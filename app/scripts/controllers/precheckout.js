'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:CurrentMembershipCtrl
 * @description
 * # AboutCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
    .controller('Precheck', ['$scope', 'ActiveUser', 'PreCheckRequest', function ($scope,ActiveUser,PreCheckRequest) {
        $scope.preLoad = [];

        if(ActiveUser.isLoggedIn())
        {
            var preLoad = PreCheckRequest;
            preLoad.getCartRequirements().then(
                function()
                {
                    console.log('preLoad waivers');
                    console.log(preLoad.waivers);
                    $scope.preLoad = preLoad;
                }
            );

            var submitPreCheckRequest = function() {
                preLoad.submitPreCheckRequest($scope.preLoad);
            };

            $scope.submitPreCheckRequest = submitPreCheckRequest;
        }
    }])
    .factory('PreCheckRequest', ['$http', 'BLUEREC_ONLINE_CONFIG', '$routeParams', 'ActiveUser', '$location', function($http,BLUEREC_ONLINE_CONFIG,$routeParams,ActiveUser,$location) {
        var preloader = this;
        preloader.waivers = [];
        preloader.payments = [];
        preloader.fields = [];
        preloader.addons = [];

        var updateAddonFees = function(proIdx, pkgIdx) {
            console.log('update addon fees ' + [proIdx]);
            console.log(preloader.addons[proIdx].addons.packages);
            console.log('package selected!');
            console.log(preloader.addons[proIdx].addons.packages[pkgIdx]);
            console.log(preloader.addons[proIdx].addons.packages[pkgIdx].selected);

            if(preloader.addons[proIdx].addons.packages[pkgIdx].selected == '1')
            {
                console.log('package is checked');
            }

            var req = {
                method: 'POST',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/cart/requirements/updatepackageprices',
                headers: {
                    'Content-Type': undefined
                },
                data: preloader.addons[proIdx].addons
            };

            $http(req).then(
                function success(response) {
                    console.log(response.data);
                    //preloader.addons[proIdx].addons.packages = response.data.data.packages;

                    for(var p = 0; p < preloader.addons[proIdx].addons.packages.length; p++)
                    {
                        for(var pf = 0; pf < response.data.data.packages.length; pf++)
                        {
                            if(preloader.addons[proIdx].addons.packages[p].uuid == response.data.data.packages[pf].uuid)
                            {
                                console.log('update fees');
                                preloader.addons[proIdx].addons.packages[p].fees = response.data.data.packages[pf].fees;
                                preloader.addons[proIdx].addons.packages[p].original_fees = response.data.data.packages[pf].original_fees;
                            }
                        }
                    }

                }
            );
        };

        var getCartRequirements = function () {
            console.log('get requirements');

            if(ActiveUser.isLoggedIn())
            {
                var req = {
                    method: 'POST',
                    url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/cart/requirements',
                    headers: {
                        'Content-Type': undefined
                    },
                    data: {'userID': ActiveUser.userData.user_id, 'householdID': ActiveUser.userData.household_id}
                };

                return $http(req).then(
                    function success(response) {
                        preloader.waivers = [];
                        preloader.hasWaivers = response.data.data.waivers.length > 0;
                        var waivers = JSON.parse(angular.toJson(response.data.data.waivers));
                        preloader.waivers = waivers;

                        preloader.payments = [];
                        preloader.hasPayments = response.data.data.payments.length > 0;
                        var payments = JSON.parse(angular.toJson(response.data.data.payments));
                        preloader.payments = payments;

                        preloader.addons = [];
                        preloader.hasAddons = response.data.data.addons.length > 0;
                        var addons = JSON.parse(angular.toJson(response.data.data.addons));
                        preloader.addons = addons;

                        preloader.fields = [];
                        preloader.hasFields = response.data.data.fields.length > 0;
                        var fields = JSON.parse(angular.toJson(response.data.data.fields));
                        preloader.fields = fields;

                        if(preloader.hasFields || preloader.hasAddons || preloader.hasPayments || preloader.hasWaivers)
                        {
                            console.log(preloader.addons);
                        }
                        else
                        {
                            if(ActiveUser.isLoggedIn())
                            {
                                $location.path('/' + $routeParams.orgurl + '/checkout');
                            }
                        }
                    }
                );
            }
        };

        var submitPreCheckRequest = function (preForm) {
            console.log('request');
            console.log(preForm);

            var req = {
                method: 'POST',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/cart/requirements/validate',
                headers: {
                    'Content-Type': undefined
                },
                data: preForm
            };

            $http(req).then(
                function success(response) {
                    console.log(response.data);
                    if(ActiveUser.isLoggedIn())
                    {
                        $location.path('/' + $routeParams.orgurl + '/checkout');
                    }
                }
            );
        };

        preloader.getCartRequirements = getCartRequirements;
        preloader.submitPreCheckRequest = submitPreCheckRequest;
        preloader.updateAddonFees = updateAddonFees;
        return preloader;
    }]);