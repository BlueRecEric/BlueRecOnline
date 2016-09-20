'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
  .controller('ShoppingCartCtrl', ['$scope', '$rootScope', '$route', '$routeParams', '$location', 'BLUEREC_ONLINE_CONFIG', '$http', 'ActiveUser', 'MakeToast', '$modal',
        function ($scope,$rootScope, $route, $routeParams,$location,BLUEREC_ONLINE_CONFIG,$http,ActiveUser,MakeToast,$modal) {
      $scope.orgurl = $routeParams.orgurl;

      $scope.cart = {};
      $scope.removed = {};
      $scope.paymentResponse;
      $scope.payingCart = false;

        var paymentModal =   $modal({
            title: 'Processing Payment',
            content: 'We are currently attempting to process your payment.<br>This message will disappear once we receive payment confirmation.',
            html: true,
            show: false
        });

      $scope.promoCodeEnabled = false;
      $scope.promoCode = '';

      $scope.$route = $route;

      ActiveUser.getFromLocal().then(function() {
          $scope.cart.household = ActiveUser.userData.household;
      }, function() {
        sendToLogin();
      }, function() {
      });

    function getSettings()
    {
        var req = {
            method: 'GET',
            url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/config/signup',
            headers: {
                'Content-Type': undefined
            }
        };

        return $http(req).then(function(result) {
                $scope.config = result.data;
            }
        );
    }

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
                $rootScope.$emit('cartItemRemoved', {});
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
                    $scope.paymentResponse = response.data;
                    //console.log($scope.paymentResponse);
                  loadCart();
                }
            );
      }

      function payCart()
      {

        $scope.payingCart = true;
        $scope.paymentErrors = [];

        //console.log('shopping cart:');
        //console.log($scope.cart);

        var formFilled = false;
        var formErrors = [];

        if(angular.isDefined($scope.cardForm))
        {
            if(!(angular.isDefined($scope.cardForm.customerName) && $scope.cardForm.customerName.length > 0))
            {
                formErrors.push('Please enter the name on the card.');
            }

            if(!(angular.isDefined($scope.cardForm.cardNumber) && $scope.cardForm.cardNumber.length > 0))
            {
                formErrors.push('Please enter your credit card number.');
            }

            if(!(angular.isDefined($scope.cardForm.expMonth) && $scope.cardForm.expMonth.length > 0))
            {
                formErrors.push('Please enter a valid expiration month.');
            }

            if(!(angular.isDefined($scope.cardForm.expYear) && $scope.cardForm.expYear.length > 0))
            {
                formErrors.push('Please enter a valid expiration year.');
            }

            if(!(angular.isDefined($scope.cardForm.cardCvv) && $scope.cardForm.cardCvv.length > 0))
            {
                formErrors.push('Please enter the verification code on the back of your card.');
            }
        }
        else
        {
            formErrors.push('Credit card form is blank.');
        }

        if(formErrors.length > 0)
        {
            $scope.payingCart = false;
            $scope.paymentErrors = formErrors;
        }
        else {

            paymentModal.show;

            var customerData = {};

            customerData.uid = ActiveUser.userData.user_id;
            customerData.hid = ActiveUser.userData.household_id;
            customerData.customerID = ActiveUser.userData.household_id + '_' + ActiveUser.userData.user_id;

            customerData.cardData = $scope.cardForm;
            customerData.cardData.expDate = $scope.cardForm.expYear + '-' + $scope.cardForm.expMonth;
            customerData.chargeAmount = $scope.cart.totalFee.toFixed(2);

            if ($scope.cart.data.length > 0) {
                customerData.cartItems = $scope.cart.data;



                //console.log('shopping cart post:');
                //console.log(customerData);

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
                        //console.log('pay response:');
                        $scope.paymentResponse = response.data;
                        //console.log($scope.paymentResponse);

                        paymentModal.show = false;

                        if (response.data.data.authorized) {
                            MakeToast.popOn('success', 'Purchasing', 'Your credit card has been authorized!');
                            $scope.removed = response.data;
                            if (angular.isDefined(response.data.data.receiptID)) {

                                var reqTwo = {
                                    method: 'POST',
                                    url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/email/receipt',
                                    headers: {
                                        'Content-Type': undefined
                                    },
                                    data: {'uid': ActiveUser.userData.user_id, 'tid': response.data.data.receiptID}
                                };

                                $http(reqTwo);

                                goToReceipt(response.data.data.receiptID);
                            }

                            $scope.cart.paymentComplete = true;
                            $scope.payingCart = false;
                            loadCart();
                        }
                        else {
                            $scope.payingCart = false;
                            MakeToast.popOn('warning', 'Purchasing', 'There was a problem authorizing your purchase.');
                        }

                    });
            }
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

      $scope.gotoItemInfoPage = function(itemID, typeName)
      {
          if(typeName === 'PROGRAM' || typeName === 'SESSION' || typeName === 'SESSION GROUP') {
              $location.path('/' + $routeParams.orgurl + '/programinfo/' + itemID);
          }
          else if(typeName === 'RENTAL CODE'){
              $location.path('/' + $routeParams.orgurl + '/reservations');
          }
          else{
              $location.path('/' + $routeParams.orgurl + '/home');
          }


      };

      loadCart();
      getSettings();

      $scope.goToCheckout = goToCheckout;
      $scope.removeItem = removeItem;
      $scope.payCart = payCart;
      $scope.checkPromo = checkPromo;
      $scope.getSettings = getSettings;
      $scope.pageData = {paymentComplete:false};

      //console.log('page data');
      //console.log($scope.pageData);
  }]);
