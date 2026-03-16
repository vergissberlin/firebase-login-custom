/**
 * Mock Firebase ref for tests. Implements the interface our library needs:
 * authWithCustomToken(token, callback), set(), child(), on(), push().
 * Use when FIREBASE_ID is not set so tests run without real Firebase credentials.
 */
function createMockRef() {
  var mockUid = process.env.FIREBASE_UID || 'mock-uid';

  function noop() {}

  function mockChild() {
    return {
      set: noop,
      on: noop,
      child: mockChild,
    };
  }

  var ref = {
    authWithCustomToken: function (token, callback) {
      if (typeof token !== 'string' || typeof callback !== 'function') {
        process.nextTick(function () {
          callback(new Error('Invalid token or callback'), null);
        });
        return;
      }
      process.nextTick(function () {
        callback(null, { uid: mockUid });
      });
    },
    set: noop,
    child: function () { return mockChild(); },
    on: noop,
    push: function () { return { key: 'mock-key' }; },
  };

  return ref;
}

module.exports = { createMockRef: createMockRef };
