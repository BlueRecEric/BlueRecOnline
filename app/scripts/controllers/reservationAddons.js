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
            $scope.submittingData = false;

            $scope.contactCheckAlert = false;

            $scope.feeAmount = 0.00;
            $scope.depositAmount = 0.00;

            $scope.rentalItemID = 0;

            $scope.agreementSigned = [];
            $scope.agreementSigned.checked = false;

            $scope.rentalData = ReservationFactory.getReservationData();
            $scope.selectedTimeData = ReservationFactory.getReservationTimes();

            $scope.reservationDataSet = false;

            $scope.reportName = 'web_agreement1_version2';
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

            $scope.packageFeeAmount = 0.0;

            //console.log('$scope.rentalItemID:  '+$scope.rentalItemID);

            $scope.rentalPackages = [];
            $scope.rentalCustomFields = [];

            $scope.displayPackages = false;
            $scope.displayCustomFields = false;

            $scope.calRentalTimeFeeAmt = function()
            {
                var amt = 0.0;

                for (var t=0;t < $scope.selectedTimeData.length; t++) {
                    /*for (var f = 0; f < $scope.selectedTimeData[t].fee_data.length; f++) {
                     amt +=  $scope.selectedTimeData[t].fee_data[f].fee_amount;
                     }*/
                    amt += $scope.selectedTimeData[t].fee_amount;
                }

                $scope.feeAmount = amt;
            };

            $scope.setAgreementData = function() {
                var req = {
                    method: 'GET',
                    url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/reservation/' + $scope.rentalItemID + '/agreement',
                    headers: {
                        'Content-Type': undefined
                    }
                };

                $http(req)
                    .success(function (data) {
                        //console.log('agreement data', data);

                        $scope.reportData = data;
                    });
            };

            $scope.setAgreementData();

            $scope.setPackages = function() {
                var req = {
                    method: 'POST',
                    url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/item/' + $scope.rentalItemID + '/packages',
                    headers: {
                        'Content-Type': undefined
                    },
                    data: {'uid': ActiveUser.userData.user_id}
                };

                $http(req)
                    .success(function (data) {
                        //console.log(data);

                        $scope.rentalPackages = data.packageForm;

                        if ($scope.rentalPackages.length > 0) {
                            $scope.displayPackages = true;
                        }
                    });
            };

            $scope.setCustomFields = function() {
                var req = {
                    method: 'POST',
                    url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/item/' + $scope.rentalItemID + '/customfields',
                    headers: {
                        'Content-Type': undefined
                    },
                    data: {'uid': ActiveUser.userData.user_id}
                };

                $http(req)
                    .success(function (data) {
                        //console.table(data);

                        $scope.rentalCustomFields = data.customForm;

                        if ($scope.rentalCustomFields.length > 0) {
                            $scope.displayCustomFields = true;
                        }
                    });
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
                $scope.packageFeeAmount = newPackageFee;
            };

            $scope.onSubmitAddRentalToCart = function() {
                $scope.addRentalRequest();
            };

            $scope.onSubmitRentalRequest = function() {
                $scope.addRentalRequest();
            };

            $scope.addRentalRequest = function() {
                var autoApproved = ($scope.rentalData.auto_approve === '1');

                if ($scope.agreementSigned.checked) {
                    var $userID = ActiveUser.userData.user_id;

                    if ($scope.rentalData.rental_code_item_id !== '' && $userID)
                    {
                        //$scope.submittingData = true;

                        var submitData = {};
                        submitData.request_id = 0;
                        submitData.householdID = ActiveUser.userData.household_id;
                        submitData.itemID = $scope.rentalData.rental_code_item_id;
                        submitData.userID = ActiveUser.userData.user_id;
                        submitData.addedByUserID = ActiveUser.userData.user_id;
                        submitData.usePaymentPlan = '0';
                        submitData.itemType = 'rental code';
                        submitData.familyMembership = '0';

                        //submitData.totalCharge = $scope.selectedTimeData.fee_amount;
                        submitData.totalCharge = $scope.feeAmount;

                        submitData.waivers = [];
                        submitData.members = [];

                        var t, f;

                        var feeData = [];

                        for (t=0;t < $scope.selectedTimeData.length; t++) {
                            for (f = 0; f < $scope.selectedTimeData[t].fee_data.length; f++) {

                                var feeFound = false;
                                for (var fd=0;fd < feeData.length; fd++)
                                {
                                    if(feeData[fd].itemFeeID === $scope.selectedTimeData[t].fee_data[f].item_fee_id)
                                    {
                                        feeData[fd].feeAmount = feeData[fd].feeAmount + ($scope.selectedTimeData[t].fee_data[f].per_hour_amount * ($scope.selectedTimeData[t].dur / 60));
                                        feeFound = true;
                                        break;
                                    }
                                }

                                if(!feeFound)
                                {
                                    feeData.push({itemFeeID:  $scope.selectedTimeData[t].fee_data[f].item_fee_id,
                                        feeAmount: $scope.selectedTimeData[t].fee_data[f].per_hour_amount * ($scope.selectedTimeData[t].dur / 60)
                                    });
                                }
                            }
                        }

                        submitData.fees = feeData;

                        submitData.events = [];

                        var i;

                        for (i = 0; i < $scope.selectedTimeData.length; i++) {

                            var feeTokenData = [];

                            for (f = 0; f < $scope.selectedTimeData[i].fee_data.length; f++) {
                                feeTokenData.push({token:  $scope.selectedTimeData[i].fee_data[f].token});
                            }

                            submitData.events.push({'token': $scope.selectedTimeData[i].token,
                                'fee_token_data': feeTokenData});
                        }

                        submitData.addons = [];

                        for (i = 0; i < $scope.rentalPackages.length; i++) {
                            if($scope.rentalPackages[i].selected)
                            {
                                submitData.addons.push($scope.rentalPackages[i]);
                            }
                        }

                        submitData.custom_fields = $scope.rentalCustomFields;

                        //console.log(submitData);

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

                                    if(response.status === 200 && response.data.result !== 'not_auto_approve')
                                    {
                                        //console.log('added');
                                        /*ReservationFactory.clearReservationData();
                                        ReservationFactory.clearReservationTimes();

                                        $rootScope.$emit('updateCartCount', {});*/

                                        //$location.path('/' + $routeParams.orgurl + '/addedtocart');

                                        //$scope.submittingData = false;
                                    }
                                    else
                                    {
                                        ReservationFactory.clearReservationData();
                                        ReservationFactory.clearReservationTimes();

                                        $location.path('/' + $routeParams.orgurl + '/reservations');
                                    }
                                }, function(response) {
                                    //console.log('error', response);
                                    /*ReservationFactory.clearReservationData();
                                    ReservationFactory.clearReservationTimes();

                                    $location.path('/' + $routeParams.orgurl + '/reservations');*/
                                });
                        }
                        else
                        {
                            req = {
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
                                });
                        }
                    }
                }
                else
                {
                    $scope.contactCheckAlert = true;
                }
            };

            $scope.onAgreementChecked = function()
            {
                if ($scope.agreementSigned.checked) {
                    $scope.contactCheckAlert = false;
                }
            };

            if($scope.reservationDataSet) {
                //console.log('RENTAL DATA:  ');
                //console.log($scope.rentalData);

                //console.log('SELECTED TIME DATA:  ');
                //console.log($scope.selectedTimeData);

                $scope.calRentalTimeFeeAmt();

                $scope.setPackages();
                $scope.setCustomFields();
            }
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