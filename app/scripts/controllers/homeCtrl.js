'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
  .controller('HomeCtrl', ['$scope', '$routeParams', '$location', 'ActiveUser', 'NavFactory', function ($scope,$routeParams,$location,ActiveUser,NavFactory) {
    var home = this;
    home.orgurl = $routeParams.orgurl;
    home.validUser = false;

      $scope.$on('$routeChangeSuccess', function() {

          $scope.nav = NavFactory;
          $scope.nav.getNavSettings();
      });

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
