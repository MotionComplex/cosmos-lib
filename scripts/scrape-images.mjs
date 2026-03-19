#!/usr/bin/env node
/**
 * Scrape Wikimedia Commons for astronomical images of catalog objects.
 *
 * Usage:
 *   node scripts/scrape-images.mjs > results.json
 *   node scripts/scrape-images.mjs --dry-run
 *   node scripts/scrape-images.mjs --stars-only
 *   node scripts/scrape-images.mjs --messier-only
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Load existing registry ──────────────────────────────────────────────────

const imagesTs = readFileSync(resolve(__dirname, '../src/data/images.ts'), 'utf-8')
const existingIds = new Set()
for (const match of imagesTs.matchAll(/^\s+([\w][\w-]*):\s+\[/gm)) {
  existingIds.add(match[1])
}
console.error(`Existing IMAGE_FALLBACKS: ${existingIds.size} entries`)

// ── Parse catalogs ──────────────────────────────────────────────────────────

function parseStars() {
  const src = readFileSync(resolve(__dirname, '../src/data/stars.ts'), 'utf-8')
  const results = []
  for (const m of src.matchAll(/id:\s*['"]([^'"]+)['"]\s*,\s*name:\s*['"]([^'"]+)['"]/g)) {
    results.push({ id: m[1], name: m[2], type: 'star' })
  }
  return results
}

function parseMessier() {
  const src = readFileSync(resolve(__dirname, '../src/data/messier.ts'), 'utf-8')
  const results = []
  // Messier data uses messier:N, name:'...', ngc:'NGC XXXX' format
  for (const m of src.matchAll(/messier:\s*(\d+)\s*,\s*name:\s*'([^']+)'(?:.*?ngc:\s*'([^']+)')?/g)) {
    results.push({ id: `m${m[1]}`, name: m[2], ngc: m[3] || null, messier: parseInt(m[1]), type: 'messier' })
  }
  return results
}

function parseDeepSky() {
  const src = readFileSync(resolve(__dirname, '../src/data/deep-sky.ts'), 'utf-8')
  const results = []
  for (const m of src.matchAll(/id:\s*['"]([^'"]+)['"]\s*,\s*name:\s*['"]([^'"]+)['"]/g)) {
    results.push({ id: m[1], name: m[2], type: 'deepsky' })
  }
  return results
}

let allObjects = [...parseStars(), ...parseMessier(), ...parseDeepSky()]

if (process.argv.includes('--stars-only')) allObjects = allObjects.filter(o => o.type === 'star')
if (process.argv.includes('--messier-only')) allObjects = allObjects.filter(o => o.type === 'messier')

const toSearch = allObjects.filter(o => !existingIds.has(o.id))
console.error(`Catalog objects: ${allObjects.length}, need images: ${toSearch.length}`)

if (process.argv.includes('--dry-run')) {
  for (const o of toSearch) console.error(`  ${o.id}: "${o.name}" [${o.type}]`)
  process.exit(0)
}

// ── Wikimedia API helpers ───────────────────────────────────────────────────

const COMMONS_API = 'https://commons.wikimedia.org/w/api.php'
const sleep = ms => new Promise(r => setTimeout(r, ms))

// Words that indicate the image is NOT an astronomical photograph
const REJECT_PATTERNS = /diagram|chart|map|logo|stamp|icon|svg|flag|coat|specimen|lotor|animal|plant|museum|portrait|statue|painting|plate|drawing|coin|medal|patch|badge|schematic|lightcurve|orbit|crater|manga|anime|ship|hotel|building|church|city|town/i

// Words that indicate good astronomical content
const ASTRO_BONUS = /hubble|eso|nasa|telescope|nebula|galaxy|star.?field|ngc|messier|spitzer|chandra|jwst|deep.?sky|milky.?way|astrophoto|observatory/i

/**
 * Search specifically for astronomical images of a star.
 * Stars are tricky — they're points of light. We search for star field photos.
 */
async function searchStar(name) {
  const queries = [
    `"${name}" star astronomy`,
    `"${name}" star astrophotography`,
  ]

  for (const query of queries) {
    const result = await searchCommonsOnce(query, name)
    if (result) return result
    await sleep(1500)
  }
  return null
}

/**
 * Search for astronomical images of a deep-sky / Messier object.
 * These generally have excellent Wikimedia coverage.
 */
async function searchDeepSky(obj) {
  const { name } = obj
  const messierNum = obj.messier
  const ngc = obj.ngc

  // Build queries from most specific to least
  const queries = []
  if (ngc) queries.push(`"${ngc}" Hubble ESO telescope`)
  if (messierNum) queries.push(`"Messier ${messierNum}" astronomy`)
  if (name !== `M${messierNum}`) queries.push(`"${name}" astronomy nebula galaxy`)
  if (ngc) queries.push(`"${ngc}" astronomy`)

  for (const query of queries) {
    const matchName = ngc || name
    const result = await searchCommonsOnce(query, matchName)
    if (result) return result
    await sleep(1500)
  }
  return null
}

/**
 * Single Wikimedia Commons search with scoring.
 */
async function searchCommonsOnce(query, objectName) {
  try {
    const params = new URLSearchParams({
      action: 'query',
      generator: 'search',
      gsrsearch: `${query} filetype:bitmap`,
      gsrnamespace: '6',
      gsrlimit: '8',
      prop: 'imageinfo',
      iiprop: 'extmetadata|size|mime',
      iiextmetadatafilter: 'Artist|LicenseShortName|Credit|Categories',
      format: 'json',
      origin: '*',
    })

    const res = await fetch(`${COMMONS_API}?${params}`, {
      headers: { 'User-Agent': 'cosmos-lib-image-scraper/1.0 (https://github.com/motioncomplex/cosmos-lib)' },
    })
    if (!res.ok) return null
    const text = await res.text()
    let json
    try { json = JSON.parse(text) } catch { return null }

    const pages = json.query?.pages
    if (!pages) return null

    const nameLower = objectName.toLowerCase()
    const nameWords = nameLower.split(/\s+/)

    const candidates = Object.values(pages)
      .map(page => {
        const title = page.title?.replace('File:', '') ?? ''
        const info = page.imageinfo?.[0]
        const width = info?.width ?? 0
        const height = info?.height ?? 0
        const mime = info?.mime ?? ''
        const meta = info?.extmetadata ?? {}
        const credit = meta.Artist?.value?.replace(/<[^>]+>/g, '').trim()
          || meta.Credit?.value?.replace(/<[^>]+>/g, '').trim()
          || 'Wikimedia Commons'
        const categories = meta.Categories?.value ?? ''

        // Hard reject
        if (REJECT_PATTERNS.test(title)) return null
        if (mime.includes('svg') || mime.includes('tiff')) return null
        if (width < 400 || height < 300) return null
        if (!(mime.includes('jpeg') || mime.includes('png'))) return null

        let score = 0

        // Size scoring
        if (width >= 2000) score += 4
        else if (width >= 1000) score += 3
        else if (width >= 600) score += 1

        // Name relevance
        const lowerTitle = title.toLowerCase()
        if (nameWords.every(w => lowerTitle.includes(w))) score += 6
        else if (nameWords.some(w => lowerTitle.includes(w))) score += 3

        // Astronomical source bonus
        if (ASTRO_BONUS.test(title) || ASTRO_BONUS.test(credit) || ASTRO_BONUS.test(categories)) score += 5

        // Penalty for category mismatches
        if (/biology|zoology|botany|geography|architecture/i.test(categories)) score -= 20

        return { filename: title, credit, score, width }
      })
      .filter(c => c !== null && c.score >= 3)
      .sort((a, b) => b.score - a.score)

    if (candidates.length > 0) {
      const best = candidates[0]
      // Validate URL
      const testUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(best.filename)}?width=640`
      const headRes = await fetch(testUrl, { method: 'HEAD', redirect: 'follow' })
      if (headRes.ok || headRes.status === 302) {
        return { filename: best.filename, credit: best.credit }
      }
    }
  } catch {
    // fail silently
  }
  return null
}

// ── Main loop ───────────────────────────────────────────────────────────────

const results = {}
let found = 0
let failed = 0

for (let i = 0; i < toSearch.length; i++) {
  const obj = toSearch[i]
  const pct = ((i / toSearch.length) * 100).toFixed(0)
  process.stderr.write(`\r[${pct}%] (${found}/${i}) ${obj.name.padEnd(30)}`)

  let result
  if (obj.type === 'star') {
    result = await searchStar(obj.name)
  } else {
    result = await searchDeepSky(obj)
  }

  if (result) {
    results[obj.id] = [{ filename: result.filename, credit: result.credit }]
    found++
  } else {
    failed++
  }

  await sleep(500)
}

process.stderr.write(`\r${''.padEnd(80)}\r`)
console.error(`Done! Found: ${found}, Not found: ${failed}`)
console.error(`New coverage: ${existingIds.size + found} / ${allObjects.length + 10}`)

console.log(JSON.stringify(results, null, 2))
