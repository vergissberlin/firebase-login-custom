###*
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
###
class FirebaseLoginCustom

  constructor: (ref,
                data = {},
                option = {
                  admin: false
                  expires: false
                  debug: false
                  notBefore: false
                },
                callback = ->) ->
    # Requirements
    FirebaseTokenGenerator = require('firebase-token-generator')

    ## Defaults

    # admin (Boolean) - Set to true if you want to disable all security
    # rules for this client. This will provide the client with read and
    # write access to your entire Firebase.
    if typeof option.admin isnt 'boolean'
      option.admin = false

    # debug (Boolean) - Set to true to enable debug output from your
    # security rules. his debug output will be automatically output to
    # the JavaScript console. You should generally not leave this set to
    # true in production (as it slows down the rules implementation and
    # gives your users visibility into your rules), but it can be helpful
    # for debugging.
    if typeof option.debug isnt 'boolean'
      option.debug = false

    # expires (Number) - A timestamp (as number of seconds since the epoch)
    # denoting the time after which this token should no longer be valid.
    if typeof option.expires isnt 'number'
      option.expires = +new Date / 1000 + 86400

    # notBefore (Number) - A timestamp (as number of seconds since the epoch)
    # denoting the time before which this token should be rejected by the
    # server.
    if typeof option.notBefore isnt 'number'
      option.notBefore = +new Date / 1000

    ## Validation
    if typeof ref isnt 'object'
      throw new Error 'Ref must be an object!'
    if typeof data.uid isnt 'string'
      throw new Error 'Data object must have an "uid" field!'
    if typeof option.secret isnt 'string'
      throw new Error 'Option object must have an "secret" field!'
    if typeof callback isnt "function"
      throw new Error 'Callback must be a function!'

    # Generate token
    tokenGenerator = new FirebaseTokenGenerator(option.secret)
    authToken = tokenGenerator.createToken(
      data,
      {
        admin: option.admin
        debug: option.debug
        expires: option.expires
        notBefore: option.notBefore
      }
    )

    # Authentication
    ref.authWithCustomToken authToken, (error, authData)->
      if error
        switch error.code
          when 'INVALID_EMAIL'
            error = 'The specified user account email is invalid.'
          when 'INVALID_PASSWORD'
            error = 'The specified user account password is incorrect.'
          when 'INVALID_USER'
            error = 'The specified user account does not exist.'
          else
            error = 'Error logging user in: ' + error.toString()

      callback error, authData

module.exports = FirebaseLoginCustom
