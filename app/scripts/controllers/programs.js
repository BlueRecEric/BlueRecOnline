'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:ProgramList
 * @description
 * # ProgramList
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
    .controller('ProgramsCtrl', ['$scope', '$rootScope', '$aside', 'ProgramsLoader', '$timeout', 'ActiveUser', 'md5', '$routeParams', '$location', 'UserData', 'RegistrationFactory', 'SearchFactory', '$anchorScroll', 'MakeToast', function ($scope,$rootScope,$aside,ProgramsLoader,$timeout,ActiveUser,md5,$routeParams, $location, UserData, RegistrationFactory,SearchFactory,$anchorScroll,MakeToast) {

        $scope.programs = ProgramsLoader;
        $scope.registration = RegistrationFactory;
        $scope.programs.busy = false;
        $scope.route = $routeParams;
        $scope.loadingProgram = false;

        $scope.search = SearchFactory;

        $scope.doSearch = function () {
            console.log('search keyword:' + $scope.search.programSearch.keyword);

            SearchFactory.setProgramSearch().then(function () {
                $scope.getPrograms();
            });
        };

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

            $scope.search.getProgramSearch().then(function () {
                $scope.programs.loadPrograms($scope.search.programSearch).then(function(response) {
                    $scope.activePrograms = response.data;
                    console.log('programs:');
                    console.log($scope.activePrograms);
                    $scope.programs.busy = false;
                });
            });
        };

        $scope.onAddToCartClick = function(program) {
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
                                $scope.onProgramClick(program);
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

        $scope.onProgramClick = function (program) {

            program.expanded = !program.expanded;

            if(program.expanded) {
                program.loadingProgram = true;
                var alreadyLoaded = false;

                var itemID = program.item_id;

                if (angular.isDefined(program.listData)) {
                    console.log('list data already set');
                    alreadyLoaded = true;
                }
                else {
                    console.log('no list data found');
                }

                console.log('Clicked item:');
                console.log(itemID);

                if(!alreadyLoaded)
                {
                    var uid = '';
                    var hid = '';

                    if (ActiveUser.isLoggedIn()) {
                        uid = ActiveUser.userData.user_id;
                        hid = ActiveUser.userData.household_id;
                    }

                    $scope.programs.loadSingleProgram(itemID, uid, hid).then(function (response) {

                        program.listData = response.data.data;


                        program.listData.showEligibleButton = false;

                        console.log('current listing:');
                        console.log(program.listData);

                        if (angular.isDefined(program.listData.users) && program.listData.users.length > 0) {
                            console.log('There are ' + program.listData.users.length + ' users');

                            console.log(program.listData.users.filter(function (user) {
                                    return user.eligible;
                                }).length + ' users are eligible for this class');
                            console.log(program.listData.users.filter(function (user) {
                                    return !user.eligible;
                                }).length + ' users are ineligible for this class');

                            if (program.listData.users.filter(function (user) {
                                    return !user.eligible;
                                }).length > 0) {
                                program.listData.showEligibleButton = true;
                            }
                        }
                        program.loadingProgram = false;
                        program.showIneligible = false;
                    });
                }
                else
                {
                    console.log('load existing data');
                    program.loadingProgram = false;
                }
            }
            else
            {

            }
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

        programs.loadPrograms = function (searchOptions) {

            if(searchOptions == null)
            {
                searchOptions.keyword = '';
                searchOptions.type = '';
                searchOptions.location = '';
            }

            var req = {
                method: 'POST',
                skipAuthorization:true,
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/onlineprograms',
                data: {
                    'keyword':searchOptions.keyword,
                    'typeId':searchOptions.type,
                    'locationId':searchOptions.location
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
