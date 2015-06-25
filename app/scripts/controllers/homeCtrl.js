'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
  .controller('HomeCtrl', ['$scope', '$routeParams', '$location', 'ActiveUser', function ($scope,$routeParams,$location,ActiveUser) {
    var home = this;
    home.orgurl = $routeParams.orgurl;
    home.validUser = false;

    ActiveUser.getFromLocal().then(function() {
      checkValidUser();
    }, function() {
      sendToLogin();
    }, function() {
    });

    function checkValidUser()
    {
      home.validUser = false;

      if(angular.isDefined(ActiveUser.userData)) {
        if (ActiveUser.userData.validLogin !== true) {
          sendToLogin();
        }
        else
        {
          home.validUser = true;
        }
      }
      else
      {
        sendToLogin();
      }
    }

    function sendToLogin()
    {
      $location.path('/' + home.orgurl + '/login');
    }
  }]);
