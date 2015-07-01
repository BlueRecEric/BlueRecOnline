'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:CurrentMembershipCtrl
 * @description
 * # AboutCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
  .controller('HouseholdCtrl', ['$scope', 'ActiveUser', 'HouseholdLoader', '$routeParams', function ($scope,ActiveUser,HouseholdLoader) {
      if(ActiveUser.isLoggedIn())
      {
        $scope.currentHousehold = HouseholdLoader;
        $scope.currentHousehold.loadHousehold();
      }
  }])
  .factory('HouseholdLoader', ['$http', 'BLUEREC_ONLINE_CONFIG', '$routeParams', 'ActiveUser', function($http,BLUEREC_ONLINE_CONFIG,$routeParams,ActiveUser) {
    var houseload = this;

    var loadHousehold = function() {

      if(houseload.busy) {
        return false;
      }
      houseload.busy = true;

      var req = {
        method: 'POST',
        url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/household',
        headers: {
          'Content-Type': undefined
        },
        data: {'uid': ActiveUser.userData.user_id}
      };

      $http(req).then(function(response) {
        houseload.returnData = {};
        console.log('current memberships');
        console.log(response.data);
        houseload.returnData = response.data;
        houseload.busy = false;
      }.bind(this));
    };

    houseload.loadHousehold = loadHousehold;
    houseload.returnData = '';
    houseload.busy = false;

    return houseload;
  }]);