'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:ProgramList
 * @description
 * # ProgramList
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
    .controller('ProgramsCtrl', ['$scope', '$aside', 'ProgramsLoader', '$timeout', 'ActiveUser', 'md5', '$routeParams', '$location', 'UserData', 'RegistrationFactory', '$anchorScroll', function ($scope,$aside,ProgramsLoader,$timeout,ActiveUser,md5,$routeParams, $location, UserData, RegistrationFactory,$anchorScroll) {

        $scope.programs = ProgramsLoader;
        $scope.registration = RegistrationFactory;
        $scope.programs.busy = false;
        $scope.route = $routeParams;
        $scope.loadingProgram = false;
        $scope.showIneligible = false;

        $scope.onGoToLogin = function () {
            $location.path('/' + $routeParams.orgurl + '/login');
        };

        $scope.checkEligibleRegistrant = function (person) {
            if(!person.eligible) {
                person.selected = false;
            }
        };

        $scope.onEligibilityClick = function(itemID) {
            $anchorScroll.yOffset = 0;
            $location.hash('register_' + itemID);
        };

        $scope.checkActiveUser = function() {
            if(ActiveUser.isLoggedIn()) {
                $scope.showRegisteredUser = true;
            }
            else
            {
                $scope.showRegisteredUser = false;
            }
        };

        $scope.getProgramTypes = function () {
            $scope.programs.loadTypes().then(function(response){
                $scope.programTypes = response;
                console.log('program types:');
                console.log($scope.programTypes);
            });
        };

        $scope.getProgramLocations = function () {
            $scope.programs.loadLocations().then(function(response){
                $scope.programLocations = response;
                console.log('program locations:');
                console.log($scope.programLocations);
            });
        };

        $scope.getPrograms = function () {

            $scope.programs.busy = true;

            $scope.programs.loadPrograms().then(function(response) {
                $scope.activePrograms = response.data;
                console.log('programs:');
                console.log($scope.activePrograms);
                $scope.programs.busy = false;
            });
        };

        $scope.onAddToCartClick = function(program) {
            var userSelected = false;

            $scope.addingRegistration = true;

            $scope.registration.addRegistrationArray(program).then(function(userAdded){

                $scope.addingRegistration = false;

                userSelected = userAdded;
                if(userSelected)
                {
                    if(program.package_count > 0)
                    {
                        $location.path('/' + $routeParams.orgurl + '/programinfo/' + program.item_id + '/addons');
                    }
                }
            });
        };

        $scope.onProgramClick = function (itemID) {
            $scope.currentProgram = {};
            $scope.loadingProgram = true;

            console.log('Clicked item:');
            console.log(itemID);

            var uid = '';
            var hid = '';

            if(ActiveUser.isLoggedIn())
            {
                uid = ActiveUser.userData.user_id;
                hid = ActiveUser.userData.household_id;
            }

            $scope.programs.loadSingleProgram(itemID,uid,hid).then(function(response){
                $scope.currentProgram = response.data.data;

                $scope.currentProgram.showEligibleButton = false;

                console.log('current listing:');
                console.log($scope.currentProgram);

                if(angular.isDefined($scope.currentProgram.users) && $scope.currentProgram.users.length > 0)
                {
                    console.log('There are ' + $scope.currentProgram.users.length + ' users');

                    console.log($scope.currentProgram.users.filter(function(user){return user.eligible;}).length + ' users are eligible for this class');
                    console.log($scope.currentProgram.users.filter(function(user){return !user.eligible;}).length + ' users are ineligible for this class');

                    if($scope.currentProgram.users.filter(function(user){return !user.eligible;}).length > 0)
                    {
                        $scope.currentProgram.showEligibleButton = true;
                    }
                }

                $scope.loadingProgram = false;
            });

        };

        $scope.checkActiveUser();
        $scope.getProgramTypes();
        $scope.getProgramLocations();
        $scope.getPrograms();

    }])
    .factory('ProgramsLoader', ['$http', 'BLUEREC_ONLINE_CONFIG', 'md5', '$routeParams', function($http,BLUEREC_ONLINE_CONFIG,md5,$routeParams) {
        var programs = this;

        programs.loadSingleProgram = function (itemID,uid,hid) {
            var req = {
                method: 'POST',
                skipAuthorization:true,
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/onlineprograms/listing',
                data: {
                    'itemID':itemID,
                    'uid':uid,
                    'hid':hid
                },
                headers: {
                    'Content-Type': undefined
                }
            };

            return $http(req);
        };

        programs.loadPrograms = function () {
            var req = {
                method: 'POST',
                skipAuthorization:true,
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/onlineprograms',
                data: {
                },
                headers: {
                    'Content-Type': undefined
                }
            };

            return $http(req);
        };

        programs.loadTypes = function () {
            var req = {
                method: 'POST',
                skipAuthorization:true,
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/onlineprogramtypes',
                headers: {
                    'Content-Type': undefined
                }
            };

            return $http(req);
        };

        programs.loadLocations = function() {
            var req = {
                method: 'POST',
                skipAuthorization:true,
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/onlineprogramlocations',
                headers: {
                    'Content-Type': undefined
                }
            };

            return $http(req);
        };

        return programs;

    }]);
