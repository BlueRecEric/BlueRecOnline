'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:ProgramList
 * @description
 * # ProgramList
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
  .controller('ProgramInfo', ['$scope', 'ProInfoLoader', '$routeParams', 'ActiveUser', '$aside', function ($scope,ProInfoLoader,$routeParams,ActiveUser,$aside) {
    //var itemID = $routeParams.itemid;

    $scope.loggedIn = false;

    if(ActiveUser.isLoggedIn())
    {
      $scope.loggedIn = true;
      $scope.ActiveUser = ActiveUser;
    }

    $scope.orgcode = $routeParams.orgurl;
    $scope.itemid = $routeParams.itemid;
    $scope.proinfo = ProInfoLoader;
    $scope.proinfo.loadProgram().then(function (){

        if(ActiveUser.isLoggedIn())
        {
            $scope.loggedIn = true;
            $scope.ActiveUser = ActiveUser;

            console.log('program info');
            console.log($scope.proinfo);

            $scope.proinfo.returnData.usrData = [];

            for (var u = 0; u < ActiveUser.userData.household.length; u++) {
                $scope.proinfo.returnData.usrData[u] = {};
                $scope.proinfo.returnData.usrData[u].userID = ActiveUser.userData.household[u].user_id;
                $scope.proinfo.returnData.usrData[u].householdID = ActiveUser.userData.household_id;
                $scope.proinfo.returnData.usrData[u].itemType = 'program';
                $scope.proinfo.returnData.usrData[u].addedByUserID = ActiveUser.userData.user_id;
                $scope.proinfo.returnData.usrData[u].usePaymentPlan = '0';
                $scope.proinfo.returnData.usrData[u].selected = false;
            }

            console.log('program info after usrdata');
            console.log($scope.proinfo);
        }

    });


    $scope.verifyProgramParticipant = function(userIndex, userID, programID)
    {
        if(angular.isDefined($scope.proinfo.returnData.usrData))
        {
            if($scope.proinfo.returnData.usrData[userIndex].selected === true) {
                console.log(userIndex + ' :: ' + 'user: ' + userID + ' program: ' + programID);
                console.log($scope.proinfo.returnData);
                $scope.proinfo.validateUserEligibility(userIndex, userID, programID);
            }
        }
        else
        {
            console.log('usrData is undefined');
        }
    };

    $scope.addUsersToCart = function()
    {
      $scope.proinfo.addToCart().then(
          function success() {
              $scope.openAside();
          }
      );
    };

    $scope.openAside = function openAside() {

      // Pre-fetch an external template populated with a custom scope
      var myOtherAside = $aside({scope: $scope, template: 'views/shoppingcart.html'});
      // Show when some event occurs (use $promise property to ensure the template has been loaded)
      myOtherAside.$promise.then(function() {
          myOtherAside.show();
      });

    };
  }]);
