'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
  .controller('ShoppingCartCtrl', ['$scope', '$routeParams', '$location', 'BLUEREC_ONLINE_CONFIG', '$http', 'ActiveUser', function ($scope,$routeParams,$location,BLUEREC_ONLINE_CONFIG,$http,ActiveUser) {
    var cart = this;

      $scope.cart = {};
      $scope.removed = {};

      ActiveUser.getFromLocal().then(function() {
        cart.household = ActiveUser.userData.household;
      }, function() {
        sendToLogin();
      }, function() {
      });

      function sendToLogin()
      {
        $location.path('/' + $routeParams.orgurl + '/login');
      }

      function loadCart()
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
              console.log('cart:');
              console.log(response.data);
              $scope.cart = response.data;
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

      function payCart()
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

      function goToCheckout()
      {
        $location.path('/' + $routeParams.orgurl + '/checkout');
      }

      loadCart();

      $scope.goToCheckout = goToCheckout;
      $scope.removeItem = removeItem;
      $scope.payCart = payCart;

  }]);
