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
    option: FirebaseLoginOption = { ...defaultOption },
    callback: FirebaseLoginCallback = () => {}
  ) {
    const FirebaseTokenGenerator = require('firebase-token-generator');

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
      throw new Error('Ref must be an object!');
    }
    if (typeof data.uid !== 'string') {
      throw new Error('Data object must have an "uid" field!');
    }
    if (typeof option.secret !== 'string') {
      throw new Error('Option object must have an "secret" field!');
    }
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function!');
    }

    const tokenGenerator = new FirebaseTokenGenerator(option.secret);
    const authToken = tokenGenerator.createToken(data, {
      admin: option.admin,
      debug: option.debug,
      expires: option.expires,
      notBefore: option.notBefore,
    });

    ref.authWithCustomToken(authToken, (error, authData) => {
      if (error) {
        const err = error as { code?: string };
        switch (err.code) {
          case 'INVALID_EMAIL':
            error = 'The specified user account email is invalid.';
            break;
          case 'INVALID_PASSWORD':
            error = 'The specified user account password is incorrect.';
            break;
          case 'INVALID_USER':
            error = 'The specified user account does not exist.';
            break;
          default:
            error = 'Error logging user in: ' + String(error);
        }
      }
      callback(error, authData);
    });
  }
}

/** Callable export for backward compatibility (use without `new`) */
function firebaseLoginCustom(
  ref: FirebaseRef,
  data?: AuthData,
  option?: FirebaseLoginOption,
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
