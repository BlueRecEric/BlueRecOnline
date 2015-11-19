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
        $scope.preForm = [];

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

            var submitPreForm = function() {
                preLoad.submitPreCheckRequest($scope.preForm);
            };

            $scope.submitPreForm = submitPreForm;
        }
  }])
    .factory('PreCheckRequest', ['$http', 'BLUEREC_ONLINE_CONFIG', '$routeParams', 'ActiveUser', function($http,BLUEREC_ONLINE_CONFIG,$routeParams,ActiveUser) {
        var preloader = this;
        preloader.waivers = [];
        preloader.payments = [];
        preloader.fields = [];
        preloader.addons = [];

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
                }

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
                    }
                );
            }
        };

        var submitPreCheckRequest = function (preForm) {
            console.log('request');
            console.log(preForm);

            var req = {
                method: 'POST',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/item/' + $routeParams.itemid + '/volunteer/add',
                headers: {
                    'Content-Type': undefined
                },
                data: {'uid': preForm.vol_user_id, 'roleID': preForm.role_id, 'comments': preForm.vol_comments}
            };

            $http(req).then(
                function success(response) {
                    console.log(response.data);
                    preloader.errors = response.data.errors;
                    preloader.messages = response.data.messages;
                }
            );
        };

        preloader.getCartRequirements = getCartRequirements;
        preloader.submitPreCheckRequest = submitPreCheckRequest;

        return preloader;
    }]);