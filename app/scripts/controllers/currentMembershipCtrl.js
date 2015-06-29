'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:CurrentMembershipCtrl
 * @description
 * # AboutCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
  .controller('CurrentMembershipCtrl', ['$scope', 'ActiveUser', 'CurrentMembershipLoader', '$routeParams', function ($scope,ActiveUser,CurrentMembershipLoader,$routeParams) {
      $scope.showCurrent = ActiveUser.isLoggedIn();
      $scope.orgurl = $routeParams.orgurl;

      if(ActiveUser.isLoggedIn())
      {
        $scope.currentMemberships = CurrentMembershipLoader;
        $scope.currentMemberships.loadMemberships();
      }
  }])
  .factory('CurrentMembershipLoader', ['$http', 'BLUEREC_ONLINE_CONFIG', '$routeParams', 'ActiveUser', function($http,BLUEREC_ONLINE_CONFIG,$routeParams,ActiveUser) {
    var memload = this;

    var loadMemberships = function() {

      if(memload.busy) {
        return false;
      }
      memload.busy = true;

      var req = {
        method: 'POST',
        url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/currentmemberships',
        headers: {
          'Content-Type': undefined
        },
        data: {'uid': ActiveUser.userData.user_id}
      };

      $http(req).then(function(response) {
        memload.returnData = {};
        console.log('current memberships');
        console.log(response.data);
        memload.returnData = response.data;
        memload.busy = false;
      }.bind(this));
    };

    memload.loadMemberships = loadMemberships;
    memload.returnData = '';
    memload.busy = false;

    return memload;
  }]);