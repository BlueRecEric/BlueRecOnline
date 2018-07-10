'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
  .controller('LoginCtrl',['$scope','$http','AuthService','$routeParams','$location','ActiveUser', '$q', 'Page', 'MakeToast', 'SaveData', 'BLUEREC_ONLINE_CONFIG', function ($scope,$http,AuthService,$routeParams,$location,ActiveUser,$q,Page,MakeToast,SaveData,BLUEREC_ONLINE_CONFIG) {
    var log = this;

    //console.log(Page);

    log.orgurl = $routeParams.orgurl;
    log.disableLogin = false;
    log.config = [];

    if(ActiveUser.isLoggedIn())
    {
        $location.path('/' + log.orgurl + '/home');
    }

      function socialSignIn(serviceName)
      {
          MakeToast.popOn('danger',serviceName,serviceName + ' log in is currently disabled.');
      }

      function passwordRecovery()
      {
          MakeToast.popOn('danger','Feature Unavailable', 'Password recovery is currently unavailable.');
      }

      function switchPortal(code) {
          $routeParams.orgurl = code;
      }

      log.getLoginConfig = function () {



          var req = {
              method: 'GET',
              url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/config/login',
              headers: {
                  'Content-Type': undefined
              }
          };

          $http(req)
              .success(function (response) {

                  console.log(response);
                  log.disableLogin = false;

                  log.config = response.data;

                  if(log.config.disablePrimaryPortal == '1' && log.config.isPrimaryPortal == '1')
                  {
                      log.disableLogin = true;
                  }

                  for(var p = 0; p < log.config.portals.length; p++)
                  {
                      console.log('check logo for ' + log.config.portals[p].portal_code);
                      log.config.portals[p].portal_logo = getPortalLogo(log.config.portals[p].portal_code);
                      console.log('code length: ' + log.config.portals[p].portal_code.length);
                      console.log('logo length: ' + log.config.portals[p].portal_logo.length);
                  }

                  console.log('Config data:');
                  console.log(log.config);

              });

      };

      function isImage(src) {

          var deferred = $q.defer();

          var image = new Image();
          image.onerror = function() {
              deferred.resolve(false);
          };
          image.onload = function() {
              deferred.resolve(true);
          };
          image.src = src;

          return deferred.promise;
      }

      function getPortalLogo(portalCode)
      {
          var logo = '';

          console.log('is images/'+portalCode+'.png a valid image?');
          isImage('images/'+portalCode+'.png').then(function(test) {
              if (test) {
                  logo = 'images/' + portalCode + '.png';
                  console.log('Yes!');
              }
              else {
                  console.log('No!');
                  console.log('is images/'+portalCode+'.jpg a valid image?');
                  isImage('images/' + portalCode + '.jpg').then(function (test) {
                      if (test) {
                          logo = 'images/' + portalCode + '.jpg';
                          console.log('Yes!');
                      }
                      else {
                          console.log('No!');
                          console.log('is images/'+portalCode+'.gif a valid image?');
                          isImage('images/' + portalCode + '.gif').then(function (test) {
                              if (test) {
                                  logo = 'images/' + portalCode + '.gif';
                                  console.log('Yes!');
                              }
                          });
                      }
                  });
              }
          });

          return logo;
      }

      function processPostLogin(response)
      {
          ActiveUser.updateUser().then
          (
              function success() {
                  ActiveUser.setActiveUser(response.data).then(
                      function success() {

                          //console.log('activeuser set to');
                          //console.log(ActiveUser.userData);

                          var returnToPage = SaveData.getAfterLogin();

                          if(returnToPage != null && angular.isDefined(returnToPage) && returnToPage.length > 0)
                          {
                              console.log('return to last page:');
                              console.log(returnToPage);
                              SaveData.setAfterLogin();
                              $location.path('/' + log.orgurl + '/' + returnToPage);
                          }
                          else {
                              if (response.data.questions_answered == '1') {
                                  $location.path('/' + log.orgurl + '/home');
                              }
                              else {
                                  $location.path('/' + log.orgurl + '/accountupdate');
                              }
                          }
                      }, function () {
                      }, function () {
                      }
                  );
              }
          );
      }

    function login(em,pass)
    {
      AuthService.login(em, pass).then(
        function success(response) {
            //console.log('login response');
            //console.log(response);

            if(response.data.validLogin)
            {
                setTimeout(processPostLogin, 500, response);
            }
            else
            {
                log.loginError = true;
                log.errorMessage = response.data.loginError;
            }

        }
      );
    }

    function logout()
    {
      AuthService.logout();
      ActiveUser.setActiveUser = null;
      ActiveUser.setActiveUser = {};
    }

    function setUser(data)
    {
      var deferred = $q.defer();


        deferred.notify('Trying to set the user.');

        if(data.validLogin) {
          log.setLoginError('');
          log.invalidLogin = false;
          ActiveUser.setActiveUser(data).then(function() {
            deferred.resolve('resolve the setUser');
          }, function(reason) {
            deferred.reject(reason);
            return false;
          }, function(update) {
            ////console.log(update);
          });
        }
        else
        {
          log.invalidLogin = true;
          log.setLoginError(data.loginError);
          return false;
        }


      return deferred.promise;
    }

    function setLoginError(error)
    {
      if(error.length > 0)
      {
        log.loginError = true;
        log.errorMessage = error;
      }
      else
      {
        log.loginError = false;
        log.errorMessage = '';
      }
    }

    function reset()
    {
      $scope.logem = '';
      $scope.logpass = '';
    }

      log.passwordRecovery = passwordRecovery;
      log.socialSignIn = socialSignIn;
    log.setLoginError = setLoginError;
    log.loginError = false;
    log.errorMessage = '';
    log.login = login;
    log.setUser = setUser;
    log.logout = logout;
    log.reset = reset;
    log.invalidLogin = null;
    log.getLoginConfig();
    $scope.switchPortal = switchPortal;
  }]);
