'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:CurrentMembershipCtrl
 * @description
 * # AboutCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
    .controller('Precheck', ['$scope', 'ActiveUser', 'PreCheckRequest', function ($scope,ActiveUser,PreCheckRequest) {
        $scope.preLoad = [];

        $scope.regularPackages = {};
        $scope.regularPackages.weekday = '';

        $scope.wkdPkgOpt = [];

        if(ActiveUser.isLoggedIn())
        {
            var preLoad = PreCheckRequest;
            preLoad.getCartRequirements().then(
                function()
                {
                    console.log('preLoad waivers');
                    console.log(preLoad.waivers);
                    $scope.preLoad = preLoad;
                }
            );

            var submitPreCheckRequest = function() {
                preLoad.submitPreCheckRequest($scope.preLoad);
            };

            $scope.submitPreCheckRequest = submitPreCheckRequest;
        }
    }])
    .factory('PreCheckRequest', ['$http', 'BLUEREC_ONLINE_CONFIG', '$routeParams', 'ActiveUser', '$location', function($http,BLUEREC_ONLINE_CONFIG,$routeParams,ActiveUser,$location) {
        var preloader = this;
        preloader.waivers = [];
        preloader.payments = [];
        preloader.fields = [];
        preloader.addons = [];

        var updateEveryDateAddonFees = function(proIdx, pkgIdx, pkgItmID, weekday)
        {
            console.log('updateEveryDateAddonFees');
            console.log('proIdx: ' + proIdx);
            console.log('pkgItmID: ' + pkgItmID);
            console.log('weekday: ' + weekday);

            var weekdayItem = preloader.addons[proIdx].addons.packages.weekdays[weekday].items[pkgIdx];

            for(var p = 0; p < preloader.addons[proIdx].addons.packages.weeks.length; p++)
            {
                var pkgWeekList = preloader.addons[proIdx].addons.packages.weeks[p].weekday[weekday];

                for(var pi = 0; pi < pkgWeekList.packages.length; pi++)
                {
                    var pkgItem = pkgWeekList.packages[pi];

                    if(pkgItem.item_id == pkgItmID)
                    {
                        if(weekdayItem.selected == '1')
                        {
                            updateDateAddonSelection(proIdx, pkgItem.uuid, pkgItem.item_id);
                        }
                    }
                }
            }

            updateDateCheckedFees(proIdx, pkgItmID);
            updateDateCheckedDays(proIdx, pkgItmID);
        };

        var updateDateAddonSelection = function(proIdx, pkgUUID, pkgItemID)
        {
            for(var p = 0; p < preloader.addons[proIdx].addons.packages.weeks.length; p++)
            {
                var pkgWeekList = preloader.addons[proIdx].addons.packages.weeks[p];

                for(var wd = 0; wd < pkgWeekList.weekday.length; wd++)
                {
                    var weekdayList = pkgWeekList.weekday[wd];

                    for(var di = 0; di < weekdayList.packages.length; di++)
                    {
                        var dayItems = weekdayList.packages[di];

                        if(dayItems.uuid === pkgUUID)
                        {
                            if(dayItems.remaining > 0)
                            {
                                dayItems.selected = '1';
                            }
                            else
                            {
                                dayItems.selected = '0';
                            }
                        }
                    }
                }
            }
        };

        var clickDateAddon = function(proIdx, weekIdx, dayIdx, pkgIdx, pkgUUID, pkgItemID, pkgRemaining)
        {
            if(pkgRemaining <= 0)
            {
                preloader.addons[proIdx].addons.packages.weeks[weekIdx].weekday[dayIdx].packages[pkgIdx].selected = '0';
            }

            console.log('proIdx: ' + proIdx);
            updateDateCheckedFees(proIdx, pkgItemID);
            updateDateCheckedDays(proIdx, pkgItemID);
        };

        var updateDateCheckedDays = function(proIdx, itemID)
        {
            // clear selected days for the itemID

            for(var ui = 0; ui < preloader.addons[proIdx].addons.packages.uniqueItems.length; ui++)
            {
                var thisIPackage = preloader.addons[proIdx].addons.packages.uniqueItems[ui];
                if(thisIPackage.item_id === itemID)
                {
                    thisIPackage.selected_days = [];
                    thisIPackage.selected_count = 0;
                }
            }

            for(var p = 0; p < preloader.addons[proIdx].addons.packages.weeks.length; p++)
            {
                var pkgWeekList = preloader.addons[proIdx].addons.packages.weeks[p];

                for(var wd = 0; wd < pkgWeekList.weekday.length; wd++)
                {
                    var weekdayList = pkgWeekList.weekday[wd];

                    for(var di = 0; di < weekdayList.packages.length; di++)
                    {
                        var dayItems = weekdayList.packages[di];

                        if(dayItems.item_id === itemID && dayItems.selected == '1')
                        {
                            for(var u = 0; u < preloader.addons[proIdx].addons.packages.uniqueItems.length; u++)
                            {
                                var thisPackage = preloader.addons[proIdx].addons.packages.uniqueItems[u];
                                if(thisPackage.item_id === itemID)
                                {
                                    thisPackage.selected_days.push(dayItems.item_day);
                                    thisPackage.selected_count++;
                                }
                            }
                        }
                    }
                }
            }

            console.log(preloader.addons[proIdx].addons.packages);
        };

        var updateDateCheckedFees = function(proIdx, itemID)
        {
            // first set all fees in the 'selected fees' array to $0
            for(var ui = 0; ui < preloader.addons[proIdx].addons.packages.uniqueItems.length; ui++)
            {
                var thisIPackage = preloader.addons[proIdx].addons.packages.uniqueItems[ui];

                if(thisIPackage.item_id === itemID)
                {
                    console.log('found selected fee');

                    for(var fi = 0; fi < thisIPackage.fees.data.length; fi++)
                    {
                        var thisIFee = thisIPackage.fees.data[fi];

                        thisIFee.fee_amount = 0;
                    }
                }
            }

            for(var p = 0; p < preloader.addons[proIdx].addons.packages.weeks.length; p++)
            {
                var pkgWeekList = preloader.addons[proIdx].addons.packages.weeks[p];

                for(var wd = 0; wd < pkgWeekList.weekday.length; wd++)
                {
                    var weekdayList = pkgWeekList.weekday[wd];

                    for(var di = 0; di < weekdayList.packages.length; di++)
                    {
                        var dayItems = weekdayList.packages[di];

                        if(dayItems.item_id === itemID && dayItems.selected == '1')
                        {
                            console.log('found selected item');

                            for(var u = 0; u < preloader.addons[proIdx].addons.packages.uniqueItems.length; u++)
                            {
                                var thisPackage = preloader.addons[proIdx].addons.packages.uniqueItems[u];

                                if(thisPackage.item_id === itemID)
                                {
                                    console.log('found selected fee');

                                    for(var f = 0; f < thisPackage.fees.data.length; f++)
                                    {
                                        var thisFee = thisPackage.fees.data[f];
                                        var baseFee = thisPackage.original_fees.data[f];

                                        thisFee.fee_amount = Number(thisFee.fee_amount) + Number(baseFee.fee_amount);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };

        var updateAddonFees = function(pkgUUID) {

            var proIdx = 0;
            var pkgIdx = 0;

            var skipUpdate = false;

            for(var $u = 0; $u < preloader.addons.length; $u++)
            {
                for(var $a = 0; $a < preloader.addons[$u].addons.packages.length; $a++)
                {
                    if(preloader.addons[$u].addons.packages[$a].uuid == pkgUUID)
                    {
                        proIdx = $u;
                        pkgIdx = $a;
                    }
                }
            }

            if(angular.isDefined(proIdx) && angular.isDefined(pkgIdx))
            {
                console.log('look for package at index ' + [proIdx] + ' :: ' + [pkgIdx]);

                if(Number(preloader.addons[proIdx].addons.packages[pkgIdx].remaining) <= 0)
                {
                    preloader.addons[proIdx].addons.packages[pkgIdx].selected = '0';
                }


                console.log('update addon fees ' + [proIdx] + ' :: ' + [pkgIdx]);
                console.log(preloader.addons[proIdx].addons.packages);
                console.log('package selected!');
                console.log(preloader.addons[proIdx].addons.packages[pkgIdx]);
                console.log(preloader.addons[proIdx].addons.packages[pkgIdx].selected);

                if(preloader.addons[proIdx].addons.packages[pkgIdx].item_type == 'PKG-D' && (preloader.addons[proIdx].addons.packages[pkgIdx].min_days > 0 || preloader.addons[proIdx].addons.packages[pkgIdx].max_days > 0))
                {
                    var searchItemId = preloader.addons[proIdx].addons.packages[pkgIdx].item_id;
                    var dayCount = 0;
                    var minDays = preloader.addons[proIdx].addons.packages[pkgIdx].min_days;
                    var maxDays = preloader.addons[proIdx].addons.packages[pkgIdx].max_days;

                    console.log('Check day count');

                    for(var $p = 0; $p < preloader.addons[proIdx].addons.packages.length; $p++)
                    {
                        console.log('Check package ' + $p);

                        if(preloader.addons[proIdx].addons.packages[$p].item_id == searchItemId)
                        {
                            console.log('Package ' + $p + ' is the same item type.');

                            if(preloader.addons[proIdx].addons.packages[$p].selected == '1')
                            {


                                if(dayCount >= maxDays)
                                {
                                    preloader.addons[proIdx].addons.packages[pkgIdx].selected = '0';
                                    skipUpdate = true;
                                }
                                else
                                {
                                    dayCount++;
                                }

                                if(dayCount < minDays)
                                {

                                }

                                if(dayCount == maxDays)
                                {

                                }
                            }
                        }
                    }
                }

                if(preloader.addons[proIdx].addons.packages[pkgIdx].selected == '1')
                {
                    console.log('package is checked');
                }

                if(!skipUpdate) {
                    var req = {
                        method: 'POST',
                        url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/cart/requirements/updatepackageprices',
                        headers: {
                            'Content-Type': undefined
                        },
                        data: preloader.addons[proIdx].addons
                    };

                    $http(req).then(
                        function success(response) {
                            console.log(response.data);
                            //preloader.addons[proIdx].addons.packages = response.data.data.packages;

                            for (var p = 0; p < preloader.addons[proIdx].addons.packages.length; p++) {
                                for (var pf = 0; pf < response.data.data.packages.length; pf++) {
                                    if (preloader.addons[proIdx].addons.packages[p].uuid == response.data.data.packages[pf].uuid) {
                                        console.log('update fees');
                                        preloader.addons[proIdx].addons.packages[p].fees = response.data.data.packages[pf].fees;
                                        preloader.addons[proIdx].addons.packages[p].original_fees = response.data.data.packages[pf].original_fees;
                                    }
                                }
                            }

                        }
                    );
                }
            }


        };

        var getCartRequirements = function () {
            console.log('get requirements');

            if(ActiveUser.isLoggedIn())
            {
                var req = {
                    method: 'POST',
                    url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/cart/requirements',
                    headers: {
                        'Content-Type': undefined
                    },
                    data: {'userID': ActiveUser.userData.user_id, 'householdID': ActiveUser.userData.household_id}
                };

                return $http(req).then(
                    function success(response) {
                        preloader.waivers = [];
                        preloader.hasWaivers = response.data.data.waivers.length > 0;
                        var waivers = JSON.parse(angular.toJson(response.data.data.waivers));
                        preloader.waivers = waivers;

                        preloader.payments = [];
                        preloader.hasPayments = response.data.data.payments.length > 0;
                        var payments = JSON.parse(angular.toJson(response.data.data.payments));
                        preloader.payments = payments;

                        preloader.addons = [];
                        preloader.hasAddons = response.data.data.addons.length > 0;
                        var addons = JSON.parse(angular.toJson(response.data.data.addons));
                        preloader.addons = addons;
                        for(var a = 0; a < preloader.addons.length; a++)
                        {
                            if(preloader.addons[a].addons.package_dates) {
                                for (var u = 0; u < preloader.addons[a].addons.packages.uniqueItems.length; u++) {
                                    preloader.addons[a].addons.packages.uniqueItems[u].wkdPkgOpt = {};

                                    preloader.addons[a].addons.packages.uniqueItems[u].wkdPkgOpt[0] = [];
                                    preloader.addons[a].addons.packages.uniqueItems[u].wkdPkgOpt[1] = [];
                                    preloader.addons[a].addons.packages.uniqueItems[u].wkdPkgOpt[2] = [];
                                    preloader.addons[a].addons.packages.uniqueItems[u].wkdPkgOpt[3] = [];
                                    preloader.addons[a].addons.packages.uniqueItems[u].wkdPkgOpt[4] = [];
                                    preloader.addons[a].addons.packages.uniqueItems[u].wkdPkgOpt[5] = [];
                                    preloader.addons[a].addons.packages.uniqueItems[u].wkdPkgOpt[6] = [];

                                    preloader.addons[a].addons.packages.uniqueItems[u].wkdPkgOpt[0].selected = '0';
                                    preloader.addons[a].addons.packages.uniqueItems[u].wkdPkgOpt[1].selected = '0';
                                    preloader.addons[a].addons.packages.uniqueItems[u].wkdPkgOpt[2].selected = '0';
                                    preloader.addons[a].addons.packages.uniqueItems[u].wkdPkgOpt[3].selected = '0';
                                    preloader.addons[a].addons.packages.uniqueItems[u].wkdPkgOpt[4].selected = '0';
                                    preloader.addons[a].addons.packages.uniqueItems[u].wkdPkgOpt[5].selected = '0';
                                    preloader.addons[a].addons.packages.uniqueItems[u].wkdPkgOpt[6].selected = '0';
                                }
                            }
                        }

                        preloader.fields = [];
                        preloader.hasFields = response.data.data.fields.length > 0;
                        var fields = JSON.parse(angular.toJson(response.data.data.fields));
                        preloader.fields = fields;

                        if(preloader.hasFields || preloader.hasAddons || preloader.hasPayments || preloader.hasWaivers)
                        {
                            console.log(preloader.addons);
                        }
                        else
                        {
                            if(ActiveUser.isLoggedIn())
                            {
                                $location.path('/' + $routeParams.orgurl + '/checkout');
                            }
                        }
                    }
                );
            }
        };

        var submitPreCheckRequest = function (preForm) {
            console.log('request');
            console.log(preForm);

            var req = {
                method: 'POST',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/cart/requirements/validate',
                headers: {
                    'Content-Type': undefined
                },
                data: preForm
            };

            $http(req).then(
                function success(response) {
                    console.log(response.data);
                    if(ActiveUser.isLoggedIn())
                    {
                        $location.path('/' + $routeParams.orgurl + '/checkout');
                    }
                }
            );
        };

        preloader.updateDateCheckedDays = updateDateCheckedDays;
        preloader.clickDateAddon = clickDateAddon;
        preloader.updateDateCheckedFees = updateDateCheckedFees;
        preloader.updateDateAddonSelection = updateDateAddonSelection;
        preloader.updateEveryDateAddonFees = updateEveryDateAddonFees;
        preloader.getCartRequirements = getCartRequirements;
        preloader.submitPreCheckRequest = submitPreCheckRequest;
        preloader.updateAddonFees = updateAddonFees;
        return preloader;
    }]);