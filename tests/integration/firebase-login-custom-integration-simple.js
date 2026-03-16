/*
 With mock (default): no env vars needed. With real Firebase:
 export FIREBASE_ID=... FIREBASE_UID=... FIREBASE_SECRET=...
 */

var getFirebaseRef = require('../get-firebase-ref');
var FirebaseLoginCustom = require('../../dist/firebase-login-custom');

var firebaseRef = getFirebaseRef(process.env.FIREBASE_ID, 'test/simple');
FirebaseLoginCustom(firebaseRef, {
        uid: process.env.FIREBASE_UID || 'mock-uid',
        group: 'mod'
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
            firebaseRef.set({
                testOne: Math.round(Math.random() * 100000),
                testTwo: Math.round(Math.random() * 100000)
            });

            setTimeout(function () {
                process.exit(0);
            }, process.env.FIREBASE_ID ? 5000 : 0);
        }
    }
);

// Listener
firebaseRef.child('testOne').on('value', function (snapshot) {
    console.log('testOne: ' + snapshot.val());  // Alerts 'San Francisco'
});
firebaseRef.child('testTwo').on('value', function (snapshot) {
    console.log('testTwo: ' + snapshot.val());  // Alerts 'San Francisco'
});

// Check exit code
process.on('exit', function (code) {
    console.log('About to exit with code:', code);
});
