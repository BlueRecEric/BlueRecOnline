'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:CurrentMembershipCtrl
 * @description
 * # AboutCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
    .controller('AddOpts', ['$scope', '$rootScope', 'ActiveUser', 'RegistrationFactory', '$location', '$routeParams', 'MakeToast', function ($scope,$rootScope,ActiveUser,RegistrationFactory,$location,$routeParams, MakeToast) {
        $scope.preLoad = [];

        $scope.addingToCart = false;

        $scope.regularPackages = {};
        $scope.regularPackages.weekday = '';

        $scope.updateEveryDateAddonFees = function(dropins, weeks, pkg) {
            console.log(pkg);
        };

        $scope.updateDayGroupFees = function(dayGroups, clickedPkg) {
            console.log('update day group selection for ' + dayGroups.length + ' items');

            for(var dg = 0; dg < dayGroups.length; dg++)
            {
                console.log('clicked package item: ' + clickedPkg.item_id + ' and loop package item: ' + dayGroups[dg].item_id);

                if(dayGroups[dg].item_id == clickedPkg.item_id && dayGroups[dg].day_group_id != clickedPkg.day_group_id)
                {
                    dayGroups[dg].selected = '0';
                }
            }

        };

        $scope.clickDateAddon = function (dropins, weeks, pkg) {
            console.log(pkg);

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
                                    console.log('selected package ' + weeks[w].weekday[wd].packages[wdp].item_id + ' with date ' + weeks[w].weekday[wd].packages[wdp].item_day);
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
                            console.log('updating fee');
                            dropins.uniqueItems[uif].fees.data[f].fee_amount = dropins.uniqueItems[uif].original_fees.data[ofee].fee_amount * dropins.uniqueItems[uif].selected_count;
                        }
                    }

                }
            }

            console.log(dropins);

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

            console.log('updated working data:');
            console.log($scope.preLoad);
        });

        if(ActiveUser.isLoggedIn())
        {
            $scope.preLoad = RegistrationFactory;

            $scope.preLoad.getLocalRegistration().then(function () {
                console.log('working data:');
                console.log($scope.preLoad);
            }); 
        }



        $scope.submitAdditionalOptions = function()
        {
            $scope.addingToCart = true;

            console.log('here is the data we will submit:');
            console.log($scope.preLoad);

            function isSelected(pkg) {
                return (pkg.selected == '1');
            }

            function dropinSelected(uniqueItem)
            {
                return (uniqueItem.selected == '1');
            }

            for(var r = 0; r < $scope.preLoad.data.length; r++)
            {
                console.log('this data:');
                console.log($scope.preLoad.data[r]);

                //$scope.preLoad.data[r].addons.selectedpackages = [];

                var selectedAddons = [];
                var selectedPackages = [];
                var selectedDropins = [];
                var selectedGroups = [];
                var selectedInventory = [];
                var registration = $scope.preLoad.data[r];

                if(angular.isDefined(registration.addons.inventory) && registration.addons.inventory.length > 0)
                {
                    selectedInventory = registration.addons.inventory.filter(isSelected);

                    console.log('here are the selected inventory:');
                    console.log(selectedInventory);

                    if(selectedInventory.length > 0)
                    {
                        for(var sinv = 0; sinv < selectedInventory.length; sinv++)
                        {
                            selectedAddons.push(selectedInventory[sinv]);
                        }
                    }
                }

                if(angular.isDefined(registration.addons.packages) && registration.addons.packages.length > 0)
                {
                    selectedPackages = registration.addons.packages.filter(isSelected);

                    console.log('here are the selected packages:');
                    console.log(selectedPackages);

                    if(selectedPackages.length > 0)
                    {
                        for(var spack = 0; spack < selectedPackages.length; spack++)
                        {
                            selectedAddons.push(selectedPackages[spack]);
                        }
                    }
                }

                if(angular.isDefined(registration.addons.dayGroups) && registration.addons.dayGroups.length > 0)
                {
                    selectedGroups = registration.addons.dayGroups.filter(isSelected);

                    console.log('here are the selected groups:');
                    console.log(selectedGroups);

                    if(selectedGroups.length > 0)
                    {
                        for(var sgrp = 0; sgrp < selectedGroups.length; sgrp++)
                        {
                            selectedAddons.push(selectedGroups[sgrp]);
                        }
                    }
                }

                if(angular.isDefined(registration.addons.dropins) && angular.isDefined($scope.preLoad.data[r].addons.dropins))
                {
                    console.log('there are dropins:');

                    if($scope.preLoad.data[r].addons.dropins.uniqueItems.length > 0)
                    {
                        selectedDropins = $scope.preLoad.data[r].addons.dropins.uniqueItems.filter(dropinSelected);

                        console.log('here are the selected dropins:');
                        console.log(selectedDropins);


                        if(selectedDropins.length > 0)
                        {
                            for(var sdrop = 0; sdrop < selectedDropins.length; sdrop++)
                            {
                                selectedAddons.push(selectedDropins[sdrop]);
                            }
                        }
                    }
                }

                console.log('here are the all selections:');
                console.log(selectedAddons);

                $scope.preLoad.data[r].addons.selectedpackages = selectedAddons;

                console.log('updated registration array:');
                console.log($scope.preLoad);

            }

            console.log('here is the data we will submit, with only selected packages:');
            console.log($scope.preLoad);

            $scope.preLoad.addToCart().then(function(response) {
                console.log('add to cart response(2):');
                console.log(response);

                MakeToast.popOn('success','Shopping Cart','Items have been added to your cart!');
                $rootScope.$emit('updateCartCount', {});

                $location.path('/' + $routeParams.orgurl + '/programs');
                $scope.addingToCart = false;
            });
        };
    }]);