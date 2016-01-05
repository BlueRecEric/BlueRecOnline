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
        '$filter', '$anchorScroll', 'moment', 'ActiveUser', 'reservationService',
        function ($scope, $http, $location, BLUEREC_ONLINE_CONFIG, $routeParams, $modal, $q, $timeout, $filter, $anchorScroll, moment, ActiveUser, reservationService) {

            $scope.searchPanelActive = true;

            $scope.isSearchIconBusy = false;
            $scope.displaySearchResults = false;
            $scope.displayNoResults = false;

            $scope.searchErrorMessage = '';

            $scope.searchResultsData = [];
            $scope.searchRowCollection = [];
            $scope.searchSelectedTimeData = [];

            $scope.weekdaySearch = {
                sunday: false,
                monday: false,
                tuesday: false,
                wednesday: false,
                thursday: false,
                friday: false,
                saturday: false
            };

            $scope.facilityData = [];

            $scope.facilityData = reservationService.get();

            console.log('FACILITYDATA');
            console.log($scope.facilityData);

            $scope.fromDate = $scope.facilityData.search_start_date;
            $scope.untilDate = $scope.facilityData.search_end_date;

            $scope.startTime = new Date($scope.facilityData.search_start_time);
            $scope.endTime = new Date($scope.facilityData.search_end_time);

            for (var i = 0; i < $scope.facilityData['weekday_indexes'].length; i++) {
                if ($scope.facilityData.weekday_indexes[i] === "0") {
                    $scope.weekdaySearch.sunday = true;
                }
                else if ($scope.facilityData.weekday_indexes[i] === "1") {
                    $scope.weekdaySearch.monday = true;
                }
                else if ($scope.facilityData.weekday_indexes[i] === "2") {
                    $scope.weekdaySearch.tuesday = true;
                }
                else if ($scope.facilityData.weekday_indexes[i] === "3") {
                    $scope.weekdaySearch.wednesday = true;
                }
                else if ($scope.facilityData.weekday_indexes[i] === "4") {
                    $scope.weekdaySearch.thursday = true;
                }
                else if ($scope.facilityData.weekday_indexes[i] === "5") {
                    $scope.weekdaySearch.friday = true;
                }
                else if ($scope.facilityData.weekday_indexes[i] === "6") {
                    $scope.weekdaySearch.saturday = true;
                }
            }

            $scope.getWeekdaysString = function ()
            {
                var weekdaysString = '';

                if ($scope.weekdaySearch.sunday) {
                    weekdaysString += 'Sun';
                }
                if ($scope.weekdaySearch.monday) {
                    if (weekdaysString !== '') {
                        weekdaysString += ',';
                    }
                    weekdaysString += 'Mon';
                }
                if ($scope.weekdaySearch.tuesday) {
                    if (weekdaysString !== '') {
                        weekdaysString += ',';
                    }
                    weekdaysString += 'Tue';
                }
                if ($scope.weekdaySearch.wednesday) {
                    if (weekdaysString !== '') {
                        weekdaysString += ',';
                    }
                    weekdaysString += 'Wed';
                }
                if ($scope.weekdaySearch.thursday) {
                    if (weekdaysString !== '') {
                        weekdaysString += ',';
                    }
                    weekdaysString += 'Thu';
                }
                if ($scope.weekdaySearch.friday) {
                    if (weekdaysString !== '') {
                        weekdaysString += ',';
                    }
                    weekdaysString += 'Fri';
                }
                if ($scope.weekdaySearch.saturday) {
                    if (weekdaysString !== '') {
                        weekdaysString += ',';
                    }
                    weekdaysString += 'Sat';
                }

                return weekdaysString;
            };

            $scope.onSearchRentalTimes = function ()
            {
                $scope.durationSelected = 180;

                $scope.displaySearchResults = false;
                $scope.displayNoResults = false;

                $scope.searchErrorMessage = '';
                $scope.isSearchIconBusy = true;

                $scope.searchResultsData = [];
                $scope.searchRowCollection = [];
                $scope.searchSelectedTimeData = [];

                var facilitySearchString = $scope.facilityData.facility_item_id_string;

                $scope.translate = function (value) {
                    return $filter('time')(value, 'mm', 'hh:mm aa', true, false);
                };

                var tempStartTime = $filter('date')($scope.startTime, 'HH:mm');
                var tempEndTime = $filter('date')($scope.endTime, 'HH:mm');

                var weekdaysString = $scope.getWeekdaysString();

                var timeDiff = (($scope.endTime.getTime() / 1000.0) - ($scope.startTime.getTime() / 1000.0))/60;

                console.log(tempStartTime + "   |   " + timeDiff);

                $scope.isSearchIconBusy = false;

               var rentalCodeSearch = $scope.facilityData.rental_code_item_id;

                var req = {
                    method: 'POST',
                    url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/reservation/searchavailiabletimes',
                    headers: {
                        'Content-Type': undefined
                    },
                    data: {
                        rental_code: rentalCodeSearch,
                        facilities: facilitySearchString,
                        from_date: $filter('date')($scope.fromDate, 'yyyy-MM-dd') + ' ' + tempStartTime,
                        until_date: $filter('date')($scope.untilDate, 'yyyy-MM-dd') + ' ' + tempEndTime,
                        duration: timeDiff,
                        start_time: tempStartTime,
                        end_time: tempEndTime,
                        weekdays: weekdaysString
                    }
                };

                $http(req)
                    .success(function (data) {

                        console.log(data);
                        if (data.success) {
                            $scope.isSearchIconBusy = false;

                            if (data.rowCount > 0) {
                                ////console.table(data);
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
                        $scope.searchSelectedTimeData = [];
                        $scope.searchRowCollection = [];
                        $scope.searchResultsData = [];

                        $scope.isSearchIconBusy = false;
                        $scope.displaySearchResults = false;
                        $scope.displayNoResults = false;

                        $scope.searchErrorMessage = data;
                    });

                $scope.searchResultsData = [].concat($scope.searchRowCollection);
                $scope.searchSelectedTimeData = [];
            };

            $scope.onSearchRentalTimes();


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
            }

            $scope.formatMySQLDate = function (formatDate) {
                //Grab each of your components
                var yyyy = formatDate.getFullYear().toString();
                var MM = (formatDate.getMonth() + 1).toString();
                var dd = formatDate.getDate().toString();
                var hh = formatDate.getHours().toString();
                var mm = formatDate.getMinutes().toString();
                var ss = formatDate.getSeconds().toString();

                //Returns your formatted result
                return yyyy + '-' + (MM[1] ? MM : '0' + MM[0]) + '-' + (dd[1] ? dd : '0' + dd[0]) + ' ' + (hh[1] ? hh : '0' + hh[0]) + ':' + (mm[1] ? mm : '0' + mm[0]) + ':00';
            };


            $scope.onSelectRentalTime = function (selectedRow) {
                //selectedRow.iconBusy = !selectedRow.iconBusy;
                ////console.table(selectedRow);
                console.log(selectedRow);

                $scope.searchSelectedTimeData = selectedRow;

                var $userID = ActiveUser.userData.user_id;

                if ($scope.facilityData.rental_code_item_id !== '' && $userID) {
                    //var $facilityString = $scope.getFacilityString();

                    console.log($scope.facilityData.rental_code_item_id);

                    var submitData = {};
                    submitData.request_id = 1;
                    submitData.householdID = ActiveUser.userData.household_id;
                    submitData.itemID = $scope.facilityData.rental_code_item_id;
                    submitData.userID = ActiveUser.userData.user_id;
                    submitData.addedByUserID = ActiveUser.userData.user_id;
                    submitData.usePaymentPlan = '0';
                    submitData.itemType = 'rental code';
                    submitData.familyMembership = '0';
                    submitData.totalCharge =  $scope.facilityData.fee_amount;
                    submitData.waivers = [];
                    submitData.members = [];

                    submitData.fees = [];
                    submitData.fees[0] = {};
                    submitData.fees[0].itemFeeID =  $scope.facilityData.item_fee_id;
                    submitData.fees[0].feeAmount =  $scope.facilityData.fee_amount;

                    /*submitData.events = [];
                    submitData.events[0] = {};
                    submitData.events[0].facility_item_id =  '278';
                    submitData.events[0].event_start =  '2016-01-05 10:00:00';
                    submitData.events[0].event_end =  '2016-01-05 12:00:00';*/

                    var tempDate = new Date($scope.searchSelectedTimeData.check_date + 'T' + $scope.searchSelectedTimeData.start_check_time_24);
                    var tempTime = new Date('1970-01-01T'+$scope.searchSelectedTimeData.start_check_time_24);

                    console.log(tempDate);
                    console.log(tempTime);

                   // var startDate = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDay(), tempTime.getHours(), tempTime.getMinutes(), 40);
                    var startDate = tempDate;

                    submitData.events = [];

                    var eventData = {};
                    for (var i = 0; i < $scope.facilityData.facility_ids.length; i++) {

                        var endDate = new Date(startDate);

                        endDate.AddHours($scope.facilityData.min_hours[i]);

                        console.log(startDate);
                        console.log(endDate);

                        eventData = {};
                        eventData = {
                            'facility_item_id' :$scope.facilityData.facility_ids[i],
                            'event_start': $scope.formatMySQLDate(startDate),
                            'event_end': $scope.formatMySQLDate(endDate)
                        };

                        submitData.events.push(eventData);

                        startDate.AddHours($scope.facilityData.min_hours[i]) ;
                    }


                    console.log(eventData);

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

                            $location.path('/' +  $routeParams.orgurl + '/reservations');
                    });
                }
            };
        }]);