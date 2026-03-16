# firebase-login-custom

[![CI](https://github.com/vergissberlin/firebase-login-custom/actions/workflows/ci.yml/badge.svg)](https://github.com/vergissberlin/firebase-login-custom/actions/workflows/ci.yml)
[![Issues](https://img.shields.io/github/issues/vergissberlin/firebase-login-custom.svg)](https://github.com/vergissberlin/firebase-login-custom/issues "GitHub ticket system")
[![npm version](https://img.shields.io/npm/v/firebase-login-custom.svg)](https://www.npmjs.com/package/firebase-login-custom "View this project on npm")

## Authenticating Users with Email & Password

To authenticate a user using [Custom Login](https://www.firebase.com/docs/web/guide/login/custom.html),
we must provide each client with a secure JWT that has been generated on a server.
We provide several helper libraries for generating JWTs.
Use a Firebase Secret to generate these tokens. Firebase Secrets can be found by logging into the
Firebase account and clicking on the Security tab in the Firebase Dashboard.

This package is a wrapper to Firebase custom login including all dependencies
with the exception of firebase it self.

More information can be found in the [Firebase custom login documentation](https://www.firebase.com/docs/web/guide/login/custom.html).

## Installation

Install via npm or pnpm:

```bash
npm install firebase firebase-login-custom
```

```bash
pnpm add firebase firebase-login-custom
```

## Example

```javascript

var ref = new Firebase('https://<Your Firebase>.firebaseio.com');

FirebaseLoginCustom(firebaseRef, {
        uid: <Your id>
    },
    {
        secret: <Your secret>,
    },
    function (error, data) {
        if (error !== null) {
            console.log(error);
        } else {
            console.log(data.token);
        }
    }
);
```

### Error handling

- **Validation errors** (invalid `ref`, `data`, `option`, or `callback`): the constructor throws `FirebaseLoginCustomValidationError` (or the callable form throws it). You can check `error.code === 'FIREBASE_LOGIN_CUSTOM_VALIDATION_ERROR'` or `error instanceof FirebaseLoginCustomValidationError`.
- **Token generation errors**: if token creation fails, the **callback** is invoked with a `FirebaseLoginCustomTokenError` (once, asynchronously). It has a `cause` property with the original thrown value.
- **Auth errors** (from Firebase): the callback receives a user-facing string for known codes (`INVALID_EMAIL`, `INVALID_PASSWORD`, `INVALID_USER`) or a generic message including the original error for other failures.

## Issues

Please report issues to [ticket system](https://github.com/vergissberlin/firebase-login-custom/issues).
Pull requests are welcome here! See [CONTRIBUTING.md](CONTRIBUTING.md) for how to contribute.

## Install locally

Tests use a **Firebase mock** by default (no credentials needed). With env vars set, they use real Firebase.

```bash
cd /path/to/firebase-login-custom
pnpm install
pnpm run build
pnpm test
```

- **Unit tests** (Vitest): `pnpm run test:unit` (no build required). Watch mode: `pnpm run test:watch`.
- **Integration tests**: `pnpm run test:integration` (builds first if needed). `pnpm test` runs unit then integration.

**Pre-commit hooks (Husky):** Before each commit, `pnpm run lint` and `pnpm run test` run automatically. If either fails, the commit is aborted. Hooks are installed when you run `pnpm install` (via the `prepare` script).

To run against real Firebase:

```bash
export FIREBASE_ID=<YOUR_TEST_ID>
export FIREBASE_UID=<YOUR_USER_ID>
export FIREBASE_SECRET=<YOUR_SECRET>
pnpm test
```

For CI, optional: set repository secrets `FIREBASE_ID`, `FIREBASE_UID`, and `FIREBASE_SECRET` to run integration tests against real Firebase on push/PR.

## Releasing

Releases are automated via GitHub Actions and [Release Please](https://github.com/googleapis/release-please).

- **Release Please** (workflow `release-please`): On every push to `main`, it opens or updates a release PR based on [Conventional Commits](https://www.conventionalcommits.org/). Merge that PR; Release Please then creates the version tag and GitHub Release.
- **Release** (workflow `Release`): Triggered when a GitHub Release is published (e.g. by Release Please), when a version tag (`v*`) is pushed, or **manually**. It builds, **publishes to npm** (requires `NPM_TOKEN` secret), and creates/updates the GitHub Release when triggered by a tag push.

### First-time publish (Release workflow never ran)

If the Release workflow has never run and nothing is on [npm](https://www.npmjs.com/package/firebase-login-custom) yet:

1. **Add `NPM_TOKEN`** (Settings → Secrets and variables → Actions): Create an npm [Access Token](https://www.npmjs.com/settings/~youruser/tokens) with **Automation** or **Publish** scope and add it as repository secret `NPM_TOKEN`.
2. **Run the Release workflow once**: In the repo go to **Actions → Release → Run workflow** (use “Run workflow” on the default branch). This publishes the current `package.json` version to npm. No GitHub Release is created when run manually.
3. After that, use either Release Please (conventional commits + merge release PR) or manual tag push (`git tag v0.1.0 && git push origin v0.1.0`) so future releases also trigger the workflow automatically.

### Regular releases

1. **Secrets** (Settings → Secrets and variables → Actions):
   - **NPM_TOKEN** (required): npm auth token with publish permission. Create at [npmjs.com → Access Tokens](https://www.npmjs.com/settings/~youruser/tokens) (Automation or Publish).
   - **GH_PAT** (optional): GitHub Personal Access Token with `repo` scope. Only needed if the default `GITHUB_TOKEN` cannot create releases (e.g. in some org settings). If you use it, set the Release workflow's "Create GitHub Release" step to `GITHUB_TOKEN: ${{ secrets.GH_PAT }}`.

2. **Version and tag (with Release Please)**: Use conventional commits (e.g. `feat:`, `fix:`, `chore:`). After pushing to `main`, Release Please will open or update a release PR. Merge that PR; Release Please creates the tag and GitHub Release. The Release workflow runs on **release published** (and on tag push), so it will build and publish to npm—ensure **NPM_TOKEN** is set in repository secrets.

   **Without Release Please** (manual): Bump version in `package.json`, commit, push a version tag:
   ```bash
   pnpm version patch   # or minor / major
   git push origin main
   git push origin v0.0.4   # use the new version number
   ```
   Pushing a tag `v*` triggers the Release workflow.

3. **Manual run**: You can also trigger the Release workflow manually (Actions → Release → Run workflow). It will publish the current version from `package.json` to npm; no GitHub Release is created unless a tag is pushed.

## Thanks to {#thanks}

1. A special thanks to the developers of **NodeJS** and **Firebase**.
