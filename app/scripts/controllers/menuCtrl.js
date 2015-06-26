'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
    .controller('MenuCtrl', ['$scope', '$routeParams', '$route', 'AuthService', '$location', 'ActiveUser', '$aside', function ($scope,$routeParams,$route,AuthService,$location,ActiveUser, $aside) {

        ActiveUser.getFromLocal().then(function success(response) {
            console.log('we got the user from the menu');
            $scope.currentUser = response;
            console.log($scope.currentUser);
            //$scope.$root.currentUser = response.data;
        });

        $scope.$watch(function() { return ActiveUser.getUser(); }, function() {
            console.log('ActiveUser changed');
            $scope.currentUser = ActiveUser.getUser();

            $scope.loggedIn=$scope.currentUser.validLogin;

            //console.table($scope.currentUser );
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
            $scope.loggedIn=false;

            AuthService.logout();
            $scope.currentUser = {};
            $location.path('/' + $routeParams.orgurl + '/login');
        };

        $scope.openAside = function openAside() {

            // Pre-fetch an external template populated with a custom scope
            var myOtherAside = $aside({scope: $scope, template: 'shoppingcart.html'});
            // Show when some event occurs (use $promise property to ensure the template has been loaded)
            myOtherAside.$promise.then(function() {
                myOtherAside.show();
            });

        };

        $scope.popover = {
            'title': 'No Items',
            'content': 'Your cart is empty!!'
        };

    }]);
