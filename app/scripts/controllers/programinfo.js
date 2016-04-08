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

    $scope.afterLoad = function() {
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
    };

    $scope.proinfo.loadProgram().then(function (){
        $scope.afterLoad();
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

    $scope.onAddToWaitListClick = function(program)
    {
        $scope.addingRegistration = true;

        program.waitlistError = false;
        program.waitlistSuccess = false;
        program.waitlistErrors = [];

        var selectedCount = program.users.filter(function (user) {return user.selected;}).length;

        if (selectedCount == 0) {
            program.noSelection = true;
            $scope.addingRegistration = false;
        }
        else {
            $scope.registration.addRegistrationArrayToWaitList(program).then(function (response) {
                console.log('full response:');
                console.log(response);

                for(var r = 0; r < response.data.responses.length; r++)
                {
                    if(!response.data.responses[r].response.data.success)
                    {
                        program.waitlistError = true;

                        for(var e = 0; e < response.data.responses[r].response.errors.length; e++)
                        {
                            program.waitlistErrors.push(response.data.responses[r].response.errors[e].error.text);
                        }
                    }
                }

                if(!program.waitlistError)
                {
                    $scope.proinfo.loadProgram().then(function (){
                        $scope.afterLoad();

                        program.waitlistSuccess = true;
                        MakeToast.popOn('success', 'Wait List', 'The selected household members have been added to the wait list!');
                        setTimeout(function () {
                            $scope.addingRegistration = false;
                        }, 500);
                    });
                }

                $scope.addingRegistration = false;
            });
        }
    };

    $scope.checkEligibleRegistrant = function (person) {
      if(!person.eligible) {
          person.selected = false;
      }
    };

    $scope.onAddToCartClick = function(program, spots)
    {
        $scope.addingRegistration = true;

        program.overLimit = false;
        program.overLimitMessage = '';

        var selectedCount = program.users.filter(function (user) {return user.selected;}).length;

        program.noSelection = false;

        if(selectedCount > spots)
        {
            program.overLimit = true;
            program.overLimitMessage = 'There are only ' + spots + ' available spots open for this activity.';
            $scope.addingRegistration = false;
        }
        else {
            if (selectedCount == 0) {
                program.noSelection = true;
                $scope.addingRegistration = false;
            }
            else {
                $scope.registration.addRegistrationArrayToCart(program).then(function (userAdded) {
                    if (userAdded) {
                        console.log('user added');

                        if (program.package_count > 0) {
                            console.log('has packages');
                            $location.path('/' + $routeParams.orgurl + '/programinfo/' + program.item_id + '/addons');
                            $scope.addingRegistration = false;
                        }
                        else {
                            $scope.proinfo.loadProgram().then(function (){
                                $scope.afterLoad();

                                console.log('no packages');
                                MakeToast.popOn('success', 'Shopping Cart', 'Items have been added to your cart!');
                                $rootScope.$emit('updateCartCount', {});
                                setTimeout(function () {
                                    $scope.addingRegistration = false;
                                }, 500);
                            });
                        }
                    }
                    else {
                        $scope.addingRegistration = false;
                        console.log('no user added');
                    }
                });
            }
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
