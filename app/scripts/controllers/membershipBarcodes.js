'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:MembershipBarcodeCtrl
 * @description
 * # AboutCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
  .controller('MembershipBarcodeCtrl', ['$scope', 'MembershipLoader','$timeout', '$routeParams', function ($scope,MembershipLoader,$timeout,$routeParams) {
      $scope.listMemberships = MembershipLoader;
      $scope.query = [];

      $scope.printBarcodes = function ()
      {
          window.print();
      };

      $scope.checkTypeRoute = function () {

          if(angular.isDefined($routeParams.keyword))
          {
              console.log('search type is defined:' + $routeParams.keyword);
              $scope.query.item_name = $routeParams.keyword;
          }

          $scope.listMemberships.loadMemberships($scope.query);
      };

      $scope.doSearch = function () {
          $scope.listMemberships.loadMemberships($scope.query);
      };

      $scope.checkTypeRoute();
  }])
  .factory('MembershipLoader', ['$http', 'BLUEREC_ONLINE_CONFIG', '$routeParams', 'md5', function($http,BLUEREC_ONLINE_CONFIG,$routeParams,md5) {
    var memload = this;

    var loadMemberships = function(query) {

      if(memload.busy) {
        return false;
      }
      memload.busy = true;

      memload.searchParams = query;

      if(angular.isDefined(memload.searchParams))
      {
        memload.thisSearchHash = md5.createHash(angular.toJson(memload.searchParams));
        memload.keyword = memload.searchParams.item_name;
        memload.family_only = memload.searchParams.is_family;
      }
      else
      {
        memload.keyword = '';
        memload.family_only = false;
      }

      var req = {
        method: 'POST',
        url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/membershiptypes',
        headers: {
          'Content-Type': undefined
        },
        data: {
          'keyword': memload.keyword,
          'familyonly': memload.family_only
        }
      };

      $http(req).then(function(response) {
        memload.returnData = {};
        console.log('membership list');
        console.log(response.data);
        memload.returnData = response.data;
        if(memload.returnData.length === 0)
        {
          memload.noresults = true;
        }

        memload.busy = false;
      }.bind(this));
    };

    memload.searchParams = [];
    memload.loadMemberships = loadMemberships;
    memload.returnData = [];
    memload.busy = false;
    memload.orgurl = $routeParams.orgurl;
    memload.noresults = false;
    return memload;
  }]);