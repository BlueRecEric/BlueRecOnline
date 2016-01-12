'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:AutoPaymentCtrl
 * @description
 * # AutoPaymentCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
    .controller('AutoPaymentCtrl', ['$scope', 'ActiveUser', 'AutoPaymentLoader', '$routeParams', function ($scope,ActiveUser,AutoPaymentLoader, $routParams) {
        if(ActiveUser.isLoggedIn())
        {
            $scope.profiles = AutoPaymentLoader;
            $scope.profiles.loadAutoPayments();
            $scope.orgurl = $routParams.orgurl;
        }
    }])
    .factory('AutoPaymentLoader', ['$http', 'BLUEREC_ONLINE_CONFIG', '$routeParams', 'ActiveUser', function($http,BLUEREC_ONLINE_CONFIG,$routeParams,ActiveUser) {
        var autoPayLoad = this;

        var loadAutoPayments = function() {

            console.log('hid is: ' + ActiveUser.userData.household_id);

            if(autoPayLoad.busy) {
                return false;
            }
            autoPayLoad.busy = true;

            var req = {
                method: 'GET',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/autopayments/' + ActiveUser.userData.household_id,
                headers: {
                    'Content-Type': undefined
                }
            };

            $http(req).then(function(response) {
                autoPayLoad.returnData = {};
                console.log('current autopays');
                console.log(response.data);
                autoPayLoad.returnData = response.data.data;
                autoPayLoad.busy = false;
            }.bind(this));
        };

        autoPayLoad.loadAutoPayments = loadAutoPayments;
        autoPayLoad.returnData = '';
        autoPayLoad.busy = false;

        return autoPayLoad;
    }]);