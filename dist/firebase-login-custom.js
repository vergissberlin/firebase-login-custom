
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
 * @param   {*} ref Firebase object reference
 * @param   {*} data Authentication object with uid and secret
 * @param   {*} option Option object with admin, debug and expire settingst
 * @param   {*} callback Callback function
 * @return  {*} FirebaseLoginCustom
 */

(function() {
  var FirebaseLoginCustom;

  FirebaseLoginCustom = (function() {
    function FirebaseLoginCustom(ref, data, option, callback) {
      var FirebaseTokenGenerator, authToken, tokenGenerator;
      if (data == null) {
        data = {};
      }
      if (option == null) {
        option = {
          admin: false,
          expires: false,
          debug: false,
          notBefore: false
        };
      }
      if (callback == null) {
        callback = function() {};
      }
      FirebaseTokenGenerator = require('firebase-token-generator');
      if (typeof option.admin !== 'boolean') {
        option.admin = false;
      }
      if (typeof option.debug !== 'boolean') {
        option.debug = false;
      }
      if (typeof option.expires !== 'number') {
        option.expires = +(new Date) / 1000 + 86400;
      }
      if (typeof option.notBefore !== 'number') {
        option.notBefore = +(new Date) / 1000;
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
      if (typeof callback !== "function") {
        throw new Error('Callback must be a function!');
      }
      tokenGenerator = new FirebaseTokenGenerator(option.secret);
      authToken = tokenGenerator.createToken(data, {
        admin: option.admin,
        debug: option.debug,
        expires: option.expires,
        notBefore: option.notBefore
      });
      ref.authWithCustomToken(authToken, function(error, authData) {
        if (error) {
          switch (error.code) {
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
              error = 'Error logging user in: ' + error.toString();
          }
        }
        return callback(error, authData);
      });
    }

    return FirebaseLoginCustom;

  })();

  module.exports = FirebaseLoginCustom;

}).call(this);
