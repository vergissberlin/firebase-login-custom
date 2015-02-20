firebase-login-custom
=====================


[![Dependency Status](https://gemnasium.com/vergissberlin/firebase-login-custom.svg)](https://gemnasium.com/vergissberlin/firebase-login-custom)
[![Build Status](https://travis-ci.org/vergissberlin/firebase-login-custom.svg)](https://travis-ci.org/vergissberlin/firebase-login-custom)


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

Install via npm:

```bash
    npm install firebase firebase-login-custom
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
$ cd /path/to/firebase-login-email/
$ npm install
$ export FIREBASE_ID=<YOUR_TEST_ID>
$ export FIREBASE_SECRET=<123456abcdefg>
$ node tests/integration/firebase-login-custom-integration-child.js
$ node tests/integration/firebase-login-custom-integration-simple.js
$ node tests/integration/firebase-login-custom-integration-unique.js
```

<a name="thanks"></a>
Thanks to
---------
1. A special thanks to the developers of **NodeJS** and **Firebase**.
