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
        $scope.addrOptions = null;

        $scope.myAccount = [];
        $scope.myAccount.addressForm = [];
        $scope.myAccount.residencyForm = [];

        $scope.$watch('addrDetails', function () {
          console.log('details changed');
          console.log($scope.addrDetails.formatted_address);
          $scope.splitAddress();
        }, true);

        $scope.splitAddress = function()
        {
          var address = $scope.addrDetails.formatted_address;

          var splitAddr = address.split(',');

          var stateZip = '';

          if(splitAddr.length > 2)
          {
            console.log('split result');
            console.log(splitAddr);

            console.log('city:' + splitAddr[1].trim());
            $scope.myAccount.addressForm.city = splitAddr[1].trim();

            console.log('state:' + splitAddr[2].trim());
            stateZip = splitAddr[2].trim().split(' ');

            if(stateZip.length > 1)
            {
              $scope.myAccount.addressForm.state = stateZip[0].trim();
              console.log('zip:' + stateZip[1].trim());
              $scope.myAccount.addressForm.zip = stateZip[1].trim();
            }

            console.log('addr:' + splitAddr[0].trim());
            $scope.myAccount.addressForm.addr = splitAddr[0].trim();
          }
        };


        $scope.myAccount = MyAccountLoader;
        $scope.myAccount.loadAccount();

        console.log('my account');
        console.log($scope.myAccount);
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

          acctload.addressForm = {};

          acctload.addressForm.addr = acctload.returnData.mailing_addr_one;
          acctload.addressForm.addr2 = acctload.returnData.mailing_addr_two;
          acctload.addressForm.city = acctload.returnData.mailing_city;
          acctload.addressForm.state = acctload.returnData.mailing_state;
          acctload.addressForm.zip = acctload.returnData.mailing_zip;

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