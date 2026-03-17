/**
 * FirebaseLoginCustom
 *
 * Authenticating Users with Custom login
 * Firebase makes it easy to integrate email and password authentication
 * into your app. Firebase automatically stores your users' credentials
 * securely (using bcrypt) and redundantly (daily off-site backups).
 * This separates sensitive user credentials from your application data,
 * and lets you focus on the user interface and experience for your app.
 *
 * @author  André Lademann <vergissberlin@googlemail.com>
 * @link    https://www.firebase.com/docs/web/guide/login/password.html
 * @param   ref Firebase object reference
 * @param   data Authentication object with uid and secret
 * @param   option Option object with admin, debug and expire settings
 * @param   callback Callback function
 * @return  FirebaseLoginCustom
 */

import FirebaseTokenGenerator from 'firebase-token-generator';

/** Error code for validation failures (invalid ref, data, option, or callback). */
export const FIREBASE_LOGIN_CUSTOM_VALIDATION_ERROR = 'FIREBASE_LOGIN_CUSTOM_VALIDATION_ERROR';

/** Error code for token generation failures (e.g. invalid claims or secret). */
export const FIREBASE_LOGIN_CUSTOM_TOKEN_ERROR = 'FIREBASE_LOGIN_CUSTOM_TOKEN_ERROR';

/**
 * Thrown when constructor arguments are invalid (ref, data, option, or callback).
 * Consumers can use `error.code === FIREBASE_LOGIN_CUSTOM_VALIDATION_ERROR` or
 * `error instanceof FirebaseLoginCustomValidationError`.
 */
export class FirebaseLoginCustomValidationError extends Error {
  readonly code = FIREBASE_LOGIN_CUSTOM_VALIDATION_ERROR;

  constructor(message: string) {
    super(message);
    this.name = 'FirebaseLoginCustomValidationError';
    Object.setPrototypeOf(this, FirebaseLoginCustomValidationError.prototype);
  }
}

/**
 * Thrown when token generation fails (e.g. invalid secret or claims).
 * Passed to the callback when createToken throws; not thrown from the constructor.
 */
export class FirebaseLoginCustomTokenError extends Error {
  readonly code = FIREBASE_LOGIN_CUSTOM_TOKEN_ERROR;
  readonly cause: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'FirebaseLoginCustomTokenError';
    this.cause = cause;
    Object.setPrototypeOf(this, FirebaseLoginCustomTokenError.prototype);
  }
}

export interface AuthData {
  uid: string;
  [key: string]: unknown;
}

export interface FirebaseLoginOption {
  admin?: boolean;
  debug?: boolean;
  expires?: number;
  notBefore?: number;
  secret: string;
}

/** Option type for inputs where secret is not yet validated */
export type FirebaseLoginOptionInput = Omit<FirebaseLoginOption, 'secret'> & {
  secret?: string;
};

export type FirebaseLoginCallback = (
  error: Error | string | null,
  authData?: unknown
) => void;

export interface FirebaseRef {
  authWithCustomToken: (
    token: string,
    callback: FirebaseLoginCallback
  ) => void;
}

/** Shape of auth errors passed to the callback by Firebase (with optional code). */
export interface FirebaseAuthError extends Error {
  code?: string;
}

const DEFAULT_OPTION: Required<Omit<FirebaseLoginOption, 'secret'>> & {
  secret?: string;
} = {
  admin: false,
  debug: false,
  expires: 0,
  notBefore: 0,
};

const SECONDS_PER_DAY = 86400;

/** User-facing messages for known Firebase auth error codes */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  INVALID_EMAIL: 'The specified user account email is invalid.',
  INVALID_PASSWORD: 'The specified user account password is incorrect.',
  INVALID_USER: 'The specified user account does not exist.',
};

function resolveOption(
  input: FirebaseLoginOptionInput
): Required<Omit<FirebaseLoginOption, 'secret'>> & { secret: string } {
  const now = Date.now() / 1000;
  return {
    admin: typeof input.admin === 'boolean' ? input.admin : DEFAULT_OPTION.admin,
    debug: typeof input.debug === 'boolean' ? input.debug : DEFAULT_OPTION.debug,
    expires: typeof input.expires === 'number' ? input.expires : now + SECONDS_PER_DAY,
    notBefore: typeof input.notBefore === 'number' ? input.notBefore : now,
    secret: input.secret as string,
  };
}

/**
 * Custom login helper: generates a Firebase custom token and authenticates via the given ref.
 * Validation errors throw synchronously; token or auth failures are reported to the callback.
 */
export class FirebaseLoginCustom {
  /**
   * @param ref - Firebase ref with `authWithCustomToken(token, callback)`
   * @param data - Auth payload; must include `uid` (string)
   * @param option - Options; must include `secret`. Optional: admin, debug, expires, notBefore
   * @param callback - Called with (error, authData) when auth completes or token generation fails
   */
  constructor(
    ref: FirebaseRef,
    data: AuthData = { uid: '' },
    option: FirebaseLoginOptionInput = { ...DEFAULT_OPTION },
    callback: FirebaseLoginCallback = () => {}
  ) {
    if (ref == null || typeof ref !== 'object') {
      throw new FirebaseLoginCustomValidationError('Ref must be an object!');
    }
    if (typeof data.uid !== 'string') {
      throw new FirebaseLoginCustomValidationError('Data object must have a "uid" field!');
    }
    if (typeof option.secret !== 'string') {
      throw new FirebaseLoginCustomValidationError('Option object must have a "secret" field!');
    }
    if (typeof callback !== 'function') {
      throw new FirebaseLoginCustomValidationError('Callback must be a function!');
    }

    const resolvedOption = resolveOption(option);

    let authToken: string;
    try {
      const tokenGenerator = new FirebaseTokenGenerator(resolvedOption.secret);
      authToken = tokenGenerator.createToken(data, {
        admin: resolvedOption.admin,
        debug: resolvedOption.debug,
        expires: resolvedOption.expires,
        notBefore: resolvedOption.notBefore,
      });
    } catch (err) {
      const callbackError =
        err instanceof Error
          ? new FirebaseLoginCustomTokenError('Token generation failed: ' + err.message, err)
          : new FirebaseLoginCustomTokenError('Token generation failed: ' + String(err), err);
      process.nextTick(() => callback(callbackError, undefined));
      return;
    }

    ref.authWithCustomToken(authToken, (error, authData) => {
      let callbackError: Error | string | null = null;
      if (error) {
        const authErr = error as FirebaseAuthError;
        const knownMessage =
          authErr?.code !== undefined ? AUTH_ERROR_MESSAGES[authErr.code] : undefined;
        callbackError =
          knownMessage !== undefined ? knownMessage : 'Error logging user in: ' + String(error);
      }
      callback(callbackError, authData);
    });
  }
}

/**
 * Callable form: same as `new FirebaseLoginCustom(...)`. Use without `new` for backward compatibility.
 */
function firebaseLoginCustom(
  ref: FirebaseRef,
  data?: AuthData,
  option?: FirebaseLoginOptionInput,
  callback?: FirebaseLoginCallback
): void {
  new FirebaseLoginCustom(
    ref,
    data ?? { uid: '' },
    option ?? { ...DEFAULT_OPTION },
    callback ?? (() => {})
  );
}

/**
 * Promise-based API: same as `firebaseLoginCustom` but returns a Promise.
 * Resolves with `{ authData }` on success, rejects with the same error type as the callback
 * (string or `FirebaseLoginCustomTokenError` / auth error message).
 */
export function firebaseLoginCustomAsync(
  ref: FirebaseRef,
  data: AuthData = { uid: '' },
  option?: FirebaseLoginOptionInput
): Promise<{ authData: unknown }> {
  return new Promise((resolve, reject) => {
    firebaseLoginCustom(ref, data, option ?? { ...DEFAULT_OPTION }, (error, authData) => {
      if (error !== null && error !== undefined) {
        reject(error);
      } else {
        resolve({ authData });
      }
    });
  });
}

export default firebaseLoginCustom;
