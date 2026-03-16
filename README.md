firebase-login-custom
=====================

[![CI](https://github.com/vergissberlin/firebase-login-custom/actions/workflows/ci.yml/badge.svg)](https://github.com/vergissberlin/firebase-login-custom/actions/workflows/ci.yml)
[![Issues](https://img.shields.io/github/issues/vergissberlin/firebase-login-custom.svg)](https://github.com/vergissberlin/firebase-login-custom/issues "GitHub ticket system")
[![npm version](https://img.shields.io/npm/v/firebase-login-custom.svg)](https://www.npmjs.com/package/firebase-login-custom "View this project on npm")


Authenticating Users with Email & Password
------------------------------------------

To authenticate a user using [Custom Login](https://www.firebase.com/docs/web/guide/login/custom.html),
we must provide each client with a secure JWT that has been generated on a server.
We provide several helper libraries for generating JWTs.
Use a Firebase Secret to generate these tokens. Firebase Secrets can be found by logging into the
Firebase account and clicking on the Security tab in the Firebase Dashboard.

This package is a wrapper to Firebase custom login including all dependencies
with the exception of firebase it self.

More information your can find [here](https://www.firebase.com/docs/web/guide/login/custom.html).

Installation
------------

Install via npm or pnpm:

```bash
npm install firebase firebase-login-custom
```

```bash
pnpm add firebase firebase-login-custom
```

Example
-------

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

Issues
------

Please report issues to [ticket system](https://github.com/vergissberlin/firebase-login-custom/issues).
Pull requests are welcome here!


Contributing
------------

1. Fork it
2. Create your feature branch (`git flow feature start my-new-feature`)
3. Commit your changes (`git commit -am 'Add code'`)
4. Finish your implementation (`git flow feature finish my-new-feature`)
4. Push to origin (`git push origin`)
5. Create new Pull Request

Install locally
---------------

```bash
$ cd /path/to/firebase-login-custom
$ pnpm install
$ pnpm run build
$ export FIREBASE_ID=<YOUR_TEST_ID>
$ export FIREBASE_UID=<YOUR_USER_ID>
$ export FIREBASE_SECRET=<YOUR_SECRET>
$ pnpm test
```

For CI, set the repository secrets `FIREBASE_ID`, `FIREBASE_UID`, and `FIREBASE_SECRET` so integration tests run on push/PR.

Releasing
---------

Releases are automated via GitHub Actions. To publish a new version:

1. **Secrets** (Settings → Secrets and variables → Actions):
   - **NPM_TOKEN** (required): npm auth token with publish permission. Create at [npmjs.com → Access Tokens](https://www.npmjs.com/settings/~youruser/tokens) (Automation or Publish).
   - **GH_PAT** (optional): GitHub Personal Access Token with `repo` scope. Only needed if the default `GITHUB_TOKEN` cannot create releases (e.g. in some org settings). If you use it, set the Release workflow’s “Create GitHub Release” step to `GITHUB_TOKEN: ${{ secrets.GH_PAT }}`.

2. **Version and tag**: Bump version in `package.json`, commit, then push a version tag:
   ```bash
   pnpm version patch   # or minor / major
   git push origin main
   git push origin v0.0.4   # use the new version number
   ```
   Pushing a tag like `v*` triggers the Release workflow: it builds, publishes to npm, and creates a GitHub Release with generated release notes.

3. **Manual run**: You can also trigger the workflow manually (Actions → Release → Run workflow). For a manual run, the workflow will publish the current version from `package.json` to npm; no GitHub Release is created unless a tag is pushed.

<a name="thanks"></a>
Thanks to
---------
1. A special thanks to the developers of **NodeJS** and **Firebase**.
