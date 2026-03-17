import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  FirebaseLoginCustom,
  FirebaseLoginCustomValidationError,
  FirebaseLoginCustomTokenError,
  firebaseLoginCustomAsync,
  FIREBASE_LOGIN_CUSTOM_VALIDATION_ERROR,
  FIREBASE_LOGIN_CUSTOM_TOKEN_ERROR,
  type FirebaseRef,
  type AuthData,
  type FirebaseLoginOptionInput,
  type FirebaseLoginCallback,
} from '../firebase-login-custom';

// Mock so we can test token failure and option forwarding; hoisted so factory can use it
const { mockCreateToken } = vi.hoisted(() => ({
  mockCreateToken: vi.fn().mockReturnValue('mock-token'),
}));
vi.mock('firebase-token-generator', () => ({
  default: class MockFirebaseTokenGenerator {
    constructor() {}
    createToken(data: unknown, opts: unknown) {
      return (mockCreateToken as (d: unknown, o: unknown) => string)(data, opts);
    }
  },
}));

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

    it('throws when ref is null or undefined', () => {
      expect(() => {
        new FirebaseLoginCustom(
          null as unknown as FirebaseRef,
          validData,
          validOption,
          validCallback
        );
      }).toThrow(FirebaseLoginCustomValidationError);
      expect(() => {
        new FirebaseLoginCustom(
          undefined as unknown as FirebaseRef,
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

    it('throws errors with correct code and name', () => {
      try {
        new FirebaseLoginCustom(
          null as unknown as FirebaseRef,
          validData,
          validOption,
          validCallback
        );
      } catch (e) {
        expect(e).toBeInstanceOf(FirebaseLoginCustomValidationError);
        expect((e as FirebaseLoginCustomValidationError).code).toBe(FIREBASE_LOGIN_CUSTOM_VALIDATION_ERROR);
        expect((e as Error).name).toBe('FirebaseLoginCustomValidationError');
      }
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
        process.nextTick(() => callback({ code: 'INVALID_EMAIL' } as unknown as Error, undefined));
      });

      const ref = createMockRef({ authWithCustomToken });
      const [error] = await runWithCallback((cb) =>
        new FirebaseLoginCustom(ref, { uid: 'u' }, { secret: 's' }, cb)
      );

      expect(error).toBe('The specified user account email is invalid.');
    });

    it('passes translated error to callback when auth fails with INVALID_PASSWORD', async () => {
      const authWithCustomToken = vi.fn((_token: string, callback: FirebaseLoginCallback) => {
        process.nextTick(() => callback({ code: 'INVALID_PASSWORD' } as unknown as Error, undefined));
      });

      const ref = createMockRef({ authWithCustomToken });
      const [error] = await runWithCallback((cb) =>
        new FirebaseLoginCustom(ref, { uid: 'u' }, { secret: 's' }, cb)
      );

      expect(error).toBe('The specified user account password is incorrect.');
    });

    it('passes translated error to callback when auth fails with INVALID_USER', async () => {
      const authWithCustomToken = vi.fn((_token: string, callback: FirebaseLoginCallback) => {
        process.nextTick(() => callback({ code: 'INVALID_USER' } as unknown as Error, undefined));
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

    it('passes generic error message when error has unknown code property', async () => {
      const authWithCustomToken = vi.fn((_token: string, callback: FirebaseLoginCallback) => {
        process.nextTick(() =>
          callback(Object.assign(new Error('Custom'), { code: 'UNKNOWN_CODE' }), undefined)
        );
      });

      const ref = createMockRef({ authWithCustomToken });
      const [error] = await runWithCallback((cb) =>
        new FirebaseLoginCustom(ref, { uid: 'u' }, { secret: 's' }, cb)
      );

      expect(error).toContain('Error logging user in:');
      expect(String(error)).toContain('Custom');
    });
  });

  describe('token generation failure', () => {
    it('invokes callback with FirebaseLoginCustomTokenError when createToken throws', async () => {
      const createTokenThrow = new Error('Invalid secret');
      mockCreateToken.mockImplementationOnce(() => {
        throw createTokenThrow;
      });

      const ref = createMockRef();
      const [error, authData] = await runWithCallback((cb) =>
        new FirebaseLoginCustom(ref, { uid: 'u' }, { secret: 's' }, cb)
      );

      expect(authData).toBeUndefined();
      expect(error).toBeInstanceOf(FirebaseLoginCustomTokenError);
      expect((error as FirebaseLoginCustomTokenError).code).toBe(FIREBASE_LOGIN_CUSTOM_TOKEN_ERROR);
      expect((error as FirebaseLoginCustomTokenError).cause).toBe(createTokenThrow);
      expect(String(error)).toContain('Token generation failed:');
    });
  });

  describe('option defaults', () => {
    beforeEach(() => {
      mockCreateToken.mockReturnValue('mock-token');
    });

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

    it('passes explicit admin and debug to token generator', async () => {
      const ref = createMockRef();
      await runWithCallback((cb) =>
        new FirebaseLoginCustom(ref, { uid: 'u' }, { secret: 's', admin: true, debug: true }, cb)
      );
      expect(mockCreateToken).toHaveBeenCalledWith(
        { uid: 'u' },
        expect.objectContaining({ admin: true, debug: true })
      );
    });

    it('passes explicit expires and notBefore to token generator', async () => {
      const ref = createMockRef();
      const expires = 1234567890;
      const notBefore = 1234567800;
      await runWithCallback((cb) =>
        new FirebaseLoginCustom(ref, { uid: 'u' }, { secret: 's', expires, notBefore }, cb)
      );
      expect(mockCreateToken).toHaveBeenCalledWith(
        { uid: 'u' },
        expect.objectContaining({ expires, notBefore })
      );
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

describe('firebaseLoginCustomAsync', () => {
  it('resolves with authData on success', async () => {
    const ref = createMockRef();
    const result = await firebaseLoginCustomAsync(ref, { uid: 'u' }, { secret: 's' });
    expect(result).toEqual({ authData: { uid: 'test-uid' } });
  });

  it('rejects when auth fails', async () => {
    const authWithCustomToken = vi.fn((_token: string, callback: FirebaseLoginCallback) => {
      process.nextTick(() => callback({ code: 'INVALID_EMAIL' } as unknown as Error, undefined));
    });
    const ref = createMockRef({ authWithCustomToken });
    await expect(firebaseLoginCustomAsync(ref, { uid: 'u' }, { secret: 's' })).rejects.toBe(
      'The specified user account email is invalid.'
    );
  });
});
