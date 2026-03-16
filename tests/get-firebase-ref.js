/**
 * Returns a Firebase ref for tests: mock when FIREBASE_ID is not set,
 * real Firebase (app+database+auth only) when credentials are present.
 */
var mock = require('./firebase-mock');

function getFirebaseRef(firebaseId, path) {
  if (firebaseId) {
    var createFirebaseRef = require('./firebase-ref-helper');
    return createFirebaseRef(firebaseId, path);
  }
  return mock.createMockRef();
}

module.exports = getFirebaseRef;
