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

        $scope.regularPackages = {};
        $scope.regularPackages.weekday = '';

        $scope.updateEveryDateAddonFees = function(dropins, weeks, pkg) {
            console.log(pkg);
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

                var selectedAddons = {};
                var selectedPackages = [];
                var selectedDropins = [];
                var registration = $scope.preLoad.data[r];

                if(registration.addons.packages.length > 0)
                {
                    selectedPackages = registration.addons.packages.filter(isSelected);

                    console.log('here are the selected packages:');
                    console.log(selectedPackages);

                    selectedAddons.push(selectedPackages);
                }

                if(angular.isDefined(registration.addons.dropins))
                {
                    if(registration.addons.dropins.uniqueItems.length > 0)
                    {
                        selectedDropins = registration.addons.dropins.uniqueItems.filter(dropinSelected);

                        console.log('here are the selected dropins:');
                        console.log(selectedDropins);

                        selectedAddons.push(selectedDropins);
                    }
                }

                console.log('here are the all selections:');
                console.log(selectedPackages);

                $scope.preLoad.data[r].addons.selectedpackages = selectedAddons;

            }

            console.log('here is the data we will submit, with only selected packages:');
            console.log($scope.preLoad);

            RegistrationFactory.addToCart().then(function(response) {
                console.log('add to cart response(2):');
                console.log(response);

                MakeToast.popOn('success','Shopping Cart','Items have been added to your cart!');
                $rootScope.$emit('updateCartCount', {});

                $location.path('/' + $routeParams.orgurl + '/programs');
            });
        };
    }]);