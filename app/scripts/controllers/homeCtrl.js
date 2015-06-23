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

    if(angular.isDefined(ActiveUser.userData)) {
      if (ActiveUser.userData.validLogin !== true) {
        console.log('not logged: ');
        console.log(ActiveUser);
        console.log('send to: ' + '/' + home.orgurl + '/login');
        $location.path('/' + home.orgurl + '/login');
      }
      else
      {
        console.log('user data found, they can stay');
      }
    }
    else
    {
      console.log('no user data found, send to: ' + '/' + home.orgurl + '/login');
      $location.path('/' + home.orgurl + '/login');
    }

  }]);
