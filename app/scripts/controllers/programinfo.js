'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:ProgramList
 * @description
 * # ProgramList
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
  .controller('ProgramInfo', ['$scope', 'ProInfoLoader', '$routeParams', 'ActiveUser', '$aside', '$location', 'MakeToast', '$rootScope', 'RegistrationFactory', function ($scope,ProInfoLoader,$routeParams,ActiveUser,$aside,$location,MakeToast,$rootScope,RegistrationFactory) {
    //var itemID = $routeParams.itemid;

    $scope.loggedIn = false;

    if(ActiveUser.isLoggedIn())
    {
      $scope.loggedIn = true;
      $scope.ActiveUser = ActiveUser;
      $scope.registration = RegistrationFactory;
    }

    $scope.orgcode = $routeParams.orgurl;
    $scope.itemid = $routeParams.itemid;
    $scope.proinfo = ProInfoLoader;
    $scope.proinfo.loadProgram().then(function (){

        $scope.proinfo.returnData.listData.showEligibleButton = false;

        console.log('current listing:');
        console.log($scope.proinfo.returnData.listData);

        if (angular.isDefined($scope.proinfo.returnData.listData.users) && $scope.proinfo.returnData.listData.users.length > 0) {
            console.log('There are ' + $scope.proinfo.returnData.listData.users.length + ' users');

            console.log($scope.proinfo.returnData.listData.users.filter(function (user) {
                    return user.eligible;
                }).length + ' users are eligible for this class');
            console.log($scope.proinfo.returnData.listData.users.filter(function (user) {
                    return !user.eligible;
                }).length + ' users are ineligible for this class');

            if ($scope.proinfo.returnData.listData.users.filter(function (user) {
                    return !user.eligible;
                }).length > 0) {
                $scope.proinfo.returnData.listData.showEligibleButton = true;
            }
        }
        $scope.proinfo.returnDataloadingProgram = false;
        $scope.proinfo.returnDatashowIneligible = false;

        if(ActiveUser.isLoggedIn())
        {
            $scope.loggedIn = true;
            $scope.ActiveUser = ActiveUser;

            console.log('program info');
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

    $scope.onAddToCartClick = function(program)
    {
        /*
      $scope.proinfo.addToCart().then(
          function success() {
              $scope.openAside();
          }
      );
      */

        $scope.addingRegistration = true;

        var selectedCount = program.users.filter(function (user) {return user.selected;}).length;

        program.noSelection = false;

        if(selectedCount == 0)
        {
            program.noSelection = true;
            $scope.addingRegistration = false;
        }
        else
        {
            $scope.registration.addRegistrationArrayToCart(program).then(function(userAdded){

                if(userAdded)
                {
                    console.log('user added');

                    if(program.package_count > 0)
                    {
                        console.log('has packages');
                        $location.path('/' + $routeParams.orgurl + '/programinfo/' + program.item_id + '/addons');
                        $scope.addingRegistration = false;
                    }
                    else
                    {
                        console.log('no packages');
                        MakeToast.popOn('success','Shopping Cart','Items have been added to your cart!');
                        $rootScope.$emit('updateCartCount', {});
                        setTimeout(function() {
                            $scope.addingRegistration = false;
                        }, 500);

                    }
                }
                else
                {
                    $scope.addingRegistration = false;
                    console.log('no user added');
                }
            });
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
  }]);
