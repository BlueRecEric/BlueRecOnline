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

        reg.saveLocalRegistration = function()
        {
            var defer = $q.defer();

            console.log('save reg to local storage:');
            console.log(reg.data);

            defer.resolve(localStorageService.set('temp-reg', reg.data));

            return defer.promise;
        };

        reg.clearLocalRegistration = function() {
            var defer = $q.defer();
            defer.resolve(localStorageService.remove('temp-reg'));
            return defer.promise;
        };

        reg.getLocalRegistration = function() {
            var defer = $q.defer();
            reg.data = localStorageService.get('temp-reg');
            defer.resolve(true);
            return defer.promise;
        };

        reg.addRegistrationArrayToCart = function(regProgram)
        {
            var defer = $q.defer();

            reg.addRegistrationArray(regProgram).then(function() {
                if(regProgram.package_count == 0) {
                    reg.addToCart().then(function() {
                        defer.resolve(true);
                    });
                }
                else
                {
                    defer.resolve(true);
                }
            });

            return defer.promise;
        };

        reg.addRegistrationArray = function(regProgram)
        {
            reg.data = [];
            var defer = $q.defer();
            var promises = [];

            var userSelected = false;

            console.log('registering for:');
            console.log(regProgram);

            promises.push(reg.clearLocalRegistration());

            for(var a = 0; a < regProgram.users.length; a++) {

                if(regProgram.users[a].selected) {
                    console.log('found a selected participant: ' + regProgram.users[a].user_id);

                    promises.push(reg.addRegistration(
                        regProgram.users[a].user_id,
                        regProgram.item_id,
                        regProgram.item_type,
                        regProgram.item_name,
                        regProgram.users[a].full_name,
                        regProgram.requires_package_purchase,
                        regProgram.requires_item_purchase
                    ));

                    regProgram.users[a].eligible = false;
                    regProgram.users[a].selected = false;

                    console.log('regProgram:');
                    console.log(regProgram);
                    userSelected = true;
                }
                else
                {
                    console.log('user ' + regProgram.users[a].user_id + ' is not selected.');
                }
            }

            return $q.all(promises).then(function () {
                reg.saveLocalRegistration().then(defer.resolve(userSelected));
            });
        };

        reg.addRegistration = function(userID, itemID, itemType, itemName, userName, requiresPackage, requiresItem)
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
                    regData.requiresPackage = requiresPackage;
                    regData.requiresItem = requiresItem;

                    regData.waivers = [];
                    regData.payments = [];
                    regData.fields = [];
                    regData.addons = [];

                    console.log('now get the addons...');

                    regData.loadingAddons = true;

                    reg.getCartAddons(regData).then(function(response) {
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
        };

        reg.getCartWaivers = function (waiverList) {
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

        reg.getCartPayments = function (paymentList) {
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

        reg.getCartCustomFields = function (fieldList) {
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

        reg.getCartAddons = function (regData) {

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

        reg.getCartRequirements = function (regData) {
            //console.log('get requirements');

            if(ActiveUser.isLoggedIn())
            {
                return $q.all([
                    reg.getCartCustomFields(regData.fields),
                    reg.getCartPayments(regData.payments),
                    reg.getCartWaivers(regData.waivers),
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

        reg.addToCart = function () {

            reg.addingToCart = true;

            var cartData = {};
            cartData.itemType = 'program';
            cartData.registrations = [];

            console.log('reg data to add:');
            console.log(reg.data);

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

                if(angular.isDefined(reg.data[a].addons) && angular.isDefined(reg.data[a].addons.selectedpackages) && reg.data[a].addons.selectedpackages.length > 0)
                {
                    for(var pkg = 0; pkg < reg.data[a].addons.selectedpackages.length; pkg++)
                    {
                        reg.data[a].addons.selectedpackages[pkg].user_id = reg.data[a].userID;
                        reg.data[a].addons.selectedpackages[pkg].household_id = ActiveUser.userData.household_id;
                        reg.data[a].addons.selectedpackages[pkg].addedByUserID = ActiveUser.userData.user_id;
                    }

                    console.log('adding an addon to the array');
                    regData.addons = reg.data[a].addons;


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

        return reg;

    }]);