import { describe, it, expect, vi } from 'vitest';
import {
  FirebaseLoginCustom,
  FirebaseLoginCustomValidationError,
  type FirebaseRef,
  type AuthData,
  type FirebaseLoginOptionInput,
  type FirebaseLoginCallback,
} from '../firebase-login-custom';

/** Same behaviour as the default export (call without new) */
function firebaseLoginCustom(
  ref: FirebaseRef,
  data?: AuthData,
  option?: FirebaseLoginOptionInput,
  callback?: FirebaseLoginCallback
): void {
  new FirebaseLoginCustom(
    ref,
    data ?? { uid: '' },
    option ?? {},
    callback ?? (() => {})
  );
}

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

function runWithCallback(
  run: (callback: FirebaseLoginCallback) => void
): Promise<[error: Error | string | null, authData?: unknown]> {
  return new Promise((resolve, reject) => {
    try {
      run((error, authData) => resolve([error, authData]));
    } catch (e) {
      reject(e);
    }
  });
}

describe('FirebaseLoginCustom', () => {
  describe('validation', () => {
    const validRef = createMockRef();
    const validData: AuthData = { uid: 'user-1' };
    const validOption: FirebaseLoginOptionInput = { secret: 'my-secret' };
    const validCallback: FirebaseLoginCallback = () => {};

    it('throws FirebaseLoginCustomValidationError when ref is not an object', () => {
      expect(() => {
        new FirebaseLoginCustom(
          'not-a-ref' as unknown as FirebaseRef,
          validData,
          validOption,
          validCallback
        );
      }).toThrow(FirebaseLoginCustomValidationError);
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
      }).toThrow('Data object must have a "uid" field!');

      expect(() => {
        new FirebaseLoginCustom(
          validRef,
          { uid: 123 } as unknown as AuthData,
          validOption,
          validCallback
        );
      }).toThrow('Data object must have a "uid" field!');
    });

    it('throws when option.secret is not a string', () => {
      expect(() => {
        new FirebaseLoginCustom(validRef, validData, {} as FirebaseLoginOptionInput, validCallback);
      }).toThrow('Option object must have a "secret" field!');

      expect(() => {
        new FirebaseLoginCustom(
          validRef,
          validData,
          { secret: 123 } as unknown as FirebaseLoginOptionInput,
          validCallback
        );
      }).toThrow('Option object must have a "secret" field!');
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
    it('calls authWithCustomToken with a generated token and invokes callback on success', async () => {
      const authWithCustomToken = vi.fn((token: string, callback: FirebaseLoginCallback) => {
        expect(typeof token).toBe('string');
        expect(token.length).toBeGreaterThan(0);
        process.nextTick(() => callback(null, { uid: 'auth-uid' }));
      });

      const ref = createMockRef({ authWithCustomToken });
      const [error, authData] = await runWithCallback((cb) =>
        new FirebaseLoginCustom(ref, { uid: 'user-1' }, { secret: 'secret' }, cb)
      );

      expect(error).toBeNull();
      expect(authData).toEqual({ uid: 'auth-uid' });
      expect(authWithCustomToken).toHaveBeenCalledTimes(1);
    });

    it('passes translated error to callback when auth fails with INVALID_EMAIL', async () => {
      const authWithCustomToken = vi.fn((_token: string, callback: FirebaseLoginCallback) => {
        process.nextTick(() => callback({ code: 'INVALID_EMAIL' } as Error, undefined));
      });

      const ref = createMockRef({ authWithCustomToken });
      const [error] = await runWithCallback((cb) =>
        new FirebaseLoginCustom(ref, { uid: 'u' }, { secret: 's' }, cb)
      );

      expect(error).toBe('The specified user account email is invalid.');
    });

    it('passes translated error to callback when auth fails with INVALID_PASSWORD', async () => {
      const authWithCustomToken = vi.fn((_token: string, callback: FirebaseLoginCallback) => {
        process.nextTick(() => callback({ code: 'INVALID_PASSWORD' } as Error, undefined));
      });

      const ref = createMockRef({ authWithCustomToken });
      const [error] = await runWithCallback((cb) =>
        new FirebaseLoginCustom(ref, { uid: 'u' }, { secret: 's' }, cb)
      );

      expect(error).toBe('The specified user account password is incorrect.');
    });

    it('passes translated error to callback when auth fails with INVALID_USER', async () => {
      const authWithCustomToken = vi.fn((_token: string, callback: FirebaseLoginCallback) => {
        process.nextTick(() => callback({ code: 'INVALID_USER' } as Error, undefined));
      });

      const ref = createMockRef({ authWithCustomToken });
      const [error] = await runWithCallback((cb) =>
        new FirebaseLoginCustom(ref, { uid: 'u' }, { secret: 's' }, cb)
      );

      expect(error).toBe('The specified user account does not exist.');
    });

    it('passes generic error message for unknown auth error codes', async () => {
      const authWithCustomToken = vi.fn((_token: string, callback: FirebaseLoginCallback) => {
        process.nextTick(() => callback(new Error('Network error'), undefined));
      });

      const ref = createMockRef({ authWithCustomToken });
      const [error] = await runWithCallback((cb) =>
        new FirebaseLoginCustom(ref, { uid: 'u' }, { secret: 's' }, cb)
      );

      expect(error).toContain('Error logging user in:');
      expect(String(error)).toContain('Network error');
    });

  });

  describe('option defaults', () => {
    it('uses default expires and notBefore when not provided', async () => {
      const authWithCustomToken = vi.fn((token: string, callback: FirebaseLoginCallback) => {
        expect(token).toBeDefined();
        process.nextTick(() => callback(null, { uid: 'u' }));
      });

      const ref = createMockRef({ authWithCustomToken });
      const [error] = await runWithCallback((cb) =>
        new FirebaseLoginCustom(ref, { uid: 'u' }, { secret: 's' }, cb)
      );

      expect(error).toBeNull();
    });
  });
});

describe('firebaseLoginCustom (default export)', () => {
  it('works without new and calls authWithCustomToken', async () => {
    const authWithCustomToken = vi.fn((token: string, callback: FirebaseLoginCallback) => {
      expect(typeof token).toBe('string');
      process.nextTick(() => callback(null, { uid: 'default-uid' }));
    });

    const ref = createMockRef({ authWithCustomToken });
    const [error, data] = await runWithCallback((cb) =>
      firebaseLoginCustom(ref, { uid: 'u' }, { secret: 's' }, cb)
    );

    expect(error).toBeNull();
    expect(data).toEqual({ uid: 'default-uid' });
  });

  it('uses empty uid when data omitted and invokes callback on success', async () => {
    const authWithCustomToken = vi.fn((_token: string, callback: FirebaseLoginCallback) => {
      process.nextTick(() => callback(null, { uid: 'ok' }));
    });

    const ref = createMockRef({ authWithCustomToken });
    const [error] = await runWithCallback((cb) =>
      firebaseLoginCustom(ref, undefined, { secret: 's' }, cb)
    );

    expect(error).toBeNull();
    expect(authWithCustomToken).toHaveBeenCalledTimes(1);
  });
});
