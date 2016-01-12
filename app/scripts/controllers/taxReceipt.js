'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:TaxReceiptCtrl
 * @description
 * # AboutCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
    .controller('TaxReceiptCtrl', ['$scope', 'ActiveUser', 'TaxReceiptLoader', function ($scope,ActiveUser,TaxReceiptLoader) {
        if(ActiveUser.isLoggedIn())
        {
            $scope.reportData = TaxReceiptLoader;
            $scope.reportData.loadTaxReceiptData();
        }
    }])
    .factory('TaxReceiptLoader', ['$http', 'BLUEREC_ONLINE_CONFIG', '$routeParams', 'ActiveUser', function($http,BLUEREC_ONLINE_CONFIG,$routeParams,ActiveUser) {
        var taxDataLoad = this;

        var loadTaxReceiptData = function() {

            console.log('Household ID is: ' + ActiveUser.userData.household_id);

            if(taxDataLoad.busy) {
                return false;
            }
            taxDataLoad.busy = true;

            var req = {
                method: 'GET',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/reports/taxreceipt/' + ActiveUser.userData.household_id,
                headers: {
                    'Content-Type': undefined
                }
            };

            $http(req).then(function(response) {
                taxDataLoad.returnData = {};
                console.log('current tax data');
                console.log(response.data);
                taxDataLoad.returnData = response.data.data;
                taxDataLoad.busy = false;
            }.bind(this));
        };

        taxDataLoad.loadTaxReceiptData = loadTaxReceiptData;
        taxDataLoad.returnData = '';
        taxDataLoad.busy = false;

        return taxDataLoad;
    }]);