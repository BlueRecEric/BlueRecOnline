'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:RequestReservation
 * @description
 * # RequestReservation
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
    .controller('RequestReservation', ['$scope', '$http', '$location', 'BLUEREC_ONLINE_CONFIG', '$routeParams', '$modal', '$q', '$timeout',
        '$filter', '$anchorScroll', 'moment', 'ActiveUser', 'reservationService',
        function ($scope, $http, $location, BLUEREC_ONLINE_CONFIG, $routeParams, $modal, $q, $timeout, $filter, $anchorScroll, moment, ActiveUser, reservationService) {

            $scope.displaySearchResults = false;
            $scope.displayNoResults = false;

            $scope.searchResultsData = [];
            $scope.searchRowCollection = [];

            $scope.displayApprovedRentals = false;

            $scope.approvedRentalData = [];
            $scope.approvedRentalCollection = [];

            $scope.userLoggedIn = false;

            $scope.userLoggedIn = ActiveUser.isLoggedIn();

            $scope.searchPanelActive = -1;

            $scope.searchDisabled = true;

            $scope.searchErrorMessage = '';

            $scope.facilitySearchItems = [];

            $scope.selectedSearchFacilities = {
                facilities: []
            };

            $scope.fromDate = new Date();
            $scope.untilDate = new Date();
            //$scope.fromDate = new Date();
            //$scope.untilDate = new Date($scope.fromDate).setDate($scope.fromDate.getDate()+1);

            $scope.timeRangeStartSelected = 420;
            $scope.timeRangeEndSelected = 1260;
            //$scope.timeRangeStartSelected = 600;
            //$scope.timeRangeEndSelected = 960;

            $scope.timeSlider = {
                floor: 420,
                ceil: 1260
            };

            $scope.durationSelected = 30;
            $scope.durationSlider = {
                ceil: 840,
                floor: 0
            };

            $scope.weekdaySearch = {
                sunday: true,
                monday: true,
                tuesday: true,
                wednesday: true,
                thursday: true,
                friday: true,
                saturday: true
            };

            $scope.isSearchIconBusy = false;

            $scope.contactCheckAlert = false;

            $scope.hideBasicInfo = true;

            $scope.displayPackages = false;
            $scope.displayCustomFields = false;

            $scope.rentalCodeSearch = '';

            $scope.rentalCodeSelected = '';
            $scope.rentalDescription = 'This is an example description.';

            $scope.reservationDetails = '';
            $scope.reservationNotes = '';

            $scope.phoneNumber = '';
            $scope.emailAddress = '';
            $scope.contactMethod = '';

            $scope.selectedDate = new Date();
            $scope.selectedDate2 = {'start':  new Date(), 'end':  new Date()};

            Date.prototype.AddDays = function(noOfDays) {
                this.setTime(this.getTime() + (noOfDays * (1000 * 60 * 60 * 24)));
                return this;
            };

            $scope.selectedDate2.end.AddDays(10);

            $scope.startTime = new Date(1970, 0, 1, 9, 0, 40);
            $scope.endTime = new Date(1970, 0, 1, 9, 0, 40);

            $scope.selectedTime = {'startTime':  new Date(1970, 0, 1, 9, 0, 40), 'endTime':  new Date(1970, 0, 1, 9, 0, 40)};

            //$scope.endTime = moment('2015-09-16 16:00:00');

            $scope.depositAmount = 0.00;

            $scope.feeAmount = 0.00;
            $scope.feeItemID = 0;

            $scope.eventSource = [];

            $scope.rentalPackages = [];
            $scope.rentalCustomFields = [];

            $scope.durationError = false;
            $scope.timeFrameError = false;
            $scope.weekdaysError = false;

            $scope.itemsByPage = 15;

            $scope.searchSelectedTimeData = [];
            $scope.searchSelectedFacItemID = '';

            var deferred;

            var selectTimeModal = $modal({
                scope: $scope,
                controller: 'selectTimeCtrl',
                template: 'selectRentalTime.html',
                placement: 'center',
                show: false
            });
            var selectTimeModalShow = selectTimeModal.show;

            selectTimeModal.show = function () {
                deferred = $q.defer();
                selectTimeModalShow();
                return deferred.promise;
            };

            $scope.onSearchCancelSelectTime = function () {
                deferred.resolve();
                selectTimeModal.hide();
            };

            $scope.onSearchSelectRentalTime = function (timeRow) {
                deferred.resolve(timeRow);
                selectTimeModal.hide();
            };

            $scope.onSelectRentalTime = function (selectedRow) {
                //selectedRow.iconBusy = !selectedRow.iconBusy;
                ////console.table(selectedRow);

                $scope.searchSelectedTimeData = selectedRow;

                if ($scope.searchSelectedTimeData.available_time_slots > 1) {
                    selectTimeModal.show().then(function (res) {
                        $scope.searchRentalTimeSelected(res);
                    });
                }
                else {
                    $scope.searchRentalTimeSelected($scope.searchSelectedTimeData.time_data[0]);
                }
            };



            var selectTimeModal2 = $modal({
                scope: $scope,
                controller: 'selectTimeCtrl',
                template: 'selectTime.html',
                placement: 'center',
                show: false
            });

            $scope.selectedRentalCodeRow = [];
            $scope.selectedFacItem = 0;

            var selectTimeModalShow2 = selectTimeModal2.show;

            selectTimeModal2.show = function () {
                deferred = $q.defer();
                selectTimeModalShow2();
                return deferred.promise;
            };

            $scope.onCancelSelectTime = function () {
                $scope.selectedRentalCodeRow = [];
                $scope.selectedFacItem = 0;

                deferred.resolve();
                selectTimeModal2.hide();
            };

            $scope.onSelectTime = function (timeRow) {
                deferred.resolve(timeRow);
                selectTimeModal2.hide();
            };

            $scope.onFacilityClick = function(rentalCodeRow, facItemID, setPageID, facilityRow) {
                $scope.selectTimePageID = setPageID;

                console.log(facilityRow);

                reservationService.set(facilityRow);

                //console.log( $scope.selectedTime);
                $scope.selectedTime = {'startTime':  new Date(1970, 0, 1, facilityRow.start_time_hour, facilityRow.start_time_minutes, 40),
                    'endTime':  new Date(1970, 0, 1, facilityRow.end_time_hour, facilityRow.end_time_minutes, 40)};

                var foundFacData = [];

                for (var i = 0; i < rentalCodeRow.facility_data.length; i++) {
                    if (rentalCodeRow.facility_data[i].item_id === facItemID) {
                        foundFacData = rentalCodeRow.facility_data[i];

                    }
                }

                $scope.selectedRentalCodeRow = rentalCodeRow;
                $scope.selectedFacItem = foundFacData;
                $scope.rentalPackages = rentalCodeRow.packageForm;
                $scope.rentalCustomFields = rentalCodeRow.customForm;

                selectTimeModal2.show().then(function (res) {
                    //$scope.searchRentalTimeSelected(res);
                });
            };

            $scope.selectTimePageID = 0;

            $scope.onSelectTimeContinue = function() {

                $scope.selectTimePageID =  $scope.selectTimePageID + 1;

                //console.log('selectTimePageID:  '+$scope.selectTimePageID);

                if($scope.selectTimePageID === 1)
                {
                    var tempFacData = reservationService.get();

                    //tempFacData.search_start_date = $filter('date')($scope.selectedDate2.start, 'yyyy-MM-dd') + ' ' + $scope.selectedTime.startTime;
                    //tempFacData.search_end_date = $filter('date')($scope.selectedDate2.end, 'yyyy-MM-dd') + ' ' + $scope.startTime;

                    tempFacData.search_start_date = $scope.selectedDate2.start;
                    tempFacData.search_end_date = $scope.selectedDate2.end;

                    tempFacData.search_start_time = $scope.selectedTime.startTime;
                    tempFacData.search_end_time = $scope.selectedTime.endTime;

                    //tempFacData['available_start_date'] = $scope.formatMySQLDate($scope.selectedDate, $scope.startTime);
                    //tempFacData['available_end_date'] = $scope.formatMySQLDate($scope.selectedDate, $scope.endTime);

                    reservationService.set(tempFacData);

                    $scope.selectedRentalCodeRow = [];
                    $scope.selectedFacItem = 0;

                    deferred.resolve();
                    selectTimeModal2.hide();

                    $location.path('/' +  $routeParams.orgurl + '/reservationtimes');
                }
            };

            $scope.anchorRentalCode = false;

            $scope.searchRentalTimeSelected = function (selectedTime) {
                if (selectedTime !== undefined) {

                    var startTimeSelected = moment($scope.searchSelectedTimeData.check_date + ' ' + selectedTime.start_time_24);
                    var endTimeSelected = moment($scope.searchSelectedTimeData.check_date + ' ' + selectedTime.end_time_24);

                    var rentalData = [];

                    for (var i = 0; i < $scope.rentalDropDown.length; i++) {
                        if ($scope.rentalDropDown[i].item_id === $scope.rentalCodeSearch) {
                            rentalData = $scope.rentalDropDown[i];
                        }
                    }

                    console.log(rentalData);

                    $scope.onFacilityClick(rentalData, $scope.searchSelectedTimeData.facility_item_id, 1);

                    /*$scope.rentalCodeSelected = $scope.rentalCodeSearch;
                    $scope.searchSelectedFacItemID = $scope.searchSelectedTimeData.facility_item_id;

                    $scope.anchorRentalCode = true;

                    $scope.selectedDate = startTimeSelected;

                    $scope.startTime = new Date(startTimeSelected);
                    $scope.endTime = new Date(endTimeSelected);

                    $scope.displaySearchResults = false;
                    $scope.displayNoResults = false;
                    $scope.searchResultsData = [];
                    $scope.searchRowCollection = [];
                    $scope.searchSelectedTimeData = [];

                    $scope.searchPanelActive = -1;

                    var promise = loadNewRental();
                    promise.then(function () {
                    });*/
                }
            };

            var loadRentalDeferred;

            function loadNewRental() {
                loadRentalDeferred = $q.defer();

                $scope.setNewRental(false);

                return loadRentalDeferred.promise;
            }

            $scope.setSelectedSearchFacility = function () {
                var facChecked = false;
                if ($scope.searchSelectedFacItemID !== '' && $scope.searchSelectedFacItemID !== undefined) {
                    for (var i = 0; i < $scope.rentalFacilities.length; i++) {
                        if ($scope.rentalFacilities[i].item_id === $scope.searchSelectedFacItemID) {
                            $scope.rentalFacilities[i].checked = true;
                            facChecked = true;
                        }
                        else {
                            $scope.rentalFacilities[i].checked = false;
                        }
                    }

                    $scope.searchSelectedFacItemID = '';
                }

                if (facChecked) {
                    $scope.onFacilityChecked();
                }
            };

            $scope.translate = function (value) {
                return $filter('time')(value, 'mm', 'hh:mm aa', true, false);
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

            $scope.onSliderChange = function () {
                //console.log('changed', $scope.priceSlider);
            };

            $anchorScroll('pageTop');

            $http.post(BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/reservation/requestreservation')
                .success(function (data) {
                    $scope.rentalDropDown = data;
                    console.log($scope.rentalDropDown);
                });

            $scope.agreementSigned = {
                'checked': false
            };

            $scope.getFacilityString = function () {

                var $facilityString = '';

                for (var i = 0; i < $scope.rentalFacilities.length; i++) {
                    if ($scope.rentalFacilities[i].checked) {
                        if ($facilityString !== '') {
                            $facilityString += ',';
                        }
                        $facilityString += $scope.rentalFacilities[i].item_id;
                    }
                }

                return $facilityString;
            };

            $scope.setNewRental = function (bSearching) {
                var useRentalCode;
                //console.log($scope.rentalCodeSearch);

                if (bSearching) {
                    useRentalCode = $scope.rentalCodeSearch;
                }
                else {
                    useRentalCode = $scope.rentalCodeSelected;
                }

                if (useRentalCode !== '' && useRentalCode !== undefined) {
                    if (!bSearching) {
                        console.log(useRentalCode);
                        if(useRentalCode === '7656')
                        {
                            $scope.depositAmount = 400.00;
                            $scope.rentalDescription = 'This is an example description.';
                        }
                        else
                        {
                            $scope.depositAmount = 200.00;
                            $scope.rentalDescription = 'This is a long description that takes several lines.';
                        }

                        $scope.displayPackages = false;
                        $scope.displayCustomFields = false;

                        var index, len;

                        for (index = 0, len = $scope.rentalDropDown.length; index < len; ++index) {

                            if ($scope.rentalDropDown[index].item_id === useRentalCode) {

                                $scope.rentalDescription = $scope.rentalDropDown[index].rental_code_description;
                                if ($scope.rentalDescription === '') {
                                    //$scope.rentalDescription = 'N/A';
                                }
                            }
                        }
                    }
                    else {
                        console.log('test 2');
                        $scope.facilitySearchItems = [];
                        $scope.selectedSearchFacilities.facilities = [];
                    }

                    var req = {
                        method: 'GET',
                        url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/reservation/' + useRentalCode + '/reservationfacilities',
                        headers: {
                            'Content-Type': undefined
                        },
                        data: {'uid': ActiveUser.userData.user_id}
                    };

                    $http(req)
                        .success(function (data) {
                            //console.table(data);

                            if (!bSearching) {
                                $scope.rentalFacilities = data;

                                $scope.setSelectedSearchFacility();
                                $scope.setPackages();
                                $scope.setCustomFields();

                                $scope.hideBasicInfo = false;

                                if (loadRentalDeferred !== undefined) {
                                    loadRentalDeferred.resolve();
                                }

                                if ($scope.anchorRentalCode) {
                                    $scope.anchorRentalCode = false;
                                    $timeout(function () {
                                        $scope.gotoAnchor('rentalCodeType', 35);
                                    }, 500, false);
                                }
                            }
                            else {
                                $scope.facilitySearchItems = data;

                                if ($scope.facilitySearchItems.length > 0) {
                                    $scope.searchDisabled = false;
                                }
                                else {
                                    $scope.searchDisabled = true;
                                }
                            }
                        });
                }

                //console.log('useRentalCode: '+useRentalCode);

                if (useRentalCode === '' || useRentalCode === undefined) {
                    if (!bSearching) {
                        $scope.resetForm();
                    }
                    else {
                        $scope.facilitySearchItems = [];
                        $scope.selectedSearchFacilities.facilities = [];
                    }
                }
            };

            $scope.setPackages = function () {
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
                        console.log(data);

                        $scope.rentalPackages = data.packageForm;

                        if ($scope.rentalPackages.length > 0) {
                            $scope.displayPackages = true;
                        }
                    });
            };

            $scope.setCustomFields = function () {
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
                        // //console.table(data);

                        $scope.rentalCustomFields = data.customForm;

                        if ($scope.rentalCustomFields.length > 0) {
                            $scope.displayCustomFields = true;
                        }
                    });
            };

            $scope.formatMySQLDate = function (formatDate, formatTime) {
                //Grab each of your components
                var yyyy = formatDate.getFullYear().toString();
                var MM = (formatDate.getMonth() + 1).toString();
                var dd = formatDate.getDate().toString();
                var hh = formatTime.getHours().toString();
                var mm = formatTime.getMinutes().toString();
                var ss = formatTime.getSeconds().toString();

                //Returns your formatted result
                return yyyy + '-' + (MM[1] ? MM : '0' + MM[0]) + '-' + (dd[1] ? dd : '0' + dd[0]) + ' ' + (hh[1] ? hh : '0' + hh[0]) + ':' + (mm[1] ? mm : '0' + mm[0]) + ':00';
            };

            $scope.calculateFeeAmount = function () {
                ////console.table($scope.rentalFacilities);

                var newFeeAmount = 0;

                $scope.feeItemID = 0;

                for (var i = 0; i < $scope.rentalFacilities.length; i++) {
                    if ($scope.rentalFacilities[i].checked) {
                        newFeeAmount = Number(newFeeAmount) + Number($scope.rentalFacilities[i].fee_amount);
                        $scope.feeItemID = $scope.rentalFacilities[i].item_fee_id;
                    }
                }

                console.log($scope.feeItemID);

                var timeDiff = ($scope.endTime.getTime() / 1000.0) - ($scope.startTime.getTime() / 1000.0);

                $scope.feeAmount = newFeeAmount * ((timeDiff / 60) / 60);
            };

            $scope.onFacilityChecked = function () {
                var $facilityString = $scope.getFacilityString();

                if ($facilityString !== '') {

                    var req = {
                        method: 'POST',
                        url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/reservation/reservationavailability',
                        headers: {
                            'Content-Type': undefined
                        },
                        data: {'facilities': $facilityString}
                    };

                    $http(req).success(function (data) {
                        //console.log($facilityString);
                        $scope.eventSource = data;
                        //console.log($scope.eventSource[2]);
                        ////console.table($scope.eventSource);
                    });

                }
                else {
                    $scope.eventSource = null;

                    ////console.table($scope.eventSource);
                }

               // $scope.$broadcast('eventSourceElementChanged');

                $scope.calculateFeeAmount();
            };

            $scope.timeChanged = function () {
                //$scope.calculateFeeAmount();
            };

            $scope.changeMode = function (mode) {
                $scope.mode = mode;
            };

            $scope.changeMode('month');

            $scope.today = function () {
                $scope.currentDate = new Date();
            };

            $scope.isToday = function () {
                var today = new Date(),
                    currentCalendarDate = new Date($scope.currentDate);

                today.setHours(0, 0, 0, 0);
                currentCalendarDate.setHours(0, 0, 0, 0);
                return today.getTime() === currentCalendarDate.getTime();
            };

            $scope.onSubmitRequest = function () {
                ////console.table($scope.rentalCustomFields);
                if ($scope.agreementSigned.checked) {
                    $scope.contactCheckAlert = false;

                    var $userID = ActiveUser.userData.user_id;

                    if ($scope.rentalCodeSelected !== '' && $userID) {
                        var $facilityString = $scope.getFacilityString();

                        var submitData = {};
                        submitData.request_id = 1;
                        submitData.householdID = ActiveUser.userData.household_id;
                        submitData.itemID = $scope.rentalCodeSelected;
                        submitData.userID = ActiveUser.userData.user_id;
                        submitData.addedByUserID = ActiveUser.userData.user_id;
                        submitData.usePaymentPlan = '0';
                        submitData.itemType = 'rental code';
                        submitData.familyMembership = '0';
                        submitData.totalCharge = $scope.feeAmount+$scope.depositAmount;
                        submitData.waivers = [];
                        submitData.members = [];

                        submitData.fees = [];
                        submitData.fees[0] = {};
                        submitData.fees[0].itemFeeID = 1;
                        submitData.fees[0].feeAmount = $scope.feeAmount+$scope.depositAmount;

                        var req = {
                            method: 'POST',
                            url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/reservation/' + $scope.rentalCodeSelected + '/addtocart',
                            headers: {
                                'Content-Type': undefined
                            },
                            data: submitData
                        };

                        $http(req)
                            .success(function (data) {
                                $scope.rentalCodeSelected = '';

                                $scope.resetForm();

                                $scope.showConformationModal();

                                //$scope.getUserApprovedRequests();

                                // //console.table(data);

                                /*$scope.approvedRentalCollection = data;

                                 if($scope.approvedRentalCollection.length > 0) {
                                 $scope.displayApprovedRentals = true;
                                 }*/
                            });

                        /*var req = {
                            method: 'POST',
                            url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/reservation/submitreservationrequest',
                            headers: {
                                'Content-Type': undefined
                            },
                            data: {
                                'rental_code_item_id': $scope.rentalCodeSelected,
                                'user_id': $userID,
                                'facilityString': $facilityString,
                                'startTime': $scope.formatMySQLDate($scope.selectedDate, $scope.startTime),
                                'endTime': $scope.formatMySQLDate($scope.selectedDate, $scope.endTime),
                                'details': $scope.reservationDetails,
                                'notes': $scope.reservationNotes,
                                'phoneNumber': $scope.phoneNumber,
                                'emailAddress': $scope.emailAddress,
                                'contactMethod': $scope.contactMethod,
                                'feeAmount': $scope.feeAmount,
                                'feeItemID': $scope.feeItemID
                            }
                        };

                        $http(req)
                            .success(function () {
                                //console.log( $scope.eventSource);

                                $scope.rentalCodeSelected = '';

                                $scope.resetForm();

                                $scope.showConformationModal();
                            });*/
                    }
                }
                else {
                    $scope.contactCheckAlert = true;
                }
            };

            $scope.resetForm = function () {
                if ($scope.rentalCodeSelected === '' || $scope.rentalCodeSelected === undefined) {
                    $scope.rentalCodeSelected = '';
                    $scope.hideBasicInfo = true;

                    $scope.displayPackages = false;
                    $scope.displayCustomFields = false;

                    $scope.rentalPackages = [];
                    $scope.rentalCustomFields = [];
                    $scope.eventSource = [];

                    $scope.reservationDetails = '';
                    $scope.reservationNotes = '';

                    $scope.phoneNumber = '';
                    $scope.emailAddress = '';
                    $scope.contactMethod = '';

                    $scope.agreementSigned.checked = false;
                }
            };

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

            $scope.gotoAnchor = function (anchorID, offset) {
                $anchorScroll.yOffset = offset;

                //$location.hash(anchorID);
                $anchorScroll(anchorID);
            };

            $scope.weekdayChecked = function () {

            };

            $scope.onSearchPanelOpen = function () {
                $timeout(function () {
                   // $scope.$broadcast('reCalcViewDimensions');
                   // $scope.$broadcast('rzSliderForceRender');
                }, 100, false);
            };

            $scope.getFacilitySearchString = function () {

                ////console.table( $scope.selectedSearchFacilities.facilities);
                var facilitySearchString = '';

                for (var i = 0; i < $scope.selectedSearchFacilities.facilities.length; i++) {
                    if (facilitySearchString !== '') {
                        facilitySearchString += ',';
                    }
                    facilitySearchString += $scope.selectedSearchFacilities.facilities[i].item_id;
                }

                return facilitySearchString;
            };

            $scope.getWeekdaysString = function () {
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


            $scope.onSearchRentalTimes = function (searchValid) {
                //console.log('searchValid:  ' + searchValid);
                if ($scope.durationSelected === 0) {
                    $scope.durationError = true;
                }
                else {
                    $scope.durationError = false;
                }

                if ($scope.timeRangeStartSelected === $scope.timeRangeEndSelected) {
                    $scope.timeFrameError = true;
                }
                else {
                    $scope.timeFrameError = false;
                }

                if ($scope.weekdaySearch.sunday || $scope.weekdaySearch.monday || $scope.weekdaySearch.tuesday || $scope.weekdaySearch.wednesday ||
                    $scope.weekdaySearch.thursday || $scope.weekdaySearch.friday || $scope.weekdaySearch.saturday) {
                    $scope.weekdaysError = false;
                }
                else {
                    $scope.weekdaysError = true;
                }

                if (searchValid && !$scope.durationError && !$scope.timeFrameError && !$scope.weekdaysError) {
                    if ($scope.isSearchIconBusy === false) {
                        $scope.displaySearchResults = false;
                        $scope.displayNoResults = false;

                        $scope.searchErrorMessage = '';
                        $scope.isSearchIconBusy = true;

                        $scope.searchResultsData = [];
                        $scope.searchRowCollection = [];
                        $scope.searchSelectedTimeData = [];

                        var facilitySearchString = $scope.getFacilitySearchString();

                        var tempStartTime = $filter('time')($scope.timeRangeStartSelected, 'mm', 'H:mm', true, true);
                        var tempEndTime = $filter('time')($scope.timeRangeEndSelected, 'mm', 'H:mm', true, true);

                        var weekdaysString = $scope.getWeekdaysString();

                        var req = {
                            method: 'POST',
                            url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/reservation/searchavailiabletimes',
                            headers: {
                                'Content-Type': undefined
                            },
                            data: {
                                rental_code: $scope.rentalCodeSearch,
                                facilities: facilitySearchString,
                                from_date: $filter('date')($scope.fromDate, 'yyyy-MM-dd') + ' ' + tempStartTime,
                                until_date: $filter('date')($scope.untilDate, 'yyyy-MM-dd') + ' ' + tempEndTime,
                                duration: $scope.durationSelected,
                                start_time: tempStartTime,
                                end_time: tempEndTime,
                                weekdays: weekdaysString
                            }
                        };

                        $http(req)
                            .success(function (data) {
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
                    }
                }
                else {
                    $scope.searchErrorMessage = 'Please fill out the fields highlighted red before searching.';
                }
            };

            /*$scope.$watch('searchPanelActive', function(newValue, oldValue) {
             if (newValue !== oldValue) {

             console.log('searchPanelActive:  '+newValue);
             if(newValue === -1)
             {
             $scope.gotoAnchor('rentalCodeType', 0);
             }
             }
             });*/

            //$scope.setNewRental(true);

            /*$scope.selectedSearchFacilities = {
             facilities: [{'item_id':'267','item_name':'Bay 1','checked':false,'fee_amount':'10.00','item_fee_id':'48','fee_id':'5'},
             {'item_id':'54','item_name':'Challenge Center','checked':false,'fee_amount':'10.00','item_fee_id':'48','fee_id':'5'}]
             };*/

            $scope.getUserApprovedRequests = function () {
                $scope.displayApprovedRentals = false;

                $scope.approvedRentalData = [];
                $scope.approvedRentalCollection = [];

                var req = {
                    method: 'POST',
                    url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/reservation/approvedreservations',
                    headers: {
                        'Content-Type': undefined
                    },
                    data: {'uid': ActiveUser.userData.user_id}
                };

                $http(req)
                    .success(function (data) {
                        // //console.table(data);

                        $scope.approvedRentalCollection = data;

                        if ($scope.approvedRentalCollection.length > 0) {
                            $scope.displayApprovedRentals = true;
                        }
                    });

                $scope.approvedRentalData = [].concat($scope.approvedRentalCollection);
            };

            if ($scope.userLoggedIn) {
                $scope.getUserApprovedRequests();
            }

            $scope.onSelectApprovedRental = function (selectedRow) {

                //console.table(selectedRow);

                var submitData = {};
                submitData.request_id = selectedRow.request_id;
                submitData.householdID = ActiveUser.userData.household_id;
                submitData.itemID = selectedRow.rental_code_item_id;
                submitData.userID = ActiveUser.userData.user_id;
                submitData.addedByUserID = ActiveUser.userData.user_id;
                submitData.usePaymentPlan = '0';
                submitData.itemType = 'RENTAL CODE';
                submitData.familyMembership = '0';
                submitData.totalCharge = selectedRow.fee_estimate;
                submitData.waivers = [];
                submitData.members = [];

                submitData.fees = [];
                if (selectedRow.item_fee_id !== 0 && selectedRow.item_fee_id !== null) {
                    submitData.fees[0] = {};
                    submitData.fees[0].itemFeeID = selectedRow.item_fee_id;
                    submitData.fees[0].feeAmount = selectedRow.fee_estimate;
                }

                var req = {
                    method: 'POST',
                    url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/reservation/' + selectedRow.rental_code_item_id + '/addtocart',
                    headers: {
                        'Content-Type': undefined
                    },
                    data: submitData
                };

                $http(req)
                    .success(function (data) {
                        $scope.getUserApprovedRequests();

                        // //console.table(data);

                        /*$scope.approvedRentalCollection = data;

                         if($scope.approvedRentalCollection.length > 0) {
                         $scope.displayApprovedRentals = true;
                         }*/
                    });
            };

            console.timeEnd('request reservation load time');

            $scope.mapClicked = function(test) {
                if(test === 1)
                {
                    $scope.rentalCodeSelected = '49';
                    $scope.setNewRental(false);
                   // $scope.searchSelectedFacItemID = $scope.searchSelectedTimeData.facility_item_id;
                }
                else if(test === 2)
                {
                    $scope.rentalCodeSelected = '7656';
                    $scope.setNewRental(false);
                   /// $scope.searchSelectedFacItemID = $scope.searchSelectedTimeData.facility_item_id;
                }

                console.log('mapClicked');
            };
        }])

    .config(function ($dropdownProvider) {
        angular.extend($dropdownProvider.defaults, {
            html: true
        });
    })

    .filter('time', function () {

        var conversions = {
            'ss': angular.identity,
            'mm': function (value) {
                return value * 60;
            },
            'hh': function (value) {
                return value * 3600;
            }
        };

        var padding = function (value, length) {
            var zeroes = length - ('' + (value)).length,
                pad = '';
            while (zeroes-- > 0) {
                pad += '0';
            }
            return pad + value;
        };

        return function (value, unit, format, isPadded, armyTime) {
            var aa = 'AM';
            var totalSeconds = conversions[unit || 'ss'](value),
                hh = Math.floor(totalSeconds / 3600),
                mm = Math.floor((totalSeconds % 3600) / 60),
                ss = totalSeconds % 60;

            if (!armyTime) {
                if (hh >= 12) {
                    aa = 'PM';
                    hh = hh - 12;
                    if (hh === 0) {
                        hh = 12;
                    }
                }
                else {
                    aa = 'AM';
                    if (hh === 0) {
                        hh = 12;
                    }
                }
            }
            else {
                if (hh < 10) {
                    hh = '0' + hh;
                }
            }

            format = format || 'hh:mm:ss';
            isPadded = angular.isDefined(isPadded) ? isPadded : true;
            //hh = isPadded? padding(hh, 2): hh;
            mm = isPadded ? padding(mm, 2) : mm;
            ss = isPadded ? padding(ss, 2) : ss;

            if (armyTime) {
                return format.replace(/H/, hh).replace(/mm/, mm).replace(/ss/, ss);
            }
            else {
                return format.replace(/hh/, hh).replace(/mm/, mm).replace(/ss/, ss).replace(/aa/, aa);
            }
        };
    })

    .directive('arrayRequired', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, elem, attrs, ngModel) {

                ngModel.$validators.arrayRequired = function (modelValue, viewValue) {
                    return (modelValue !== undefined && modelValue.length > 0 ? true : false);
                };

            }
        };
    })

    .directive('stRatio', function () {
        return {
            link: function (scope, element, attr) {
                var ratio = +(attr.stRatio);

                element.css('width', ratio + '%');
            }
        };
    })

    .directive('bsManualTooltip', function ($window, $location, $sce, $tooltip, $$rAF) {

        return {
            scope: true,
            link: function postLink(scope, element, attr, transclusion) {

                // Directive options
                var options = {scope: scope};
                angular.forEach(['template', 'contentTemplate', 'placement', 'container', 'target', 'delay', 'trigger', 'keyboard', 'html', 'animation', 'type'], function (key) {
                    if (angular.isDefined(attr[key])) options[key] = attr[key];
                });

                // Observe scope attributes for change
                angular.forEach(['title'], function (key) {
                    attr.$observe(key, function (newValue, oldValue) {
                        scope[key] = $sce.trustAsHtml(newValue);
                        angular.isDefined(oldValue) && $$rAF(function () {
                            tooltip && tooltip.$applyPlacement();
                        });
                    });
                });

                // Manual toggling support
                attr.bsShow && scope.$watch(attr.bsShow, function (newValue, oldValue) {
                    if (!tooltip || !angular.isDefined(newValue)) return;
                    newValue ? tooltip.show() : tooltip.hide();
                });

                // Initialize popover
                var tooltip = $tooltip(element, options);

                // Garbage collection
                scope.$on('$destroy', function () {
                    tooltip.destroy();
                });

            }
        };
    });