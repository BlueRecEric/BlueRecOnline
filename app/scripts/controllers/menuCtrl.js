'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
    .controller('MenuCtrl', ['$scope', '$rootScope', '$routeParams', '$route', 'AuthService', '$location', 'ActiveUser', '$aside', 'NavFactory', 'UserData', function ($scope,$rootScope,$routeParams,$route,AuthService,$location,ActiveUser, $aside, NavFactory, UserData) {

        $scope.CartCount = 0;

        $rootScope.$on('updateCartCount', function () {
            $scope.getCartCount();
        });

        $scope.getCartCount = function() {
            $scope.CartCount = 5;
        };

        $scope.$watch(function() { return ActiveUser.getUser(); }, function() {
            $scope.currentUser = ActiveUser.getUser();
            $scope.loggedIn = ActiveUser.isLoggedIn();
        });

        if(ActiveUser.isLoggedIn())
        {
            ActiveUser.beginUpdates();
        }

        $scope.$on('user:updated', function() {
            //console.log('we just received word that the user was updated!');
            ActiveUser.putUserInLocalStorage(UserData.getUserData());
            setTimeout(updateHouseholdData,500);
            ActiveUser.endUpdates();
            ActiveUser.beginUpdates();
        });

        function updateHouseholdData()
        {
            if(ActiveUser.isLoggedIn())
            {
                $scope.household = ActiveUser.userData.household;
            }
        }

        if(angular.isDefined($routeParams.current)) {
            $scope.ActivitiesLink = $routeParams.current.params.orgurl + '/programs/';
        }

        $scope.$on('$routeChangeSuccess', function() {

            $scope.nav = NavFactory;
            $scope.nav.getNavSettings();

            $scope.ActivitiesLink = $routeParams.orgurl + '/programs';
            $scope.LeaguesLink = $routeParams.orgurl + '/leagues';
            $scope.MembershipsLink = $routeParams.orgurl + '/memberships';
            $scope.ReservationsLink = $routeParams.orgurl + '/reservations';
            $scope.ShopLink = $routeParams.orgurl + '/shop';
            $scope.LoginLink = $routeParams.orgurl + '/login';
            $scope.HomeLink = $routeParams.orgurl + '/home';

            $scope.MyAccountLink = $routeParams.orgurl + '/myaccount';
            $scope.HouseholdLink = $routeParams.orgurl + '/household';
            $scope.PurchasesLink = $routeParams.orgurl + '/purchases';
            $scope.AutoPayCardsLink = $routeParams.orgurl + '/autopayments';
            $scope.InvoicesLink = $routeParams.orgurl + '/invoices';
        });

        $scope.logout = function()
        {
            $scope.loggedIn=false;

            if(angular.isDefined(ActiveUser.userUpdate) && ActiveUser.userUpdate != null)
            {
                ActiveUser.endUpdates();
            }

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
