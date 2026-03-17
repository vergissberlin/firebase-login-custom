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
with the exception of firebase itself.

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
Pull requests are welcome here! See [CONTRIBUTING.md](CONTRIBUTING.md) for how to contribute (install locally, test, and releasing).

## Thanks to {#thanks}

1. A special thanks to the developers of **NodeJS** and **Firebase**.
