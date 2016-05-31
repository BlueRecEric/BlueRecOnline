'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:reservationAvailableTimes
 * @description
 * # AboutCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
    .controller('ReservationAvailableTimes', ['$scope', '$http', '$location', 'BLUEREC_ONLINE_CONFIG', '$routeParams', '$modal', '$q', '$timeout',
        '$filter', '$anchorScroll', 'moment', 'ActiveUser', 'reservationService', 'reservationTimeService',
        function ($scope, $http, $location, BLUEREC_ONLINE_CONFIG, $routeParams, $modal, $q, $timeout, $filter, $anchorScroll, moment, ActiveUser, reservationService, reservationTimeService) {

            $scope.renderSlider = false;

            $scope.searchPanelActive = true;

            $scope.isSearchIconBusy = false;
            $scope.displaySearchResults = false;
            $scope.displayNoResults = false;

            $scope.searchErrorMessage = '';

            $scope.searchResultsData = [];
            $scope.searchRowCollection = [];
            $scope.searchSelectedTimeData = [];

            $scope.facilityError = false;
            $scope.weekdayError = false;

            $scope.loadingWeekdays = false;

            $scope.rentalData = [];

            $scope.rentalData = reservationService.get();

            $scope.facilityArray = [];

            for(var ia=0; ia < $scope.rentalData.facility_ids.length; ia++)
            {
                $scope.facilityArray.push(false);
            }

            console.log('rentalData');
            console.log($scope.rentalData);

            $scope.durationSlider = {
                ceil: $scope.rentalData.max_hour,
                floor: $scope.rentalData.min_hour};

            $scope.rentalDuration = {selectedTime:  $scope.rentalData.min_hour};

            $timeout(function () {
                $scope.renderSlider = true;
            }, 500, false);

            $scope.fromDate = $scope.rentalData.search_start_date;
            $scope.untilDate = $scope.rentalData.search_end_date;

            $scope.startTime = new Date();
            $scope.startTime.setHours(8);
            $scope.startTime.setMinutes(0);

           $scope.endTime = new Date();
            $scope.endTime.setHours(16);
            $scope.endTime.setMinutes(0);

            $scope.weekdayData = [];

            $scope.getWeekdayData = function() {
                $scope.loadingWeekdays = true;
                var req = {
                    method: 'POST',
                    url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/reservation/' + $scope.rentalData.rental_code_item_id + '/reservationweekday',
                    headers: {
                        'Content-Type': undefined
                    },
                    data: {
                        'start_date': $filter('date')($scope.fromDate,'yyyy-MM-dd'),
                        'end_date': $filter('date')($scope.untilDate,'yyyy-MM-dd')
                    }
                };

                $http(req)
                    .success(function (data) {
                        console.log(data);

                        $scope.loadingWeekdays = false;

                        $scope.weekdayData = data.weekday_data;
                    })
                    .error(function (){
                        $scope.loadingWeekdays = false;
                    });
            };

            $scope.getWeekdayData();

            $scope.onSearchDateChange = function() {
                $scope.getWeekdayData();
            };

            $scope.onWeekdayChange = function() {
                var selectedWeekdays = $scope.getSelectedWeekdays();
                if($scope.weekdayError && selectedWeekdays.length > 0)
                {$scope.weekdayError = false;}
            };

            $scope.translateDuration = function (value) {
                var label = value;

                if (value < 60) {
                    label = value + ' mins';
                }
                if (value >= 60) {
                    var totalSeconds = value * 60;

                    var hours = Math.floor(totalSeconds / 3600);
                    var minutes = Math.floor((totalSeconds % 3600) / 60);

                    label = hours;

                    if (hours === 1) {
                        label += ' hr';
                    }
                    else {
                        label += ' hrs';
                    }

                    if (minutes > 0) {
                        label += ' ' + minutes;

                        if (minutes === 1) {
                            label += ' min';
                        }
                        else {
                            label += ' mins';
                        }
                    }
                }
                return label;
            };

            $scope.getFacilitySearchString = function () {
                //console.table( $scope.selectedSearchFacilities.facilities);
                var facilitySearchString = '';

                for (var i=0;i < $scope.facilityArray.length; i++) {
                    if($scope.facilityArray[i]) {
                        if (facilitySearchString !== '') {
                            facilitySearchString += ', ';
                        }
                        facilitySearchString += $scope.rentalData.facility_ids[i];
                    }
                }

                return facilitySearchString;
            };

            $scope.getSelectedWeekdays = function() {
                var selectedWeekdays = [];

                for (var i=0;i < $scope.weekdayData.length; i++)
                {
                    if($scope.weekdayData[i].selected)
                    {
                        selectedWeekdays.push($scope.weekdayData[i]);
                    }
                }

                return selectedWeekdays;
            };

            $scope.onSearchRentalTimes = function ()
            {
                //console.log($scope.rentalData);

                $scope.facilityError = false;
                $scope.weekdayError = false;

                $scope.displaySearchResults = false;
                $scope.displayNoResults = false;

                $scope.searchErrorMessage = '';
                $scope.isSearchIconBusy = true;

                $scope.searchResultsData = [];
                $scope.searchRowCollection = [];
                $scope.searchSelectedTimeData = [];


                var selectedWeekdays = $scope.getSelectedWeekdays();
                var facilitySearchString = $scope.getFacilitySearchString();

                if(facilitySearchString.length === 0)
                {$scope.facilityError = true;}

                if(selectedWeekdays.length === 0)
                {$scope.weekdayError = true;}

                if(!$scope.facilityError && !$scope.weekdayError && $scope.startTime < $scope.endTime) {
                    $scope.isSearchIconBusy = false;

                    /*for(var i=0;i < $scope.rentalData.weekday_indexes2.length; i++)
                     {
                     if($scope.weekdaySearch2[$scope.rentalData.weekday_indexes[i]])
                     {
                     var day = {};
                     if(tempStartTime <= $scope.convertDateTo24Hour($scope.rentalData.weekday_end[i])) {

                     day = {
                     'day': $scope.getWeekdaysString($scope.rentalData.weekday_indexes[i]),
                     'start_time': tempStartTime,
                     'end_time': tempEndTime,
                     'check_start_time': $scope.convertDateTo24Hour($scope.rentalData.weekday_start[i]),
                     'check_end_time': $scope.convertDateTo24Hour($scope.rentalData.weekday_end[i])
                     };
                     }

                     weekdayData.push(day);
                     }
                     }*/

                    console.log('selectedWeekdays');
                    console.log(selectedWeekdays);

                    var req = {
                        method: 'POST',
                        url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/reservation/searchavailiabletimes',
                        headers: {
                            'Content-Type': undefined
                        },
                        data: {
                            rental_code: $scope.rentalData.rental_code_item_id,
                            facilities: facilitySearchString,
                            from_date: $filter('date')($scope.fromDate, 'yyyy-MM-dd'),
                            until_date: $filter('date')($scope.untilDate, 'yyyy-MM-dd'),
                            duration: $scope.rentalDuration.selectedTime,
                            start_time: $filter('date')($scope.startTime, 'HH:mm'),
                            end_time:  $filter('date')($scope.endTime, 'HH:mm'),
                            weekdays: selectedWeekdays
                        }
                    };

                    $http(req)
                        .success(function (data) {

                            //console.log(data);
                            if (data.success) {
                                $scope.isSearchIconBusy = false;

                                if (data.rowCount > 0) {
                                    $scope.searchRowCollection = data.results;

                                    $scope.displayNoResults = false;
                                    $scope.displaySearchResults = true;
                                }
                                else {
                                    $scope.displaySearchResults = false;
                                    $scope.displayNoResults = true;
                                }
                            }
                            else if (data.error) {
                                $scope.isSearchIconBusy = false;
                                $scope.displaySearchResults = false;
                                $scope.displayNoResults = false;
                                $scope.searchErrorMessage = data.message;
                            }
                        })
                        .error(function (data) {
                            $scope.isSearchIconBusy = false;

                            /*$scope.searchSelectedTimeData = [];
                             $scope.searchRowCollection = [];
                             $scope.searchResultsData = [];

                             $scope.displaySearchResults = false;
                             $scope.displayNoResults = false;

                             $scope.searchErrorMessage = data;*/
                        });

                    $scope.searchResultsData = [].concat($scope.searchRowCollection);
                }
                else
                {
                    $scope.isSearchIconBusy = false;

                    $scope.searchErrorMessage = 'You must select something for the options highlighted red.';

                    $anchorScroll.yOffset = 500;
                    $anchorScroll('pageTop');
                }
                //console.log($scope.searchResultsData);
                $scope.searchSelectedTimeData = [];
            };

            //$scope.onSearchRentalTimes();

            var confirmationModal = $modal({
                scope: $scope,
                template: 'confirmation.html',
                show: false,
                animation: 'am-fade-and-scale',
                placement: 'bottom'
            });

            $scope.showConformationModal = function () {
                confirmationModal.$promise.then(confirmationModal.show);
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

            $scope.onSelectRentalTime = function (selectedRow) {
                //selectedRow.iconBusy = !selectedRow.iconBusy;
                ////console.table(selectedRow);
                //console.log(selectedRow);

                $scope.searchSelectedTimeData = selectedRow;

                var tempDate = new Date($scope.searchSelectedTimeData.check_date + 'T' + $scope.searchSelectedTimeData.start_check_time_24);
                var tempDate2 = new Date($scope.searchSelectedTimeData.check_date + 'T' + $scope.searchSelectedTimeData.end_check_time_24);

                var timeDiff = ((tempDate2.getTime() / 1000.0) - (tempDate.getTime() / 1000.0))/60;
                timeDiff = timeDiff / 60;
                //console.log('timeDiff: ' + timeDiff);

                console.log('rental data: ' );

                var feeAmount = 0;
                var selectedFacilities = [];
                for (var i=0;i < $scope.facilityArray.length; i++) {
                    if ($scope.facilityArray[i]) {
                        feeAmount += (timeDiff * $scope.rentalData.facility_fees[i].per_hour_amount);

                        // console.log($scope.rentalData.facility_fees[i]);
                        //$scope.rentalData.facility_ids[i].fee_amount = feeAmount;
                        selectedFacilities.push($scope.rentalData.facility_ids[i]);
                    }
                }

                //console.log('feeAmount: ' + feeAmount);

                $scope.searchSelectedTimeData.fee_amount = feeAmount;

                $scope.searchSelectedTimeData.selectedFacilityIds = selectedFacilities;
                reservationTimeService.set($scope.searchSelectedTimeData);

                $location.path('/' + $routeParams.orgurl + '/reservationaddons');

                /*var $userID = ActiveUser.userData.user_id;

                 if ($scope.rentalData.rental_code_item_id !== '' && $userID) {
                 //var $facilityString = $scope.getFacilityString();

                 // //console.log($scope.rentalData.rental_code_item_id);

                 var submitData = {};
                 submitData.request_id = 1;
                 submitData.householdID = ActiveUser.userData.household_id;
                 submitData.itemID = $scope.rentalData.rental_code_item_id;
                 submitData.userID = ActiveUser.userData.user_id;
                 submitData.addedByUserID = ActiveUser.userData.user_id;
                 submitData.usePaymentPlan = '0';
                 submitData.itemType = 'rental code';
                 submitData.familyMembership = '0';
                 submitData.totalCharge =  $scope.rentalData.fee_amount;
                 submitData.waivers = [];
                 submitData.members = [];

                 submitData.fees = [];
                 submitData.fees[0] = {};
                 submitData.fees[0].itemFeeID =  $scope.rentalData.item_fee_id;
                 submitData.fees[0].feeAmount =  $scope.rentalData.fee_amount;

                 var tempDate = new Date($scope.searchSelectedTimeData.check_date + 'T' + $scope.searchSelectedTimeData.start_check_time_24);
                 //var tempTime = new Date('1970-01-01T'+$scope.searchSelectedTimeData.start_check_time_24);

                 //console.log(tempDate);
                 //console.log(tempTime);

                 // var startDate = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDay(), tempTime.getHours(), tempTime.getMinutes(), 40);
                 var startDate = tempDate;

                 submitData.events = [];

                 var eventData = {};
                 for (var i = 0; i < $scope.rentalData.facility_ids.length; i++) {

                 var endDate = new Date(startDate);

                 endDate.AddHours($scope.rentalData.min_hours[i]);

                 //console.log(startDate);
                 //console.log(endDate);

                 eventData = {};
                 eventData = {
                 'facility_item_id' :$scope.rentalData.facility_ids[i],
                 'event_start': $scope.formatMySQLDate(startDate),
                 'event_end': $scope.formatMySQLDate(endDate)
                 };

                 submitData.events.push(eventData);

                 startDate.AddHours($scope.rentalData.min_hours[i]) ;
                 }

                 //console.log(eventData);

                 var req = {
                 method: 'POST',
                 url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/cart/add',
                 headers: {
                 'Content-Type': undefined
                 },
                 data: submitData
                 };

                 $http(req)
                 .success(function (data) {
                 //$scope.rentalCodeSearch = '';

                 //$scope.resetForm();

                 //$scope.showConformationModal();

                 $location.path('/' + $routeParams.orgurl + '/addedtocart');
                 // $location.path('/' +  $routeParams.orgurl + '/reservations');
                 });
                 }*/
            };
        }]);