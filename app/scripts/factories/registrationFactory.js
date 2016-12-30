'use strict';

angular.module('bluereconlineApp')
    .factory('RegistrationFactory',['BLUEREC_ONLINE_CONFIG','$rootScope', '$http','$q','$routeParams', 'ActiveUser', 'localStorageService', '$timeout', 'uuid4', function(BLUEREC_ONLINE_CONFIG, $rootScope, $http, $q, $routeParams, ActiveUser, localStorageService,$timeout,uuid4) {

        var reg = this;
        reg = {};
        reg.data = [];
        reg.waitlist = [];

        reg.loadingAddons = false;
        reg.loadingPayments = false;
        reg.loadingWaivers = false;
        reg.loadingFields = false;

        reg.saveLocalRegistration = function()
        {
            var defer = $q.defer();

            //console.log('save reg to local storage:');
            //console.log(reg.data);

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

        reg.addRegistrationArrayToWaitList = function(waitProgram) {
            var defer = $q.defer();

            reg.addWaitListArray(waitProgram).then(function() {
                reg.addToWaitlist().then(function(response) {
                    defer.resolve(response);
                });
            });

            return defer.promise;
        };

        reg.sendWaitlistAddEmail = function() {
            var req = {
                method: 'POST',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/email/waitlistAdd',
                headers: {
                    'Content-Type': undefined
                },
                data: {'uid': ActiveUser.userData.user_id}
            };

            return $http(req);
        };

        reg.addWaitListArray = function(waitProgram) {
            reg.waitlist = [];
            var defer = $q.defer();
            var promises = [];

            var userSelected = false;

            for(var a = 0; a < waitProgram.users.length; a++) {

                if(waitProgram.users[a].selected) {
                    promises.push(reg.addWaitList(
                        waitProgram.users[a].user_id,
                        waitProgram.item_id,
                        waitProgram.item_type,
                        waitProgram.item_name,
                        waitProgram.users[a].full_name,
                        waitProgram.requires_package_purchase,
                        waitProgram.requires_item_purchase
                    ));

                    waitProgram.users[a].eligible = false;
                    waitProgram.users[a].selected = false;

                    userSelected = true;
                }
            }

            return $q.all(promises).then(function () {
                reg.saveLocalRegistration().then(defer.resolve(userSelected));
            });
        };

        reg.addWaitList = function(userID, itemID, itemType, itemName, userName, requiresPackage, requiresItem)
        {
            var defer = $q.defer();

            if(isFinite(userID) && userID !== null)
            {
                if(isFinite(itemID) && itemID !== null)
                {
                    var waitData = {};
                    waitData.userID = userID;
                    waitData.itemID = itemID;
                    waitData.itemType = itemType;
                    waitData.itemName = itemName;
                    waitData.userName = userName;
                    waitData.requiresPackage = requiresPackage;
                    waitData.requiresItem = requiresItem;

                    reg.waitlist.push(waitData);

                    defer.resolve(true);
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

            //console.log('registering for:');
            //console.log(regProgram);

            promises.push(reg.clearLocalRegistration());

            for(var a = 0; a < regProgram.users.length; a++) {

                if(regProgram.users[a].selected) {
                    //console.log('found a selected participant: ' + regProgram.users[a].user_id);

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

                    //console.log('regProgram:');
                    //console.log(regProgram);
                    userSelected = true;
                }
                else
                {
                    //console.log('user ' + regProgram.users[a].user_id + ' is not selected.');
                }
            }

            return $q.all(promises).then(function () {
                reg.saveLocalRegistration().then(defer.resolve(userSelected));
            });
        };

        reg.addRegistration = function(userID, itemID, itemType, itemName, userName, requiresPackage, requiresItem)
        {
            //console.log('add the registration data...');
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

                    //console.log('now get the addons...');

                    regData.loadingAddons = true;

                    reg.getCartAddons(regData).then(function(response) {
                        //console.log('here is the response: ');
                        //console.log(response);

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

        reg.updateStandardAddOnFees = function (regData, itemID, pkgItemID) {

            console.log('all regData:');
            console.log(regData);

            var currPkg = '';
            var numSelected = 0;
            var includeAdditionalFee = false;

            for(var regNum = 0; regNum < regData.length; regNum++) {
                console.log('update reg data for:');
                console.log(regData[regNum]);

                for(var sa = 0; sa < regData[regNum].addons.packages.length; sa++)
                {
                    currPkg = regData[regNum].addons.packages[sa];

                    if(currPkg.item_id == pkgItemID && currPkg.selected == '1')
                    {
                        numSelected++;
                    }
                    else
                    {
                        console.log(currPkg.item_id+' does not equal '+pkgItemID);
                    }

                    regData[regNum].addons.packages[sa].numSelected = numSelected;
                    console.log('this package is selected '+numSelected+' times so far.');
                }

                if(numSelected > 1)
                {
                    includeAdditionalFee = true;
                }

                reg.getUpdatedStandardAddOnFees(regData[regNum], itemID, pkgItemID, regNum, includeAdditionalFee);
            }
        };

        reg.getUpdatedStandardAddOnFees = function(regData, itemID, pkgItemID, regNum, includeAdditionalFee)
        {
            regData.regNum = regNum;
            regData.includeAdditionalPackageFee = includeAdditionalFee;

            console.log('sending reg data:');
            console.log(regData);

            var req = {
                method: 'POST',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/item/' + itemID + '/addons',
                headers: {
                    'Content-Type': undefined
                },
                data: {
                    'regData': regData,
                    'uid':regData.userID
                }
            };

            $http(req).then(
                function success(response) {
                    var addons = JSON.parse(angular.toJson(response.data.data.addons));
                    console.log(regData.addons);

                    console.log('returned regdata:');
                    console.log(response.data);
                    console.log('returned addons:');
                    console.log(addons);

                    for(var sa = 0; sa < regData.addons.packages.length; sa++)
                    {
                        if(regData.addons.packages[sa].item_id == pkgItemID)
                        {
                            regData.addons.packages[sa].fees.data = addons.packages[sa].fees.data;
                        }
                    }
                }
            );
        };

        reg.updateWeekdayAddOnFees = function (regData, itemID, pkgItemID, optionIndex) {

            console.log('all regData:');
            console.log(regData);

            var weekdayList = [
                {'weekday':'0', 'selected':0},
                {'weekday':'1', 'selected':0},
                {'weekday':'2', 'selected':0},
                {'weekday':'3', 'selected':0},
                {'weekday':'4', 'selected':0},
                {'weekday':'5', 'selected':0},
                {'weekday':'6', 'selected':0},
            ];

            for(var regNum = 0; regNum < regData.length; regNum++) {
                console.log('update reg data for:');
                console.log(regData[regNum]);

                for(var wkOpt = 0; wkOpt < regData[regNum].addons.weekdayOptions.length; wkOpt++)
                {
                    if(regData[regNum].addons.weekdayOptions[wkOpt].item_id == pkgItemID && regData[regNum].addons.weekdayOptions[wkOpt].selected == '1')
                    {
                        for(var wd = 0; wd < 7; wd++)
                        {
                            if(weekdayList[wd].weekday == regData[regNum].addons.weekdayOptions[wkOpt].weekday)
                            {
                                weekdayList[wd].selected++;
                                regData[regNum].addons.weekdayOptions[wkOpt].numSelected = weekdayList[wd].selected;
                            }
                        }
                    }
                }

                reg.getUpdatedWeekdayAddOnFees(regData[regNum], itemID, regNum);
            }

            console.log('weekday list:');
            console.log(weekdayList);
        };

        reg.getUpdatedWeekdayAddOnFees = function(regData, itemID, regNum)
        {
            regData.regNum = regNum;

            var req = {
                method: 'POST',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/item/' + itemID + '/addons',
                headers: {
                    'Content-Type': undefined
                },
                data: {
                    'regData': regData,
                    'uid':regData.userID
                }
            };

            $http(req).then(
                function success(response) {
                    var addons = JSON.parse(angular.toJson(response.data.data.addons));
                    console.log('returned regdata:');
                    console.log(response.data);
                    console.log('returned addons:');
                    console.log(addons);

                    for(var wd = 0; wd < regData.addons.weekdayOptions.length; wd++)
                    {
                        regData.addons.weekdayOptions[wd].fees.data = addons.weekdayOptions[wd].fees.data;
                        regData.addons.weekdayOptions[wd].numSelected = addons.weekdayOptions[wd].numSelected;
                    }
                }
            );
        };

        reg.getCartAddons = function (regData) {

            var defer = $q.defer();

            var uid = '';

            console.log('data sent to get addons:');
            console.log(regData);

            if(ActiveUser.isLoggedIn())
            {
                //uid = ActiveUser.userData.user_id;
            }

            var req = {
                method: 'POST',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/item/' + regData.itemID + '/addons',
                headers: {
                    'Content-Type': undefined
                },
                data: {
                    'uid':regData.userID
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

        reg.addToWaitlist = function() {
            reg.addingToCart = true;

            var waitlistData = {};
            waitlistData.itemType = 'program';
            waitlistData.waitlists = [];

            console.log('waitlist data to add:');
            console.log(reg.waitlist);

            for(var a = 0; a < reg.waitlist.length; a++)
            {
                console.log('data for this registration:');
                console.log(reg.data[a]);

                var regID = uuid4.generate();

                var waitData = {};
                waitData = {
                    'uuid': regID,
                    'userID':reg.waitlist[a].userID,
                    'itemID':reg.waitlist[a].itemID,
                    'householdID':ActiveUser.userData.household_id,
                    'addedByUserID':ActiveUser.userData.user_id,
                    'itemType':reg.waitlist[a].itemType,
                    'usePaymentPlan':'0'
                };

                waitlistData.waitlists.push(waitData);
            }

            console.log('here is the waitlist data:');
            console.log(waitlistData);

            if(waitlistData.waitlists.length > 0) {
                var req = {
                    method: 'POST',
                    url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/cart/waitlist',
                    headers: {
                        'Content-Type': undefined
                    },
                    data: waitlistData
                };

                return $http(req).then(function(response) {
                    return response;
                });
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