'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:CurrentMembershipCtrl
 * @description
 * # AboutCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
    .controller('ReceiptCtrl', ['$scope', 'ActiveUser', 'PurchasesLoader', '$routeParams', '$location', function ($scope,ActiveUser,PurchasesLoader, $routeParams, $location) {
        $scope.receiptData = {};

        $scope.onClickPrintReceiptFromPurchases = function(receiptID)
        {
            $location.path('/' + $routeParams.orgurl + '/purchases/receipt/' + receiptID);
        };
    }])
    .factory('ReceiptLoader', ['$http', 'BLUEREC_ONLINE_CONFIG', '$routeParams', 'ActiveUser', function($http,BLUEREC_ONLINE_CONFIG,$routeParams,ActiveUser) {
        var receiptLoad = this;

        var loadReceipt = function() {
            if(receiptLoad.busy) {
                return false;
            }
            receiptLoad.busy = true;

            var req = {
                method: 'GET',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/purchases/' + ActiveUser.userData.user_id + '?action=purchases',
                headers: {
                    'Content-Type': undefined
                }
            };

            $http(req).then(function(response) {
                receiptLoad.returnData = {};
                console.log('current receipt');
                console.log(response.data);
                receiptLoad.returnData = response.data.data;
                receiptLoad.busy = false;
            }.bind(this));
        };

        receiptLoad.loadReceipt = loadReceipt;
        receiptLoad.returnData = '';
        receiptLoad.busy = false;

        return receiptLoad;
    }]);