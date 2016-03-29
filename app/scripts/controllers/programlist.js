'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:ProgramList
 * @description
 * # ProgramList
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
  .controller('ProgramList', ['$scope', '$aside', 'ProLoader', '$timeout', 'ActiveUser', 'md5', '$routeParams', '$location', 'UserData', 'RegistrationFactory', function ($scope,$aside,ProLoader,$timeout,ActiveUser,md5,$routeParams, $location, UserData, RegistrationFactory) {
    $scope.proloader = ProLoader;
    $scope.addingRegistration = false;
    //$scope.query = {};

    var regList = RegistrationFactory;
    
    $scope.proloader.nexonClickPrintReceiptFromPurchasesPage($scope.query).then(
        function success() {
          ActiveUser.updateUser().then(
              function () {
                if(ActiveUser.isLoggedIn())
                {
                  ActiveUser.putUserInLocalStorage(UserData.getUserData()).then(
                      function () {
                        $scope.household = ActiveUser.userData.household;

                        $scope.proloader.createRegistrantList($scope.proloader.returnData);
                      });
                }
            });
        }
    );

    $scope.proloader.getProgramTypes();
    $scope.proloader.getProgramLocations();

    $scope.showAdvancedSearch = false;

    $scope.registrationSelected = false;

    $scope.advancedSearchLabel = 'More Options';

    var filterTextTimeout;
    $scope.household = {};

    $scope.$on('$routeChangeSuccess', function() {
      $scope.$watch(
          function getOrgUrlChange() {
            return $routeParams.orgurl;
          },
          function handleOrgUrlChange() {
            $scope.proloader.nextPage(null);
          }
      );
    });

    if(ActiveUser.isLoggedIn())
    {
        $scope.household = ActiveUser.userData.household;
    }

    function updateHouseholdData()
    {
      if(ActiveUser.isLoggedIn())
      {
        $scope.household = ActiveUser.userData.household;

        $scope.proloader.createRegistrantList($scope.proloader.returnData);
      }
    }

    $scope.$on('user:updated', function() {
      setTimeout(updateHouseholdData,500);
    });

    /*
    ActiveUser.getFromLocal().then(function() {
      $scope.household = ActiveUser.userData.household;
      //$scope.$root.currentUser = response.data;
    }, function() {
    }, function() {
    });
    */

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

    function doSearch()
    {
      $scope.proloader.noresults = false;

      $scope.proloader.nextPage($scope.query).then(function(){
        if(ActiveUser.isLoggedIn())
        {
          $scope.household = ActiveUser.userData.household;

          $scope.proloader.createRegistrantList($scope.proloader.returnData);
        }
      });
    }

    function getSearchHash()
    {
      var returnVal = '';

      if(angular.isDefined($scope.query))
      {
        returnVal = md5.createHash(angular.toJson($scope.query));
      }

      return returnVal;
    }

    $scope.$watch(getSearchHash(), function () {
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
        $scope.proloader.validateUserEligibility(programIndex, sessionIndex, userIndex, userID, programID);
      }
    };

    $scope.openAside = function openAside() {

      // Pre-fetch an external template populated with a custom scope
      var myOtherAside = $aside({scope: $scope, template: 'views/shoppingcart.html'});
      // Show when some event occurs (use $promise property to ensure the template has been loaded)
      myOtherAside.$promise.then(function() {
        myOtherAside.show();
      });

    };

    $scope.addUsersToCart = function(program)
    {

      console.log('program:');
      console.log(program);

      console.log('try adding to the reg list: ' + program.regData.length);

      var userSelected = false;

      $scope.addingRegistration = true;

      regList.addRegistrationArray(program).then(function(userAdded){

        $scope.addingRegistration = false;

        userSelected = userAdded;
        if(userSelected)
        {
          if(program.package_count > 0)
          {
              regList.saveLocalRegistration().then(function(){
              $location.path('/' + $routeParams.orgurl + '/programinfo/' + program.item_id + '/addons');
            });
          }
        }
      });



      /*
      $scope.proloader.addToCart(programIndex, sessionIndex).then(
          function success() {
            $scope.openAside();
          }
      );
      */
    };

    $scope.doSearch = doSearch;
  }])
  .factory('ProLoader', ['$http', 'BLUEREC_ONLINE_CONFIG', 'md5', '$routeParams', 'ActiveUser', function($http,BLUEREC_ONLINE_CONFIG,md5,$routeParams,ActiveUser) {
    var proload = this;

    proload.typeBusy = false;
    proload.types = {};

    var addToCart = function(programIndex, sessionIndex)
    {
      var cartData = {};
      cartData.itemType = 'program';
      cartData.registrations = [];
      var regData = {};

      proload.returnData[programIndex].programs[sessionIndex].addingToCart = true;

      //proload.returnData[programIndex].programs[sessionIndex].addCartButton.disabled = 'disabled';

      for(var a = 0; a < proload.returnData[programIndex].programs[sessionIndex].regData.length; a++)
      {
        if(proload.returnData[programIndex].programs[sessionIndex].regData[a].selected)
        {
          regData = {};
          regData = {
            'userID':proload.returnData[programIndex].programs[sessionIndex].regData[a].userID,
            'itemID':proload.returnData[programIndex].programs[sessionIndex].item_id,
            'householdID':proload.returnData[programIndex].programs[sessionIndex].regData[a].householdID,
            'addedByUserID':proload.returnData[programIndex].programs[sessionIndex].regData[a].addedByUserID,
            'itemType':proload.returnData[programIndex].programs[sessionIndex].regData[a].itemType,
            'usePaymentPlan':proload.returnData[programIndex].programs[sessionIndex].regData[a].usePaymentPlan,
            'programIndex':programIndex,
            'sessionIndex':sessionIndex,
            'userIndex':a
          };
          cartData.registrations.push(regData);
        }
      }

      if(cartData.registrations.length > 0) {
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

              proload.returnData[programIndex].programs[sessionIndex].addingToCart = false;

              for(var c = 0; c < cartData.registrations.length; c++)
              {
                proload.returnData[cartData.registrations[c].programIndex].programs[cartData.registrations[c].sessionIndex].regData[cartData.registrations[c].userIndex].added = true;
              }
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
            if(
                response.data.data.ageValid === false ||
                response.data.data.gradeValid === false
            )
            {
              proload.returnData[programIndex].programs[sessionIndex].regData[userIndex].selected = false;
              proload.returnData[programIndex].programs[sessionIndex].regData[userIndex].regError = true;
              proload.returnData[programIndex].programs[sessionIndex].regData[userIndex].errorText = response.data.data.problems;
            }
            else
            {
              proload.returnData[programIndex].programs[sessionIndex].regData[userIndex].regValid = true;
            }

          }
      );
    };

    var getProgramTypes = function() {

      if(proload.typeBusy) {
        return false;
      }
      proload.typeBusy = true;

      var req = {
        method: 'POST',
        skipAuthorization:true,
        url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/onlineprogramtypes',
        headers: {
          'Content-Type': undefined
        }
      };

      $http(req).then(function(response) {
        var types = response.data;
        proload.types = types;
        proload.typeBusy = false;
      }.bind(this));

    };

    var getProgramLocations = function() {

      if(proload.locationBusy) {
        return false;
      }
      proload.locationBusy = true;

      var req = {
        method: 'POST',
        skipAuthorization:true,
        url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/onlineprogramlocations',
        headers: {
          'Content-Type': undefined
        }
      };

      $http(req).then(function(response) {
        var locations = response.data;
        proload.locations = locations;
        proload.locationBusy = false;
      }.bind(this));

    };

    var nextPage = function(query) {
      proload.typeId = '';
      proload.locationId = '';

      if(angular.isDefined(query) && query !== null)
      {
        proload.searchParams = query;

        if(angular.isDefined(proload.searchParams) && proload.searchParams !== null)
        {
          proload.thisSearchHash = md5.createHash(angular.toJson(proload.searchParams)+$routeParams.orgurl);

          proload.keyword = proload.searchParams.item_name;
          proload.onlyTickets = proload.searchParams.has_tickets;
          proload.typeId = proload.searchParams.type_id;
          proload.locationId = proload.searchParams.location_id;
          if(proload.thisSearchHash !== proload.lastSearchHash)
          {
            proload.afterCount = 0;
            proload.lastSearchHash = proload.thisSearchHash;
          }
          else
          {
            proload.lastSearchParams = proload.searchParams;
          }
        }
        else
        {
          proload.keyword = '';
          proload.onlyTickets = false;
          proload.typeId = '';
          proload.locationId = '';
        }
      }
      else
      {
        if(angular.isDefined(proload.thisSearchHash) && angular.isDefined(proload.searchParams) && angular.isDefined(proload.lastSearchHash) && (proload.thisSearchHash !== proload.lastSearchHash)) {

          proload.lastSearchHash = proload.thisSearchHash;
          proload.afterCount = 0;
          proload.keyword = '';
          proload.onlyTickets = false;
          proload.typeId = '';
          proload.locationId = '';
        }
      }


      proload.orgurl = $routeParams.orgurl;

      if(proload.busy) {
        return false;
      }
      proload.busy = true;

      if(proload.thisSearchHash !== proload.lastSearchHash)
      {
        proload.lastSearchHash = proload.thisSearchHash;
        proload.afterCount = 0;
        proload.noresults = false;
      }
      else
      {
        proload.lastSearchHash = proload.thisSearchHash;
      }

      if(proload.noresults)
      {
        proload.busy = false;
        return false;
      }

      proload.thisSearchHash = '';

      var req = {
        method: 'POST',
        skipAuthorization:true,
        url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/onlineprograms',
        data: {
          'after': proload.afterCount,
          'keyword': proload.keyword,
          'onlytickets': proload.onlyTickets,
          'typeId': proload.typeId,
          'locationId': proload.locationId
        },
        headers: {
          'Content-Type': undefined
        }
      };

      return $http(req).then(function(response) {

        var programs = response.data;

        if(proload.afterCount > 0)
        {
          for (var i = 0; i < programs.length; i++) {
            proload.responseData.push(programs[i]);
          }
        }
        else
        {
          proload.responseData = programs;
        }

        proload.returnData = JSON.parse(angular.toJson(proload.responseData));
        proload.afterCount += proload.increment;

        if(programs.length === 0)
        {
          proload.noresults = true;
        }

        var totalPrograms = 0;

        for(var s = 0; s < proload.returnData.length; s++)
        {
          totalPrograms += proload.returnData[s].programs.length;

          for(var p = 0; p < proload.returnData[s].programs.length; p++)
          {
            proload.returnData[s].programs[p].online_description = [];

          }
        }

        if(totalPrograms < 25)
        {
          proload.noresults = true;
        }

        proload.busy = false;
      }.bind(this));

    };

    var createRegistrantList = function(proData)
    {
      ActiveUser.getFromLocal().then(function success() {
        if(ActiveUser.isLoggedIn()) {
          var household = ActiveUser.userData.household;

          for (var s = 0; s < proData.length; s++) {
            for (var p = 0; p < proData[s].programs.length; p++) {
              proData[s].programs[p].regData = [];

              for (var u = 0; u < household.length; u++) {
                proData[s].programs[p].regData[u] = {};
                proData[s].programs[p].regData[u].userID = household[u].user_id;
                proData[s].programs[p].regData[u].householdID = ActiveUser.userData.household_id;
                proData[s].programs[p].regData[u].itemType = 'program';
                proData[s].programs[p].regData[u].addedByUserID = ActiveUser.userData.user_id;
                proData[s].programs[p].regData[u].usePaymentPlan = '0';
                proData[s].programs[p].regData[u].fullName = household[u].firstname + ' ' + household[u].lastname;
                proData[s].programs[p].regData[u].selected = false;
              }
            }
          }
        }
      });

      return proData;
    };

    proload.getProgramTypes = getProgramTypes;
    proload.getProgramLocations = getProgramLocations;
    proload.nextPage = nextPage;
    proload.createRegistrantList = createRegistrantList;
    proload.responseData = [];
    proload.searchParams = [];
    proload.lastSearchHash = '';
    proload.thisSearchHash = '';
    proload.returnData = '';
    proload.afterCount = 0;
    proload.increment = 25;
    proload.busy = false;
    proload.noresults = false;
    proload.slowReload = false;
    proload.validateUserEligibility = validateUserEligibility;
    proload.addToCart = addToCart;

    return proload;
  }]);
