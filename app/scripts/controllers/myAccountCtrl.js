'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:CurrentMembershipCtrl
 * @description
 * # AboutCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
  .controller('MyAccountCtrl', ['$scope', 'ActiveUser', 'MyAccountLoader', function ($scope,ActiveUser,MyAccountLoader) {
      if(ActiveUser.isLoggedIn())
      {
        $scope.addrResult = '';
        $scope.addrDetails = '';
        $scope.addrOptions = null;

        $scope.watchAddressForm = function () {
          return $scope.myAccount.addressForm.addr;
        };

        $scope.$watch($scope.watchAddressForm, function () {
          console.log('address changed');
        }, true);

        $scope.myAccount = [];
        $scope.myAccount.residencyForm = [];
        $scope.myAccount = MyAccountLoader;
        //$scope.myAccount.loadAccount();
      }
  }])
  .factory('MyAccountLoader', ['$http', 'BLUEREC_ONLINE_CONFIG', '$routeParams', 'ActiveUser', function($http,BLUEREC_ONLINE_CONFIG,$routeParams,ActiveUser) {
    var acctload = this;

    var loadAccount = function() {

      if(acctload.busy) {
        return false;
      }
      if(ActiveUser.isLoggedIn()) {
        acctload.busy = true;

        var req = {
          method: 'POST',
          url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/myaccount',
          headers: {
            'Content-Type': undefined
          },
          data: {'uid': ActiveUser.userData.user_id}
        };

        $http(req).then(function (response) {
          acctload.returnData = {};
          console.log('current account');
          console.log(response.data);
          acctload.returnData = response.data;
          acctload.busy = false;
        }.bind(this));
      }
      else
      {
        return false;
      }
    };

    acctload.loadAccount = loadAccount;
    acctload.returnData = '';
    acctload.busy = false;

    return acctload;
  }]);