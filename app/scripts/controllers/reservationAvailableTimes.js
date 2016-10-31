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

            //console.log('itemid: ' + $routeParams.itemid);

            $scope.formErrors = [];
            $scope.formErrors.facilityError = false;
            $scope.formErrors.weekdayError = false;

            $scope.loadingWeekdays = [];
            $scope.loadingWeekdays.loading = false;

            $scope.rentalDataLoaded = false;

            $scope.rentalData = [];
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

            Date.prototype.AddDays = function(noOfDays) {
             this.setTime(this.getTime() + (noOfDays * (1000 * 60 * 60 * 24)));
             return this;};

            $scope.minDate = new Date();
            $scope.minDate.AddDays(-1);

            $scope.fromDate = new Date();
            $scope.untilDate = new Date();
            //$scope.untilDate.AddDays(1);

            $scope.startTime = new Date();
            $scope.startTime.setHours(8);
            $scope.startTime.setMinutes(0);

            $scope.endTime = new Date();
            $scope.endTime.setHours(16);
            $scope.endTime.setMinutes(0);

            $scope.itemsByPage = 50;

            $scope.showingToast = false;

            $timeout(function () {
                $scope.renderSlider = true;
            }, 500, false);

            $scope.getRentalData = function() {
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
                        //console.log('getRentalData:');
                        //console.log(data);

                        $scope.rentalData = data.rental_data;

                        if($scope.rentalData.force_facility_order === '1')
                        {
                            for (var i=0;i < $scope.rentalData.facility_data.length; i++)
                            {
                                $scope.rentalData.facility_data[i].selected = true;
                            }
                        }

                        //console.log('Rental Data:');
                        //console.log($scope.rentalData);

                        $scope.durationSlider = {
                            ceil: $scope.rentalData.max_hour,
                            floor: $scope.rentalData.min_hour};

                        $scope.rentalDuration = {selectedTime:  $scope.rentalData.min_hour};
                        $scope.rentalDurationTemp = {selectedTime:  $scope.rentalData.min_hour};

                        $scope.rentalDataLoaded = true;
                    })
                    .error(function (){
                        $scope.errorLoadingRental = true;
                        $scope.rentalDataLoaded = false;
                    });
            };

            $scope.getRentalData();

            $scope.weekdayData = [];

            $scope.getSelectedWeekdays = function() {
                var selectedWeekdays = [];

                //console.log('weekdayData:  ');
                //console.log($scope.weekdayData);

                for (var i=0;i < $scope.weekdayData.length; i++)
                {
                    if($scope.weekdayData[i].selected)
                    {
                        //console.log($scope.weekdayData);
                        for (var a=0;a < $scope.weekdayData[i].start_time_data.length; a++)
                        {
                            selectedWeekdays.push({weekday_index: $scope.weekdayData[i].weekday_index,
                                start_time:   $scope.weekdayData[i].start_time_data[a],
                                end_time:   $scope.weekdayData[i].end_time_data[a]});
                        }
                    }
                }

                return selectedWeekdays;
            };

            $scope.getWeekdayData = function() {
                $scope.loadingWeekdays.loading = true;

                var selectedWeekdays = $scope.getSelectedWeekdays();

                var req = {
                    method: 'POST',
                    url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/reservation/' + $scope.rentalItemID + '/reservationweekday',
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
                        //console.log(data);
                        //console.log(selectedWeekdays);
                        for (var i=0;i < selectedWeekdays.length; i++) {

                            for (var a=0;a < data.weekday_data.length; a++) {
                                if (selectedWeekdays[i].weekday_index === data.weekday_data[a].weekday_index) {
                                    data.weekday_data[a].selected = true;
                                    break;
                                }
                            }
                        }

                        $scope.weekdayData = data.weekday_data;


                        $scope.loadingWeekdays.loading = false;
                    })
                    .error(function (){
                        $scope.loadingWeekdays.loading = false;
                    });
            };

            $scope.getWeekdayData();

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

            $scope.onSearchRentalTimes = function ()
            {
                //console.log($scope.rentalData.facility_data);

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

                //console.log('selectedFacilities:  ');
                //console.log(selectedFacilities);

                if(selectedFacilities.length === 0)
                {$scope.formErrors.facilityError = true;}

                if(selectedWeekdays.length === 0)
                {$scope.formErrors.weekdayError = true;}

                if(!$scope.formErrors.facilityError && !$scope.formErrors.weekdayError && $scope.startTime < $scope.endTime) {
                    $scope.isSearchIconBusy.loading = true;

                    //console.log('search submit data');
                    /*//console.log({
                     rental_code_item_id: $scope.rentalItemID,
                     facilities: selectedFacilities,
                     weekdays: selectedWeekdays,
                     from_date: $filter('date')($scope.fromDate, 'yyyy-MM-dd'),
                     until_date: $filter('date')($scope.untilDate, 'yyyy-MM-dd'),
                     duration: $scope.rentalDuration.selectedTime,
                     start_time: $filter('date')($scope.startTime, 'HH:mm'),
                     end_time:  $filter('date')($scope.endTime, 'HH:mm')
                     });*/

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
                            start_time: $filter('date')($scope.startTime, 'HH:mm'),
                            end_time:  $filter('date')($scope.endTime, 'HH:mm'),
                            force_order: ($scope.rentalData.force_facility_order=='1')
                        }
                    };

                    $http(req)
                        .success(function (data) {
                            //console.log('search results: ');
                            //console.log(data);

                            if (data.success) {
                                $scope.isSearchIconBusy.loading = false;

                                if (data.rowCount > 0) {
                                    var tempResults = data.results;

                                    for (var i=0;i < tempResults.length; i++) {
                                        for (var t=0;t < tempResults[i].tdata.length; t++) {

                                            var tokenPayload = angular.copy(jwtHelper.decodeToken(tempResults[i].tdata[t].token));

                                            var feeData = $scope.getFacilityFeeData(tokenPayload.fid);

                                            var perHourFeeAmt = 0;

                                            if(!angular.isUndefined(feeData) && feeData !== null)
                                            {
                                                for (var f=0;f < feeData.length; f++) {
                                                    perHourFeeAmt += feeData[f].per_hour_amount * (tokenPayload.dur / 60);
                                                }
                                            }

                                            var newTDate = {
                                                token: tempResults[i].tdata[t].token,
                                                d: tempResults[i].d,
                                                lf_date: tempResults[i].lf_date,
                                                sf_date: tempResults[i].sf_date,
                                                st: tokenPayload.st,
                                                st24: tokenPayload.st24,
                                                et: tokenPayload.et,
                                                et24: tokenPayload.et24,
                                                fid: tokenPayload.fid,
                                                fname: tokenPayload.fname,
                                                dur: tokenPayload.dur,
                                                added: tokenPayload.added,
                                                fee_data: feeData,
                                                fee_amount: perHourFeeAmt,
                                                booking_type: $scope.getFacilityFeeBookingType(tokenPayload.fid),
                                                location_address: $scope.getFacilityAddress(tokenPayload.fid),
                                                eg: tempResults[i].tdata[t].eg};

                                            tempResults[i].tdata[t] = newTDate;
                                        }
                                    }

                                    $scope.searchRowCollection = tempResults;

                                    //console.log('search results: ');
                                    //console.log($scope.searchRowCollection);

                                    $scope.displayNoResults = false;
                                    $scope.displaySearchResults = true;
                                }
                                else {
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

                            $scope.searchErrorMessage = 'There was an issue while processing your search.  We are working to resolve the issue.';
                        });

                    $scope.searchResultsData = [].concat($scope.searchRowCollection);
                }
                else
                {
                    $scope.isSearchIconBusy.loading = false;

                    $scope.searchErrorMessage = 'Please select at least one option for the following items highlighted red.';

                    //$anchorScroll.yOffset = 500;
                    //$anchorScroll('pageTop');
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

            /*$scope.onWeekdayChange = function() {
             var selectedWeekdays = $scope.getSelectedWeekdays();
             if($scope.formErrors.weekdayError && selectedWeekdays.length > 0)
             {$scope.formErrors.weekdayError = false;}
             };*/

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

            /*var confirmationModal = $modal({
             scope: $scope,
             template: 'confirmation.html',
             show: false,
             animation: 'am-fade-and-scale',
             placement: 'bottom'
             });

             $scope.showConformationModal = function () {
             confirmationModal.$promise.then(confirmationModal.show);
             };*/

            /*Date.prototype.AddHours = function(noOfHours) {
             this.setTime(this.getTime() + (noOfHours * (1000 * 60* 60)));
             return this;
             };*/

            /*$scope.formatMySQLDate = function (formatDate) {
             //Grab each of your components
             var yyyy = formatDate.getFullYear().toString();
             var MM = (formatDate.getMonth() + 1).toString();
             var dd = formatDate.getDate().toString();
             var hh = formatDate.getHours().toString();
             var mm = formatDate.getMinutes().toString();
             //var ss = formatDate.getSeconds().toString();

             //Returns your formatted result
             return yyyy + '-' + (MM[1] ? MM : '0' + MM[0]) + '-' + (dd[1] ? dd : '0' + dd[0]) + ' ' + (hh[1] ? hh : '0' + hh[0]) + ':' + (mm[1] ? mm : '0' + mm[0]) + ':00';
             };*/

            $scope.removeSelectedRental = function removeSelectedRental(selectedRow) {
                var index = $scope.selectedRentalTimes.rentals.indexOf(selectedRow);

                if (index !== -1) {
                    $scope.selectedRentalTimes.rentals.splice(index, 1);
                }

                //console.log(selectedRow);

                //console.log('search data');

                console.log($scope.searchRowCollection);

                for (var i=0;i < $scope.searchRowCollection.length; i++)
                {
                    //console.log($scope.searchRowCollection[i].tdata);

                    index = $scope.searchRowCollection[i].tdata.indexOf(selectedRow);
                    $scope.searchRowCollection[i].tdata[index].added = false;

                    break;
                }
            };

            $scope.collection = [{
                name: 'test1'}, {
                name: 'test2'}, {
                name: 'test3'
            }];

            $scope.onSelectRentalTime = function onSelectRentalTime(selectedRow, timeRow) {

                if (!timeRow.added)
                {
                    timeRow.added = true;

                    $scope.selectedRentalTimes.rentals.push(timeRow);
                }
                else
                {
                    var index = $scope.selectedRentalTimes.rentals.indexOf(timeRow);

                    $scope.selectedRentalTimes.rentals.splice(index, 1);

                    timeRow.added = false;
                }

                if(!$scope.showingToast || angular.isUndefined(toaster.toast))
                {
                    toaster.pop({
                        toastId:  new Date().getTime(),
                        toasterId: '2',
                        type: 'list',
                        title: '',
                        body: 'undo',
                        timeout: 0,
                        clickHandler: function (toaster, isCloseButton) {
                            console.log('toaster:');
                            console.log(toaster);
                            console.log('isCloseButton:');
                            console.log(isCloseButton);

                            $anchorScroll.yOffset = 100;
                            $anchorScroll('selRentalTimes');
                            return isCloseButton; // or false to prevent hiding the toast

                            //toaster.toastId = null;

                            //return isCloseButton;
                        },
                        onShowCallback: function () {
                            console.log('onShowCallback');
                            $scope.showingToast = true;
                            console.log(toaster.toastId);
                        },
                        onHideCallback: function () {
                            console.log('onHideCallBack');
                            $scope.showingToast = false;
                            console.log(toaster.toastId);
                        },
                        bodyOutputType: 'directive',
                        directiveData: {
                            item: $scope.collection[1],
                            collection: $scope.collection
                        }
                    });
                }

                //console.log('selectedRentalTimes.times');
                //console.log($scope.selectedRentalTimes.rentals);

                /*
                 }
                 else{
                 toaster.toast.title = timeRow.d + ' ' + timeRow.st + '-' + timeRow.et + ' @' + timeRow.fname;
                 //toaster.toast.title = timeRow.d + ' ' + timeRow.st + '-' + timeRow.et + ' @' + timeRow.fname;
                 }*/

                //$anchorScroll.yOffset = 500;

                //$anchorScroll(anchorToPoint);

                //selectedRow.iconBusy = !selectedRow.iconBusy;

                //$scope.searchSelectedTimeData = selectedRow;

                //var tempDate = new Date($scope.searchSelectedTimeData.check_date + 'T' + $scope.searchSelectedTimeData.start_check_time_24);
                //var tempDate2 = new Date($scope.searchSelectedTimeData.check_date + 'T' + $scope.searchSelectedTimeData.end_check_time_24);

                //var timeDiff = ((tempDate2.getTime() / 1000.0) - (tempDate.getTime() / 1000.0))/60;
                //timeDiff = timeDiff / 60;

                //var feeAmount = 0;
                //var selectedFacilities = [];
                /*for (var i=0;i < $scope.facilityArray.length; i++) {
                 if ($scope.facilityArray[i]) {
                 feeAmount += (timeDiff * $scope.rentalData.facility_fees[i].per_hour_amount);

                 //console.log($scope.rentalData.facility_fees[i]);
                 //$scope.rentalData.facility_ids[i].fee_amount = feeAmount;
                 selectedFacilities.push($scope.rentalData.facility_ids[i]);
                 }
                 }*/

                //console.log('feeAmount: ' + feeAmount);

                //$scope.searchSelectedTimeData.fee_amount = feeAmount;

                //$scope.searchSelectedTimeData.selectedFacilityIds = selectedFacilities;

                //reservationTimeService.set($scope.searchSelectedTimeData);

                //$location.path('/' + $routeParams.orgurl + '/reservationaddons');

                /*var $userID = ActiveUser.userData.user_id;

                 if ($scope.rentalItemID !== '' && $userID) {
                 //var $facilityString = $scope.getFacilityString();

                 //console.log($scope.rentalItemID);

                 var submitData = {};
                 submitData.request_id = 1;
                 submitData.householdID = ActiveUser.userData.household_id;
                 submitData.itemID = $scope.rentalItemID;
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

            $scope.onAcceptRentalTimes = function ()
            {
                var selectedRentalData = {};

                selectedRentalData.rental_code_item_id = $scope.rentalItemID;
                selectedRentalData.auto_approve = $scope.rentalData.auto_approve;

                //console.log(selectedRentalData);

                ReservationFactory.setReservationData(selectedRentalData);

                ReservationFactory.setReservationTimes($scope.selectedRentalTimes.rentals);

                $location.path('/' + $routeParams.orgurl + '/reservationaddons');
            };

            $rootScope.$on('reviewSelTimesEvent', function (event) {
                $anchorScroll.yOffset = 100;
                $anchorScroll('selRentalTimes');
            });

            $rootScope.$on('continueProcessEvent', function (event) {
                $scope.onAcceptRentalTimes();
            });
        }])

    .directive('undo', function($rootScope) {
        return {
            link: function(scope) {
                scope.reviewSelTimes = function() {
                    console.log('reviewSelTimes');
                    $rootScope.$emit('reviewSelTimesEvent');
                };
                scope.continueProcess = function() {
                    console.log('continueProcess');
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
