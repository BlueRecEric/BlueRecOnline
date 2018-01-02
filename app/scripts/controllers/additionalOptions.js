'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:CurrentMembershipCtrl
 * @description
 * # AboutCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
    .controller('AddOpts', ['$scope', '$rootScope', 'ActiveUser', 'RegistrationFactory', '$location', '$routeParams', 'MakeToast', '$timeout', function ($scope,$rootScope,ActiveUser,RegistrationFactory,$location,$routeParams, MakeToast, $timeout) {
        $scope.preLoad = [];

        $scope.addingToCart = false;

        $scope.regularPackages = {};
        $scope.regularPackages.weekday = '';



        $scope.updateEveryDateAddonFees = function(dropins, weeks, pkg) {
            //console.log(pkg);
        };

        $scope.updateStandardAddonFees = function(pkg) {

            console.log('Clicked package');
            console.log(pkg);

            if(pkg.required_purchase == '1')
            {
                pkg.selected = '1';
            }

            console.log('Requirement checked');
            console.log(pkg);

            $timeout($scope.preLoad.updateStandardAddOnFees, 500, true, $scope.preLoad.data, $routeParams.itemid, pkg.item_id);
        };

        $scope.updateWeekdayAddonFees = function(pkgItemID, optionIndex) {
            $timeout($scope.preLoad.updateWeekdayAddOnFees, 500, true, $scope.preLoad.data, $routeParams.itemid, pkgItemID, optionIndex);
            //$scope.preLoad.updateAddonFees($scope.preLoad.data, $routeParams.itemid);
        };

        $scope.updateDayGroupFees = function(dayGroups, clickedPkg) {
            //console.log('update day group selection for ' + dayGroups.length + ' items');

            for(var dg = 0; dg < dayGroups.length; dg++)
            {
                //console.log('clicked package item: ' + clickedPkg.item_id + ' and loop package item: ' + dayGroups[dg].item_id);

                if(dayGroups[dg].item_id == clickedPkg.item_id && dayGroups[dg].day_group_id != clickedPkg.day_group_id)
                {
                    dayGroups[dg].selected = '0';
                }
            }

        };

        $scope.clickDateAddon = function (dropins, weeks, pkg) {
            //console.log(pkg);

            for(var ui = 0; ui < dropins.uniqueItems.length; ui++)
            {
                if(dropins.uniqueItems[ui].item_id == pkg.item_id)
                {
                    dropins.uniqueItems[ui].selected_count = 0;
                    dropins.uniqueItems[ui].selected_days = [];

                    for(var w = 0; w < weeks.length; w++)
                    {
                        for(var wd = 0; wd < weeks[w].weekday.length; wd++)
                        {
                            for(var wdp = 0; wdp < weeks[w].weekday[wd].packages.length; wdp++)
                            {
                                if(weeks[w].weekday[wd].packages[wdp].item_id == pkg.item_id && weeks[w].weekday[wd].packages[wdp].selected == '1')
                                {
                                    //console.log('selected package ' + weeks[w].weekday[wd].packages[wdp].item_id + ' with date ' + weeks[w].weekday[wd].packages[wdp].item_day);
                                    dropins.uniqueItems[ui].selected_count++;
                                    dropins.uniqueItems[ui].selected_days.push(weeks[w].weekday[wd].packages[wdp].item_day);
                                    dropins.uniqueItems[ui].selected = '1';
                                }
                            }
                        }
                    }
                }
            }

            for(var uif = 0; uif < dropins.uniqueItems.length; uif++)
            {
                for(var f = 0; f < dropins.uniqueItems[uif].fees.data.length; f++)
                {

                    for(var ofee = 0; ofee < dropins.uniqueItems[uif].original_fees.data.length; ofee++)
                    {
                        if(dropins.uniqueItems[uif].fees.data[f].fee_id == dropins.uniqueItems[uif].original_fees.data[ofee].fee_id)
                        {
                            //console.log('updating fee');
                            dropins.uniqueItems[uif].fees.data[f].fee_amount = dropins.uniqueItems[uif].original_fees.data[ofee].fee_amount * dropins.uniqueItems[uif].selected_count;
                        }
                    }

                }
            }

            //console.log(dropins);

        };

        $scope.standardPackageFilter = function(element)
        {
            if(element.item_type === 'PKG' || element.item_type === 'PKG-DG')
            {
                return true;
            }
            else
            {
                return false;
            }
        };

        $scope.weekdayPackageFilter = function(element)
        {
            if(element.item_type === 'PKG-D')
            {
                return true;
            }
            else
            {
                return false;
            }
        };

        $scope.wkdPkgOpt = [];

        $scope.$on('registration:loaded', function() {
            $scope.preLoad = RegistrationFactory;

            //console.log('updated working data:');
            //console.log($scope.preLoad);
            $scope.itemID = $routeParams.itemid;
        });

        if(ActiveUser.isLoggedIn())
        {
            $scope.preLoad = RegistrationFactory;
            $scope.itemID = $routeParams.itemid;
            $scope.preLoad.getLocalRegistration().then(function () {
                //console.log('working data:');
                //console.log($scope.preLoad);

            }); 
        }



        $scope.submitAdditionalOptions = function()
        {
            $scope.addingToCart = true;
            $scope.showRequiredPackageError = false;

            $scope.optionErrors = [];

            //console.log('here is the data we will submit:');
            //console.log($scope.preLoad);

            function isSelected(pkg) {
                return (pkg.selected == '1');
            }

            function dropinSelected(uniqueItem)
            {
                return (uniqueItem.selected == '1');
            }

            function weekdayItemSelected(weekdayItem)
            {
                return (weekdayItem.selected == '1');
            }

            for(var r = 0; r < $scope.preLoad.data.length; r++)
            {
                //console.log('this data:');
                //console.log($scope.preLoad.data[r]);

                //$scope.preLoad.data[r].addons.selectedpackages = [];

                var hasPackage = false;
                var hasInventory = false;
                var hasPrograms = false;
                var selectedAddons = [];
                var selectedWeekdays = [];
                var selectedPackages = [];
                var selectedPrograms = [];
                var selectedDropins = [];
                var selectedGroups = [];
                var selectedInventory = [];
                var registration = $scope.preLoad.data[r];

                var requiredAmountSelected = true;

                if(angular.isDefined(registration.addons.programs) && registration.addons.programs.length > 0)
                {
                    selectedPrograms = registration.addons.programs.filter(isSelected);

                    //console.log('here are the selected inventory:');
                    //console.log(selectedInventory);

                    if(selectedPrograms.length > 0)
                    {
                        hasPrograms = true;
                        for(var spro = 0; spro < selectedPrograms.length; spro++)
                        {
                            selectedAddons.push(selectedPrograms[spro]);
                        }
                    }
                }

                if(angular.isDefined(registration.addons.inventory) && registration.addons.inventory.length > 0)
                {
                    selectedInventory = registration.addons.inventory.filter(isSelected);

                    //console.log('here are the selected inventory:');
                    //console.log(selectedInventory);

                    if(selectedInventory.length > 0)
                    {
                        hasInventory = true;
                        for(var sinv = 0; sinv < selectedInventory.length; sinv++)
                        {
                            selectedAddons.push(selectedInventory[sinv]);
                        }
                    }
                }

                if(angular.isDefined(registration.addons.packages) && registration.addons.packages.length > 0)
                {
                    selectedPackages = registration.addons.packages.filter(isSelected);

                    //console.log('here are the selected packages:');
                    //console.log(selectedPackages);

                    if(selectedPackages.length > 0)
                    {
                        hasPackage = true;
                        for(var spack = 0; spack < selectedPackages.length; spack++)
                        {
                            selectedAddons.push(selectedPackages[spack]);
                        }
                    }
                }

                if(angular.isDefined(registration.addons.dayGroups) && registration.addons.dayGroups.length > 0)
                {
                    selectedGroups = registration.addons.dayGroups.filter(isSelected);

                    //console.log('here are the selected groups:');
                    //console.log(selectedGroups);

                    if(selectedGroups.length > 0)
                    {
                        hasPackage = true;
                        for(var sgrp = 0; sgrp < selectedGroups.length; sgrp++)
                        {
                            selectedAddons.push(selectedGroups[sgrp]);
                        }
                    }
                }

                if(angular.isDefined(registration.addons.dropins) && angular.isDefined($scope.preLoad.data[r].addons.dropins))
                {
                    if(angular.isDefined(registration.addons.dropins.uniqueItems))
                    {
                        //console.log('there are dropins:');

                        if($scope.preLoad.data[r].addons.dropins.uniqueItems.length > 0)
                        {
                            selectedDropins = $scope.preLoad.data[r].addons.dropins.uniqueItems.filter(dropinSelected);

                            //console.log('here are the selected dropins:');
                            //console.log(selectedDropins);


                            if(selectedDropins.length > 0)
                            {
                                hasPackage = true;
                                for(var sdrop = 0; sdrop < selectedDropins.length; sdrop++)
                                {
                                    selectedAddons.push(selectedDropins[sdrop]);
                                }
                            }
                        }
                    }
                }

                if(angular.isDefined($scope.preLoad.data[r].addons.weekdayOptions))
                {
                    //console.log('there are weekdays:');

                    var currentPackageItemID = '';
                    var selectedCount = 0;
                    var currentMin = 0;
                    var currentMax = 0;
                    var currentItemName = '';

                    var weekdayError = {};

                    if($scope.preLoad.data[r].addons.weekdayOptions.length > 0 && $scope.preLoad.data[r].addons.weekdayItems.length > 0)
                    {
                        for(var wdi = 0; wdi < $scope.preLoad.data[r].addons.weekdayItems.length; wdi++) {
                            for (var p = 0; p < $scope.preLoad.data[r].addons.weekdayOptions.length; p++) {
                                if($scope.preLoad.data[r].addons.weekdayOptions[p].item_id == $scope.preLoad.data[r].addons.weekdayItems[wdi]) {
                                    if (currentPackageItemID != $scope.preLoad.data[r].addons.weekdayOptions[p].item_id) {
                                        if (!requiredAmountSelected && (currentMin >= 0 || currentMax >= 0)) {
                                            if (selectedCount >= $scope.preLoad.data[r].addons.weekdayOptions[p].min_days && (currentMax == 0 && selectedCount > 0 || selectedCount <= $scope.preLoad.data[r].addons.weekdayOptions[p].max_days)) {
                                                //console.log('count passed in main loop');
                                                requiredAmountSelected = true;
                                            }
                                            else {
                                                //console.log('count error in main loop');
                                                weekdayError.message = 'You must select between ' + currentMin + ' and ' + currentMax + ' weekday(s) for ' + currentItemName;
                                                weekdayError.itemID = currentPackageItemID;
                                                $scope.optionErrors.push(weekdayError);
                                            }
                                        }

                                        if ($scope.preLoad.data[r].addons.weekdayOptions[p].selected == '1') {
                                            selectedCount = 0;
                                            currentPackageItemID = $scope.preLoad.data[r].addons.weekdayOptions[p].item_id;
                                            currentMin = $scope.preLoad.data[r].addons.weekdayOptions[p].min_days;
                                            currentMax = $scope.preLoad.data[r].addons.weekdayOptions[p].max_days;
                                            currentItemName = $scope.preLoad.data[r].addons.weekdayOptions[p].item_name;
                                            if (currentMin >= 0 || currentMax >= 0) {
                                                requiredAmountSelected = false;
                                                selectedCount++;
                                            }
                                            //console.log('weekday count initiated:');
                                            //console.log('current min is ' + currentMin + ' and current max is ' + currentMax);
                                            //console.log('current count is ' + selectedCount);
                                            //console.log('requiredAmountSelected is: ' + requiredAmountSelected);
                                        }
                                    }
                                    else {
                                        if ($scope.preLoad.data[r].addons.weekdayOptions[p].selected == '1') {
                                            selectedCount++;
                                            //console.log('current count is ' + selectedCount);
                                        }
                                    }
                                }
                            }
                        }

                        if(!requiredAmountSelected) {
                            if (selectedCount < currentMin || (selectedCount < currentMin && currentMax == 0) || (currentMax > 0 && selectedCount > currentMax)) {

                                //console.log('count error outside main loop');
                                //console.log('Outside: current min is ' + currentMin + ' and current max is ' + currentMax);
                                //console.log('Outside: current count is ' + selectedCount);
                                //console.log('Outside: requiredAmountSelected is: ' + requiredAmountSelected);
                                if (currentMin == currentMax) {
                                    weekdayError.message = 'You must select ' + currentMin + ' weekday(s) for ' + currentItemName;
                                }
                                else if (currentMin == 0 && currentMax > 0) {
                                    weekdayError.message = 'You may only select up to ' + currentMax + ' weekday(s) for ' + currentItemName;
                                }
                                else if (currentMin > 0 && currentMax == 0) {
                                    weekdayError.message = 'You must select at least ' + currentMin + ' weekday(s) for ' + currentItemName;
                                }
                                else {
                                    weekdayError.message = 'You must select between ' + currentMin + ' and ' + currentMax + ' weekday(s) for ' + currentItemName;
                                }

                                weekdayError.itemID = currentPackageItemID;
                                $scope.optionErrors.push(weekdayError);
                            }
                            else {
                                //console.log('count passed outside main loop');
                            }
                        }
                    }

                    if($scope.preLoad.data[r].addons.weekdayOptions.length > 0)
                    {
                        selectedWeekdays = $scope.preLoad.data[r].addons.weekdayOptions.filter(weekdayItemSelected);

                        //console.log('here are the selected weekdays:');
                        //console.log(selectedWeekdays);


                        if(selectedWeekdays.length > 0)
                        {
                            hasPackage = true;
                            for(var swday = 0; swday < selectedWeekdays.length; swday++)
                            {
                                selectedAddons.push(selectedWeekdays[swday]);
                            }
                        }
                    }
                }

                //console.log('here are the all selections:');
                //console.log(selectedAddons);

                $scope.preLoad.data[r].addons.selectedpackages = selectedAddons;

                //console.log('updated registration array:');
                //console.log($scope.preLoad);

                if(!hasPackage && $scope.preLoad.data[r].requiresPackage == '1')
                {
                    var optError = {};
                    optError.message = 'You must select at least one package for ' + $scope.preLoad.data[r].userName;
                    optError.itemID = $scope.preLoad.data[r].itemID;

                    $scope.optionErrors.push(optError);
                }

                if(!hasInventory && $scope.preLoad.data[r].requiresItem == '1')
                {
                    var invError = {};
                    invError.message = 'You must select at least one item for ' + $scope.preLoad.data[r].userName;
                    invError.itemID = $scope.preLoad.data[r].itemID;

                    $scope.optionErrors.push(invError);
                }
            }

            //console.log('here is the data we will submit, with only selected packages:');
            //console.log($scope.preLoad);

            if($scope.optionErrors.length > 0)
            {
                $scope.showRequiredPackageError = true;
                $scope.addingToCart = false;
            }
            else {
                //console.log('no errors, add to cart');

                $scope.preLoad.addToCart().then(function (response) {
                    console.log('add to cart response(2):');
                    console.log(response);

                    MakeToast.popOn('success', 'Shopping Cart', 'Items have been added to your cart!');
                    $rootScope.$emit('updateCartCount', {});

                    $location.path('/' + $routeParams.orgurl + '/programs');
                    $scope.addingToCart = false;
                });
            }
        };
    }]);