'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
  .controller('UserAuthCtrl', ['ActiveUser', function (ActiveUser) {

    ActiveUser.getFromLocal().then(function success() {
      //$scope.$root.currentUser = response.data;
    });
    /*
    AuthService.getUser().then(function success(response) {
      console.log('remember this user?');
      console.log(response.data);
      //$scope.$root.currentUser = response.data;
    });
    */

  }]);
