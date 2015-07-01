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

        $scope.$watch(function() { return ActiveUser.getUser(); }, function() {
            $scope.currentUser = ActiveUser.getUser();
            $scope.loggedIn = ActiveUser.isLoggedIn();
        });

        if(angular.isDefined($routeParams.current)) {
            $scope.ActivitiesLink = $routeParams.current.params.orgurl + '/programs/';
        }

        $scope.$on('$routeChangeSuccess', function() {
            $scope.ActivitiesLink = $routeParams.orgurl + '/programs/';
            $scope.MembershipsLink = $routeParams.orgurl + '/memberships/';
            $scope.ReservationsLink = $routeParams.orgurl + '/reservations/';
            $scope.ShopLink = $routeParams.orgurl + '/shop/';
            $scope.LoginLink = $routeParams.orgurl + '/login/';
            $scope.HomeLink = $routeParams.orgurl + '/home/';

            $scope.MyAccountLink = $routeParams.orgurl + '/myaccount';
            $scope.HouseholdLink = $routeParams.orgurl + '/household';
            $scope.PurchasesLink = $routeParams.orgurl + '/purchases';
        });

        $scope.logout = function()
        {
            $scope.loggedIn=false;

            AuthService.logout();
            $scope.currentUser = {};
            ActiveUser.setActiveUser('');


            $location.path('/' + $routeParams.orgurl + '/login');
        };

        $scope.openAside = function openAside() {

            // Pre-fetch an external template populated with a custom scope
            var myOtherAside = $aside({scope: $scope, template: 'partials/shoppingcart.html'});
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
