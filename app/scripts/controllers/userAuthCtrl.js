'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
  .controller('UserAuthCtrl', ['$scope', '$routeParams', 'AuthService', function ($scope,$routeParams,AuthService) {

        if(AuthService.getUser() != undefined) {
            AuthService.getUser().then(function success(response) {
                //console.log('remember this user?');
                //console.log(response.data);
                $scope.$root.currentUser = response.data;
            });
        }

  }]);
