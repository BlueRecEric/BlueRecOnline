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
          if(angular.isDefined($scope.addrDetails))
          {
              console.log($scope.addrDetails.formatted_address);
          }
          $scope.splitAddress();
        }, true);

        $scope.splitAddress = function()
        {
            var address = '';

            if(angular.isDefined($scope.addrDetails))
            {
                address = $scope.addrDetails.formatted_address;
            }

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

        $scope.submitAddrForm = function()
        {
            $scope.myAccount.submitAddressForm();
        };

        $scope.submitResidencyForm = function()
        {
          $scope.myAccount.submitResidencyForm();
        };

        $scope.submitPasswordForm = function()
        {
          $scope.myAccount.submitPasswordForm();
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

                    acctload.addressForm.addr = acctload.returnData.address.mailing_addr_one;
                    acctload.addressForm.addr2 = acctload.returnData.address.mailing_addr_two;
                    acctload.addressForm.city = acctload.returnData.address.mailing_city;
                    acctload.addressForm.state = acctload.returnData.address.mailing_state;
                    acctload.addressForm.zip = acctload.returnData.address.mailing_zip;

                    acctload.passwordForm.current = '';
                    acctload.passwordForm.newpass = '';
                    acctload.passwordForm.conpass = '';

                    if(acctload.returnData.address.is_resident === '1')
                    {
                        acctload.residencyForm.isResident = true;
                    }
                    else
                    {
                        acctload.residencyForm.isResident = false;
                    }

                    acctload.busy = false;
                }.bind(this));
            }
            else
            {
                return false;
            }
        };

        var submitAddressForm = function() {
            var req = {
                method: 'POST',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/myaccount' + '?action=update_address',
                headers: {
                    'Content-Type': undefined
                },
                data: {'uid': ActiveUser.userData.user_id,
                    'addr': acctload.addressForm.addr,
                    'addr2': acctload.addressForm.addr2,
                    'city': acctload.addressForm.city,
                    'state': acctload.addressForm.state,
                    'zip':acctload.addressForm.zip}
            };

            return $http(req)
                .then(
                function success(response) {
                    acctload.addressForm.dataSubmitted = true;
                    acctload.addressForm.success = response.data.success;
                    acctload.addressForm.message = response.data.message;
                }
            );
        };

        var submitResidencyForm = function() {

            var isResident = false;

            if(acctload.residencyForm.isResident === true)
            {
                isResident = true;
            }

            var req = {
                method: 'POST',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/myaccount' + '?action=update_residency',
                headers: {
                    'Content-Type': undefined
                },
                data: {'uid': ActiveUser.userData.user_id,
                    'resident': isResident}
            };

            return $http(req)
                .then(
                function success(response) {
                    console.log(response.data);
                    acctload.residencyForm.dataSubmitted = true;
                    acctload.residencyForm.success = response.data.success;
                    acctload.residencyForm.message = response.data.message;
                    console.log(acctload.residencyForm);
                }
            );
        };

        var submitPasswordForm = function() {
            var req = {
                method: 'POST',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/myaccount' + '?action=update_password',
                headers: {
                    'Content-Type': undefined
                },
                data: {'uid': ActiveUser.userData.user_id,
                    'currentPwd': acctload.passwordForm.current,
                    'newPwd': acctload.passwordForm.newpass,
                    'conPwd': acctload.passwordForm.conpass
                }
            };

            return $http(req)
                .then(
                function success(response) {
                    console.log(response.data);
                    acctload.passwordForm.dataSubmitted = true;
                    acctload.passwordForm.success = response.data.success;
                    acctload.passwordForm.message = response.data.message;
                    console.log(acctload.passwordForm);
                }
            );
        };

        acctload.loadAccount = loadAccount;
        acctload.submitAddressForm = submitAddressForm;
        acctload.submitResidencyForm = submitResidencyForm;
        acctload.submitPasswordForm = submitPasswordForm;
        acctload.returnData = '';
        acctload.busy = false;

        return acctload;
  }]);