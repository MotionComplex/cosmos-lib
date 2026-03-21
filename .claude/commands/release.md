# Release & Version Management

You are helping publish a new version of `@motioncomplex/cosmos-lib`. Follow this process exactly.

## Step 1 — Pre-flight checks

Run these in parallel:
- `npm run typecheck`
- `npm run test`
- `npm run build`

If any fail, stop and fix the issues before continuing.

## Step 2 — Determine version bump

Check what changed since the last release:

```
git log $(git describe --tags --abbrev=0 2>/dev/null || git rev-list --max-parents=0 HEAD)..HEAD --oneline
```

Ask the user what kind of bump this is if not obvious:
- **patch** (1.0.x): bug fixes, docs, minor tweaks
- **minor** (1.x.0): new features, new modules, new API surface (backwards-compatible)
- **major** (x.0.0): breaking API changes

If the user passed an argument to this command (e.g. `/release patch`), use that directly.

## Step 3 — Bump the library version

Use `npm version <patch|minor|major> --no-git-tag-version` to bump `package.json` only (no auto-tag — we'll commit manually for a clean message).

Read the new version from `package.json` after bumping.

## Step 4 — Update example apps

Both example apps must reference the new version. Update these files:

1. **`examples/observatory-app/package.json`** — update `@motioncomplex/cosmos-lib` dependency to `^<new-version>`
2. **`examples/react-native-app/package.json`** — update `@motioncomplex/cosmos-lib` dependency to `^<new-version>`

Do NOT run `npm install` in example apps — just update the version specifier in their `package.json`. The lockfiles will update naturally when the apps are next installed.

## Step 5 — Update lockfiles

Run `npm install` in the **root** only (to sync `package-lock.json` with the new version).

## Step 6 — Commit & tag

Stage all changed files and create a single commit:

```
chore: release v<version>
```

Then create a git tag: `git tag v<version>`

## Step 7 — Summary

Print a summary:
- Old version → New version
- Files changed
- The git commit and tag created
- Remind the user: **"Push to main to trigger the publish workflow: `git push && git push --tags`"**

Do NOT push automatically — let the user decide when to push.

## Important notes

- The CI workflow at `.github/workflows/publish.yml` handles the actual `npm publish` on push to main.
- The observatory-app uses Vite aliases to `../../src` for local dev, so it always runs against source. The version in its `package.json` matters for production builds and for documentation purposes.
- The react-native-app uses the published npm package directly, so it will pick up the new version on next `npm install` after publish.
