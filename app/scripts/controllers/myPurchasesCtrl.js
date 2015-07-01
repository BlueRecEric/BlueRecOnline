'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:CurrentMembershipCtrl
 * @description
 * # AboutCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
  .controller('PurchasesCtrl', ['$scope', 'ActiveUser', 'PurchasesLoader', '$routeParams', function ($scope,ActiveUser,PurchasesLoader) {
      if(ActiveUser.isLoggedIn())
      {
        $scope.purchases = PurchasesLoader;
        $scope.purchases.loadPurchases();
      }
  }])
  .factory('PurchasesLoader', ['$http', 'BLUEREC_ONLINE_CONFIG', '$routeParams', 'ActiveUser', function($http,BLUEREC_ONLINE_CONFIG,$routeParams,ActiveUser) {
    var purchaseload = this;

    var loadPurchases = function() {

      if(purchaseload.busy) {
        return false;
      }
      purchaseload.busy = true;

      var req = {
        method: 'POST',
        url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/purchases',
        headers: {
          'Content-Type': undefined
        },
        data: {'uid': ActiveUser.userData.user_id}
      };

      $http(req).then(function(response) {
        purchaseload.returnData = {};
        console.log('current purchases');
        console.log(response.data);
        purchaseload.returnData = response.data;
        purchaseload.busy = false;
      }.bind(this));
    };

    purchaseload.loadPurchases = loadPurchases;
    purchaseload.returnData = '';
    purchaseload.busy = false;

    return purchaseload;
  }]);