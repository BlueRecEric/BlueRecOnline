'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:ProgramList
 * @description
 * # ProgramList
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
  .controller('ProgramList', ['$scope', 'ProLoader', '$timeout', 'ActiveUser', function ($scope,ProLoader,$timeout,ActiveUser) {
    $scope.proloader = ProLoader;
    $scope.proloader.nextPage($scope.query);

    var filterTextTimeout;
    $scope.household = {};

    ActiveUser.getFromLocal().then(function() {
      $scope.household = ActiveUser.userData.household;
      //$scope.$root.currentUser = response.data;
    }, function() {
    }, function() {
    });

    $scope.$watch('query.item_name', function () {
      if (filterTextTimeout) {
        $timeout.cancel(filterTextTimeout);
      }
      filterTextTimeout = $timeout(function() {
        $scope.proloader.nextPage($scope.query);
      }, 250); // delay 250 ms
    });
  }])
  .factory('ProLoader', ['$http', 'BLUEREC_ONLINE_CONFIG', 'md5', '$routeParams', function($http,BLUEREC_ONLINE_CONFIG,md5,$routeParams) {
    var proload = this;


    var nextPage = function(query) {
      //console.log('Try to load the next page.');
      //console.log('search query:');
      //console.log(query);
      proload.searchParams = query;

      proload.orgurl = $routeParams.orgurl;

      if(proload.busy) {
        return false;
      }
      proload.busy = true;

      proload.thisSearchHash = '';

      if(angular.isDefined(proload.searchParams))
      {
        proload.thisSearchHash = md5.createHash(angular.toJson(proload.searchParams));
        proload.keyword = proload.searchParams.item_name;
        proload.onlyTickets = proload.searchParams.has_tickets;
      }
      else
      {
        proload.keyword = '';
        proload.onlyTickets = false;
      }

      if(proload.thisSearchHash !== proload.lastSearchHash)
      {
        proload.lastSearchHash = '';
        proload.lastSearchHash = proload.thisSearchHash;
        proload.afterCount = 0;
        proload.noresults = false;
      }

      if(proload.noresults)
      {
        proload.busy = false;
        return false;
      }

      var req = {
        method: 'POST',
        skipAuthorization:true,
        url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/onlineprograms',
        data: {
          'after': proload.afterCount,
          'keyword': proload.keyword,
          'onlytickets': proload.onlyTickets
        },
        headers: {
          'Content-Type': undefined
        }
      };

      $http(req).then(function(response) {
        var programs = response.data;
        //console.log(programs);
        for (var i = 0; i < programs.length; i++) {
          //console.log(programs[i]);
          proload.responseData.push(programs[i]);
        }
        proload.returnData = JSON.parse(angular.toJson(proload.responseData));
        console.log(proload.returnData);
        proload.afterCount += proload.increment;

        if(programs.length === 0)
        {
          proload.noresults = true;
        }

        proload.busy = false;
      }.bind(this));

    };

    proload.nextPage = nextPage;
    proload.responseData = [];
    proload.searchParams = [];
    proload.lastSearchHash = '';
    proload.thisSearchHash = '';
    proload.returnData = '';
    proload.afterCount = 0;
    proload.increment = 10;
    proload.busy = false;
    proload.noresults = false;
    proload.slowReload = false;

    return proload;
  }]);
