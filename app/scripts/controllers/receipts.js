'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:CurrentMembershipCtrl
 * @description
 * # AboutCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
    .controller('ReceiptCtrl', ['$scope', 'ReceiptLoader', '$routeParams', '$location', function ($scope,ReceiptLoader, $routeParams, $location) {
        $scope.receiptData = ReceiptLoader;
        $scope.receiptData.loadReceipt();


        $scope.showItemData = function(itemType, columnType, columnData)
        {
            var bShow = false;

            switch(itemType) {
                case 'PROGRAM':
                    bShow = true;
                    break;
                case 'PAYMENT PLAN':
                    if(
                        columnType === 'item_name' ||
                        columnType === 'itemDates' ||
                        columnType === 'personName' ||
                        columnType === 'originalItem' ||
                        columnType === 'extraDataTwo'
                    )

                    if(columnData.length > 0) {
                        {
                            bShow = true;
                        }
                    }
                    break;
                case 'RENTAL CODE':
                    if(columnType === 'item_name' || columnType === 'itemDates')
                    {bShow = true;}
                    break;
                case 'PACKAGE':
                    if(columnType === 'item_name')
                    {bShow = true;}
                    break;
            }

            return bShow;
        };

    }])
    .factory('ReceiptLoader', ['$http', 'BLUEREC_ONLINE_CONFIG', '$routeParams', function($http,BLUEREC_ONLINE_CONFIG,$routeParams) {
        var receiptLoad = this;

        var loadReceipt = function() {
            if(receiptLoad.busy) {
                return false;
            }
            receiptLoad.busy = true;

            var req = {
                method: 'GET',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/purchases/receipt/' + $routeParams.receiptID,
                headers: {
                    'Content-Type': undefined
                }
            };

            $http(req).then(function(response) {
                receiptLoad.returnData = {};
                receiptLoad.returnData = response.data.data;

                console.log('receiptLoad.returnData:');
                console.log(receiptLoad.returnData);

                receiptLoad.busy = false;
            }.bind(this));
        };

        receiptLoad.loadReceipt = loadReceipt;
        receiptLoad.busy = false;

        return receiptLoad;
    }]);