/*
 Before run test, input follow on your CLI
 export FIREBASE_ID=<YOUR-FIREBASE-ID>
 export FIREBASE_UID=<YOUR-USER-ID>
 export FIREBASE_SECRET=<YOUR-SECRET>

 If you already done this, and setupt your Firebase Account
 your can run the test with:

 node tests/integration/firebase-login-custom-integration-unique.js
 */

// Requirements
var Firebase = require('firebase');
var FirebaseLoginCustom = require('../../dist/firebase-login-custom');


// Login process
var firebaseRef = new Firebase('https://' + process.env.FIREBASE_ID + '.firebaseio.com/test/unique');
FirebaseLoginCustom(firebaseRef, {
        uid: process.env.FIREBASE_UID
    },
    {
        debug: true,
        secret: process.env.FIREBASE_SECRET,
        expires: +new Date() / 1000 + 4,
        notBefore: +new Date() / 1000
    },
    function (error, data) {
        if (error !== null) {
            console.log(error);
            process.exit(1);
        } else {
            console.log(data);

            // Try to write test data
            firebaseRef.push({
                name: 'Ursula'
            });

            setTimeout(function () {
                process.exit(0);
            }, 5000);
        }
    }
);

// Check exit code
process.on('exit', function (code) {
    console.log('About to exit with code:', code);
});
