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
        $scope.programSortOptions = [];
        $scope.search = SearchFactory;
        $scope.enrolledWithOptions = [];

        $scope.checkEnrolledPrograms = function () {
            if(ActiveUser.isLoggedIn()) {
                ProgramsLoader.loadEnrolledPrograms(ActiveUser.userData.household_id).then(function(response) {
                    $scope.enrolledWithOptions = response.data;
                    console.log($scope.enrolledWithOptions);
                });
            }
        };

        $scope.checkTypeRoute = function () {
            var searchSet = false;

            if(angular.isDefined($routeParams.typeid))
            {
                console.log('search type is defined:' + $routeParams.typeid);
                $scope.search.programSearch.type = $routeParams.typeid;
                searchSet = true;
            }

            if(angular.isDefined($routeParams.keyword))
            {
                console.log('search type is defined:' + $routeParams.keyword);
                $scope.search.programSearch.keyword = $routeParams.keyword;
                searchSet = true;
            }

            if(searchSet)
            {
                $scope.doSearch();
            }
            else
            {
                $scope.getPrograms();
            }

        };

        $scope.doSearch = function () {
            console.log('search keyword:' + $scope.search.programSearch.keyword);

            SearchFactory.setProgramSearch().then(function () {
                $scope.getPrograms();
            });
        };

        $scope.onGoToLogin = function () {
            $location.path('/' + $routeParams.orgurl + '/login');
        };

        $scope.checkPreEligibleRegistrant = function (person) {
            if(!person.preEligible) {
                person.selected = false;
            }
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

        $scope.getProgramSortOptions = function() {
            $scope.programSortOptions.data = [{'sortOption':'0','sortBy':'name','sortLabel':'By Name'},{'sortOption':'1','sortBy':'date','sortLabel':'By Date'}];
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

            return $scope.search.getProgramSearch().then(function () {
                $scope.programs.loadPrograms($scope.search.programSearch).then(function(response) {
                    $scope.activePrograms = response.data;
                    console.log('programs:');
                    console.log($scope.activePrograms);
                    $scope.programs.busy = false;
                });
            });
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
                        program.waitlistSuccess = true;
                        MakeToast.popOn('success', 'Wait List', 'The selected household members have been added to the wait list!');

                        $scope.registration.sendWaitlistAddEmail();

                        for(var sess = 0; sess < $scope.activePrograms.data.sessions.length; sess++)
                        {
                            for(var pro = 0; pro < $scope.activePrograms.data.sessions[sess].programs.length; pro++)
                            {
                                if($scope.activePrograms.data.sessions[sess].programs[pro].item_id == program.item_id)
                                {
                                    $scope.onProgramClick($scope.activePrograms.data.sessions[sess].programs[pro], true);
                                }
                            }
                        }
                    }

                    $scope.addingRegistration = false;
                });
            }
        };

        $scope.onAdditionalEnrollmentClick = function(userID, householdID, registrationID, programID) {
            $scope.registration.addAdditionalEnrollmentToCart(userID, householdID, registrationID, programID).then(function (userAdded) {
                if(userAdded) {
                    console.log('user added');
                    $location.path('/' + $routeParams.orgurl + '/programinfo/' + programID + '/addons');
                }
                else {
                    console.log('no user added');
                }
            });
        };

        $scope.onAddToCartClick = function(program, spots) {
            $scope.addingRegistration = true;

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
                                console.log('no packages');
                                MakeToast.popOn('success', 'Shopping Cart', 'Items have been added to your cart!');
                                $rootScope.$emit('updateCartCount', {});
                                for(var sess = 0; sess < $scope.activePrograms.data.sessions.length; sess++)
                                {
                                    for(var pro = 0; pro < $scope.activePrograms.data.sessions[sess].programs.length; pro++)
                                    {
                                        if($scope.activePrograms.data.sessions[sess].programs[pro].item_id == program.item_id)
                                        {
                                            $scope.onProgramClick($scope.activePrograms.data.sessions[sess].programs[pro], true);
                                        }
                                    }
                                }
                                $scope.addingRegistration = false;

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

        $scope.onProgramClick = function (program, forceReload) {

            program.expanded = !program.expanded;

            if(angular.isDefined(forceReload))
            {
                if(forceReload)
                {
                    program.expanded = true;
                }
            }

            if(program.expanded) {
                program.loadingProgram = true;
                var alreadyLoaded = false;

                var itemID = program.item_id;

                if(!(angular.isDefined(forceReload) && forceReload)) {
                    if (angular.isDefined(program.listData)) {
                        console.log('list data already set');
                        alreadyLoaded = true;
                    }
                    else {
                        console.log('no list data found');
                    }
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
                        program.listData = undefined;
                        program.listData = response.data.data;


                        program.listData.showEligibleButton = false;
                        program.listData.showPreEligibleButton = false;

                        //console.log('current listing:');
                        //console.log(program.listData);

                        if (angular.isDefined(program.listData.users) && program.listData.users.length > 0) {
                            /*
                            console.log('There are ' + program.listData.users.length + ' users');

                            console.log(program.listData.users.filter(function (user) {
                                    return user.eligible;
                                }).length + ' users are eligible for this class');
                            console.log(program.listData.users.filter(function (user) {
                                    return !user.eligible;
                                }).length + ' users are ineligible for this class');
                            */
                            if (program.listData.users.filter(function (user) {
                                    return !user.eligible;
                                }).length > 0) {
                                program.listData.showEligibleButton = true;
                            }

                            if (program.listData.users.filter(function (user) {
                                    return !user.preEligible;
                                }).length > 0) {
                                program.listData.showPreEligibleButton = true;
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
                console.log('program is not expanded'); 
            }
        };


        $scope.checkActiveUser();
        $scope.getProgramTypes();
        $scope.getProgramLocations();
        $scope.checkTypeRoute();
        $scope.checkEnrolledPrograms();
        $scope.getProgramSortOptions();
    }])
    .factory('ProgramsLoader', ['$http', 'BLUEREC_ONLINE_CONFIG', 'md5', '$routeParams', function($http,BLUEREC_ONLINE_CONFIG,md5,$routeParams) {
        var programs = this;

        programs.loadEnrolledPrograms = function(hid)
        {
            var req = {
                method: 'POST',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/household/extraenrollment',
                data: {
                    'hid':hid
                },
                headers: {
                    'Content-Type': undefined
                }
            };

            return $http(req);
        };

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
                searchOptions.sortBy = '';
            }

            var req = {
                method: 'POST',
                skipAuthorization:true,
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/onlineprograms',
                data: {
                    'keyword':searchOptions.keyword,
                    'typeId':searchOptions.type,
                    'locationId':searchOptions.location,
                    'sortBy':searchOptions.sortBy
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
