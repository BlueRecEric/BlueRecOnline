'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:CurrentMembershipCtrl
 * @description
 * # AboutCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
  .controller('MyAccountCtrl', ['$scope', '$routeParams', '$location', 'ActiveUser', 'MyAccountLoader', function ($scope,$routeParams,$location,ActiveUser,MyAccountLoader) {

      $scope.loggedIn = false;
      $scope.verifying = true;
      $scope.myAccount = MyAccountLoader;

      $scope.onGoToLogin = function () {
          $location.path('/' + $routeParams.orgurl + '/login');
      };
      $scope.onGoToHome = function () {
          $location.path('/' + $routeParams.orgurl + '/home');
      };

      if(ActiveUser.isLoggedIn())
      {
            $scope.loggedIn = true;

            $scope.addrResult = '';
            $scope.addrOptions = null;

            $scope.myAccount.addressForm = [];
            $scope.myAccount.residencyForm = [];
            $scope.myAccount.emailForm = [];

            $scope.$watch('addrDetails', function () {
              console.log('details changed');
              if(angular.isDefined($scope.addrDetails))
              {
                  console.log($scope.addrDetails.formatted_address);
              }
              $scope.splitAddress();
            }, true);

            $scope.resendEmailVerification = function() {
                $scope.sendingVerification = true;
                $scope.verificationSent = false;

                $scope.myAccount.submitEmailReverification().then(function(response) {
                    console.log('resend verification response');
                    console.log(response);

                    $scope.resendResponse = response.data;

                    $scope.sendingVerification = false;

                    if($scope.resendResponse.errors.length > 0)
                    {
                        $scope.verification.errors = [];
                        $scope.verification.errors = $scope.resendResponse.errors;
                    }
                    else {
                        $scope.verificationSent = true;
                    }
                });
            };

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

            $scope.submitEmailForm = function()
            {
              $scope.myAccount.submitEmailForm();
            };

            $scope.submitResidencyForm = function()
            {
              $scope.myAccount.submitResidencyForm();
            };

            $scope.submitPasswordForm = function()
            {
              $scope.myAccount.submitPasswordForm();
            };

            $scope.myAccount.loadAccount();

            console.log('my account');
            console.log($scope.myAccount);
      }


      if(angular.isDefined($routeParams.verifyToken) && $routeParams.verifyToken.length > 0)
      {
          $scope.verifying = true;
          $scope.verifyEmail = function() {
            return $scope.myAccount.verifyEmail($routeParams.verifyToken);
          };

          $scope.verifyEmail().then(function(response) {
              console.log('verification response');
              console.log(response);
              $scope.verification = response.data;
              $scope.verifying = false;
          });
      }

      MyAccountLoader.getSettings().then(function (result) {
          $scope.config = result.data;
          console.log('config');
          console.log($scope.config);
      });

  }])
    .factory('MyAccountLoader', ['$http', 'BLUEREC_ONLINE_CONFIG', '$routeParams', 'ActiveUser', function($http,BLUEREC_ONLINE_CONFIG,$routeParams,ActiveUser) {
        var acctload = this;

        acctload.getSettings = function()
        {
            var req = {
                method: 'GET',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/config',
                headers: {
                    'Content-Type': undefined
                }
            };

            return $http(req);
        };

        acctload.loadAccount = function() {

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

                    acctload.emailForm = [];

                    acctload.emailForm.email_address = acctload.returnData.address.email_address;
                    acctload.emailForm.email_status = acctload.returnData.address.email_status;
                    acctload.emailForm.message = '';

                    acctload.passwordForm = [];

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

        acctload.submitAddressForm = function() {
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

        acctload.verifyEmail = function(token) {
            console.log('submit email');

            var req = {
                method: 'POST',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/email/verify',
                headers: {
                    'Content-Type': undefined
                },
                data: {'token':token}
            };

            return $http(req);
        };

        acctload.submitEmailReverification = function() {
            console.log('submit email ' + ActiveUser.userData.user_id);

            var req = {
                method: 'POST',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/email/resendverification',
                headers: {
                    'Content-Type': undefined
                },
                data: {'uid': ActiveUser.userData.user_id}
            };

            return $http(req);
        };

        acctload.submitEmailForm = function() {
            console.log('submit email');

            var req = {
                method: 'POST',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/myaccount' + '?action=update_email',
                headers: {
                    'Content-Type': undefined
                },
                data: {'uid': ActiveUser.userData.user_id,
                    'email': acctload.emailForm.email_address}
            };

            return $http(req)
                .then(
                function success(response) {
                    console.log(response.data);
                    acctload.emailForm.dataSubmitted = true;
                    acctload.emailForm.success = response.data.success;
                    acctload.emailForm.message = response.data.message;
                    console.log(acctload.emailForm);
                }
            );
        };

        acctload.submitResidencyForm = function() {

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

        acctload.submitPasswordForm = function() {
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

        acctload.returnData = '';
        acctload.busy = false;

        return acctload;
  }]);