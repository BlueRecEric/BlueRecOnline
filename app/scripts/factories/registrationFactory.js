'use strict';

angular.module('bluereconlineApp')
    .factory('RegistrationFactory',['BLUEREC_ONLINE_CONFIG','$rootScope', '$http','$q','$routeParams', 'ActiveUser', 'localStorageService', '$timeout', 'uuid4', function(BLUEREC_ONLINE_CONFIG, $rootScope, $http, $q, $routeParams, ActiveUser, localStorageService,$timeout,uuid4) {

        var reg = this;
        reg = {};
        reg.data = [];

        reg.loadingAddons = false;
        reg.loadingPayments = false;
        reg.loadingWaivers = false;
        reg.loadingFields = false;

        function saveLocalRegistration()
        {
            console.log('now saving the registration to local storage...');
            var defer = $q.defer();
            $timeout(function(){
                localStorageService.set('Registration', reg);
                defer.resolve(true);
            },250);

            return defer.promise;
        }

        function addRegistrationArray(regProgram)
        {
            var defer = $q.defer();

            var userSelected = false;

            for(var a = 0; a < regProgram.regData.length; a++) {
                if(regProgram.regData[a].selected) {
                    console.log('found a selected participant: ' + regProgram.regData[a].userID);
                    addRegistration(
                        regProgram.regData[a].userID,
                        regProgram.item_id,
                        regProgram.regData[a].itemType,
                        regProgram.item_name,
                        regProgram.regData[a].fullName
                    );
                    console.log('regProgram:');
                    console.log(regProgram);
                    userSelected = true;
                }
                else
                {
                    console.log('user ' + regProgram.regData[a].userID + ' is not selected.');
                }
            }

            defer.resolve(userSelected);
            return defer.promise;
        }

        function addRegistration(userID, itemID, itemType, itemName, userName)
        {
            console.log('add the registration data...');
            var defer = $q.defer();

            if(isFinite(userID) && userID !== null)
            {
                if(isFinite(itemID) && itemID !== null)
                {
                    var regData = {};
                    regData.userID = userID;
                    regData.itemID = itemID;
                    regData.itemType = itemType;
                    regData.itemName = itemName;
                    regData.userName = userName;

                    regData.waivers = [];
                    regData.payments = [];
                    regData.fields = [];
                    regData.addons = [];

                    console.log('now get the addons...');

                    regData.loadingAddons = true;

                    getCartAddons(regData).then(function(response) {
                        console.log('here is the response: ');
                        console.log(response);

                        regData.loadingAddons = false;

                        regData.addons = response;

                        reg.data.push(regData);

                        //$rootScope.$broadcast('registration:loaded');
                        defer.resolve(regData.addons);
                    });
                }
                else {
                    defer.resolve(false);
                }
            }
            else {
                defer.resolve(false);
            }

            return defer.promise;
        }

        var getCartWaivers = function (waiverList) {
            var req = {
                method: 'POST',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/cart/waivers',
                headers: {
                    'Content-Type': undefined
                },
                data: {'userID': ActiveUser.userData.user_id, 'householdID': ActiveUser.userData.household_id}
            };

            return $http(req).then(
                function success(response) {
                    waiverList = JSON.parse(angular.toJson(response.data.data.waivers));
                });
        };

        var getCartPayments = function (paymentList) {
            var req = {
                method: 'POST',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/cart/payments',
                headers: {
                    'Content-Type': undefined
                },
                data: {'userID': ActiveUser.userData.user_id, 'householdID': ActiveUser.userData.household_id}
            };

            return $http(req).then(
                function success(response) {
                    paymentList = JSON.parse(angular.toJson(response.data.data.payments));
                });
        };

        var getCartCustomFields = function (fieldList) {
            var req = {
                method: 'POST',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/cart/customfields',
                headers: {
                    'Content-Type': undefined
                },
                data: {'userID': ActiveUser.userData.user_id, 'householdID': ActiveUser.userData.household_id}
            };

            return $http(req).then(
                function success(response) {
                    fieldList = JSON.parse(angular.toJson(response.data.data.fields));
                });
        };

        var getCartAddons = function (regData) {

            var defer = $q.defer();

            var req = {
                method: 'GET',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/item/' + regData.itemID + '/addons',
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            $http(req).then(
                function success(response) {

                    regData.addons = [];
                    regData.hasAddons = response.data.data.addons.length > 0;
                    var addons = JSON.parse(angular.toJson(response.data.data.addons));
                    regData.addons = addons;

                    console.log('addon response:');
                    console.log(response);

                    for(var a = 0; a < regData.addons.length; a++)
                    {
                        if(regData.addons[a].addons.package_dates) {
                            for (var u = 0; u < regData.addons[a].packages.uniqueItems.length; u++) {
                                regData.addons[a].addons.packages.uniqueItems[u].wkdPkgOpt = {};

                                regData.addons[a].addons.packages.uniqueItems[u].wkdPkgOpt[0] = [];
                                regData.addons[a].addons.packages.uniqueItems[u].wkdPkgOpt[1] = [];
                                regData.addons[a].addons.packages.uniqueItems[u].wkdPkgOpt[2] = [];
                                regData.addons[a].addons.packages.uniqueItems[u].wkdPkgOpt[3] = [];
                                regData.addons[a].addons.packages.uniqueItems[u].wkdPkgOpt[4] = [];
                                regData.addons[a].addons.packages.uniqueItems[u].wkdPkgOpt[5] = [];
                                regData.addons[a].addons.packages.uniqueItems[u].wkdPkgOpt[6] = [];

                                console.log('update weekday package selection');

                                regData.addons[a].addons.packages.uniqueItems[u].wkdPkgOpt[0].selected = '0';
                                regData.addons[a].addons.packages.uniqueItems[u].wkdPkgOpt[1].selected = '0';
                                regData.addons[a].addons.packages.uniqueItems[u].wkdPkgOpt[2].selected = '0';
                                regData.addons[a].addons.packages.uniqueItems[u].wkdPkgOpt[3].selected = '0';
                                regData.addons[a].addons.packages.uniqueItems[u].wkdPkgOpt[4].selected = '0';
                                regData.addons[a].addons.packages.uniqueItems[u].wkdPkgOpt[5].selected = '0';
                                regData.addons[a].addons.packages.uniqueItems[u].wkdPkgOpt[6].selected = '0';
                            }
                        }
                    }
                    defer.resolve(regData.addons);
                }
            );

            return defer.promise;
        };

        var getCartRequirements = function (regData) {
            //console.log('get requirements');

            if(ActiveUser.isLoggedIn())
            {
                return $q.all([
                    getCartCustomFields(regData.fields),
                    getCartPayments(regData.payments),
                    getCartWaivers(regData.waivers),
                ]).then(function(data) {
                    console.log('get requirements result');
                    console.log(data);
                });
            }
            else
            {
                console.log('user not logged in.');
            }
        };

        var addToCart = function () {

            reg.addingToCart = true;

            var cartData = {};
            cartData.itemType = 'program';
            cartData.registrations = [];

            for(var a = 0; a < reg.data.length; a++)
            {
                console.log('data for this registration:');
                console.log(reg.data[a]);

                var regID = uuid4.generate();

                var regData = {};
                regData = {
                    'uuid': regID,
                    'userID':reg.data[a].userID,
                    'itemID':reg.data[a].itemID,
                    'householdID':ActiveUser.userData.household_id,
                    'addedByUserID':ActiveUser.userData.user_id,
                    'itemType':reg.data[a].itemType,
                    'usePaymentPlan':'0'
                };

                if(reg.data[a].addons.length > 0)
                {
                    if(reg.data[a].addons[0].addons.packages.length > 0)
                    {
                        for(var pkg = 0; pkg < reg.data[a].addons.length; pkg++)
                        {
                            reg.data[a].addons[pkg].user_id = reg.data[a].userID;
                            reg.data[a].addons[pkg].household_id = ActiveUser.userData.household_id;
                        }

                        console.log('adding an addon to the array');
                        regData.addons = reg.data[a].addons;
                    }


                    /*
                    for(var p = 0; p < reg.data[a].addons.selectedpackages.length; p++)
                    {
                        var addonID = uuid4.generate();

                        var addon = {};
                        addon = {
                            'uuid': addonID,
                            'main-uuid':regID,
                            'userID':reg.data[a].userID,
                            'itemID':reg.data[a].addons.selectedpackages[p].item_id,
                            'householdID':ActiveUser.userData.household_id,
                            'addedByUserID':ActiveUser.userData.user_id,
                            'itemType':reg.data[a].addons.selectedpackages[p].item_type,
                            'usePaymentPlan':'0',
                            'fees':reg.data[a].addons.selectedpackages[p].fees
                        };

                        regData.addons.push(addon);
                    }
                    */
                }

                cartData.registrations.push(regData);

            }

            console.log('here is the cart data:');
            console.log(cartData);


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
                            console.log('add to cart response(1):');
                            console.log(response);
                        }
                    );
            }

        };

        reg.saveLocalRegistration = saveLocalRegistration;
        reg.addToCart = addToCart;
        reg.getCartRequirements = getCartRequirements;
        reg.addRegistration = addRegistration;
        reg.addRegistrationArray = addRegistrationArray;
        return reg;

    }]);