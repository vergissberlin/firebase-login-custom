/**
 * Creates a Firebase ref with authWithCustomToken for integration tests.
 * Only loads firebase/app, firebase/database, firebase/auth (no Firestore/grpc),
 * so tests run on Node 25 where the native "grpc" module is not available.
 */
var firebase = require('firebase/app');
require('firebase/database');
require('firebase/auth');

function createFirebaseRef(firebaseId, path) {
  var databaseURL = 'https://' + firebaseId + '.firebaseio.com';
  var app = firebase.initializeApp({ databaseURL: databaseURL });
  var ref = app.database().ref(path);
  ref.authWithCustomToken = function (token, callback) {
    app.auth().signInWithCustomToken(token)
      .then(function (userCredential) {
        // Match legacy authData shape: callback(null, authData) with uid
        var authData = userCredential.user ? { uid: userCredential.user.uid } : userCredential;
        callback(null, authData);
      })
      .catch(function (err) { callback(err, null); });
  };
  return ref;
}

module.exports = createFirebaseRef;
