# firebase-login-custom

[![CI](https://github.com/vergissberlin/firebase-login-custom/actions/workflows/ci.yml/badge.svg)](https://github.com/vergissberlin/firebase-login-custom/actions/workflows/ci.yml)
[![Issues](https://img.shields.io/github/issues/vergissberlin/firebase-login-custom.svg)](https://github.com/vergissberlin/firebase-login-custom/issues "GitHub ticket system")
[![npm version](https://img.shields.io/npm/v/firebase-login-custom.svg)](https://www.npmjs.com/package/firebase-login-custom "View this project on npm")

## Authenticating Users with Email & Password

To authenticate a user using [Custom Login](https://firebase.google.com/docs/auth/web/custom-auth),
we must provide each client with a secure JWT that has been generated on a server.
We provide several helper libraries for generating JWTs.

> **Deprecation notice:** The token-based flow using a **Firebase Secret** (Security tab in the Firebase Dashboard) is deprecated. Firebase recommends using [Service Accounts](https://firebase.google.com/docs/auth/admin/create-custom-tokens) and the Firebase Admin SDK to create custom tokens. This package still supports the legacy `secret` option for existing setups.

Use a Firebase Secret to generate these tokens (legacy). Firebase Secrets can be found by logging into the
Firebase account and clicking on the Security tab in the Firebase Dashboard.

**Security:** Never commit your Firebase secret or put it in frontend code. Load it from environment variables or a secure config (e.g. `process.env.FIREBASE_SECRET`) on the server only.

This package is a wrapper to Firebase custom login including all dependencies
with the exception of firebase itself.

More information can be found in the [Firebase custom login documentation](https://firebase.google.com/docs/auth/web/custom-auth).

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

### Promise-based API

For async/await code, use `firebaseLoginCustomAsync` (same options and behaviour, returns a Promise):

```javascript
const { firebaseLoginCustomAsync } = require('firebase-login-custom');

const { authData } = await firebaseLoginCustomAsync(firebaseRef, { uid: 'user-1' }, { secret: process.env.FIREBASE_SECRET });
```

### Error handling

- **Validation errors** (invalid `ref`, `data`, `option`, or `callback`): the constructor throws `FirebaseLoginCustomValidationError` (or the callable form throws it). With `firebaseLoginCustomAsync`, the Promise rejects. You can check `error.code === 'FIREBASE_LOGIN_CUSTOM_VALIDATION_ERROR'` or `error instanceof FirebaseLoginCustomValidationError`.
- **Token generation errors**: if token creation fails, the **callback** is invoked with a `FirebaseLoginCustomTokenError` (once, asynchronously). With `firebaseLoginCustomAsync`, the Promise rejects with the same error. It has a `cause` property with the original thrown value.
- **Auth errors** (from Firebase): the callback receives a user-facing string for known codes (`INVALID_EMAIL`, `INVALID_PASSWORD`, `INVALID_USER`) or a generic message including the original error for other failures. With `firebaseLoginCustomAsync`, the Promise rejects with that string.

## Issues

Please report issues to [ticket system](https://github.com/vergissberlin/firebase-login-custom/issues).
Pull requests are welcome here! See [CONTRIBUTING.md](CONTRIBUTING.md) for how to contribute (install locally, test, and releasing).

## Thanks to …

1. A special thanks to the developers of **NodeJS** and **Firebase**.
