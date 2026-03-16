/*
 With mock (default): no env vars needed. With real Firebase:
 export FIREBASE_ID=<YOUR-FIREBASE-ID>
 export FIREBASE_UID=<YOUR-USER-ID>
 export FIREBASE_SECRET=<YOUR-SECRET>
 */

var getFirebaseRef = require('../get-firebase-ref');
var FirebaseLoginCustom = require('../../dist/firebase-login-custom');

var firebaseRef = getFirebaseRef(process.env.FIREBASE_ID, 'test/child');
FirebaseLoginCustom(firebaseRef, {
        uid: process.env.FIREBASE_UID || 'mock-uid'
    },
    {
        debug: true,
        secret: process.env.FIREBASE_SECRET || 'mock-secret',
        expires: +new Date() / 1000 + 4,
        notBefore: +new Date() / 1000
    },
    function (error, data) {
        if (error !== null) {
            console.log(error);
            process.exit(1);
        } else {
            // console.log(data);

            // Try to write test data
            firebaseRef.child(data.uid).set({
                name: 'Dirk'
            });

            setTimeout(function () {
                process.exit(0);
            }, process.env.FIREBASE_ID ? 5000 : 0);
        }
    }
);

// Check exit code
process.on('exit', function (code) {
    console.log('About to exit with code:', code);
});
