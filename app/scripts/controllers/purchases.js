'use strict';

angular.module('bluereconlineApp')
  .controller('PurchasesCtrl', ['$scope', 'ActiveUser', 'PurchasesLoader', function ($scope,ActiveUser,PurchasesLoader) {
      if(ActiveUser.isLoggedIn())
      {

      }
  }])
    .factory('PurchasesLoader', ['$http', 'BLUEREC_ONLINE_CONFIG', '$routeParams', 'ActiveUser', function($http,BLUEREC_ONLINE_CONFIG,$routeParams,ActiveUser) {

  }]);