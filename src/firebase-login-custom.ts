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
type FirebaseLoginOptionInput = Omit<FirebaseLoginOption, 'secret'> & {
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

const defaultOption: Required<Omit<FirebaseLoginOption, 'secret'>> & {
  secret?: string;
} = {
  admin: false,
  expires: 0,
  debug: false,
  notBefore: 0,
};

export class FirebaseLoginCustom {
  constructor(
    ref: FirebaseRef,
    data: AuthData = { uid: '' },
    option: FirebaseLoginOptionInput = { ...defaultOption },
    callback: FirebaseLoginCallback = () => {}
  ) {
    if (typeof option.admin !== 'boolean') {
      option.admin = false;
    }
    if (typeof option.debug !== 'boolean') {
      option.debug = false;
    }
    if (typeof option.expires !== 'number') {
      option.expires = +new Date() / 1000 + 86400;
    }
    if (typeof option.notBefore !== 'number') {
      option.notBefore = +new Date() / 1000;
    }

    if (typeof ref !== 'object') {
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

    let authToken: string;
    try {
      const tokenGenerator = new FirebaseTokenGenerator(option.secret);
      authToken = tokenGenerator.createToken(data, {
        admin: option.admin,
        debug: option.debug,
        expires: option.expires,
        notBefore: option.notBefore,
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
        const err = error as { code?: string };
        switch (err.code) {
          case 'INVALID_EMAIL':
            callbackError = 'The specified user account email is invalid.';
            break;
          case 'INVALID_PASSWORD':
            callbackError = 'The specified user account password is incorrect.';
            break;
          case 'INVALID_USER':
            callbackError = 'The specified user account does not exist.';
            break;
          default:
            callbackError = 'Error logging user in: ' + String(error);
        }
      }
      callback(callbackError, authData);
    });
  }
}

/** Callable export for backward compatibility (use without `new`) */
function firebaseLoginCustom(
  ref: FirebaseRef,
  data?: AuthData,
  option?: FirebaseLoginOptionInput,
  callback?: FirebaseLoginCallback
): void {
  new FirebaseLoginCustom(
    ref,
    data ?? { uid: '' },
    option ?? { ...defaultOption },
    callback ?? (() => {})
  );
}

export default firebaseLoginCustom;
