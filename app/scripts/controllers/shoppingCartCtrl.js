'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
  .controller('ShoppingCartCtrl', ['$scope', '$rootScope', '$routeParams', '$location', 'BLUEREC_ONLINE_CONFIG', '$http', 'ActiveUser', 'MakeToast',
        function ($scope,$rootScope,$routeParams,$location,BLUEREC_ONLINE_CONFIG,$http,ActiveUser,MakeToast) {
      $scope.orgurl = $routeParams.orgurl;

      $scope.cart = {};
      $scope.removed = {};

      $scope.promoCodeEnabled = false;
      $scope.promoCode = '';

      ActiveUser.getFromLocal().then(function() {
          $scope.cart.household = ActiveUser.userData.household;
      }, function() {
        sendToLogin();
      }, function() {
      });

      function checkPromo()
      {
        var req = {
          method: 'POST',
          url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/cart/promo',
          headers: {
            'Content-Type': undefined
          },
          data: {'userID': ActiveUser.userData.user_id, 'householdID':ActiveUser.userData.household_id, 'promoCode':$scope.promoCode}
        };

        return $http(req)
            .then(
            function success(response) {
              $scope.removed = response.data;
              loadCart();
            }
        );
      }

      function sendToLogin()
      {
        $location.path('/' + $routeParams.orgurl + '/login');
      }

      function loadCart(payComplete)
      {
        var req = {
          method: 'POST',
          url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/cart/get',
          headers: {
            'Content-Type': undefined
          },
          data: {'userID': ActiveUser.userData.user_id, 'householdID':ActiveUser.userData.household_id}
        };

        return $http(req)
            .then(
            function success(response) {
                $rootScope.$emit('updateCartCount', {});

                $scope.cart = response.data;

                console.log('cart:');
                console.log($scope.cart);
            }
        );
      }

      function removeItem(itemID)
      {
        var req = {
          method: 'POST',
          url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/cart/remove',
          headers: {
            'Content-Type': undefined
          },
          data: {'userID': ActiveUser.userData.user_id, 'householdID':ActiveUser.userData.household_id, 'shoppingItemID':itemID}
        };

        return $http(req)
            .then(
            function success(response) {
                $scope.removed = response.data;
                loadCart();
            }
        );
      }

      function processCartItems()
      {
        var req = {
          method: 'POST',
          url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/cart/process',
          headers: {
            'Content-Type': undefined
          },
          data: {'userID': ActiveUser.userData.user_id, 'householdID':ActiveUser.userData.household_id}
        };

        return $http(req)
            .then(
                function success(response) {
                  $scope.removed = response.data;
                  loadCart();
                }
            );
      }

      function payCart()
      {

        console.log('shopping cart:');
        console.log($scope.cart);

        var customerData = {};

        customerData.uid = ActiveUser.userData.user_id;
        customerData.hid = ActiveUser.userData.household_id;
        customerData.customerID = ActiveUser.userData.household_id + '_' + ActiveUser.userData.user_id;

        customerData.cardData = $scope.cardForm;
        customerData.cardData.expDate = $scope.cardForm.expYear + '-' + $scope.cardForm.expMonth;
        customerData.chargeAmount = $scope.cart.totalFee.toFixed(2);

        if($scope.cart.data.length > 0) {
            customerData.cartItems = $scope.cart.data;

            console.log('shopping cart post:');
            console.log(customerData);

            MakeToast.popOn('info', 'Purchasing', 'We are authorizing your credit card...');

            var req = {
            method: 'POST',
            url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/cart/pay',
            headers: {
                'Content-Type': undefined
            },
            data: customerData
            };

            return $http(req)
            .then(function success(response) {
                console.log('pay response:');
                console.log(response);

                if(response.data.data.authorized)
                {
                    MakeToast.popOn('success', 'Purchasing', 'Your credit card has been authorized!');
                    $scope.removed = response.data;
                    if(angular.isDefined(response.data.data.receiptID))
                    {
                        goToReceipt(response.data.data.receiptID);
                    }

                    $scope.cart.paymentComplete = true;

                    loadCart(true);
                }
                else
                {
                    MakeToast.popOn('warning', 'Purchasing', 'There was a problem authorizing your purchase.');
                }

            });
        }
      }

      function goToReceipt(receiptID)
      {
          $location.path('/' + $routeParams.orgurl + '/purchases/receipt/' + receiptID);
      }

      function goToCheckout()
      {
        $location.path('/' + $routeParams.orgurl + '/precheckout');
      }

      loadCart();

      $scope.goToCheckout = goToCheckout;
      $scope.removeItem = removeItem;
      $scope.payCart = payCart;
      $scope.checkPromo = checkPromo;
      $scope.pageData = {paymentComplete:false};

      console.log('page data');
      console.log($scope.pageData);
  }]);
