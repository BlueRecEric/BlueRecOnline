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

        $scope.itemId = {'id':0};

        $scope.regularPackages = {};
        $scope.regularPackages.weekday = '';
        $scope.readyToCheckout = true;
        $scope.assistanceRequested = false;
        $scope.assistanceConfirmed = true;
        $scope.wkdPkgOpt = [];

        $scope.requiredEmergencyCount = '';

        $scope.printDiv = function(divName) {
            console.log('print div name');
            console.log(divName);
            var printContents = document.getElementById(divName).innerHTML;
            var popupWin = window.open('', '_blank', 'width=800,height=600');
            popupWin.document.open();
            popupWin.document.write('<html><head><link href="//maxcdn.bootstrapcdn.com/bootswatch/3.3.5/cerulean/bootstrap.min.css" rel="stylesheet"><link rel="stylesheet" href="styles/main.css" /></head><body onload="window.print();return false"><div id="printContainer">' + printContents + '</div></body></html>');
            popupWin.document.close();
        };

        $scope.checkWaiverAgreed = function(widx, sidx)
        {
            console.log('waiver index: ' + widx);
            console.log('signoff index: ' + sidx);

            console.log('check waiver');
            console.log(preLoad.waivers[widx].signoff[sidx]);

            if(preLoad.waivers[widx].signoff[sidx].agreed)
            {
                preLoad.waivers[widx].signoff[sidx].notagreed = false;
            }
        };

        $scope.confirmADARequest = function()
        {
            console.log('confirm ada requests');
            $scope.assistanceConfirmed = true;
        };

        $scope.cancelADARequest = function()
        {
            console.log('cancel ada requests');
            for(var req = 0; req < preLoad.sradata.length; req++)
            {
                preLoad.sradata[req].assistance = '0';
            }

            $scope.checkADARequests();
        };

        $scope.checkADARequests = function()
        {
            $scope.assistanceRequested = false;
            $scope.assistanceConfirmed = true;
            console.log('check for ada requests');

            for(var req = 0; req < preLoad.sradata.length; req++)
            {
                if(preLoad.sradata[req].assistance == '1')
                {
                    console.log('one request found');
                    $scope.assistanceRequested = true;
                    $scope.assistanceConfirmed = false;
                }
            }
        };

        $scope.checkWaiverNotAgreed = function(widx, sidx)
        {
            console.log('waiver index: ' + widx);
            console.log('signoff index: ' + sidx);

            console.log('check waiver');
            console.log(preLoad.waivers[widx].signoff[sidx]);

            if(preLoad.waivers[widx].signoff[sidx].notagreed)
            {
                preLoad.waivers[widx].signoff[sidx].agreed = false;
            }
        };

        if(ActiveUser.isLoggedIn())
        {
            console.log('userdata-pre:');
            console.log(ActiveUser.userData);

            if(!angular.isNumber(ActiveUser.userData.requiredEmergencyCount))
            {
                console.log('required count is not a number');
                ActiveUser.userData.requiredEmergencyCount = 0;
            }

            console.log('userdata:');
            console.log(ActiveUser.userData);

            $scope.requiredEmergencyCount = ActiveUser.userData.requiredEmergencyCount;

            var preLoad = PreCheckRequest;
            preLoad.getCartRequirements().then(
                function()
                {
                    //console.log('preLoad waivers');
                    //console.log(preLoad.waivers);


                    console.log(preLoad);
                    $scope.preLoad = preLoad;
                }
            );

            var submitPreCheckRequest = function() {

                $scope.showWaiverError = false;
                $scope.readyToCheckout = false;
                $scope.waiverErrors = [];

                console.log('waivers:');
                console.log(preLoad.waivers);


                for(var f = 0; f < preLoad.fields.length; f++)
                {
                    for(var cf = 0; cf < preLoad.fields[f].fields.customForm.length; cf++)
                    {
                        var thisField = preLoad.fields[f].fields.customForm[cf];

                        if(thisField.response_value === null || !angular.isDefined(thisField.response_value))
                        {
                            thisField.response_value = '';
                        }

                        if(thisField.selected_response === null || !angular.isDefined(thisField.selected_response))
                        {
                            thisField.selected_response = {};
                            thisField.selected_response.label = '';
                        }

                        if(thisField.selected_response.label === null || !angular.isDefined(thisField.selected_response.label))
                        {
                            thisField.selected_response = {};
                            thisField.selected_response.label = '';
                        }

                        if(thisField.type == 'select')
                        {
                            thisField.response_value = thisField.selected_response.label;
                        }

                        console.log(thisField.label + ':');
                        console.log(thisField);

                        if(thisField.required && thisField.type == 'select' && thisField.response_value.length == 0)
                        {
                            var selectError = {};
                            selectError.message = 'Please select a value for "' + thisField.label + '"';
                            selectError.fieldID = thisField.model;

                            $scope.waiverErrors.push(selectError);
                        }

                        if(thisField.required && thisField.type == 'text' && thisField.response_value.length == 0)
                        {
                            var textError = {};
                            textError.message = 'Please enter a value for "' + thisField.label + '"';
                            textError.fieldID = thisField.model;

                            $scope.waiverErrors.push(textError);
                        }

                        if(thisField.required && thisField.type == 'number' && thisField.response_value.length == 0 && !isFinite(thisField.response_value))
                        {
                            var numError = {};
                            numError.message = 'Please enter a number for "' + thisField.label + '"';
                            numError.fieldID = thisField.model;

                            $scope.waiverErrors.push(numError);
                        }
                        else
                        {
                            if(thisField.type == 'number' && thisField.response_value.length > 0 && !isFinite(thisField.response_value))
                            {
                                var notNumError = {};
                                notNumError.message = 'The value of "' + thisField.label + '" must be a number';
                                notNumError.fieldID = thisField.model;

                                $scope.waiverErrors.push(notNumError);
                            }
                        }

                        if(thisField.required && thisField.type == 'checkbox' && (thisField.response_value.length == 0 || thisField.response_value == '0')) {
                            var fError = {};
                            fError.message = 'The field "' + thisField.label + '" is required';
                            fError.waiverID = thisField.model;

                            $scope.waiverErrors.push(fError);
                        }
                    }
                }

                var allWaiversSigned = true;

                for(var w = 0; w < preLoad.waivers.length; w++)
                {
                    for(var s = 0; s < preLoad.waivers[w].signoff.length; s++)
                    {
                        if(!preLoad.waivers[w].signoff[s].agreed && preLoad.waivers[w].is_optional == '0')
                        {
                            allWaiversSigned = false;

                            var wError = {};
                            wError.message = 'The ' + preLoad.waivers[w].waiver_name + ' must be agreed to by ' + preLoad.waivers[w].signoff[s].user_name;
                            wError.waiverID = preLoad.waivers[w].waiver_id;

                            $scope.waiverErrors.push(wError);
                        }
                    }
                }

                var contactErrors = false;

                for(var ec = 0; ec < preLoad.emergencycontacts.data.length; ec++)
                {
                    var ecError = {};
                    if(preLoad.emergencycontacts.data[ec].required) {
                        if (preLoad.emergencycontacts.data[ec].contactName.length <= 0) {
                            preLoad.emergencycontacts.data[ec].errors = [];
                            ecError = {};
                            ecError.message = 'Please enter a name for the emergency contact.';
                            contactErrors = true;

                            preLoad.emergencycontacts.data[ec].errors.push(ecError);
                        }

                        if (preLoad.emergencycontacts.data[ec].contactRelationship.length <= 0) {
                            preLoad.emergencycontacts.data[ec].errors = [];
                            ecError = {};
                            ecError.message = 'Please enter a relationship for the emergency contact.';
                            contactErrors = true;

                            preLoad.emergencycontacts.data[ec].errors.push(ecError);
                        }

                        if (preLoad.emergencycontacts.data[ec].contactPhone.length <= 0) {
                            preLoad.emergencycontacts.data[ec].errors = [];
                            ecError = {};
                            ecError.message = 'Please enter a phone # for the emergency contact.';
                            contactErrors = true;

                            preLoad.emergencycontacts.data[ec].errors.push(ecError);
                        }
                    }
                }

                if($scope.waiverErrors.length > 0 || contactErrors)
                {
                    if($scope.waiverErrors.length > 0) {
                        $scope.showWaiverError = true;
                    }
                    $scope.readyToCheckout = true;
                }
                else
                {
                    preLoad.submitPreCheckRequest($scope.preLoad).then(function() {
                        $scope.readyToCheckout = true;
                    });
                }


            };

            $scope.submitPreCheckRequest = submitPreCheckRequest;
        }
    }])
    .factory('PreCheckRequest', ['$http', 'BLUEREC_ONLINE_CONFIG', '$routeParams', 'ActiveUser', '$location', '$q', function($http,BLUEREC_ONLINE_CONFIG,$routeParams,ActiveUser,$location,$q) {
        var preloader = this;
        preloader.waivers = [];
        preloader.payments = [];
        preloader.fields = [];
        preloader.addons = [];
        preloader.emergencycontacts = [];

        var updateEveryDateAddonFees = function(proIdx, pkgIdx, pkgItmID, weekday)
        {
            //console.log('updateEveryDateAddonFees');
            //console.log('proIdx: ' + proIdx);
            //console.log('pkgItmID: ' + pkgItmID);
            //console.log('weekday: ' + weekday);

            var weekdayItem = preloader.addons[proIdx].addons.packages.weekdays[weekday].items[pkgIdx];

            for(var p = 0; p < preloader.addons[proIdx].addons.packages.weeks.length; p++)
            {
                var pkgWeekList = preloader.addons[proIdx].addons.packages.weeks[p].weekday[weekday];

                for(var pi = 0; pi < pkgWeekList.packages.length; pi++)
                {
                    var pkgItem = pkgWeekList.packages[pi];

                    if(pkgItem.item_id == pkgItmID)
                    {
                        console.log('updateEveryDateAddonFees');

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
                            console.log('updateDateAddonSelection');

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
                console.log('clickDateAddon');

                preloader.addons[proIdx].addons.packages.weeks[weekIdx].weekday[dayIdx].packages[pkgIdx].selected = '0';
            }

            //console.log('proIdx: ' + proIdx);
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

            //console.log(preloader.addons[proIdx].addons.packages);
        };

        var updateDateCheckedFees = function(proIdx, itemID)
        {
            console.log('updateDateCheckedFees');

            // first set all fees in the 'selected fees' array to $0
            for(var ui = 0; ui < preloader.addons[proIdx].addons.packages.uniqueItems.length; ui++)
            {
                var thisIPackage = preloader.addons[proIdx].addons.packages.uniqueItems[ui];

                if(thisIPackage.item_id === itemID)
                {
                    //console.log('found selected fee');

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
                            //console.log('found selected item');

                            for(var u = 0; u < preloader.addons[proIdx].addons.packages.uniqueItems.length; u++)
                            {
                                var thisPackage = preloader.addons[proIdx].addons.packages.uniqueItems[u];

                                if(thisPackage.item_id === itemID)
                                {
                                    //console.log('found selected fee');

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

            console.log('updateDateCheckedFees');

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
                if(Number(preloader.addons[proIdx].addons.packages[pkgIdx].remaining) <= 0)
                {
                    preloader.addons[proIdx].addons.packages[pkgIdx].selected = '0';
                }

                if(preloader.addons[proIdx].addons.packages[pkgIdx].item_type == 'PKG-D' && (preloader.addons[proIdx].addons.packages[pkgIdx].min_days > 0 || preloader.addons[proIdx].addons.packages[pkgIdx].max_days > 0))
                {
                    console.log('run weekday check');

                    var searchItemId = preloader.addons[proIdx].addons.packages[pkgIdx].item_id;
                    var dayCount = 0;
                    var minDays = preloader.addons[proIdx].addons.packages[pkgIdx].min_days;
                    var maxDays = preloader.addons[proIdx].addons.packages[pkgIdx].max_days;

                    var updatePurchaseFlag = false;

                    for(var $p = 0; $p < preloader.addons[proIdx].addons.packages.length; $p++)
                    {
                        if(preloader.addons[proIdx].addons.packages[$p].item_id == searchItemId)
                        {
                            if(preloader.addons[proIdx].addons.packages[$p].selected == '1')
                            {
                                if(dayCount >= maxDays)
                                {
                                    preloader.addons[proIdx].addons.packages[pkgIdx].selected = '0';
                                    updatePurchaseFlag = true;
                                    skipUpdate = true;
                                }
                                else
                                {
                                    dayCount++;
                                }

                                if(dayCount < minDays)
                                {
                                    updatePurchaseFlag = false;
                                }

                                if(dayCount >= minDays && dayCount <= maxDays)
                                {
                                    updatePurchaseFlag = true;
                                }
                            }
                        }
                    }

                    for(var $pc = 0; $pc < preloader.addons[proIdx].addons.packages.length; $pc++)
                    {
                        if(preloader.addons[proIdx].addons.packages[$pc].item_id == searchItemId)
                        {
                            preloader.addons[proIdx].addons.packages[$pc].day_count = dayCount;
                        }
                    }

                    for(var $pf = 0; $pf < preloader.addons[proIdx].addons.packages.length; $pf++)
                    {
                        if(preloader.addons[proIdx].addons.packages[$pf].item_id == searchItemId)
                        {
                            preloader.addons[proIdx].addons.packages[$pf].readyToPurchase = updatePurchaseFlag;
                        }
                    }
                }

                if(preloader.addons[proIdx].addons.packages[pkgIdx].selected == '1')
                {
                    console.log('package is checked');
                    console.log('skip update: ' + skipUpdate.toString());
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
                            //console.log(response.data);
                            //preloader.addons[proIdx].addons.packages = response.data.data.packages;

                            for (var p = 0; p < preloader.addons[proIdx].addons.packages.length; p++) {
                                for (var pf = 0; pf < response.data.data.packages.length; pf++) {
                                    if (preloader.addons[proIdx].addons.packages[p].uuid == response.data.data.packages[pf].uuid) {
                                        //console.log('update fees');
                                        preloader.addons[proIdx].addons.packages[p].fees = response.data.data.packages[pf].fees;
                                        preloader.addons[proIdx].addons.packages[p].original_fees = response.data.data.packages[pf].original_fees;
                                    }
                                }
                            }

                        }
                    );
                }
            }

            // make an array of checked addon item ids

            var checkedAddonItemIds = [];

            for(var $pro = 0; $pro < preloader.addons.length; $pro++)
            {
                for(var $addon = 0; $addon < preloader.addons[$pro].addons.packages.length; $addon++)
                {
                    if (checkedAddonItemIds.indexOf(preloader.addons[$pro].addons.packages[$addon].item_id) == -1) {
                        if (preloader.addons[$pro].addons.packages[$addon].item_type == 'PKG' && preloader.addons[$pro].addons.packages[$addon].selected == '1') {
                            checkedAddonItemIds.push(preloader.addons[$pro].addons.packages[$addon].item_id);
                        }
                        if (preloader.addons[$pro].addons.packages[$addon].item_type == 'PKG-DG' && preloader.addons[$pro].addons.packages[$addon].selected == '1') {
                            checkedAddonItemIds.push(preloader.addons[$pro].addons.packages[$addon].item_id);
                        }
                        if (preloader.addons[$pro].addons.packages[$addon].item_type == 'PKG-D' && preloader.addons[$pro].addons.packages[$addon].readyToPurchase) {
                            checkedAddonItemIds.push(preloader.addons[$pro].addons.packages[$addon].item_id);
                        }
                    }
                }
            }

            getCartPayments(checkedAddonItemIds);

            console.log('checked addon ids:');
            console.log(checkedAddonItemIds);
            console.log(preloader.addons);
        };

        var getCartWaivers = function () {
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
                    preloader.waivers = [];
                    preloader.hasWaivers = response.data.data.waivers.length > 0;
                    var waivers = JSON.parse(angular.toJson(response.data.data.waivers));
                    preloader.waivers = waivers;
                });
        };

        var getCartPayments = function (idArray) {
            var req = {
                method: 'POST',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/cart/payments',
                headers: {
                    'Content-Type': undefined
                },
                data: {'userID': ActiveUser.userData.user_id, 'householdID': ActiveUser.userData.household_id, 'extraItems':idArray}
            };

            return $http(req).then(
                function success(response) {
                    preloader.payments = [];
                    preloader.hasPayments = response.data.data.payments.length > 0;
                    var payments = JSON.parse(angular.toJson(response.data.data.payments));
                    preloader.payments = payments;
                });
        };

        var getCartEmergencyContacts = function () {
            var req = {
                method: 'POST',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/cart/emergencycontacts',
                headers: {
                    'Content-Type': undefined
                },
                data: {'userID': ActiveUser.userData.user_id, 'householdID': ActiveUser.userData.household_id}
            };

            return $http(req).then(
                function success(response) {
                    preloader.emergencycontacts = [];
                    var contacts = JSON.parse(angular.toJson(response.data.data.emergencyContacts));
                    preloader.emergencycontacts = contacts;
                });
        };

        var getCartMedicalSRAData = function () {
            var req = {
                method: 'POST',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/cart/medsra',
                headers: {
                    'Content-Type': undefined
                },
                data: {'userID': ActiveUser.userData.user_id, 'householdID': ActiveUser.userData.household_id}
            };

            return $http(req).then(
                function success(response) {
                    preloader.sradata = [];
                    var sraData = JSON.parse(angular.toJson(response.data.data.sradata));
                    preloader.sradata = sraData;
                });
        };

        var getCartCustomFields = function () {
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
                    preloader.fields = [];
                    preloader.hasFields = response.data.data.fields.length > 0;
                    var fields = JSON.parse(angular.toJson(response.data.data.fields));
                    preloader.fields = fields;
                });
        };

        var getCartAddons = function () {
            var req = {
                method: 'POST',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/cart/addons',
                headers: {
                    'Content-Type': undefined
                },
                data: {'userID': ActiveUser.userData.user_id, 'householdID': ActiveUser.userData.household_id}
            };

            return $http(req).then(
                function success(response) {
                    preloader.addons = [];
                    preloader.hasAddons = response.data.data.addons.length > 0;
                    var addons = JSON.parse(angular.toJson(response.data.data.addons));
                    preloader.addons = addons;

                    //console.log('addons');
                    //console.log(preloader.addons);

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

                                console.log('update weekday package selection');

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
                });
        };

        var getCartRequirements = function () {
            //console.log('get requirements');

            if(ActiveUser.isLoggedIn())
            {
                return $q.all([
                    getCartCustomFields(),
                    getCartPayments(),
                    getCartWaivers(),
                    getCartEmergencyContacts(),
                    getCartMedicalSRAData()
                ]).then(function(data) {

                });
            }
        };

        var submitPreCheckRequest = function (preForm) {
            //console.log('request');
            //console.log(preForm);

            var req = {
                method: 'POST',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/cart/requirements/validate',
                headers: {
                    'Content-Type': undefined
                },
                data: preForm
            };

            return $http(req).then(
                function success(response) {
                    //console.log(response.data);
                    if (ActiveUser.isLoggedIn()) {
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
        preloader.getCartWaivers = getCartWaivers;
        preloader.getCartAddons = getCartAddons;
        preloader.getCartPayments = getCartPayments;
        preloader.getCartCustomFields = getCartCustomFields;
        return preloader;
    }]);