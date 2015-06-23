'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
  .controller('MenuCtrl', ['$scope', '$routeParams', '$route', 'AuthService', '$location', function ($scope,$routeParams,$route,AuthService,$location) {
    var nav = this;

    $route.reload();

    //console.log('current params:');
    //console.log($routeParams);

    if(angular.isDefined($routeParams.current)) {
      $scope.ActivitiesLink = $routeParams.current.params.orgurl + '/programs/';
    }

    $scope.$on('$routeChangeSuccess', function() {
      //console.log('change params:');
      //console.log($routeParams);
      $scope.ActivitiesLink = $routeParams.orgurl + '/programs/';
      $scope.MembershipsLink = $routeParams.orgurl + '/memberships/';
      $scope.ReservationsLink = $routeParams.orgurl + '/reservations/';
      $scope.ShopLink = $routeParams.orgurl + '/shop/';
      $scope.LoginLink = $routeParams.orgurl + '/login/';
      $scope.HomeLink = $routeParams.orgurl + '/home/';
    });

    function logout()
    {
      AuthService.logout();
      $scope.$root.currentUser = null;
      $scope.$root.currentUser = {};
      $location.path('/' + $routeParams.orgurl + '/login');
    }

    nav.logout = logout;
  }]);
