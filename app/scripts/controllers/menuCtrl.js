'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
  .controller('MenuCtrl', ['$scope', '$routeParams', '$route', 'AuthService', '$location', 'ActiveUser', function ($scope,$routeParams,$route,AuthService,$location,ActiveUser) {

        $scope.popover = {
            'title': 'No Items',
            'content': 'Your cart is empty!!'
        };

    ActiveUser.getFromLocal().then(function success(response) {
      console.log('we got the user from the menu');
      $scope.currentUser = response;
      console.log($scope.currentUser);
      //$scope.$root.currentUser = response.data;
    });

    $scope.$watch(function() { return ActiveUser.getUser(); }, function() {
      console.log('ActiveUser changed');
      $scope.currentUser = ActiveUser.getUser();
    });

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

    $scope.logout = function()
    {
      AuthService.logout();
      $scope.currentUser = {};
      $location.path('/' + $routeParams.orgurl + '/login');
    };
  }]);
