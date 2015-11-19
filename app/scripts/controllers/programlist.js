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

    $scope.showAdvancedSearch = false;

    $scope.registrationSelected = false;

    $scope.advancedSearchLabel = 'More Options';

    var filterTextTimeout;
    $scope.household = {};

    ActiveUser.getFromLocal().then(function() {
      $scope.household = ActiveUser.userData.household;
      //$scope.$root.currentUser = response.data;
    }, function() {
    }, function() {
    });

    $scope.onSearchPanelOpen = function () {
      $scope.showAdvancedSearch = ($scope.showAdvancedSearch)?false:true;

      if($scope.showAdvancedSearch)
      {
        $scope.advancedSearchLabel = 'Fewer Options';
      }
      else
      {
        $scope.advancedSearchLabel = 'More Options';
      }
    };

    $scope.$watch('query.item_name', function () {
      if (filterTextTimeout) {
        $timeout.cancel(filterTextTimeout);
      }
      filterTextTimeout = $timeout(function() {
        $scope.proloader.nextPage($scope.query);
      }, 250); // delay 250 ms
    });

    $scope.verifyProgramParticipant = function(programIndex, sessionIndex, userIndex, userID, programID)
    {
      if($scope.proloader.returnData[programIndex].programs[sessionIndex].regData[userIndex].selected === true) {
        console.log(programIndex + ' :: ' + sessionIndex + ' :: ' + userIndex + ' :: ' + 'user: ' + userID + ' program: ' + programID);
        console.log($scope.proloader.returnData);
        $scope.proloader.validateUserEligibility(programIndex, sessionIndex, userIndex, userID, programID);
      }
    };

    $scope.addUsersToCart = function(programIndex, sessionIndex)
    {
      $scope.proloader.addToCart(programIndex, sessionIndex);
    };
  }])
  .factory('ProLoader', ['$http', 'BLUEREC_ONLINE_CONFIG', 'md5', '$routeParams', 'ActiveUser', function($http,BLUEREC_ONLINE_CONFIG,md5,$routeParams,ActiveUser) {
    var proload = this;

    var addToCart = function(programIndex, sessionIndex)
    {
      var cartData = {};
      cartData.itemType = 'program';
      cartData.registrations = [];
      var regData = {};

      for(var a = 0; a < proload.returnData[programIndex].programs[sessionIndex].regData.length; a++)
      {
        if(proload.returnData[programIndex].programs[sessionIndex].regData[a].selected)
        {
          regData = {};
          //console.log('add ' + proload.returnData[programIndex].programs[sessionIndex].regData[a].userID + ' to program ' + proload.returnData[programIndex].programs[sessionIndex].item_id);
          regData = {
            'userID':proload.returnData[programIndex].programs[sessionIndex].regData[a].userID,
            'itemID':proload.returnData[programIndex].programs[sessionIndex].item_id,
            'householdID':proload.returnData[programIndex].programs[sessionIndex].regData[a].householdID,
            'addedByUserID':proload.returnData[programIndex].programs[sessionIndex].regData[a].addedByUserID,
            'itemType':proload.returnData[programIndex].programs[sessionIndex].regData[a].itemType,
            'usePaymentPlan':proload.returnData[programIndex].programs[sessionIndex].regData[a].usePaymentPlan
          };
          cartData.registrations.push(regData);
        }
      }

      console.log(cartData);

      if(cartData.registrations.length > 0) {
        console.log(angular.toJson(cartData));
        var req = {
          method: 'POST',
          url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/cart/add',
          headers: {
            'Content-Type': undefined
          },
          data: cartData
        };

        return $http(req)
            .then(
            function success(response) {
              console.log(response.data);
            }
        );
      }
    };

    var validateUserEligibility = function (programIndex, sessionIndex, userIndex, userID, programID)
    {
      var req = {
        method: 'GET',
        url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/program/eligibility/' + programID + '/' + userID,
        headers: {
          'Content-Type': undefined
        }
      };

      return $http(req)
          .then(
          function success(response) {
            console.log(response.data);
            if(
                response.data.data.ageValid === false ||
                response.data.data.gradeValid === false
            )
            {
              proload.returnData[programIndex].programs[sessionIndex].regData[userIndex].selected = false;
              proload.returnData[programIndex].programs[sessionIndex].regData[userIndex].regError = true;
              proload.returnData[programIndex].programs[sessionIndex].regData[userIndex].errorText = response.data.data.problems;
            }

          }
      );
    };

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

      var createRegistrantList = function(proData)
      {
        ActiveUser.getFromLocal().then(function() {
          var household = ActiveUser.userData.household;

          for(var s = 0; s < proData.returnData.length; s++)
          {
            for(var p = 0; p < proData.returnData[s].programs.length; p++)
            {
              proData.returnData[s].programs[p].regData = [];

              for(var u = 0; u < household.length; u++)
              {
                proData.returnData[s].programs[p].regData[u] = {};
                proData.returnData[s].programs[p].regData[u].userID = household[u].user_id;
                proData.returnData[s].programs[p].regData[u].householdID = ActiveUser.userData.household_id;
                proData.returnData[s].programs[p].regData[u].itemType = 'program';
                proData.returnData[s].programs[p].regData[u].addedByUserID = ActiveUser.userData.user_id;
                proData.returnData[s].programs[p].regData[u].usePaymentPlan = '0';
                proData.returnData[s].programs[p].regData[u].selected = false;
              }
            }
          }

        }, function() {
        }, function() {
        });



        return proData;
      };

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

        proload = createRegistrantList(proload);

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
    proload.validateUserEligibility = validateUserEligibility;
    proload.addToCart = addToCart;

    return proload;
  }]);
