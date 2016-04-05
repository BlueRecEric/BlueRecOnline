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
        '$filter', '$anchorScroll', 'moment', 'ActiveUser', 'reservationService', 'reservationTimeService',
        function ($scope, $rootScope, $http, $location, BLUEREC_ONLINE_CONFIG, $routeParams, $modal, $q, $timeout, $filter, $anchorScroll, moment,
                  ActiveUser, reservationService, reservationTimeService) {

            $scope.contactCheckAlert = false;

            $scope.hideBasicInfo = true;

            $scope.depositAmount = 0.00;

            $scope.feeAmount = 0.00;

            $scope.facilityData = reservationService.get();
            $scope.selectedTimeData = reservationTimeService.get();

            console.log('SELECT TIME - FACILITYDATA');
            console.log($scope.facilityData);

            console.log('SELECT TIME - selectedTimeData');
            console.log($scope.selectedTimeData);

            $scope.feeAmount = $scope.selectedTimeData.fee_amount;

            $scope.packageFeeAmount = 0.0;

            $scope.rentalCodeSelected = $scope.facilityData.rental_code_item_id;

            //console.log('$scope.rentalCodeSelected:  '+$scope.rentalCodeSelected);

            $scope.startTime = new Date($scope.rentalCodeSelected.start_time_check_24);
            $scope.endTime = new Date($scope.facilityData.end_time_check_24);

            //console.log('  $scope.startTime: ' +   $scope.startTime);

            $scope.rentalPackages = [];
            $scope.rentalCustomFields = [];

            $scope.displayPackages = false;
            $scope.displayCustomFields = false;

            $scope.setPackages = function() {
                var req = {
                    method: 'POST',
                    url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/item/' + $scope.rentalCodeSelected + '/packages',
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
                    url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/item/' + $scope.rentalCodeSelected + '/customfields',
                    headers: {
                        'Content-Type': undefined
                    },
                    data: {'uid': ActiveUser.userData.user_id}
                };

                $http(req)
                    .success(function (data) {
                        console.table(data);

                        $scope.rentalCustomFields = data.customForm;

                        if ($scope.rentalCustomFields.length > 0) {
                            $scope.displayCustomFields = true;
                        }
                    });
            };

            Date.prototype.AddHours = function(noOfHours) {
                this.setTime(this.getTime() + (noOfHours * (1000 * 60* 60)));
                return this;
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

            $scope.onPackageCheckedEvent = function() {
                var newPackageFee = 0.0;

                for (var i = 0; i < $scope.rentalPackages.length; i++) {
                    if($scope.rentalPackages[i].selected)
                    {
                        for(var a = 0; a < $scope.rentalPackages[i].fees.length; a++){
                            if(angular.isNumber(parseFloat($scope.rentalPackages[i].fees[a].fee_amount))) {
                                newPackageFee += parseFloat($scope.rentalPackages[i].fees[a].fee_amount);
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
                var $autoApproved = ($scope.facilityData.auto_approve==='1');

                if ($scope.agreementSigned.checked) {
                    var $userID = ActiveUser.userData.user_id;

                    if ($scope.facilityData.rental_code_item_id !== '' && $userID) {
                         //var $facilityString = $scope.getFacilityString();

                        // //console.log($scope.facilityData.rental_code_item_id);

                        var submitData = {};
                        submitData.request_id = 1;
                        submitData.householdID = ActiveUser.userData.household_id;
                        submitData.itemID = $scope.facilityData.rental_code_item_id;
                        submitData.userID = ActiveUser.userData.user_id;
                        submitData.addedByUserID = ActiveUser.userData.user_id;
                        submitData.usePaymentPlan = '0';
                        submitData.itemType = 'rental code';
                        submitData.familyMembership = '0';
                        submitData.totalCharge = $scope.selectedTimeData.fee_amount;
                        submitData.waivers = [];
                        submitData.members = [];

                        submitData.fees = [];
                        submitData.fees[0] = {};
                        submitData.fees[0].itemFeeID = $scope.facilityData.item_fee_id;
                        //submitData.fees[0].feeAmount =  $scope.facilityData.fee_amount;
                        submitData.fees[0].feeAmount = $scope.feeAmount;

                        submitData.start_date = $scope.formatMySQLDate(new Date($scope.selectedTimeData.check_date + 'T' + $scope.selectedTimeData.start_check_time_24));
                        submitData.end_date = $scope.formatMySQLDate(new Date($scope.selectedTimeData.check_date + 'T' + $scope.selectedTimeData.end_check_time_24));

                        //var tempTime = new Date('1970-01-01T'+$scope.selectedTimeData.start_check_time_24);

                        ////console.log(tempDate);
                        ////console.log(tempTime);

                        // var startDate = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDay(), tempTime.getHours(), tempTime.getMinutes(), 40);
                        var startDate = new Date($scope.selectedTimeData.check_date + 'T' + $scope.selectedTimeData.start_check_time_24);

                        submitData.events = [];

                        var eventData = {};

                        var i;
                        for (i = 0; i < $scope.selectedTimeData.selectedFacilityIds.length; i++) {

                            //var endDate = new Date(startDate);

                            var endDate = new Date($scope.selectedTimeData.check_date + 'T' + $scope.selectedTimeData.end_check_time_24);

                            //endDate.AddHours($scope.facilityData.min_hours[i]);

                            ////console.log(startDate);
                            ////console.log(endDate);

                            eventData = {};
                            eventData = {
                                'facility_item_id': $scope.selectedTimeData.selectedFacilityIds[i],
                                'event_start': $scope.formatMySQLDate(startDate),
                                'event_end': $scope.formatMySQLDate(endDate)
                            };

                            submitData.events.push(eventData);

                            //startDate.AddHours($scope.facilityData.min_hours[i]);
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

                        if($autoApproved)
                        {
                            req = {
                                method: 'POST',
                                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/cart/add',
                                headers: {
                                    'Content-Type': undefined
                                },
                                data: submitData
                            };
                            $http(req)
                                .success(function () {
                                    $rootScope.$emit('updateCartCount', {});

                                    $location.path('/' + $routeParams.orgurl + '/addedtocart');
                                    // $location.path('/' +  $routeParams.orgurl + '/reservations');
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
                                    //console.log(data);

                                    $location.path('/' + $routeParams.orgurl + '/rentalrequestsubmitted');
                                    //$location.path('/' +  $routeParams.orgurl + '/reservations');
                                });
                        }
                    }
                }
                else
                {
                    $scope.contactCheckAlert = true;
                }
            };

            $scope.setPackages();
            $scope.setCustomFields();

        }]);