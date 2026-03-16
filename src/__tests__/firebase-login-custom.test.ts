import { describe, it, expect, vi } from 'vitest';
import {
  FirebaseLoginCustom,
  firebaseLoginCustom,
  type FirebaseRef,
  type AuthData,
  type FirebaseLoginOptionInput,
  type FirebaseLoginCallback,
} from '../firebase-login-custom';

function createMockRef(behaviour?: {
  authWithCustomToken?: (token: string, callback: FirebaseLoginCallback) => void;
}): FirebaseRef {
  const authWithCustomToken =
    behaviour?.authWithCustomToken ??
    ((_token: string, callback: FirebaseLoginCallback) => {
      process.nextTick(() => callback(null, { uid: 'test-uid' }));
    });
  return { authWithCustomToken };
}

describe('FirebaseLoginCustom', () => {
  describe('validation', () => {
    const validRef = createMockRef();
    const validData: AuthData = { uid: 'user-1' };
    const validOption: FirebaseLoginOptionInput = { secret: 'my-secret' };
    const validCallback: FirebaseLoginCallback = () => {};

    it('throws when ref is not an object', () => {
      expect(() => {
        new FirebaseLoginCustom(
          null as unknown as FirebaseRef,
          validData,
          validOption,
          validCallback
        );
      }).toThrow('Ref must be an object!');

      expect(() => {
        new FirebaseLoginCustom(
          'not-a-ref' as unknown as FirebaseRef,
          validData,
          validOption,
          validCallback
        );
      }).toThrow('Ref must be an object!');
    });

    it('throws when data.uid is not a string', () => {
      expect(() => {
        new FirebaseLoginCustom(validRef, {} as AuthData, validOption, validCallback);
      }).toThrow('Data object must have an "uid" field!');

      expect(() => {
        new FirebaseLoginCustom(
          validRef,
          { uid: 123 } as unknown as AuthData,
          validOption,
          validCallback
        );
      }).toThrow('Data object must have an "uid" field!');
    });

    it('throws when option.secret is not a string', () => {
      expect(() => {
        new FirebaseLoginCustom(validRef, validData, {} as FirebaseLoginOptionInput, validCallback);
      }).toThrow('Option object must have an "secret" field!');

      expect(() => {
        new FirebaseLoginCustom(
          validRef,
          validData,
          { secret: 123 } as unknown as FirebaseLoginOptionInput,
          validCallback
        );
      }).toThrow('Option object must have an "secret" field!');
    });

    it('throws when callback is not a function', () => {
      expect(() => {
        new FirebaseLoginCustom(
          validRef,
          validData,
          validOption,
          null as unknown as FirebaseLoginCallback
        );
      }).toThrow('Callback must be a function!');

      expect(() => {
        new FirebaseLoginCustom(validRef, validData, validOption, 'not-a-fn' as unknown as FirebaseLoginCallback);
      }).toThrow('Callback must be a function!');
    });
  });

  describe('auth flow', () => {
    it('calls authWithCustomToken with a generated token and invokes callback on success', (done) => {
      const authWithCustomToken = vi.fn((token: string, callback: FirebaseLoginCallback) => {
        expect(typeof token).toBe('string');
        expect(token.length).toBeGreaterThan(0);
        process.nextTick(() => callback(null, { uid: 'auth-uid' }));
      });

      const ref = createMockRef({ authWithCustomToken });
      const callback: FirebaseLoginCallback = (error, authData) => {
        expect(error).toBeNull();
        expect(authData).toEqual({ uid: 'auth-uid' });
        expect(authWithCustomToken).toHaveBeenCalledTimes(1);
        done();
      };

      new FirebaseLoginCustom(ref, { uid: 'user-1' }, { secret: 'secret' }, callback);
    });

    it('passes translated error to callback when auth fails with INVALID_EMAIL', (done) => {
      const authWithCustomToken = vi.fn((_token: string, callback: FirebaseLoginCallback) => {
        process.nextTick(() => callback({ code: 'INVALID_EMAIL' } as Error, undefined));
      });

      const ref = createMockRef({ authWithCustomToken });
      const callback: FirebaseLoginCallback = (error) => {
        expect(error).toBe('The specified user account email is invalid.');
        done();
      };

      new FirebaseLoginCustom(ref, { uid: 'u' }, { secret: 's' }, callback);
    });

    it('passes translated error to callback when auth fails with INVALID_PASSWORD', (done) => {
      const authWithCustomToken = vi.fn((_token: string, callback: FirebaseLoginCallback) => {
        process.nextTick(() => callback({ code: 'INVALID_PASSWORD' } as Error, undefined));
      });

      const ref = createMockRef({ authWithCustomToken });
      const callback: FirebaseLoginCallback = (error) => {
        expect(error).toBe('The specified user account password is incorrect.');
        done();
      };

      new FirebaseLoginCustom(ref, { uid: 'u' }, { secret: 's' }, callback);
    });

    it('passes translated error to callback when auth fails with INVALID_USER', (done) => {
      const authWithCustomToken = vi.fn((_token: string, callback: FirebaseLoginCallback) => {
        process.nextTick(() => callback({ code: 'INVALID_USER' } as Error, undefined));
      });

      const ref = createMockRef({ authWithCustomToken });
      const callback: FirebaseLoginCallback = (error) => {
        expect(error).toBe('The specified user account does not exist.');
        done();
      };

      new FirebaseLoginCustom(ref, { uid: 'u' }, { secret: 's' }, callback);
    });

    it('passes generic error message for unknown auth error codes', (done) => {
      const authWithCustomToken = vi.fn((_token: string, callback: FirebaseLoginCallback) => {
        process.nextTick(() => callback(new Error('Network error'), undefined));
      });

      const ref = createMockRef({ authWithCustomToken });
      const callback: FirebaseLoginCallback = (error) => {
        expect(error).toContain('Error logging user in:');
        expect(String(error)).toContain('Network error');
        done();
      };

      new FirebaseLoginCustom(ref, { uid: 'u' }, { secret: 's' }, callback);
    });
  });

  describe('option defaults', () => {
    it('uses default expires and notBefore when not provided', (done) => {
      const authWithCustomToken = vi.fn((token: string, callback: FirebaseLoginCallback) => {
        expect(token).toBeDefined();
        process.nextTick(() => callback(null, { uid: 'u' }));
      });

      const ref = createMockRef({ authWithCustomToken });
      const callback: FirebaseLoginCallback = () => done();

      new FirebaseLoginCustom(
        ref,
        { uid: 'u' },
        { secret: 's' }, // no expires, notBefore
        callback
      );
    });
  });
});

describe('firebaseLoginCustom (default export)', () => {
  it('works without new and calls authWithCustomToken', (done) => {
    const authWithCustomToken = vi.fn((token: string, callback: FirebaseLoginCallback) => {
      expect(typeof token).toBe('string');
      process.nextTick(() => callback(null, { uid: 'default-uid' }));
    });

    const ref = createMockRef({ authWithCustomToken });
    firebaseLoginCustom(ref, { uid: 'u' }, { secret: 's' }, (error, data) => {
      expect(error).toBeNull();
      expect(data).toEqual({ uid: 'default-uid' });
      done();
    });
  });

  it('uses empty uid and default options when called with minimal args', (done) => {
    const authWithCustomToken = vi.fn((_token: string, callback: FirebaseLoginCallback) => {
      process.nextTick(() => callback(null, { uid: 'ok' }));
    });

    const ref = createMockRef({ authWithCustomToken });
    firebaseLoginCustom(ref, undefined, undefined, (error) => {
      expect(error).toBeNull();
      expect(authWithCustomToken).toHaveBeenCalledTimes(1);
      done();
    });
  });
});
