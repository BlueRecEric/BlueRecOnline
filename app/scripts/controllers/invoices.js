'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:CurrentMembershipCtrl
 * @description
 * # AboutCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
    .controller('InvoicesCtrl', ['$scope', 'ActiveUser', 'InvoicesLoader', '$routeParams', function ($scope,ActiveUser,InvoicesLoader, $routParams) {
        if(ActiveUser.isLoggedIn())
        {
            $scope.invoices = InvoicesLoader;
            $scope.invoices.loadInvoices();
            $scope.orgurl = $routParams.orgurl;
        }
    }])
    .factory('InvoicesLoader', ['$http', 'BLUEREC_ONLINE_CONFIG', '$routeParams', 'ActiveUser', 'MakeToast', function($http,BLUEREC_ONLINE_CONFIG,$routeParams,ActiveUser,MakeToast) {
        var invoiceLoad = this;

        var loadInvoices = function() {

            console.log('hid is: ' + ActiveUser.userData.household_id);

            if(invoiceLoad.busy) {
                return false;
            }
            invoiceLoad.busy = true;

            var req = {
                method: 'GET',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/invoices/' + ActiveUser.userData.household_id,
                headers: {
                    'Content-Type': undefined
                }
            };

            $http(req).then(function(response) {
                invoiceLoad.returnData = {};
                console.log('current invoices');
                console.log(response.data);
                invoiceLoad.returnData = response.data.data;
                invoiceLoad.busy = false;
            }.bind(this));
        };

        var addInvoiceToCart = function($itemIdx,$payIdx){
            var cartData = invoiceLoad.returnData[$itemIdx].payments[$payIdx];

            console.log('add invoice to cart');
            console.log(cartData);

            var submitData = {};

            submitData.userID = invoiceLoad.returnData[$itemIdx].user_id;
            submitData.householdID = ActiveUser.userData.household_id;
            submitData.addedByUserID = ActiveUser.userData.user_id;
            submitData.itemType = 'PAYMENT PLAN';
            submitData.itemID = invoiceLoad.returnData[$itemIdx].payments[$payIdx].item_id;
            submitData.usePaymentPlan = '0';

            console.log(submitData);


            console.log(angular.toJson(submitData));
            var req = {
                method: 'POST',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/cart/add',
                headers: {
                    'Content-Type': undefined
                },
                data: submitData
            };

            return $http(req)
                .then(
                    function success(response) {
                        console.log(response.data);
                        invoiceLoad.returnData[$itemIdx].payments[$payIdx].inCart = true;
                        MakeToast.popOn('success', 'Shopping Cart', 'Invoice Added To Cart');
                    });
        };

        invoiceLoad.loadInvoices = loadInvoices;
        invoiceLoad.addInvoiceToCart = addInvoiceToCart;
        invoiceLoad.returnData = '';
        invoiceLoad.busy = false;

        return invoiceLoad;
    }]);