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

            $scope.facilityArray = [];

            for(var ia=0; ia < $scope.facilityData.facility_ids.length; ia++)
            {
                $scope.facilityArray.push(false);
                /*if($scope.facilityData.force_facility_order)
                {
                    $scope.facilityArray.push(true);
                }
                else
                {

                }*/
            }

            //console.log('FACILITYDATA');
            //console.log($scope.facilityData);

            $scope.durationSlider = {
                ceil: $scope.facilityData.max_hour,
                floor: $scope.facilityData.min_hour};

            $scope.rentalDuration = {selectedTime:  $scope.facilityData.min_hour};

            $timeout(function () {
                $scope.renderSlider = true;
            }, 500, false);

            $scope.weekdaySearch2 = [];

            $scope.weekdaySearch2[0]=false;
            $scope.weekdaySearch2[1]=false;
            $scope.weekdaySearch2[2]=false;
            $scope.weekdaySearch2[3]=false;
            $scope.weekdaySearch2[4]=false;
            $scope.weekdaySearch2[5]=false;
            $scope.weekdaySearch2[6]=false;

            $scope.fromDate = $scope.facilityData.search_start_date;
            $scope.untilDate = $scope.facilityData.search_end_date;

            $scope.startTime = new Date($scope.facilityData.search_start_time);
            $scope.endTime = new Date($scope.facilityData.search_end_time);

            for (var i = 0; i < $scope.facilityData.weekday_indexes.length; i++) {
                if ($scope.facilityData.weekday_indexes[i] === '0') {
                    $scope.weekdaySearch.sunday = true;
                    $scope.weekdaySearch2[0]=false;
                }
                else if ($scope.facilityData.weekday_indexes[i] === '1') {
                    $scope.weekdaySearch.monday = true;
                    $scope.weekdaySearch2[1]=false;
                }
                else if ($scope.facilityData.weekday_indexes[i] === '2') {
                    $scope.weekdaySearch.tuesday = true;
                    $scope.weekdaySearch2[2]=false;
                }
                else if ($scope.facilityData.weekday_indexes[i] === '3') {
                    $scope.weekdaySearch.wednesday = true;
                    $scope.weekdaySearch2[3]=false;
                }
                else if ($scope.facilityData.weekday_indexes[i] === '4') {
                    $scope.weekdaySearch.thursday = true;
                    $scope.weekdaySearch2[4]=false;
                }
                else if ($scope.facilityData.weekday_indexes[i] === '5') {
                    $scope.weekdaySearch.friday = true;
                    $scope.weekdaySearch2[5]=false;
                }
                else if ($scope.facilityData.weekday_indexes[i] === '6') {
                    $scope.weekdaySearch.saturday = true;
                    $scope.weekdaySearch2[6]=false;
                }
            }

            $scope.getWeekdaysString = function (weekdayIndex)
            {
                var weekdaysString = '';

                switch(weekdayIndex) {
                    case '0':
                        weekdaysString = 'Mon';
                        break;
                    case '1':
                        weekdaysString = 'Tue';
                        break;
                    case '2':
                        weekdaysString = 'Wed';
                        break;
                    case '3':
                        weekdaysString = 'Thu';
                        break;
                    case '4':
                        weekdaysString = 'Fri';
                        break;
                    case '5':
                        weekdaysString = 'Sat';
                        break;
                    case '6':
                        weekdaysString = 'Sun';
                        break;
                }

                return weekdaysString;
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

                ////console.table( $scope.selectedSearchFacilities.facilities);
                var facilitySearchString = '';

                for (var i=0;i < $scope.facilityArray.length; i++) {
                    if($scope.facilityArray[i]) {
                        if (facilitySearchString !== '') {
                            facilitySearchString += ', ';
                        }
                        facilitySearchString += $scope.facilityData.facility_ids[i];
                    }
                }

                return facilitySearchString;
            };

            $scope.convertDateTo24Hour = function (date)
            {
                var elem = date.split(' ');
                var stSplit = elem[0].split(":");// alert(stSplit);
                var stHour = stSplit[0];
                var stMin = stSplit[1];
                var stAmPm = elem[1];

                if (stAmPm=='PM')
                {
                    if (stHour!=12)
                    {
                        stHour=stHour*1+12;
                    }

                }else if(stAmPm=='AM' && stHour=='12'){
                    stHour = stHour -12;
                }
                else {
                    stHour = stHour;
                }

                if(stHour < 10) {
                    return '0' + stHour + ':' + stMin;
                }
                else {
                    return stHour + ':' + stMin;
                }
            }


            $scope.onSearchRentalTimes = function ()
            {
                /*var totalFacilitiesSel = 0;
                for(var i=0;i < $scope.facilityArray.length; i++)
                {
                    if($scope.facilityArray[i])
                    {
                        totalFacilitiesSel++;
                    }
                }*/

                //console.log('totalFacilitiesSel:  '+totalFacilitiesSel);
                console.log($scope.facilityData);

                $scope.displaySearchResults = false;
                $scope.displayNoResults = false;

                $scope.searchErrorMessage = '';
                $scope.isSearchIconBusy = true;

                $scope.searchResultsData = [];
                $scope.searchRowCollection = [];
                $scope.searchSelectedTimeData = [];

                var facilitySearchString = $scope.getFacilitySearchString();

                $scope.translate = function (value) {
                    return $filter('time')(value, 'mm', 'hh:mm aa', true, false);
                };

                var tempStartTime = $filter('date')($scope.startTime, 'HH:mm');
                var tempEndTime = $filter('date')($scope.endTime, 'HH:mm');

                //var weekdaysString = $scope.getWeekdaysString();

                var weekdayData = [];
                for(var i=0;i < $scope.facilityData.weekday_indexes2.length; i++)
                {
                    if($scope.weekdaySearch2[$scope.facilityData.weekday_indexes[i]])
                    {
                        var day = {'day': $scope.getWeekdaysString($scope.facilityData.weekday_indexes[i]),
                            'start_time': $scope.convertDateTo24Hour($scope.facilityData.weekday_start[i]),
                            'end_time': $scope.convertDateTo24Hour($scope.facilityData.weekday_end[i])};

                        weekdayData.push(day);
                    }
                }

                console.log('weekdayData');
                console.log(weekdayData);

                //var timeDiff = (($scope.endTime.getTime() / 1000.0) - ($scope.startTime.getTime() / 1000.0))/60;

                //console.log(tempStartTime + '   |   ' + timeDiff);

                $scope.isSearchIconBusy = false;

               var rentalCodeSearch = $scope.facilityData.rental_code_item_id;

                /*var totalMins = 0;
                for (var a = 0; a < $scope.facilityData.min_hours.length; a++) {
                    totalMins += parseInt($scope.facilityData.min_hours[a]);
                }

                if(totalMins > 0)
                {timeDiff = totalMins;}*/

                var req = {
                    method: 'POST',
                    url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/reservation/searchavailiabletimes',
                    headers: {
                        'Content-Type': undefined
                    },
                    data: {
                        rental_code: rentalCodeSearch,
                        facilities: facilitySearchString,
                        from_date: $filter('date')($scope.fromDate, 'yyyy-MM-dd'),
                        until_date: $filter('date')($scope.untilDate, 'yyyy-MM-dd'),
                        duration: $scope.rentalDuration.selectedTime,
                        start_time: tempStartTime,
                        end_time: tempEndTime,
                        weekdays: weekdayData
                    }
                };

                $http(req)
                    .success(function (data) {

                        //console.log(data);
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
                            //$scope.searchErrorMessage = data.message;
                        }
                    })
                    .error(function (data) {
                        /*$scope.searchSelectedTimeData = [];
                        $scope.searchRowCollection = [];
                        $scope.searchResultsData = [];

                        $scope.isSearchIconBusy = false;
                        $scope.displaySearchResults = false;
                        $scope.displayNoResults = false;

                        $scope.searchErrorMessage = data;*/
                    });

                $scope.searchResultsData = [].concat($scope.searchRowCollection);

                //console.log($scope.searchResultsData);
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

                console.log('facility data: ' );

                var feeAmount = 0;
                var selectedFacilities = [];
                for (var i=0;i < $scope.facilityArray.length; i++) {
                    if ($scope.facilityArray[i]) {
                        feeAmount += (timeDiff * $scope.facilityData.facility_fees[i].per_hour_amount);

                        // console.log($scope.facilityData.facility_fees[i]);
                        //$scope.facilityData.facility_ids[i].fee_amount = feeAmount;
                        selectedFacilities.push($scope.facilityData.facility_ids[i]);
                    }
                }

                //console.log('feeAmount: ' + feeAmount);

                $scope.searchSelectedTimeData.fee_amount = feeAmount;

                $scope.searchSelectedTimeData.selectedFacilityIds = selectedFacilities;
                reservationTimeService.set($scope.searchSelectedTimeData);

                $location.path('/' + $routeParams.orgurl + '/reservationaddons');

                /*var $userID = ActiveUser.userData.user_id;

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
                    submitData.totalCharge =  $scope.facilityData.fee_amount;
                    submitData.waivers = [];
                    submitData.members = [];

                    submitData.fees = [];
                    submitData.fees[0] = {};
                    submitData.fees[0].itemFeeID =  $scope.facilityData.item_fee_id;
                    submitData.fees[0].feeAmount =  $scope.facilityData.fee_amount;

                    var tempDate = new Date($scope.searchSelectedTimeData.check_date + 'T' + $scope.searchSelectedTimeData.start_check_time_24);
                    //var tempTime = new Date('1970-01-01T'+$scope.searchSelectedTimeData.start_check_time_24);

                    //console.log(tempDate);
                    //console.log(tempTime);

                   // var startDate = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDay(), tempTime.getHours(), tempTime.getMinutes(), 40);
                    var startDate = tempDate;

                    submitData.events = [];

                    var eventData = {};
                    for (var i = 0; i < $scope.facilityData.facility_ids.length; i++) {

                        var endDate = new Date(startDate);

                        endDate.AddHours($scope.facilityData.min_hours[i]);

                        //console.log(startDate);
                        //console.log(endDate);

                        eventData = {};
                        eventData = {
                            'facility_item_id' :$scope.facilityData.facility_ids[i],
                            'event_start': $scope.formatMySQLDate(startDate),
                            'event_end': $scope.formatMySQLDate(endDate)
                        };

                        submitData.events.push(eventData);

                        startDate.AddHours($scope.facilityData.min_hours[i]) ;
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