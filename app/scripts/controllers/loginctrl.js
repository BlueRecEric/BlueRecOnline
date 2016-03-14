'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
  .controller('LoginCtrl',['$scope','$http','AuthService','$routeParams','$location','ActiveUser', '$q', 'Page', 'MakeToast', function ($scope,$http,AuthService,$routeParams,$location,ActiveUser,$q,Page,MakeToast) {
    var log = this;

    console.log(Page);

    log.orgurl = $routeParams.orgurl;

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

      function processPostLogin(response)
      {
          ActiveUser.updateUser().then
          (
              function success() {
                  ActiveUser.setActiveUser(response.data).then(
                      function success() {

                          console.log('activeuser set to');
                          console.log(ActiveUser.userData);

                          if(response.data.questions_answered == '1')
                          {
                              $location.path('/' + log.orgurl + '/home');
                          }
                          else
                          {
                              $location.path('/' + log.orgurl + '/accountupdate');
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
            console.log('login response');
            console.log(response);

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
            //console.log(update);
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
  }]);
