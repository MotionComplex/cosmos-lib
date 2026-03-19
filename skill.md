# Publishing @motioncomplex/cosmos-lib

Private package hosted on **GitHub Packages**.

## One-time setup (new machine)

### 1. Create a GitHub Personal Access Token

1. Go to **GitHub > Settings > Developer settings > Personal access tokens > Tokens (classic)**
2. Generate a new token with scopes: **`write:packages`**, **`read:packages`**
3. Copy the token

### 2. Authenticate with GitHub Packages

```bash
npm login --registry=https://npm.pkg.github.com
```

- **Username**: your GitHub username
- **Password**: the PAT from step 1
- **Email**: your GitHub email

This writes credentials to `~/.npmrc`. You only need to do this once per machine (until the token expires).

## Publishing a new version

```bash
# Bump the version (patch / minor / major)
npm version patch   # 1.0.0 -> 1.0.1
npm version minor   # 1.0.0 -> 1.1.0
npm version major   # 1.0.0 -> 2.0.0

# Publish (runs typecheck + tests + build automatically via prepublishOnly)
npm publish
```

Or push a version tag to trigger the GitHub Actions workflow:

```bash
npm version patch
git push && git push --tags
```

The workflow at `.github/workflows/publish.yml` will publish automatically on any `v*` tag.

## Installing in other projects

### 1. Configure the scope registry

Create or edit `.npmrc` in the consuming project root:

```
@motioncomplex:registry=https://npm.pkg.github.com
```

### 2. Authenticate (if not already)

```bash
npm login --registry=https://npm.pkg.github.com
```

### 3. Install

```bash
npm install @motioncomplex/cosmos-lib
```

## Troubleshooting

| Error | Fix |
|-------|-----|
| `401 Unauthorized` | Token expired or missing. Re-run `npm login --registry=https://npm.pkg.github.com` |
| `402 Payment Required` | You're publishing to npmjs.org instead of GitHub Packages. Check `publishConfig.registry` in `package.json` |
| `403 Forbidden` | Token lacks `write:packages` scope, or the package name scope doesn't match your GitHub user/org |
| `E404` when installing | Consumer's `.npmrc` is missing the `@motioncomplex:registry` line |
