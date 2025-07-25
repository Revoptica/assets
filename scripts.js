/*
 * RevOptica Authentication Script
 * 
 * To use this script, you need to provide configuration data before loading this script.
 * Add this to your HTML before the script tag:
 * 
 * <script>
 * window.configData = {
 *   auth0Tenant: "your-tenant",
 *   auth0Domain: "your-domain.auth0.com",
 *   clientID: "your-client-id",
 *   callbackURL: "your-callback-url",
 *   authorizationServer: {
 *     issuer: "your-issuer"
 *   },
 *   internalOptions: {
 *     leeway: 60
 *   }
 * };
 * </script>
 */

window.addEventListener('load', function() {

    // Try to get config from different sources
    var config;
    try {
        // First try to get config from the @@config@@ placeholder (if it exists)
        if (typeof window.configData !== 'undefined') {
            config = window.configData;
        } else if (typeof window.atob !== 'undefined') {
            // Fallback to the original method
            config = JSON.parse(
                decodeURIComponent(escape(window.atob('@@config@@')))
            );
        } else {
            console.error('Configuration not found. Please ensure configData is available.');
            return;
        }
    } catch (e) {
        console.error('Error parsing configuration:', e);
        return;
    }

    document.getElementById('registerSwitcher').addEventListener('click', function(e){
      e.preventDefault();
      clearErrors();
      document.getElementById('registerform').className = 'd-none';
      document.getElementById('loginform').className = '';
      document.getElementById('forgotpassword').className = 'd-none';
      // document.getElementById('extrainfo').className = 'd-none';
    });
    document.getElementById('registerSwitcher2').addEventListener('click', function(e){
      e.preventDefault();
      clearErrors();
      document.getElementById('registerform').className = 'd-none';
      document.getElementById('loginform').className = '';
      document.getElementById('forgotpassword').className = 'd-none';
      // document.getElementById('extrainfo').className = 'd-none';
    });
    document.getElementById('loginSwitcher').addEventListener('click', function(e){
      e.preventDefault();
      clearErrors();
      document.getElementById('registerform').className = '';
      document.getElementById('loginform').className = 'd-none';
      document.getElementById('forgotpassword').className = 'd-none';
      // document.getElementById('extrainfo').className = '';
    });
    document.getElementById('forgotswitcher').addEventListener('click', function(e){
      e.preventDefault();
      clearErrors();
      document.getElementById('registerform').className = 'd-none';
      document.getElementById('loginform').className = 'd-none';
      document.getElementById('forgotpassword').className = '';
      // document.getElementById('extrainfo').className = 'd-none';
    });

    if(config && "internalOptions" in config) {
      var leeway = config.internalOptions.leeway;
      if (leeway) {
        var convertedLeeway = parseInt(leeway);
      
        if (!isNaN(convertedLeeway)) {
          config.internalOptions.leeway = convertedLeeway;
        }
      }
    }

    var params = Object.assign({
      overrides: {
        __tenant: config.auth0Tenant,
        __token_issuer: config.authorizationServer.issuer
      },
      domain: config.auth0Domain,
      clientID: config.clientID,
      redirectUri: config.callbackURL,
      responseType: 'code'
    }, config.internalOptions);

    var webAuth = new auth0.WebAuth(params);
    var databaseConnection = 'Username-Password-Authentication';
    // var captcha = webAuth.renderCaptcha(
    //   document.querySelector('.captcha-container')
    // );

    function login(e) {
      console.log('login');
      e.preventDefault();
      clearErrors();
      var button = this;
      var username = document.getElementById('loginemail').value;
      var password = document.getElementById('loginpassword').value;
      button.disabled = true;
      webAuth.login({
        realm: databaseConnection,
        username: username,
        password: password,
        // captcha: captcha.getValue()
      }, function(err) {
        if (err) displayError(err);
        button.disabled = false;
      });
    }

    function forgotpassword(e) {
      console.log('forgotpassword');
      e.preventDefault();
      clearErrors();
      var button = this;
      var email = document.getElementById('forgotemail').value;
      button.disabled = true;
      webAuth.changePassword({
        connection: databaseConnection,
        email: email,
        // captcha: captcha.getValue()
      }, function (err, resp) {
        if (err) {
          if (err) displayError(err);
        } else {
          document.getElementById("forgot-contents").innerHTML = resp;
          document.getElementById("btn-forgot").classList.add('d-none');
          button.disabled = false;
        }
      });
    }

    function signup(e) {
      console.log('signup');
      e.preventDefault();
      clearErrors();
      var button = this;
      var email = document.getElementById('regemail').value;
      var password = document.getElementById('regpassword').value;

      button.disabled = true;
      webAuth.redirect.signupAndLogin({
        connection: databaseConnection,
        email: email,
        password: password,
        // captcha: captcha.getValue()
      }, function(err) {
        if(err) {
          displayError(err);
        }
        else {
          console.error('unknown error', err);
        }
        button.disabled = false;
      });
    }

    function loginWithGoogle() {
      console.log('loginWithGoogle');
      webAuth.authorize({
        connection: 'google-oauth2'
      }, function(err) {
        if (err) displayError(err);
      });
    }
            
    function loginWithMicrosoft() {
      console.log('loginWithMicrosoft');
      webAuth.authorize({
        connection: 'windowslive'
      }, function(err) {
        if (err) displayError(err);
      });
    }
    
    function clearErrors() {
      var errorMessage = document.getElementsByClassName('error-message');
      for (var i=0; i<errorMessage.length; i++) {
        errorMessage[i].innerHTML = "";
        errorMessage[i].style.display = 'none';
      }
    }

    function displayError(err) {
      captcha.reload();
      var errorMessage = document.getElementsByClassName('error-message');
      for (var i=0; i<errorMessage.length; i++) {
        errorMessage[i].innerHTML = err.policy || err.description;
        errorMessage[i].style.display = 'block';
      }
    }

    document.getElementById('btn-login').addEventListener('click', login);
    document.getElementById('btn-google').addEventListener('click', loginWithGoogle);
    document.getElementById('btn-google2').addEventListener('click', loginWithGoogle);
    document.getElementById('btn-microsoft').addEventListener('click', loginWithMicrosoft);
    document.getElementById('btn-microsoft2').addEventListener('click', loginWithMicrosoft);
    document.getElementById('btn-signup').addEventListener('click', signup);
    document.getElementById('btn-forgot').addEventListener('click', forgotpassword);
  });