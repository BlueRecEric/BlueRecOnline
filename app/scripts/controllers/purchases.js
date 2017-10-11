'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:CurrentMembershipCtrl
 * @description
 * # AboutCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
    .controller('PurchasesCtrl', ['$scope', 'ActiveUser', 'PurchasesLoader', '$routeParams', '$location', function ($scope,ActiveUser,PurchasesLoader, $routeParams, $location) {
        if(ActiveUser.isLoggedIn())
        {
            $scope.purchases = PurchasesLoader;
            $scope.purchases.loadPurchases();
            $scope.orgurl = $routeParams.orgurl;
        }

        $scope.receiptData = {};

        $scope.printDiv = function(divName) {
            console.log('print div name');
            console.log(divName);
            var printContents = document.getElementById(divName).innerHTML;
            var popupWin = window.open('', '_blank', 'width=800,height=600');
            popupWin.document.open();
            popupWin.document.write('<html><head><link href="//maxcdn.bootstrapcdn.com/bootswatch/3.3.5/cerulean/bootstrap.min.css" rel="stylesheet"><link rel="stylesheet" href="styles/main.css" /></head><body onload="window.print();return false"><div id="printContainer">' + printContents + '</div></body></html>');
            popupWin.document.close();
        };

        $scope.onClickPrintReceiptFromPurchases = function(receiptID)
        {
            $location.path('/' + $routeParams.orgurl + '/purchases/receipt/' + receiptID);
        };
    }])
    .factory('PurchasesLoader', ['$http', 'BLUEREC_ONLINE_CONFIG', '$routeParams', 'ActiveUser', function($http,BLUEREC_ONLINE_CONFIG,$routeParams,ActiveUser) {
        var purchaseLoad = this;

        var loadPurchases = function() {

            console.log('User ID is: ' + ActiveUser.userData.user_id);

            if(purchaseLoad.busy) {
                return false;
            }
            purchaseLoad.busy = true;

            var req = {
                method: 'GET',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/purchases/' + ActiveUser.userData.user_id + '?action=purchases',
                headers: {
                    'Content-Type': undefined
                }
            };

            $http(req).then(function(response) {
                purchaseLoad.returnData = {};
                console.log('current purchases');
                console.log(response.data);
                purchaseLoad.returnData = response.data.data;
                purchaseLoad.busy = false;
            }.bind(this));
        };

        purchaseLoad.loadPurchases = loadPurchases;
        purchaseLoad.returnData = '';
        purchaseLoad.busy = false;

        return purchaseLoad;
    }]);