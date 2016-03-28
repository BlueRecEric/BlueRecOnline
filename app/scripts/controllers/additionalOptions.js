'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:CurrentMembershipCtrl
 * @description
 * # AboutCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
    .controller('AddOpts', ['$scope', 'ActiveUser', 'RegistrationFactory', '$location', '$routeParams', function ($scope,ActiveUser,RegistrationFactory,$location,$routeParams) {
        $scope.preLoad = [];

        $scope.regularPackages = {};
        $scope.regularPackages.weekday = '';

        $scope.wkdPkgOpt = [];

        $scope.$on('registration:loaded', function() {
            $scope.preLoad = RegistrationFactory;

            console.log('updated working data:');
            console.log($scope.preLoad);
        });

        if(ActiveUser.isLoggedIn())
        {
            $scope.preLoad = RegistrationFactory;

            console.log('working data:');
            console.log($scope.preLoad);
        }

        $scope.submitAdditionalOptions = function()
        {
            console.log('here is the data we will submit:');
            console.log($scope.preLoad);

            function isSelected(pkg) {
                return (pkg.selected == '1');
            }

            for(var r = 0; r < $scope.preLoad.data.length; r++)
            {
                console.log('this data:');
                console.log($scope.preLoad.data[r]);

                //$scope.preLoad.data[r].addons.selectedpackages = [];

                var selectedPackages = [];
                var registration = $scope.preLoad.data[r];

                if(registration.addons[0].addons.packages.length > 0)
                {
                    selectedPackages = registration.addons[0].addons.packages.filter(isSelected);

                    console.log('here are the selected packages:');
                    console.log(selectedPackages);
                }

                $scope.preLoad.data[r].addons[0].addons.selectedpackages = selectedPackages;
            }

            console.log('here is the data we will submit, with only selected packages:');
            console.log($scope.preLoad);

            RegistrationFactory.addToCart().then(function(response) {
                console.log('add to cart response(2):');
                console.log(response);

                $location.path('/' + $routeParams.orgurl + '/programs');
            });
        };
    }]);