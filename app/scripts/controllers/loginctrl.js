'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
  .controller('LoginCtrl',['$scope','$http','AuthService','$routeParams','$location','ActiveUser', '$q', function ($scope,$http,AuthService,$routeParams,$location,ActiveUser,$q) {
    var log = this;

    log.orgurl = $routeParams.orgurl;

    function login(em,pass)
    {
      AuthService.login(em, pass).then(
        function success(response) {
          ActiveUser.setActiveUser(response.data).then(
            function success() {
                $location.path('/' + log.orgurl + '/home');
              }, function () {
              }, function () {
              }
          );
          /*
          log.setUser(response.data);
          console.log('send to: '+ '/' + log.orgurl + '/home');
          $location.path('/' + log.orgurl + '/home');
          */
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

      setTimeout(function() {
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
            console.log(update);
          });
        }
        else
        {
          log.invalidLogin = true;
          log.setLoginError(data.loginError);
          return false;
        }
      }, 1000);

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

    log.setLoginError = setLoginError;
    log.loginError = false;
    log.errorMessage = '';
    log.login = login;
    log.setUser = setUser;
    log.logout = logout;
    log.reset = reset;
    log.invalidLogin = null;
  }]);
