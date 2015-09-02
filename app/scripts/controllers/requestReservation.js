'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:RequestReservation
 * @description
 * # RequestReservation
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
    .controller('RequestReservation', ['$scope', '$http',  'BLUEREC_ONLINE_CONFIG', '$routeParams', '$modal','$timeout', '$filter', '$anchorScroll', 'ActiveUser',
        function ($scope, $http, BLUEREC_ONLINE_CONFIG, $routeParams, $modal,$timeout,$filter, $anchorScroll, ActiveUser) {

            $scope.searchRentalTypeTT = {tip: 'Start your search by first selecting the Rental Type you wish to search for.', checked: true};
            $scope.showSearchRentalTypeTT= {show:true};

            $scope.displaySearchResults=false;

            $scope.searchResultsData= [{iconBusy: false, facility_name: 'Challenge Center', date: '08/29/2015', from: '10:00 AM', to: '2:00 PM'},
                {iconBusy: false, facility_name: 'Challenge Center', date: '08/29/2015', from: '10:00 AM', to: '10:30 AM'},
                {iconBusy: false, facility_name: 'Challenge Center', date: '08/29/2015', from: '10:30 AM', to: '11:00 AM'},
                {iconBusy: false, facility_name: 'Challenge Center', date: '08/29/2015', from: '11:00 AM', to: '11:30 AM'},
                {iconBusy: false, facility_name: 'Challenge Center', date: '08/29/2015', from: '11:30 AM', to: '12:00 PM'},
                {iconBusy: false, facility_name: 'Challenge Center', date: '08/29/2015', from: '12:00 PM', to: '12:30 PM'},
                {iconBusy: false, facility_name: 'Challenge Center', date: '08/29/2015', from: '12:30 PM', to: '1:00 PM'},
                {iconBusy: false, facility_name: 'Challenge Center', date: '08/29/2015', from: '1:00 PM', to: '1:30 PM'},
                {iconBusy: false, facility_name: 'Challenge Center', date: '08/29/2015', from: '1:30 PM', to: '2:00 PM'}];

            $scope.userLoggedIn=false;

            $scope.userLoggedIn=ActiveUser.isLoggedIn();

            $scope.searchPanelActive = -1;

            $scope.searchDisabled=true;

            $scope.facilitySearchItems = [];
            $scope.selectedSearchFacilities = [];

            $scope.fromDate = ''; // &lt;- {{ getType('fromDate') }}
            $scope.untilDate = '';

            $scope.timeRangeStartSelected = 420;
            $scope.timeRangeEndSelected = 1260;

            $scope.timeSlider = {
                floor: 420,
                ceil: 1260
            };

            $scope.durationSelected = 0;
            $scope.durationSlider = {
                ceil: 840,
                floor: 0
            };

            $scope.isSearchIconBusy = false;

            $scope.buttonClick = function () {
                $scope.isSearchIconBusy = !$scope.isSearchIconBusy;
            };

            $scope.translate = function(value)
            {
                return $filter('time')(value, 'mm', 'hh:mmaa', true);
            };

            $scope.translateDuration = function(value)
            {
                var label = value;

                if(value < 60)
                {label = value + ' mins';}
                if(value >= 60)
                {
                    var totalSeconds = value * 60;

                    var hours = Math.floor(totalSeconds / 3600);
                    var minutes = Math.floor((totalSeconds % 3600) / 60);

                    label = hours;

                    if(hours === 1)
                    {label += ' hr';}
                    else
                    {label += ' hrs';}

                    if(minutes > 0)
                    {
                        label += ' ' + minutes;

                        if(minutes === 1)
                        {label += ' min';}
                        else
                        {label += ' mins';}
                    }
                }
                return label;
            };

            $scope.onSliderChange = function()
            {
                console.log('changed', $scope.priceSlider);
            };

            $scope.contactCheckAlert=false;

            $scope.hideBasicInfo=true;

            $scope.displayPackages=false;
            $scope.displayCustomFields=false;

            $scope.rentalCodeSearch = '';

            $scope.facilitySearchItems=[];
            $scope.selectedSearchFacilities.facilities=[];

            $scope.rentalDescription = 'N/A';

            $scope.reservationDetails = '';
            $scope.reservationNotes = '';

            $scope.phoneNumber = '';
            $scope.emailAddress = '';
            $scope.contactMethod = '';

            $scope.selectedDate= new Date();

            $scope.startTime = new Date(1970, 0, 1, 9, 0, 40);
            $scope.endTime = new Date(1970, 0, 1, 9, 0, 40);

            $scope.feeAmount = 0.00;

            $scope.eventSource=[];

            $scope.rentalPackages=[];
            $scope.rentalCustomFields=[];

            $anchorScroll('pageTop');

            $http.post(BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/reservation/requestreservation')
                .success(function (data) {
                    $scope.rentalDropDown = data;
                    // //console.log( $scope.rentalDropDown[1]);
                });

            $scope.agreementSigned = {
                'checked': false
            };

            $scope.getFacilityString = function(){

                var $facilityString='';

                for(var i = 0; i < $scope.rentalFacilities.length; i++)
                {
                    if($scope.rentalFacilities[i].checked)
                    {
                        if($facilityString !== '')
                        {$facilityString += ',';}
                        $facilityString += $scope.rentalFacilities[i].item_id;
                    }
                }

                return $facilityString;
            };

            $scope.setNewRental = function(bSearching)
            {
                if($scope.rentalCodeSearch !== '')
                {
                    if(!bSearching) {
                        $scope.displayPackages = false;
                        $scope.displayCustomFields = false;

                        var index, len;

                        for (index = 0, len = $scope.rentalDropDown.length; index < len; ++index) {
                            if ($scope.rentalDropDown[index].item_id === $scope.rentalCodeSearch) {
                                $scope.rentalDescription = $scope.rentalDropDown[index].rental_code_description;
                                if ($scope.rentalDescription === '') {
                                    $scope.rentalDescription = 'N/A';
                                }
                            }
                        }
                    }
                    else
                    {
                        $scope.showSearchRentalTypeTT={show:false};

                        $scope.facilitySearchItems=[];
                        $scope.selectedSearchFacilities.facilities=[];
                    }

                    var req = {
                        method: 'POST',
                        url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/reservation/'+$scope.rentalCodeSearch+'/reservationfacilities',
                        headers: {
                            'Content-Type': undefined
                        },
                        data: {'uid': ActiveUser.userData.user_id}
                    };

                    $http(req)
                        .success(function (data) {
                            //console.table(data);

                            if(!bSearching) {
                                $scope.rentalFacilities = data;

                                $scope.setPackages();
                                $scope.setCustomFields();

                                $scope.hideBasicInfo=false;
                            }
                            else
                            {
                                $scope.facilitySearchItems = data;

                                if($scope.facilitySearchItems.length > 0)
                                {$scope.searchDisabled=false;}
                                else
                                {$scope.searchDisabled=true;}

                                //$scope.showSearchRentalTypeTT={show:true};
                            }
                        });
                }

                if(!bSearching) {
                    if ($scope.rentalCodeSearch === '') {
                        $scope.resetForm();
                    }
                }
            };

            $scope.setPackages = function()
            {

                var req = {
                    method: 'POST',
                    url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/item/'+$scope.rentalCodeSearch+'/packages',
                    headers: {
                        'Content-Type': undefined
                    },
                    data: {'uid': ActiveUser.userData.user_id}
                };

                $http(req)
                    .success(function (data) {
                        //console.table(data);

                        $scope.rentalPackages = data.packageForm;

                        if($scope.rentalPackages.length > 0)
                        {
                            $scope.displayPackages = true;
                        }
                    });
            };

            $scope.setCustomFields = function()
            {
                var req = {
                    method: 'POST',
                    url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/item/'+$scope.rentalCodeSearch+'/customfields',
                    headers: {
                        'Content-Type': undefined
                    },
                    data: {'uid': ActiveUser.userData.user_id}
                };

                $http(req)
                    .success(function (data) {
                        // console.table(data);

                        $scope.rentalCustomFields = data.customForm;

                        if($scope.rentalCustomFields.length > 0)
                        {
                            $scope.displayCustomFields = true;
                        }
                    });
            };

            $scope.formatMySQLDate = function(formatDate, formatTime) {
                //Grab each of your components
                var yyyy = formatDate.getFullYear().toString();
                var MM = (formatDate.getMonth()+1).toString();
                var dd  = formatDate.getDate().toString();
                var hh = formatTime.getHours().toString();
                var mm = formatTime.getMinutes().toString();
                var ss = formatTime.getSeconds().toString();

                //Returns your formatted result
                return yyyy + '-' + (MM[1]?MM:'0'+MM[0]) + '-' + (dd[1]?dd:'0'+dd[0]) + ' ' + (hh[1]?hh:'0'+hh[0]) + ':' + (mm[1]?mm:'0'+mm[0]) + ':00';
            };

            $scope.calculateFeeAmount = function()
            {
                //console.table($scope.rentalFacilities);

                var newFeeAmount = 0;

                for(var i = 0; i < $scope.rentalFacilities.length; i++)
                {
                    if($scope.rentalFacilities[i].checked)
                    {
                        newFeeAmount = Number(newFeeAmount) + Number($scope.rentalFacilities[i].fee_amount);
                    }
                }

                var timeDiff=($scope.endTime.getTime()/1000.0)-($scope.startTime.getTime()/1000.0);

                $scope.feeAmount = newFeeAmount*((timeDiff/60)/60);
            };


            $scope.onFacilityChecked = function()
            {
                var $facilityString = $scope.getFacilityString();

                if($facilityString !== '')
                {

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
                        console.log($scope.eventSource[2]);
                        console.table($scope.eventSource);
                    });

                }
                else
                {
                    $scope.eventSource = null;

                    //console.table($scope.eventSource);
                }

                $scope.$broadcast('eventSourceElementChanged');

                $scope.calculateFeeAmount();
            };

            $scope.timeChanged = function()
            {
                $scope.calculateFeeAmount();
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

            $scope.onSubmitRequest = function()
            {
                console.table($scope.rentalCustomFields);
                if($scope.agreementSigned.checked)
                {
                    $scope.contactCheckAlert = false;

                    var $userID = ActiveUser.userData.user_id;

                    if($scope.rentalCodeSearch !== '' && $userID)
                    {
                        var $facilityString = $scope.getFacilityString();

                        var req = {
                            method: 'POST',
                            url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/reservation/submitreservationrequest',
                            headers: {
                                'Content-Type': undefined
                            },
                            data: {
                                'rental_code_item_id': $scope.rentalCodeSearch,
                                'user_id': $userID,
                                'facilityString': $facilityString,
                                'startTime': $scope.formatMySQLDate($scope.selectedDate, $scope.startTime),
                                'endTime': $scope.formatMySQLDate($scope.selectedDate, $scope.endTime),
                                'details': $scope.reservationDetails,
                                'notes': $scope.reservationNotes,
                                'phoneNumber': $scope.phoneNumber,
                                'emailAddress': $scope.emailAddress,
                                'contactMethod': $scope.contactMethod,
                                'feeAmount': $scope.feeAmount
                            }
                        };

                        $http(req)
                            .success(function () {
                                //console.log( $scope.eventSource);

                                $scope.rentalCodeSearch = '';

                                $scope.resetForm();

                                $scope.showConformationModal();
                            });
                    }
                }
                else
                {
                    $scope.contactCheckAlert=true;
                }
            };

            $scope.resetForm = function() {
                if($scope.rentalCodeSearch === '')
                {
                    $anchorScroll('pageTop');

                    $scope.hideBasicInfo=true;

                    $scope.displayPackages=false;
                    $scope.displayCustomFields=false;

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

            var confirmationModal = $modal({scope: $scope, template: 'confirmation.html', show: false, animation: 'am-fade-and-scale', placement: 'bottom'});

            $scope.showConformationModal = function() {
                confirmationModal.$promise.then(confirmationModal.show);
            };

            $scope.gotoAnchor = function(anchorID, offset) {

                $anchorScroll.yOffset = offset;
                $anchorScroll(anchorID);
            };

            $scope.weekdayChecked = function() {

            };

            $scope.onSearchWindowOpenEvent = function() {
                $timeout(function() {

                    $scope.$broadcast('reCalcViewDimensions');
                    $scope.$broadcast('rzSliderForceRender');

                    $scope.showSearchRentalTypeTT.show=true;
                }, 100, false);

            };

            $scope.onSearchRentalTimes = function() {
                $scope.isSearchIconBusy = !$scope.isSearchIconBusy;

                $scope.displaySearchResults = true;
            };

            $scope.onSelectRentalTime = function(selectedRow) {
                selectedRow.iconBusy = !selectedRow.iconBusy;
            };

        }])

    .config(function($dropdownProvider) {
        angular.extend($dropdownProvider.defaults, {
            html: true
        });
    })

    .filter('time', function() {

        var conversions = {
            'ss': angular.identity,
            'mm': function(value) { return value * 60; },
            'hh': function(value) { return value * 3600;}
        };

        var padding = function(value, length) {
            var zeroes = length - ('' + (value)).length,
                pad = '';
            while(zeroes-- > 0) {pad += '0';}
            return pad + value;
        };

        return function(value, unit, format, isPadded) {
            var aa='AM';
            var totalSeconds = conversions[unit || 'ss'](value),
                hh = Math.floor(totalSeconds / 3600),
                mm = Math.floor((totalSeconds % 3600) / 60),
                ss = totalSeconds % 60;

            if(hh>=12)
            {
                aa='PM';
                hh=hh-12;
                if(hh===0)
                {hh=12;}
            }
            else
            {
                aa='AM';
                if(hh===0)
                {hh=12;}
            }

            format = format || 'hh:mm:ss';
            isPadded = angular.isDefined(isPadded)? isPadded: true;
            //hh = isPadded? padding(hh, 2): hh;
            mm = isPadded? padding(mm, 2): mm;
            ss = isPadded? padding(ss, 2): ss;


            return format.replace(/hh/, hh).replace(/mm/, mm).replace(/ss/, ss).replace(/aa/, aa);
        };
    })

    .directive('bsManualTooltip', function($window, $location, $sce, $tooltip, $$rAF) {

        return {
            scope: true,
            link: function postLink(scope, element, attr, transclusion) {

                // Directive options
                var options = {scope: scope};
                angular.forEach(['template', 'contentTemplate', 'placement', 'container', 'target', 'delay', 'trigger', 'keyboard', 'html', 'animation', 'type'], function(key) {
                    if(angular.isDefined(attr[key])) options[key] = attr[key];
                });

                // Observe scope attributes for change
                angular.forEach(['title'], function(key) {
                    attr.$observe(key, function(newValue, oldValue) {
                        scope[key] = $sce.trustAsHtml(newValue);
                        angular.isDefined(oldValue) && $$rAF(function() {
                            tooltip && tooltip.$applyPlacement();
                        });
                    });
                });

                // Manual toggling support
                attr.bsShow && scope.$watch(attr.bsShow, function(newValue, oldValue) {
                    if(!tooltip || !angular.isDefined(newValue)) return;
                    newValue ? tooltip.show() : tooltip.hide();
                });

                // Initialize popover
                var tooltip = $tooltip(element, options);

                // Garbage collection
                scope.$on('$destroy', function() {
                    tooltip.destroy();
                });

            }
        };

    });


