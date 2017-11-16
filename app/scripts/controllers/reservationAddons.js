'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:reservationAddons
 * @description
 * # AboutCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
    .controller('ReservationAddons', ['$scope', '$rootScope', '$http', '$location', 'BLUEREC_ONLINE_CONFIG', '$routeParams', '$modal', '$q', '$timeout',
        '$filter', '$anchorScroll', 'moment', 'ActiveUser', 'ReservationFactory',
        function ($scope, $rootScope, $http, $location, BLUEREC_ONLINE_CONFIG, $routeParams, $modal, $q, $timeout, $filter, $anchorScroll, moment,
                  ActiveUser, ReservationFactory) {

            $scope.userLoggedIn = false;
            $scope.userLoggedIn = ActiveUser.isLoggedIn();

            if (!$scope.userLoggedIn)
            {
                $location.path('/' + $routeParams.orgurl + '/reservations');
            }

            $scope.submittingData = false;

            $scope.agreementCheckError = false;
            $scope.cartError = false;
            $scope.errorText = '';

            $scope.lighting = [];
            $scope.lighting.feeAmount = 0.00;
            $scope.lighting.show = true;
            $scope.lighting.selected = false;

            $scope.rentalFees = [];
            $scope.rentalFees.feeAmount = 0.00;
            $scope.rentalFees.depositAmount = 0.00;
            $scope.rentalFees.packageFeeAmount = 0.0;

            $scope.rentalItemID = 0;

            $scope.agreementData = [];
            $scope.agreementData.agreement_name = '';
            $scope.agreementData.agreement_text = '';

            $scope.agreementSigned = [];
            $scope.agreementSigned.checked = false;

            $scope.requirements = [];
            $scope.requirements.data = [];
            $scope.requirements.show = false;
            $scope.requirements.loaded = false;

            $scope.rentalData = ReservationFactory.getReservationData();

            $scope.selectedTimeData = ReservationFactory.getReservationTimes();

            //console.log('$scope.rentalData', $scope.rentalData);

            $scope.displayTimeData = [];

            $scope.lighting_package = [];
            $scope.lighting_package.fee_amount = 0;
            $scope.lighting_package.package = [];
            $scope.lighting_package.has_sunset_times = false;
            $scope.lighting_package.has_lighting_package = false;

            $scope.reservationDataSet = false;

            $scope.reportName = '';
            $scope.reportData = {};

            if ($scope.rentalData == undefined || $scope.selectedTimeData == undefined) {

                if ($scope.rentalData == undefined)
                {
                    $location.path('/' + $routeParams.orgurl + '/reservations');
                }
                else
                {
                    $location.path('/' +  $routeParams.orgurl + '/reservationtimes/' + $scope.rentalData.rental_code_item_id);
                }
            }
            else
            {
                $scope.rentalItemID = $scope.rentalData.rental_code_item_id;

                $scope.reservationDataSet = true;
            }

            //console.log('$scope.selectedTimeData:  ',$scope.selectedTimeData);

            $scope.rentalPackages = [];

            $scope.displayPackages = false;

            $scope.calRentalTimeFeeAmt = function()
            {
                var amt = 0.0;

                for (var t=0;t < $scope.selectedTimeData.length; t++) {
                    /*for (var f = 0; f < $scope.selectedTimeData[t].fac_fee_data.length; f++) {
                     amt +=  $scope.selectedTimeData[t].fac_fee_data[f].fee_amount;
                     }*/
                    amt += parseFloat($scope.selectedTimeData[t].fee_amount);
                }

                $scope.rentalFees.feeAmount = amt;
            };

            $scope.setLightingFees = function() {
                if ($scope.userLoggedIn) {
                    var req = {
                        method: 'POST',
                        url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/reservation/' + $scope.rentalItemID + '/' + ActiveUser.userData.user_id + '/' + ActiveUser.userData.household_id + '/getlightingfees',
                        headers: {
                            'Content-Type': undefined
                        },
                        data: {
                            'rental_times': $scope.selectedTimeData
                        }
                    };

                    $http(req)
                        .success(function (data) {
                            //console.log('rental lighting fees:  ', data);

                            $scope.lighting_package.has_lighting_package = data.has_lighting_package;

                            $scope.lighting_package.has_sunset_times = data.has_sunset_times;
                            $scope.lighting_package.package = data.lighting_package;

                            $scope.lighting_package.fee_amount = parseFloat(((data.has_sunset_times) ? data.lighting_package.fees[0].fee_amount : 0));

                            $scope.displayTimeData = angular.copy(data.rental_times);

                            //console.log('$scope.displayTimeData', $scope.displayTimeData);
                        });
                }
            };

            $scope.setLightingFees();

            $scope.setAgreementData = function() {
                if ($scope.userLoggedIn) {
                    var req = {
                        method: 'GET',
                        url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/reservation/' + $scope.rentalItemID + '/' + ActiveUser.userData.user_id + '/' + ActiveUser.userData.household_id + '/agreement',
                        headers: {
                            'Content-Type': undefined
                        }
                    };

                    $http(req)
                        .success(function (data) {
                            //console.log('agreement data', data);

                            $scope.agreementData = data;
                        });
                }
            };

            $scope.setAgreementData();

            $scope.calculateEventMinutes = function(){
                var totalMinutes = 0;

                for (var t=0;t < $scope.selectedTimeData.length; t++) {
                    var seconds = $scope.selectedTimeData[t].utce - $scope.selectedTimeData[t].utcs;
                    var minutes = 0;

                    if(seconds > 60)
                    {minutes = seconds / 60;}

                    //console.log('minutes:  ', minutes);

                    totalMinutes += minutes;
                }

                return totalMinutes;
            };

            $scope.setPackages = function()
            {
                if ($scope.userLoggedIn) {
                    var EventMinutes = $scope.calculateEventMinutes();
                    var totalTimeSlots = 0;

                    if ($scope.rentalData.auto_approve === '1' && !angular.isUndefined($scope.selectedTimeData)) {
                        totalTimeSlots = $scope.selectedTimeData.length;
                    }

                    //console.log('EventMinutes: ', EventMinutes);

                    var req = {
                        method: 'POST',
                        url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/item/' + $scope.rentalItemID + '/packages',
                        headers: {
                            'Content-Type': undefined
                        },
                        data: {
                            'uid': ActiveUser.userData.user_id,
                            'minutes': EventMinutes,
                            'time_slots': totalTimeSlots
                        }
                    };

                    $http(req)
                        .success(function (data) {
                            //console.log('package data: ', data);

                            if($scope.rentalData.online_auto_select_event === '1')
                            {
                                var newPackageData = [];

                                var newPackageFee = 0.0;

                                for (var i = 0; i < $scope.rentalData.package_data.length; i++)
                                {
                                    if($scope.rentalData.package_data[i].qty > 0) {
                                        for (var a = 0; a < data.packageForm.length; a++) {
                                            if ($scope.rentalData.package_data[i].item_id === data.packageForm[a].item_id) {
                                                data.packageForm[a].quantity = $scope.rentalData.package_data[i].qty;
                                                data.packageForm[a].selected = true;

                                                if(angular.isNumber(parseInt(data.packageForm[a].quantity)) && parseInt(data.packageForm[a].quantity) > 0) {
                                                    for (var f = 0; f < data.packageForm[a].fees.length;f++) {
                                                        if (angular.isNumber(parseFloat(data.packageForm[a].fees[f].fee_amount))) {
                                                            newPackageFee += parseFloat(data.packageForm[a].fees[f].fee_amount) * parseInt(data.packageForm[a].quantity);
                                                        }
                                                    }
                                                }

                                                newPackageData.push(data.packageForm[a]);

                                                break;
                                            }
                                        }
                                    }
                                }

                                data.packageForm = [];
                                data.packageForm = angular.copy(newPackageData);

                                $scope.rentalFees.packageFeeAmount = parseFloat(newPackageFee);
                            }

                            $scope.rentalPackages = data.packageForm;

                            if ($scope.rentalPackages.length > 0) {
                                $scope.displayPackages = true;
                            }
                        });
                }
            };

            $scope.formatMySQLDate = function (formatDate) {
                //Grab each of your components
                var yyyy = formatDate.getFullYear().toString();
                var MM = (formatDate.getMonth() + 1).toString();
                var dd = formatDate.getDate().toString();
                var hh = formatDate.getHours().toString();
                var mm = formatDate.getMinutes().toString();
                //var ss = formatDate.getSeconds().toString();

                //Returns your formatted result
                return yyyy + '-' + (MM[1] ? MM : '0' + MM[0]) + '-' + (dd[1] ? dd : '0' + dd[0]) + ' ' + (hh[1] ? hh : '0' + hh[0]) + ':' + (mm[1] ? mm : '0' + mm[0]) + ':00';
            };

            $scope.onPackageChangeEvent = function() {
                var newPackageFee = 0.0;

                //console.log($scope.rentalPackages);

                for (var i = 0; i < $scope.rentalPackages.length; i++) {
                    if($scope.rentalPackages[i].selected)
                    {
                        if(angular.isNumber(parseInt($scope.rentalPackages[i].quantity)) && parseInt($scope.rentalPackages[i].quantity) > 0) {
                            for (var a = 0; a < $scope.rentalPackages[i].fees.length; a++) {
                                if (angular.isNumber(parseFloat($scope.rentalPackages[i].fees[a].fee_amount))) {
                                    newPackageFee += parseFloat($scope.rentalPackages[i].fees[a].fee_amount) * parseInt($scope.rentalPackages[i].quantity);
                                }
                            }
                        }
                    }
                }

                //console.log('test', $scope.rentalFees.packageFeeAmount);

                $scope.rentalFees.packageFeeAmount = parseFloat(newPackageFee);
            };

            $scope.onSubmitAddRentalToCart = function() {
                $scope.addRentalRequest();
            };

            $scope.onSubmitRentalRequest = function() {
                $scope.addRentalRequest();
            };

            $scope.addRentalRequest = function() {
                $scope.agreementCheckError = false;
                $scope.cartError = false;

                var autoApproved = ($scope.rentalData.auto_approve === '1');
                autoApproved = true;

                //console.log('requirements', $scope.requirements.data);

                if ($scope.agreementSigned.checked) {
                    var $userID = ActiveUser.userData.user_id;

                    if ($scope.rentalData.rental_code_item_id !== '' && $userID)
                    {
                        $scope.submittingData = true;

                    	var selectedRequirements = [];

                        for (var r = 0; r < $scope.requirements.data.length; r++) {
                            if(!angular.isUndefined($scope.requirements.data[r].file_data)) {
                                selectedRequirements.push({
                                    requirement_id: $scope.requirements.data[r].requirement_id,
                                    file_name: $scope.requirements.data[r].file_data.info.name,
                                    file_type: $scope.requirements.data[r].file_data.info.type,
                                    file_size: $scope.requirements.data[r].file_data.info.size,
                                    file_data: $scope.requirements.data[r].file_data.data
                                });
                            }
                        }

                        var submitData = {};
                        submitData.request_id = 0;
                        submitData.householdID = ActiveUser.userData.household_id;
                        submitData.itemID = $scope.rentalData.rental_code_item_id;
                        submitData.userID = ActiveUser.userData.user_id;
                        submitData.addedByUserID = ActiveUser.userData.user_id;
                        submitData.usePaymentPlan = '0';
                        submitData.itemType = 'rental code';
                        submitData.familyMembership = '0';
                        submitData.requirements = selectedRequirements;

                        //console.log('submitData', submitData);

                        //submitData.totalCharge = $scope.selectedTimeData.fee_amount;
                        submitData.totalCharge = $scope.rentalFees.feeAmount;

                        submitData.members = [];

                        var t, f;

                        var feeData = [];

                        for (t=0;t < $scope.selectedTimeData.length; t++) {
                            for (f = 0; f < $scope.selectedTimeData[t].fac_fee_data.length; f++)
                            {
                                var feeFound = false;
                                for (var fd=0;fd < feeData.length; fd++)
                                {
                                    if(feeData[fd].itemFeeID === $scope.selectedTimeData[t].fac_fee_data[f].item_fee_id)
                                    {
                                        feeData[fd].feeAmount = feeData[fd].feeAmount + ($scope.selectedTimeData[t].fac_fee_data[f].per_hour_amount * ($scope.selectedTimeData[t].dur / 60));

                                        feeFound = true;

                                        break;
                                    }
                                }

                                if(!feeFound)
                                {
                                    feeData.push({itemFeeID:  $scope.selectedTimeData[t].fac_fee_data[f].item_fee_id,
                                        feeAmount: $scope.selectedTimeData[t].fac_fee_data[f].per_hour_amount * ($scope.selectedTimeData[t].dur / 60)
                                    });
                                }
                            }
                        }

                        submitData.fac_fee_data = feeData;
                        submitData.events = [];

                        var i;

                        for (i = 0; i < $scope.selectedTimeData.length; i++) {

                            var feeTokenData = [];

                            for (f = 0; f < $scope.selectedTimeData[i].fac_fee_data.length; f++) {
                                feeTokenData.push({token:  $scope.selectedTimeData[i].fac_fee_data[f].token});
                            }

                            submitData.events.push({'token': $scope.selectedTimeData[i].token,
                                'fee_token_data': feeTokenData});
                        }

                        submitData.events = $scope.selectedTimeData;

                        submitData.addons = [];

                        for (i = 0; i < $scope.rentalPackages.length; i++) {
                            if($scope.rentalPackages[i].selected)
                            {
                                submitData.addons.push($scope.rentalPackages[i]);
                            }
                        }

                        if($scope.lighting_package.has_sunset_times)
                        {
                            submitData.addons.push($scope.lighting_package.package);
                        }

                        //console.log('submitData', submitData);

                        var req;

                        if(autoApproved)
                        {
                            req = {
                                method: 'POST',
                                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/cart/add',
                                headers: {
                                    'Content-Type': undefined
                                },
                                data: submitData
                            };
                            $http(req).
                            then(function(response) {

                                //console.log('success', response);

                                if(angular.isDefined(response.data.error))
                                {
                                    $scope.cartError = true;
                                    $scope.errorText = response.data.error;
                                }
                                else
                                {
                                    if(response.status === 200 && response.data.result !== 'not_auto_approve')
                                    {
                                        //console.log('added');

                                        ReservationFactory.clearReservationData();
                                        ReservationFactory.clearReservationTimes();

                                        $rootScope.$emit('updateCartCount', {});

                                        $location.path('/' + $routeParams.orgurl + '/addedtocart');

                                        $scope.submittingData = false;
                                    }
                                    else
                                    {
                                        ReservationFactory.clearReservationData();
                                        ReservationFactory.clearReservationTimes();

                                        $location.path('/' + $routeParams.orgurl + '/reservations');
                                    }
                                }

                            }, function(response) {
                                //console.log('error', response);

                                $scope.submittingData = false;
                                //ReservationFactory.clearReservationData();
                                //ReservationFactory.clearReservationTimes();

                                //$location.path('/' + $routeParams.orgurl + '/reservations');
                            });
                        }
                        else
                        {
                            /*req = {
                                method: 'POST',
                                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/reservation/submitreservationrequest',
                                headers: {
                                    'Content-Type': undefined
                                },
                                data: submitData
                            };
                            $http(req)
                            .success(function (data) {
                                //ReservationFactory.clearReservationData();
                                //ReservationFactory.clearReservationTimes();

                                //$location.path('/' + $routeParams.orgurl + '/rentalrequestsubmitted');

                                //$scope.submittingData = false;
                            });*/
                        }
                    }
                }
                else
                {
                    $scope.agreementCheckError = true;
                }
            };

            $scope.onAgreementChecked = function()
            {
                if ($scope.agreementSigned.checked)
                {
                    //$scope.agreementCheckError = false;
                }
            };

            $scope.onLightingFeeSelected = function()
            {

            };

            $scope.setRequirements = function()
            {
                if ($scope.userLoggedIn) {

                    //console.log('EventMinutes: ', EventMinutes);

                    var req = {
                        method: 'POST',
                        url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/reservation/' + $scope.rentalItemID + '/reservationrequirements',
                        headers: {
                            'Content-Type': undefined
                        },
                        data: {
                        }
                    };

                    $http(req)
                        .success(function (data) {
                            console.log('requirement data: ', data);

                            if(!angular.isUndefined(data.requirements) && data.requirements.length > 0)
                            {
                                $scope.requirements.data = data.requirements;

                                $scope.requirements.show = true;
                            }

                            $scope.requirements.loaded = true;
                        });
                }
            };

            if($scope.reservationDataSet) {
                //console.log('RENTAL DATA:  ', $scope.rentalData);

                //console.log('SELECTED TIME DATA:  ', $scope.selectedTimeData);

                $scope.calRentalTimeFeeAmt();

                $scope.setPackages();

                $scope.setRequirements();
            }
        }])

    .directive('fileread', [function () {
        return {
            scope: {
                fileread: '='
            },
            link: function (scope, element, attributes) {
                element.bind('change', function (changeEvent) {
                    var reader = new FileReader();
                    reader.onload = function (loadEvent) {
                        scope.$apply(function () {
                        	var fileData = [];

                            fileData.data = loadEvent.target.result;
                            fileData.info = changeEvent.target.files[0];

                            scope.fileread = fileData;
                        });
                    };
                    reader.readAsDataURL(changeEvent.target.files[0]);
                });
            }
        };
    }])

    .directive('numbersOnly', function(){
        return {
            require: 'ngModel',
            link: function(scope, element, attrs, modelCtrl) {
                modelCtrl.$parsers.push(function (inputValue) {
                    if (inputValue == undefined) return '';

                    var transformedInput = inputValue.replace(/[^0-9]/g, '');

                    if (transformedInput!=inputValue) {
                        modelCtrl.$setViewValue(transformedInput);
                        modelCtrl.$render();
                    }

                    return transformedInput;
                });
            }
        };
    });