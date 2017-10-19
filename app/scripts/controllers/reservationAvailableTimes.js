'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:reservationAvailableTimes
 * @description
 * # AboutCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
    .controller('ReservationAvailableTimes', ['$scope', '$rootScope', '$http', '$location', 'BLUEREC_ONLINE_CONFIG', '$routeParams', '$modal', '$q', '$timeout',
        '$filter', '$anchorScroll', 'jwtHelper', 'ActiveUser', 'toaster', 'ReservationFactory',
        function ($scope, $rootScope, $http, $location, BLUEREC_ONLINE_CONFIG, $routeParams, $modal, $q, $timeout, $filter, $anchorScroll, jwtHelper, ActiveUser,
                  toaster, ReservationFactory) {

            $scope.userLoggedIn = false;
            $scope.userLoggedIn = ActiveUser.isLoggedIn();

            if (!$scope.userLoggedIn)
            {
                $location.path('/' + $routeParams.orgurl + '/reservations');
            }

            $scope.formErrors = [];
            $scope.formErrors.facilityError = false;
            $scope.formErrors.weekdayError = false;

            $scope.loadingWeekdays = [];
            $scope.loadingWeekdays.loading = false;

            $scope.fees = [];
            $scope.fees.show = false;
            $scope.fees.fee_data = [];

            $scope.rentalDataLoaded = false;

            /**
             * @typedef {Object} rentalData
             * @property {int} how_far_in_advance
             * @property {int} how_far_out
             * @property {string} force_facility_order
             * @property {string} facility_data
             * @property {int} facility_limit
             * @property {string} lf_date
             * @property {string} sf_date
             * @property {string} st_date
             * @property {string} et_date
             * @property {string} etime
             * @property {string} fac_label
             * @property {string} slots
             * @property {Object} tdata
             * @property {int} tdata.eg
             * @property {string} tdata.fname
             * @property {string} tdata.et
             * @property {string} tdata.st
             */
            $scope.rentalData = [];
            $scope.rentalData.facility_limit = 1;

            $scope.errorLoadingRental = false;

            $scope.selectedRentalTimes = [];
            $scope.selectedRentalTimes.rentals = [];

            $scope.rentalItemID = $routeParams.itemid;

            $scope.renderSlider = false;

            $scope.searchPanelActive = true;

            $scope.isSearchIconBusy = [];
            $scope.isSearchIconBusy.loading = false;

            $scope.displaySearchResults = false;
            $scope.displayNoResults = false;

            $scope.searchErrorMessage = '';

            $scope.searchResultsData = [];
            $scope.searchRowCollection = [];

            $scope.autoOnlineTime = [];
            $scope.autoOnlineTime.start_time = [];
            $scope.autoOnlineTime.end_time = [];

            Date.prototype.AddDays = function(noOfDays) {
                this.setTime(this.getTime() + (noOfDays * (1000 * 60 * 60 * 24)));
                return this;};

            $scope.fromDate = new Date();
            $scope.untilDate = new Date();
            $scope.untilDate.AddDays(7);

            $scope.startTime = [];
            $scope.startTime.time = new Date();

            $scope.endTime = [];
            $scope.endTime.time = new Date();

            $scope.minDate = new Date();
            $scope.minDate.AddDays(-1);

            $scope.minDateDisplay = new Date();

            $scope.maxDate = new Date();
            $scope.maxDate.AddDays(365);

            $scope.packages = [];
            $scope.packages.show_packages = false;
            $scope.packages.max_capacity = 0;
            $scope.packages.total_packages = 0;

            $scope.packageData = [];

            $scope.itemsByPage = 50;

            $scope.showingToast = false;

            $timeout(function () {
                $scope.renderSlider = true;
            }, 500, false);

            $scope.selectFacilities = function(selectAll){
                if(!angular.isUndefined($scope.rentalData) && !angular.isUndefined($scope.rentalData.facility_data)) {
                    var facCount = $scope.rentalData.facility_data.length;

                    for (var i = 0; i < facCount; i++) {
                        $scope.rentalData.facility_data[i].selected = selectAll;
                    }
                }
            };

            $scope.selectWeekends = function(selectAll){
                if(!angular.isUndefined($scope.weekdayData)) {
                    var weekdayCount = $scope.weekdayData.length;

                    for (var i = 0; i < weekdayCount; i++) {
                        $scope.weekdayData[i].selected = selectAll;
                    }
                }
            };

            $scope.getRentalData = function() {
                if($scope.userLoggedIn) {
                    var req = {
                        method: 'POST',
                        url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/reservation/' + $scope.rentalItemID + '/reservationdata',
                        headers: {
                            'Content-Type': undefined
                        },
                        data: {
                            'user_id': ActiveUser.userData.user_id
                        }
                    };

                    $http(req)
                        .success(function (data) {
                            //console.log('getRentalData', data);

                            if (!angular.isUndefined(data.rental_data) && !angular.isUndefined(data.rental_data.facility_data)) {
                                $scope.rentalData = data.rental_data;

                                $scope.packages.show_packages = $scope.rentalData.show_packages;
                                $scope.packages.max_capacity = $scope.rentalData.max_capacity;

                                $scope.packageData = $scope.rentalData.package_data;

                                console.log('$scope.packages', $scope.packages);
                                console.log('packageData', $scope.packageData);

                                $scope.startTime.time = new Date();
                                $scope.endTime.time = new Date();

                                if ($scope.rentalData.online_auto_select_event === '1' && $scope.rentalData.online_auto_select_event !== '1') {
                                    $scope.untilDate = new Date();

                                    $scope.startTime.time.setHours(8);
                                    $scope.startTime.time.setMinutes(0);

                                    $scope.endTime.time.setHours(14);
                                    $scope.endTime.time.setMinutes(0);
                                }
                                else {
                                    $scope.startTime.time.setHours(($scope.rentalData.force_time_slots === '1') ? 0 : 8);
                                    $scope.startTime.time.setMinutes(0);

                                    $scope.endTime.time.setHours(($scope.rentalData.force_time_slots === '1') ? 23 : 9);
                                    $scope.endTime.time.setMinutes(($scope.rentalData.force_time_slots === '1') ? 59 : 0);
                                }

                                $scope.rentalData.facility_limit = 0;

                                var facCount = $scope.rentalData.facility_data.length;

                                if ($scope.rentalData.force_facility_order === '1') {
                                    if (facCount > 0) {
                                        $scope.rentalData.facility_limit = $filter('number')((facCount / 2) + 1, 0);
                                    }
                                }

                                // if ($scope.rentalData.force_facility_order === '1') {
                                for (var i = 0; i < facCount; i++) {
                                    $scope.rentalData.facility_data[i].selected = true;
                                }
                                //}

                                $scope.fees.fee_data = [];
                                for (var fi = 0; fi < facCount; fi++) {
                                    for (var fd = 0; fd < $scope.rentalData.facility_data[fi].fee_data.length; fd++) {
                                        $scope.fees.fee_data.push({
                                            item_fee_id: $scope.rentalData.facility_data[fi].fee_data[fd].item_fee_id,
                                            fee_id: $scope.rentalData.facility_data[fi].fee_data[fd].fee_id,
                                            fee_name: $scope.rentalData.facility_data[fi].fee_data[fd].fee_name,
                                            fee_amount: parseFloat($scope.rentalData.facility_data[fi].fee_data[fd].fee_amount)
                                        });
                                    }
                                }

                                //$scope.fees.fee_data = $scope.rentalData.fee_data;
                                $scope.fees.show = $scope.rentalData.show_fees;

                                if ($scope.rentalData.how_far_in_advance > 0) {
                                    var inAdvanceDate = new Date();

                                    inAdvanceDate.setDate(inAdvanceDate.getDate() + parseInt($scope.rentalData.how_far_in_advance));

                                    $scope.fromDate = angular.copy(inAdvanceDate);
                                    $scope.untilDate = angular.copy(inAdvanceDate);
                                    $scope.minDateDisplay = angular.copy(inAdvanceDate);

                                    inAdvanceDate.setDate(inAdvanceDate.getDate() - 1);

                                    $scope.minDate = angular.copy(inAdvanceDate);
                                }

                                if ($scope.rentalData.how_far_out > 0) {
                                    var farOutDate = new Date();

                                    farOutDate.setDate(farOutDate.getDate() + (parseInt($scope.rentalData.how_far_out) - 1));

                                    $scope.maxDate = angular.copy(farOutDate);
                                }

                                $scope.durationSlider = {
                                    ceil: $scope.rentalData.max_hour,
                                    floor: $scope.rentalData.min_hour
                                };

                                $scope.rentalDuration = {selectedTime: $scope.rentalData.min_hour};
                                $scope.rentalDurationTemp = {selectedTime: $scope.rentalData.min_hour};

                                $scope.rentalDataLoaded = true;

                                $scope.getWeekdayData();
                            }
                            else {
                                $location.path('/' + $routeParams.orgurl + '/reservations');
                            }
                        })
                        .error(function () {
                            $scope.errorLoadingRental = true;
                            $scope.rentalDataLoaded = false;
                        });
                }
            };

            $scope.updateOverlappingEvents = function updateOverlappingEvents(timeRow)
            {
                var a;
                var t;

                for (a = 0; a < $scope.searchRowCollection.length; a++) {
                    for (t = 0; t < $scope.searchRowCollection[a].tdata.length; t++) {
                        if($scope.searchRowCollection[a].tdata[t].fid === timeRow.fid &&
                            $scope.searchRowCollection[a].tdata[t].id != timeRow.id) {
                            if ((parseInt($scope.searchRowCollection[a].tdata[t].utcs) > parseInt(timeRow.utcs) &&
                                    parseInt($scope.searchRowCollection[a].tdata[t].utcs) < parseInt(timeRow.utce)) ||
                                (parseInt($scope.searchRowCollection[a].tdata[t].utce) > parseInt(timeRow.utcs) &&
                                    parseInt($scope.searchRowCollection[a].tdata[t].utce) < parseInt(timeRow.utce))) {

                                if($scope.searchRowCollection[a].tdata[t].added) {
                                    $scope.removeSelectedRentalData($scope.searchRowCollection[a].tdata[t]);

                                    for (var aa = 0; aa < $scope.searchRowCollection.length; aa++) {
                                        for (var tt = 0; tt < $scope.searchRowCollection[aa].tdata.length; tt++) {
                                            if ($scope.searchRowCollection[aa].tdata[tt].fid === $scope.searchRowCollection[a].tdata[t].fid &&
                                                $scope.searchRowCollection[aa].tdata[tt].id != $scope.searchRowCollection[a].tdata[t].id) {
                                                if (parseInt($scope.searchRowCollection[a].tdata[t].utcs) < parseInt($scope.searchRowCollection[aa].tdata[tt].utcs) &&
                                                    (parseInt($scope.searchRowCollection[a].tdata[t].utce) > parseInt($scope.searchRowCollection[aa].tdata[tt].utcs) &&
                                                        parseInt($scope.searchRowCollection[a].tdata[t].utce) < parseInt($scope.searchRowCollection[aa].tdata[tt].utce))) {
                                                    //$scope.searchRowCollection[aa].tdata[tt].overlap = false;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            };

            $scope.getRentalData();

            $scope.weekdayDataLoaded = false;
            $scope.weekdayData = [];

            $scope.getSelectedWeekdays = function() {
                var selectedWeekdays = [];

                for (var i=0;i < $scope.weekdayData.length; i++)
                {
                    if($scope.weekdayData[i].selected)
                    {
                        if($scope.rentalData.force_time_slots === '1')
                        {
                            selectedWeekdays.push({weekday_index: $scope.weekdayData[i].windex,
                                start_time: $scope.weekdayData[i].start_time_data,
                                end_time: $scope.weekdayData[i].end_time_data});
                        }
                        else
                        {
                            for (var a = 0; a < $scope.weekdayData[i].start_time_data.length; a++) {
                                selectedWeekdays.push({weekday_index: $scope.weekdayData[i].weekday_index,
                                    start_time: $scope.weekdayData[i].start_time_data[a],
                                    end_time: $scope.weekdayData[i].end_time_data[a]});
                            }
                        }
                    }
                }

                return selectedWeekdays;
            };

            $scope.getWeekdayData = function() {
                if(angular.isDate($scope.fromDate) && angular.isDate($scope.untilDate)) {
                    $scope.loadingWeekdays.loading = true;

                    var selectedWeekdays = $scope.getSelectedWeekdays();

                    var req = {
                        method: 'POST',
                        url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/reservation/' + $scope.rentalItemID + '/reservationweekday',
                        headers: {
                            'Content-Type': undefined
                        },
                        data: {
                            'start_date': $filter('date')($scope.fromDate, 'yyyy-MM-dd'),
                            'end_date': $filter('date')($scope.untilDate, 'yyyy-MM-dd')
                        }
                    };

                    $http(req)
                        .success(function (data) {
                            var a;

                            if(selectedWeekdays.length > 0) {
                                for (var i = 0; i < selectedWeekdays.length; i++) {

                                    for (a = 0; a < data.weekday_data.length; a++) {
                                        if (selectedWeekdays[i].weekday_index === data.weekday_data[a].weekday_index) {
                                            data.weekday_data[a].selected = true;
                                            break;
                                        }
                                    }
                                }
                            }
                            else if(!$scope.weekdayDataLoaded)
                            {
                                if($scope.rentalData.force_time_slots !== '1')
                                {
                                    for (a = 0; a < data.weekday_data.length; a++) {
                                        data.weekday_data[a].selected = true;
                                    }
                                }
                            }

                            $scope.weekdayDataLoaded = true;

                            $scope.weekdayData = data.weekday_data;

                            $scope.autoOnlineTime.start_time = $scope.weekdayData[0].start_time_data[0];
                            $scope.autoOnlineTime.end_time = $scope.weekdayData[0].end_time_data[0];

                            //console.log('weekdayData', $scope.weekdayData);

                            $scope.loadingWeekdays.loading = false;
                        })
                        .error(function () {
                            $scope.loadingWeekdays.loading = false;
                        });
                }
            };

            $scope.onSearchDateChange = function() {
                if($scope.untilDate < $scope.fromDate)
                {
                    $scope.untilDate = $scope.fromDate;
                }

                $scope.getWeekdayData();
            };

            $scope.getSelectedFacilities = function () {
                var selectedFacilities = [];

                for (var i=0;i < $scope.rentalData.facility_data.length; i++)
                {
                    if($scope.rentalData.facility_data[i].selected)
                    {
                        selectedFacilities.push($scope.rentalData.facility_data[i]);
                    }
                }

                return selectedFacilities;
            };

            $scope.getFacilityAddress = function (facilityItemID)
            {
                var address = '';

                for (var i=0;i < $scope.rentalData.facility_data.length; i++)
                {
                    if($scope.rentalData.facility_data[i].item_id === facilityItemID)
                    {
                        address = $scope.rentalData.facility_data[i].location_address;
                        break;
                    }
                }

                return address;
            };

            $scope.getFacilityFeeData = function (facilityItemID)
            {
                var feeData = [];

                for (var i=0;i < $scope.rentalData.facility_data.length; i++)
                {
                    if($scope.rentalData.facility_data[i].item_id === facilityItemID)
                    {
                        feeData = $scope.rentalData.facility_data[i].fee_data;
                        break;
                    }
                }

                return feeData;
            };

            $scope.getFacilityFeeBookingType = function (facilityItemID)
            {
                var bookingType = '';

                for (var i=0;i < $scope.rentalData.facility_data.length; i++)
                {
                    if($scope.rentalData.facility_data[i].item_id === facilityItemID)
                    {
                        bookingType = $scope.rentalData.facility_data[i].booking_type;
                        break;
                    }
                }

                return bookingType;
            };

            $scope.reloadAddedTime = function(timeData)
            {
                for (var i=0;i < $scope.selectedRentalTimes.rentals.length; i++) {
                    for (var a=0;a < timeData.length; a++) {
                        var timeFound = false;
                        for (var t=0;t < timeData[a].tdata.length; t++) {

                            if(timeData[a].tdata[t].fid === $scope.selectedRentalTimes.rentals[i].fid &&
                                timeData[a].tdata[t].d === $scope.selectedRentalTimes.rentals[i].d &&
                                timeData[a].tdata[t].st24 === $scope.selectedRentalTimes.rentals[i].st24)
                            {
                                timeData[a].tdata[t].added = true;

                                timeFound = true;

                                break;
                            }
                        }

                        if(timeFound)
                        {break;}
                    }
                }

                return timeData;
            };

            $scope.diffDate = function(date1, date2){
                var dateOut1 = new Date(date1); // it will work if date1 is in ISO format
                var dateOut2 = new Date(date2);

                var timeDiff = Math.abs(date2.getTime() - date1.getTime());
                var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                return diffDays;
            };

            $scope.onSearchRentalTimes = function ()
            {
                $scope.formErrors.facilityError = false;
                $scope.formErrors.weekdayError = false;

                $scope.displaySearchResults = false;
                $scope.displayNoResults = false;

                $scope.searchErrorMessage = '';

                $scope.isSearchIconBusy.loading = false;

                $scope.searchResultsData = [];
                $scope.searchRowCollection = [];

                var selectedWeekdays = $scope.getSelectedWeekdays();
                var selectedFacilities = $scope.getSelectedFacilities();

                if(selectedFacilities.length === 0)
                {$scope.formErrors.facilityError = true;}

                if(selectedWeekdays.length === 0)
                {$scope.formErrors.weekdayError = true;}

                var searchStartTime;
                var searchEndTime;

                var totalPackages = 0;

                if($scope.rentalData.online_auto_select_event==='1')
                {
                    totalPackages = $scope.packages.total_packages;

                    if($scope.autoOnlineTime.start_time.length === 0)
                    {searchStartTime = $scope.weekdayData[0].start_time_data[0];}
                    else
                    {searchStartTime = $scope.autoOnlineTime.start_time;}

                    if($scope.autoOnlineTime.end_time.length === 0)
                    {searchEndTime = $scope.weekdayData[0].start_time_data[0];}
                    else
                    {searchEndTime = $scope.autoOnlineTime.end_time;}
                }
                else
                {
                    searchStartTime = $scope.startTime.time;
                    searchEndTime = $scope.endTime.time;
                }

                console.log('searchStartTime', searchStartTime);

                if(!$scope.formErrors.facilityError && !$scope.formErrors.weekdayError &&
                    (searchStartTime < searchEndTime || $scope.rentalData.online_auto_select_event==='1') &&
                    angular.isDate($scope.fromDate) && angular.isDate($scope.untilDate)) {
                    $scope.isSearchIconBusy.loading = true;

                    var req = {
                        method: 'POST',
                        url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/reservation/searchavailiabletimes',
                        headers: {
                            'Content-Type': undefined
                        },
                        data: {
                            rental_code_item_id: $scope.rentalItemID,
                            facilities: selectedFacilities,
                            weekdays: selectedWeekdays,
                            from_date: $filter('date')($scope.fromDate, 'yyyy-MM-dd'),
                            until_date: $filter('date')($scope.untilDate, 'yyyy-MM-dd'),
                            duration: $scope.rentalDuration.selectedTime,
                            start_time: $filter('date')(searchStartTime, 'HH:mm'),
                            end_time:  $filter('date')(searchEndTime, 'HH:mm'),
                            force_order: ($scope.rentalData.force_facility_order=='1')?'true':'false',
                            online_auto_select_event: ($scope.rentalData.online_auto_select_event=='1')?'true':'false',
                            total_packages:  totalPackages
                        }
                    };

                    $http(req)
                        .success(function (data) {
                            //console.log('Search data: ', data);

                            if (data.success) {
                                $scope.isSearchIconBusy.loading = false;

                                //$scope.rentalData.online_auto_select_event=='1'

                                if (data.rowCount > 0)
                                {
                                    //console.log('test_duration', $scope.rentalData.test_duration);
                                    var tempResults = data.results;

                                    for (var i=0;i < tempResults.length; i++) {
                                        for (var t=0;t < tempResults[i].tdata.length; t++) {
                                            tempResults[i].tdata[t].booking_type = $scope.getFacilityFeeBookingType(tempResults[i].tdata[t].fid);
                                            tempResults[i].tdata[t].location_address = $scope.getFacilityAddress(tempResults[i].tdata[t].fid);
                                        }
                                    }

                                    $scope.searchRowCollection = $scope.reloadAddedTime(tempResults);

                                    for (var sr=0;sr < $scope.selectedRentalTimes.rentals.length; sr++)
                                    {
                                        $scope.updateOverlappingEvents($scope.selectedRentalTimes.rentals[sr]);
                                    }

                                    //console.log('search results: ', $scope.searchRowCollection);

                                    $scope.displayNoResults = false;
                                    $scope.displaySearchResults = true;
                                }
                                else
                                {
                                    $scope.displaySearchResults = false;
                                    $scope.displayNoResults = true;
                                }
                            }
                            else if (data.error) {
                                $scope.isSearchIconBusy.loading = false;
                                $scope.displaySearchResults = false;
                                $scope.displayNoResults = false;
                                $scope.searchErrorMessage = data.message;
                            }
                        })
                        .error(function (data) {
                            $scope.isSearchIconBusy.loading = false;
                            $scope.displaySearchResults = false;
                            $scope.displayNoResults = false;

                            //$scope.searchErrorMessage = 'An error occured while processing your search.';
                            $scope.searchErrorMessage = 'No facility rentals found at this time.';
                        });

                    $scope.searchResultsData = [].concat($scope.searchRowCollection);
                }
                else
                {
                    if($scope.startTime.time >= $scope.endTime.time &&  $scope.rentalData.online_auto_select_event!=='1')
                    {
                        $scope.searchErrorMessage = 'Start time cannot be greater than the End time.';
                    }
                    else if($scope.formErrors.facilityError)
                    {
                        $scope.searchErrorMessage = 'Please select at least one facility.';
                    }
                    else if($scope.formErrors.weekdayError)
                    {
                        $scope.searchErrorMessage = 'Please select at least one weekday.';
                    }
                    else if(!angular.isDate($scope.fromDate) || !angular.isDate($scope.untilDate))
                    {
                        $scope.searchErrorMessage = 'Please select a Start/End date.';
                    }
                    else
                    {
                        $scope.searchErrorMessage = 'Make sure all options highlighted red are selected.';
                    }

                    $scope.isSearchIconBusy.loading = false;

                    //$anchorScroll.yOffset = 500;
                    $anchorScroll('pageTop');
                }
            };

            var timeoutInstance;
            $scope.$watch('rentalDurationTemp.selectedTime', function (newVal) {
                if (!isNaN(newVal)) {
                    if (timeoutInstance) {
                        $timeout.cancel(timeoutInstance);
                    }

                    timeoutInstance = $timeout(function () {
                        $scope.rentalDuration.selectedTime = newVal;
                    }, 144);

                }
            });

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

            $scope.removeSelectedRental = function(timeRow) {
                $scope.removeSelectedRentalData(timeRow);

                $scope.checkIfHideBottomPanel();
            };

            $scope.removeSelectedRentalData = function(timeRow)
            {
                var selectedTimeData = $filter('filter')($scope.selectedRentalTimes.rentals, {fgid: timeRow.fgid});

                for (var i=0;i < selectedTimeData.length; i++)
                {
                    var selectedTimeIndex = $scope.selectedRentalTimes.rentals.indexOf(selectedTimeData[i]);

                    if (selectedTimeIndex !== -1) {
                        $scope.selectedRentalTimes.rentals.splice(selectedTimeIndex, 1);
                    }

                    for (var a=0;a < $scope.searchRowCollection.length; a++) {
                        var timeFound = false;
                        for (var t = 0; t <  $scope.searchRowCollection[a].tdata.length; t++) {
                            if($scope.searchRowCollection[a].tdata[t].fid === selectedTimeData[i].fid &&
                                $scope.searchRowCollection[a].tdata[t].d === selectedTimeData[i].d &&
                                $scope.searchRowCollection[a].tdata[t].st24 === selectedTimeData[i].st24)
                            {
                                $scope.searchRowCollection[a].tdata[t].added = false;

                                timeFound = true;

                                break;
                            }
                        }

                        if(timeFound)
                        {break;}
                    }
                }
            };

            $scope.onSelectRentalTime = function onSelectRentalTime(selectedRow, timeRow) {
                var selectedTimeData = $filter('filter')(selectedRow.tdata, {fgid: timeRow.fgid}, true);

                //console.log('selectedTimeData: ', selectedTimeData);

                if($scope.rentalData.online_auto_select_event !== '1')
                {
                    if (!timeRow.added)
                    {
                        timeRow.added = true;

                        $scope.selectedRentalTimes.rentals = $scope.selectedRentalTimes.rentals.concat(selectedTimeData);
                    }
                    else
                    {
                        $scope.removeSelectedRentalData(timeRow);
                    }

                    //console.log('$scope.selectedRentalTimes.rentals: ',  $scope.selectedRentalTimes.rentals);

                    $scope.updateOverlappingEvents(timeRow);

                    if (!$scope.showingToast || angular.isUndefined(toaster.toast)) {
                        toaster.pop({
                            toastId: new Date().getTime(),
                            toasterId: '2',
                            type: 'list',
                            title: '',
                            body: 'undo',
                            timeout: 0,
                            clickHandler: function (toaster, isCloseButton) {

                                return isCloseButton;
                            },
                            onShowCallback: function () {
                                $scope.showingToast = true;
                            },
                            onHideCallback: function () {
                                $scope.showingToast = false;
                            },
                            bodyOutputType: 'directive'
                        });
                    }

                    $scope.checkIfHideBottomPanel();
                }
                else
                {
                    $scope.gotoRentalAddons(selectedTimeData);
                }
            };

            $scope.checkIfHideBottomPanel = function () {
                if ($scope.selectedRentalTimes.rentals.length <= 0)
                {
                    toaster.clear('*');
                }
            };

            $scope.onAcceptRentalTimes = function () {
                $scope.gotoRentalAddons($scope.selectedRentalTimes.rentals);
            };

            $scope.gotoRentalAddons = function (rentalTimes) {
                var selectedRentalData = {};

                selectedRentalData.rental_code_item_id = $scope.rentalItemID;
                selectedRentalData.auto_approve = $scope.rentalData.auto_approve;
                selectedRentalData.online_auto_select_event = $scope.rentalData.online_auto_select_event;
                selectedRentalData.package_data = $scope.packageData;

                //console.log ('selectedRentalData: ', selectedRentalData);
                //console.log('$scope.selectedRentalTimes.rentals: ',  $scope.selectedRentalTimes.rentals);

                ReservationFactory.setReservationData(selectedRentalData);

                ReservationFactory.setReservationTimes(rentalTimes);

                $location.path('/' + $routeParams.orgurl + '/reservationaddons');
            };

            $rootScope.$on('reviewSelTimesEvent', function (event) {
                //$anchorScroll.yOffset = 100;
                $anchorScroll('selRentalTimes');
            });

            $rootScope.$on('continueProcessEvent', function (event) {
                $scope.onAcceptRentalTimes();
            });

            $scope.getGroupedSum = function(items) {
                return items
                    .map(function(x) { return x.fee_amount; })
                    .reduce(function(a, b) { return a + b; });
            };

            $scope.onPackageChangeEvent = function()
            {
                var totalPackages = 0;

                console.log($scope.packageData);

                for (var i = 0; i < $scope.packageData.length; i++)
                {
                    if(!angular.isUndefined($scope.packageData[i]) && !angular.isUndefined($scope.packageData[i].qty) && $scope.packageData[i].qty != '' &&
                        angular.isNumber(parseInt($scope.packageData[i].qty)) && parseInt($scope.packageData[i].qty) >= 0)
                    {
                        totalPackages += parseInt($scope.packageData[i].qty);
                    }
                    else
                    {
                        $scope.packageData[i].qty = '';
                    }
                }

                $scope.packages.total_packages = totalPackages;
            };
        }])

    .directive('undo', function($rootScope) {
        return {
            link: function(scope) {
                scope.reviewSelTimes = function() {
                    $rootScope.$emit('reviewSelTimesEvent');
                };
                scope.continueProcess = function() {
                    $rootScope.$emit('continueProcessEvent');
                };
            },
            template: '<div class="container">'+
            '<div class="col-md-6 text-center"><a class="text-center clickable" ' +
            'style="font-size: 20px !important" ' +
            'ng-click="reviewSelTimes()"><u>Review Selected Times</u></a></div>'+
            '<div class="col-md-6 text-center"><a class="text-center clickable" '+
            'style="font-size: 20px !important" ' +
            'ng-click="continueProcess()"><u>Accept Times and Continue</u></a></div></div>'
        };
    });
