#!/usr/bin/env node
/**
 * Download preview images from MAST (STScI) for all catalog objects.
 *
 * All images are fetched by EXACT RA/Dec coordinates — not by name or text
 * search. The field of view is computed per object from its angular size so
 * you always see the whole object, properly framed.
 *
 * Sources (tried in priority order):
 *   1. Pan-STARRS DR2 color cutout   — gr-i composite, dec > -30
 *   2. DSS via MAST archive          — full sky grayscale fallback
 *
 * HLA (Hubble Legacy Archive) is intentionally excluded: its pixel scale
 * varies by dataset so FOV cannot be reliably controlled, leading to
 * inconsistent framing. Pan-STARRS + DSS give deterministic, well-framed results.
 *
 * Output:
 *   <outdir>/<id>.jpg   (Pan-STARRS color)
 *   <outdir>/<id>.gif   (DSS grayscale fallback)
 *   <outdir>/manifest.json
 *
 * Usage:
 *   node scripts/download-mast-images.mjs [options]
 *
 * Options:
 *   --output <dir>    Output directory            (default: ./images)
 *   --padding <f>     FOV multiplier around object (default: 1.6)
 *   --min-fov <arcmin> Minimum FOV floor           (default: 4)
 *   --max-fov <arcmin> Maximum FOV ceiling          (default: 120)
 *   --out-px <px>     Requested output pixel size  (default: 1024)
 *   --min-px <px>     Reject images smaller than this (default: 0 = off)
 *   --dry-run         List objects without downloading
 *   --force           Re-download already-present images
 *   --messier-only    Only process Messier objects
 *   --skip-stars      Skip stellar objects
 *   --concurrency <n> Parallel downloads           (default: 3)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── CLI args ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const getArg = (flag, fallback) => {
  const i = args.indexOf(flag)
  return i !== -1 && args[i + 1] != null ? args[i + 1] : fallback
}
const hasFlag = flag => args.includes(flag)

const OUTPUT_DIR   = resolve(getArg('--output',      './images'))
const FOV_PADDING  = parseFloat(getArg('--padding',  '1.6'))
const MIN_FOV      = parseFloat(getArg('--min-fov',  '4'))
const MAX_FOV      = parseFloat(getArg('--max-fov',  '120'))
const OUT_PX       = parseInt(getArg('--out-px',     '1024'))
const MIN_PX       = parseInt(getArg('--min-px',     '0'))    // reject images below this size (0 = off)
const DRY_RUN      = hasFlag('--dry-run')
const FORCE        = hasFlag('--force')
const CONCURRENCY  = parseInt(getArg('--concurrency','3'))

// ── Known angular sizes (arcmin) for objects without size_arcmin ──────────────
// Sources: SIMBAD, NED, published literature.

const KNOWN_SIZES = {
  // Deep-sky extras
  'ngc7293':    25,   // Helix Nebula — one of the largest planetaries on sky
  'omega-cen':  36,   // Omega Centauri
  'sgr-a-star':  0.5, // Sgr A* — galactic center, show tight field
  'm87-bh':      1.5, // M87 black hole — show jet region
  // Solar system (skipped — no fixed coords, but listed for clarity)
}

// Default FOV by object type when size is unknown
const TYPE_DEFAULT_FOV = {
  star:         15,  // star field context
  planet:       10,
  nebula:       20,
  galaxy:       12,
  cluster:      20,
  'solar-system': 15,
  unknown:      15,
}

function objectFov(obj) {
  // Use catalog size if available
  const catalogSize = obj.size_arcmin ?? KNOWN_SIZES[obj.id]
  const rawFov = catalogSize
    ? catalogSize * FOV_PADDING
    : (TYPE_DEFAULT_FOV[obj.type] ?? 15)
  return Math.max(MIN_FOV, Math.min(MAX_FOV, rawFov))
}

// ── Load catalogs ─────────────────────────────────────────────────────────────

function parseMessier() {
  const src = readFileSync(resolve(__dirname, '../src/data/messier.ts'), 'utf-8')
  const results = []
  // Match each object literal block
  for (const match of src.matchAll(/\{[^}]+messier:\s*\d+[^}]+\}/gs)) {
    const block = match[0]
    const num   = block.match(/messier:\s*(\d+)/)?.[1]
    const name  = block.match(/name:\s*'([^']+)'/)?.[1]
    const ngc   = block.match(/ngc:\s*'([^']+)'/)?.[1]
    const ra    = block.match(/ra:\s*([\d.]+)/)?.[1]
    const dec   = block.match(/dec:\s*(-?[\d.]+)/)?.[1]
    const type  = block.match(/type:\s*'([^']+)'/)?.[1]
    const size  = block.match(/size_arcmin:\s*([\d.]+)/)?.[1]
    if (num && name && ra && dec) {
      results.push({
        id: `m${num}`, name, ngc: ngc ?? null,
        ra: parseFloat(ra), dec: parseFloat(dec),
        type: type ?? 'unknown',
        size_arcmin: size ? parseFloat(size) : undefined,
      })
    }
  }
  return results
}

function parseStars() {
  const src = readFileSync(resolve(__dirname, '../src/data/stars.ts'), 'utf-8')
  const results = []
  for (const match of src.matchAll(/\{[^}]+id:\s*['"][^'"]+['"][^}]+ra:\s*[\d.]+[^}]+\}/gs)) {
    const block = match[0]
    const id    = block.match(/id:\s*['"]([^'"]+)['"]/)?.[1]
    const name  = block.match(/name:\s*['"]([^'"]+)['"]/)?.[1]
    const ra    = block.match(/ra:\s*([\d.]+)/)?.[1]
    const dec   = block.match(/dec:\s*(-?[\d.]+)/)?.[1]
    if (id && name && ra && dec) {
      results.push({ id, name, ra: parseFloat(ra), dec: parseFloat(dec), type: 'star' })
    }
  }
  return results
}

function parseDeepSky() {
  const src = readFileSync(resolve(__dirname, '../src/data/deep-sky.ts'), 'utf-8')
  const results = []
  for (const match of src.matchAll(/\{[^}]+id:\s*['"][^'"]+['"][^}]+\}/gs)) {
    const block = match[0]
    const id    = block.match(/id:\s*['"]([^'"]+)['"]/)?.[1]
    const name  = block.match(/name:\s*['"]([^'"]+)['"]/)?.[1]
    const ra    = block.match(/ra:\s*([\d.]+)/)?.[1]
    const dec   = block.match(/dec:\s*(-?[\d.]+)/)?.[1]
    const type  = block.match(/type:\s*['"]([^'"]+)['"]/)?.[1]
    if (id && name && ra && dec) {
      results.push({ id, name, ra: parseFloat(ra), dec: parseFloat(dec), type: type ?? 'unknown' })
    }
  }
  return results
}

let allObjects = [
  ...parseMessier(),
  ...parseDeepSky(),
]

if (!hasFlag('--skip-stars')) {
  allObjects = [...allObjects, ...parseStars()]
}

if (hasFlag('--messier-only')) {
  allObjects = allObjects.filter(o => /^m\d+$/.test(o.id))
}

// Solar system bodies have no fixed RA/Dec — always skip
const withCoords = allObjects.filter(o => o.ra !== null && o.dec !== null)

console.error(`Catalog objects with coordinates: ${withCoords.length}`)

// ── Image source APIs ─────────────────────────────────────────────────────────

const USER_AGENT = 'cosmos-lib-image-downloader/1.0 (https://github.com/MotionComplex/cosmos-lib)'

/**
 * Parse actual pixel dimensions from a JPEG or GIF buffer header.
 * No external deps — reads only the bytes needed.
 *
 * JPEG: scan for SOF markers (0xFFC0–0xFFC3, 0xFFC5–0xFFC7, etc.)
 *       SOF payload: [length:2][precision:1][height:2][width:2]
 * GIF:  bytes 6–9 are width/height as little-endian uint16.
 *
 * Returns { w, h } or null if the format is unrecognised / buffer too short.
 */
function readDimensions(buf, ext) {
  if (ext === 'gif') {
    if (buf.length < 10) return null
    return { w: buf.readUInt16LE(6), h: buf.readUInt16LE(8) }
  }

  if (ext === 'jpg') {
    // Walk JPEG segments looking for a SOF marker
    let i = 0
    if (buf[0] !== 0xFF || buf[1] !== 0xD8) return null // not a JPEG
    i = 2
    while (i + 4 < buf.length) {
      if (buf[i] !== 0xFF) break
      const marker = buf[i + 1]
      const segLen = buf.readUInt16BE(i + 2)
      // SOF0/1/2/3/5/6/7/9/10/11 all encode dimensions the same way
      if ((marker >= 0xC0 && marker <= 0xC3) || (marker >= 0xC5 && marker <= 0xC7) ||
          (marker >= 0xC9 && marker <= 0xCB) || (marker >= 0xCD && marker <= 0xCF)) {
        if (i + 8 >= buf.length) return null
        return { w: buf.readUInt16BE(i + 7), h: buf.readUInt16BE(i + 5) }
      }
      i += 2 + segLen
    }
    return null
  }

  return null
}

/**
 * Pan-STARRS DR2 color cutout (gr-i composite).
 *
 * Step 1: request the file list for the position (returns per-filter filenames).
 * Step 2: request a color JPEG cutout using the three best filters available.
 *
 * The `size` sent to fitscut.cgi is the native PS1 pixel count that covers
 * fov_arcmin (at 0.25"/px). `output_size` downsamples to OUT_PX for consistent
 * output regardless of FOV.
 */
async function tryPanSTARRS(ra, dec, fov_arcmin) {
  if (dec < -30) return null  // hard coverage limit

  const PS1_ARCSEC_PER_PX = 0.25
  // Number of native PS1 pixels covering the requested FOV
  const nativePx = Math.round((fov_arcmin * 60) / PS1_ARCSEC_PER_PX)
  // Cap at API maximum and floor at output size
  const cutoutPx = Math.max(OUT_PX, Math.min(nativePx, 10000))

  try {
    // Step 1 — file list
    const filesUrl = new URL('https://ps1images.stsci.edu/cgi-bin/ps1filenames.py')
    filesUrl.searchParams.set('ra',      ra.toFixed(6))
    filesUrl.searchParams.set('dec',     dec.toFixed(6))
    filesUrl.searchParams.set('filters', 'grizy')
    filesUrl.searchParams.set('type',    'stack')

    const filesRes = await fetch(filesUrl.toString(), {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(12000),
    })
    if (!filesRes.ok) return null

    const lines = (await filesRes.text()).trim().split('\n').slice(1)
    if (lines.length === 0) return null

    const byFilter = {}
    for (const line of lines) {
      const cols = line.split('\t')
      const filter   = cols[4]?.trim()
      const filename = cols[7]?.trim()
      if (filter && filename && !byFilter[filter]) byFilter[filter] = filename
    }

    // Prefer a natural-color composite (i=red, r=green, g=blue).
    // Fall back gracefully if filters are missing.
    const red   = byFilter['i'] ?? byFilter['r'] ?? byFilter['g']
    const green = byFilter['r'] ?? byFilter['g'] ?? byFilter['i']
    const blue  = byFilter['g'] ?? byFilter['r'] ?? byFilter['i']
    if (!red && !green && !blue) return null

    // Step 2 — color cutout
    const cutUrl = new URL('https://ps1images.stsci.edu/cgi-bin/fitscut.cgi')
    if (red)   cutUrl.searchParams.set('red',   red)
    if (green) cutUrl.searchParams.set('green', green)
    if (blue)  cutUrl.searchParams.set('blue',  blue)
    cutUrl.searchParams.set('size',        String(cutoutPx))                    // native px (sets FOV)
    cutUrl.searchParams.set('output_size', String(Math.min(OUT_PX, cutoutPx))) // never upsample
    cutUrl.searchParams.set('format',      'jpg')
    cutUrl.searchParams.set('autoscale',   '99.5')             // stretch for visibility

    const imgRes = await fetch(cutUrl.toString(), {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(25000),
    })
    if (!imgRes.ok) return null

    const buf = Buffer.from(await imgRes.arrayBuffer())
    // PS1 returns a tiny placeholder JPEG on error/empty field — reject small files
    if (buf.byteLength < 8000) return null

    const dims = readDimensions(buf, 'jpg')
    return { data: buf, ext: 'jpg', source: 'panstarrs', dims }
  } catch {
    return null
  }
}

/**
 * DSS (Digitized Sky Survey) via the MAST archive.
 *
 * Uses POSS2/UKSTU Red for dec > -40 (best resolution), DSS1 Red for
 * the extreme south. Field of view (`w`, `h`) is set directly in arcminutes
 * so framing is exact. Output format is GIF (what the DSS CGI natively returns).
 *
 * Despite being grayscale and older, DSS has full-sky coverage and always
 * returns something — making it a reliable last resort.
 */
async function tryDSS(ra, dec, fov_arcmin) {
  const survey = dec > -40 ? 'poss2ukstu_red' : 'poss1_red'

  const url = new URL('https://archive.stsci.edu/cgi-bin/dss_search')
  url.searchParams.set('r',        ra.toFixed(6))
  url.searchParams.set('d',        dec.toFixed(6))
  url.searchParams.set('e',        'J2000')
  url.searchParams.set('w',        fov_arcmin.toFixed(2))
  url.searchParams.set('h',        fov_arcmin.toFixed(2))
  url.searchParams.set('f',        'gif')
  url.searchParams.set('v',        survey)
  url.searchParams.set('s',        'on')
  url.searchParams.set('compress', 'none')

  try {
    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(25000),
    })
    if (!res.ok) return null

    const buf = Buffer.from(await res.arrayBuffer())
    // DSS sends a small "not found" GIF on errors
    if (buf.byteLength < 2000) return null

    const dims = readDimensions(buf, 'gif')
    return { data: buf, ext: 'gif', source: 'dss', dims }
  } catch {
    return null
  }
}

/**
 * Resolve the best image for an object.
 * FOV is computed from the object's angular size so framing is always correct.
 */
async function resolveImage(obj) {
  const fov = objectFov(obj)

  const ps1 = await tryPanSTARRS(obj.ra, obj.dec, fov)
  if (ps1) return ps1

  const dss = await tryDSS(obj.ra, obj.dec, fov)
  if (dss) return dss

  return null
}

// ── Downloader ────────────────────────────────────────────────────────────────

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function processObject(obj, manifest) {
  const alreadyJpg = existsSync(resolve(OUTPUT_DIR, `${obj.id}.jpg`))
  const alreadyGif = existsSync(resolve(OUTPUT_DIR, `${obj.id}.gif`))

  if (!FORCE && (alreadyJpg || alreadyGif)) {
    const file = alreadyJpg ? `${obj.id}.jpg` : `${obj.id}.gif`
    if (!manifest[obj.id]) {
      manifest[obj.id] = { file, source: 'cached', ra: obj.ra, dec: obj.dec, fov_arcmin: objectFov(obj) }
    }
    return 'cached'
  }

  const result = await resolveImage(obj)
  if (!result) return 'failed'

  // Reject if the server returned less than the minimum requested resolution
  const smallestDim = result.dims ? Math.min(result.dims.w, result.dims.h) : null
  if (MIN_PX > 0 && smallestDim !== null && smallestDim < MIN_PX) return 'failed'

  const filename = `${obj.id}.${result.ext}`
  writeFileSync(resolve(OUTPUT_DIR, filename), result.data)

  manifest[obj.id] = {
    file:       filename,
    source:     result.source,
    width:      result.dims?.w ?? null,
    height:     result.dims?.h ?? null,
    ra:         obj.ra,
    dec:        obj.dec,
    fov_arcmin: objectFov(obj),
    name:       obj.name,
    type:       obj.type,
  }

  return result.source
}

// ── Main ──────────────────────────────────────────────────────────────────────

if (DRY_RUN) {
  console.error('\n── Objects to download ──────────────────────────────────────────────────────')
  for (const o of withCoords) {
    const fov = objectFov(o).toFixed(1)
    console.error(`  ${o.id.padEnd(20)} ${o.name.padEnd(32)} fov=${fov.padStart(6)}' dec=${o.dec?.toFixed(1)}`)
  }
  console.error(`\nTotal: ${withCoords.length} objects`)
  console.error(`Output: ${OUTPUT_DIR}  |  Padding: ${FOV_PADDING}x  |  Min/Max FOV: ${MIN_FOV}/${MAX_FOV} arcmin`)
  process.exit(0)
}

mkdirSync(OUTPUT_DIR, { recursive: true })

const manifestPath = resolve(OUTPUT_DIR, 'manifest.json')
const manifest = existsSync(manifestPath)
  ? JSON.parse(readFileSync(manifestPath, 'utf-8'))
  : {}

const toProcess = FORCE
  ? withCoords
  : withCoords.filter(o =>
      !existsSync(resolve(OUTPUT_DIR, `${o.id}.jpg`)) &&
      !existsSync(resolve(OUTPUT_DIR, `${o.id}.gif`))
    )

const alreadyCached = withCoords.length - toProcess.length
console.error(`To download:    ${toProcess.length}`)
console.error(`Already cached: ${alreadyCached}`)
console.error(`Output dir:     ${OUTPUT_DIR}`)
console.error(`FOV:            ${FOV_PADDING}× object size  (floor ${MIN_FOV}', ceiling ${MAX_FOV}')`)
console.error(`Output px:      ${OUT_PX}`)
console.error(`Concurrency:    ${CONCURRENCY}`)
console.error('')

const stats = { panstarrs: 0, dss: 0, cached: alreadyCached, failed: 0 }
let completed = 0

async function processBatch(batch) {
  await Promise.all(batch.map(async obj => {
    const source = await processObject(obj, manifest)
    stats[source] = (stats[source] ?? 0) + 1
    completed++
    const pct  = ((completed / toProcess.length) * 100).toFixed(0).padStart(3)
    const fov  = objectFov(obj).toFixed(1)
    const entry = manifest[obj.id]
    const res = entry?.width ? `${entry.width}x${entry.height}` : source === 'failed' ? 'no image' : '?'
    process.stderr.write(
      `\r[${pct}%] ${completed}/${toProcess.length}  ` +
      `PS1:${stats.panstarrs} DSS:${stats.dss} ✗:${stats.failed}  ` +
      `${obj.id.padEnd(16)} fov=${fov}' ${res.padEnd(10)}   `
    )
    await sleep(300) // polite rate limiting per request
  }))
}

for (let i = 0; i < toProcess.length; i += CONCURRENCY) {
  await processBatch(toProcess.slice(i, i + CONCURRENCY))
  if (i + CONCURRENCY < toProcess.length) await sleep(200)
}

process.stderr.write('\n')
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))

console.error('')
console.error('── Results ──────────────────────────────────────')
console.error(`  Pan-STARRS (color):   ${stats.panstarrs}`)
console.error(`  DSS (grayscale):      ${stats.dss}`)
console.error(`  Already cached:       ${stats.cached}`)
console.error(`  Not found:            ${stats.failed}`)
console.error(`  Manifest:             ${manifestPath}`)
console.error('─────────────────────────────────────────────────')
