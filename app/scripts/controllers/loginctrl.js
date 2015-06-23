'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
  .controller('LoginCtrl',['$scope','$http','AuthService','$routeParams','$location','ActiveUser', function ($scope,$http,AuthService,$routeParams,$location,ActiveUser) {
    var log = this;

    log.orgurl = $routeParams.orgurl;

    function login(em,pass)
    {
      console.log('trying to log in with');
      console.log(em);
      console.log(pass);
      AuthService.login(em, pass).then(
        function success(response) {
          log.setUser(response.data);
          console.log('send to: '+ '/' + log.orgurl + '/home');
          $location.path('/' + log.orgurl + '/home');
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
      console.log(data);

      if(data.validLogin) {
        log.setLoginError('');
        log.invalidLogin = false;
        ActiveUser.setActiveUser = data;
        console.log('currentUser:' + angular.toJson(ActiveUser));
      }
      else
      {
        log.invalidLogin = true;
        log.setLoginError(data.loginError);
      }
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
