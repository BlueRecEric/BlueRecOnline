'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:RequestReservation
 * @description
 * # RequestReservation
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
    .controller('RequestReservation', ['$scope', '$http',  'BLUEREC_ONLINE_CONFIG', '$routeParams', '$modal', '$anchorScroll', 'ActiveUser',  function ($scope, $http, BLUEREC_ONLINE_CONFIG, $routeParams, $modal, $anchorScroll, ActiveUser) {
        $scope.userLoggedIn=false;

        $scope.userLoggedIn=ActiveUser.isLoggedIn();

        $scope.contactCheckAlert=false;

        $scope.hideBasicInfo=true;

        $scope.rentalCodeSearch = '';

        $scope.rentalDescription = 'N/A';

        $scope.reservationDetails = '';
        $scope.reservationNotes = '';

        $scope.alcohol = '';

        $scope.phoneNumber = '';
        $scope.emailAddress = '';
        $scope.contactMethod = '';

        $scope.selectedDate= new Date();

        $scope.startTime = new Date(1970, 0, 1, 9, 0, 40);
        $scope.endTime = new Date(1970, 0, 1, 9, 0, 40);

        $scope.feeAmount = 0.00;

        $scope.eventSource=[];

        $anchorScroll('pageTop');

        $http.post(BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/requestreservation/')
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

        $scope.setNewRental = function()
        {
            if($scope.rentalCodeSearch !== '')
            {
                var index, len;

                for (index = 0, len = $scope.rentalDropDown.length; index < len; ++index) {
                    if($scope.rentalDropDown[index].item_id === $scope.rentalCodeSearch)
                    {
                        $scope.rentalDescription = $scope.rentalDropDown[index].rental_code_description;
                        if($scope.rentalDescription === '')
                        {$scope.rentalDescription = 'N/A';}
                    }
                }

                $http.post(BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/reservationfacilities/'+$scope.rentalCodeSearch)
                .success(function (data) {
                    $scope.rentalFacilities = data;

                    $scope.hideBasicInfo=false;
                });
            }

            if( $scope.rentalCodeSearch === '')
            {
                $scope.resetForm();
            }
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
                    url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/reservationavailability/',
                    headers: {
                        'Content-Type': undefined
                    },
                    data: {'facilities': $facilityString}
                };

                $http(req).success(function (data) {
                    console.log($facilityString);
                    $scope.eventSource = data;
                });

            }
            else
            {
                $scope.eventSource = null;

                console.table($scope.eventSource);
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
            if($scope.agreementSigned.checked)
            {
                $scope.contactCheckAlert = false;

                var $userID = ActiveUser.userData.user_id;

                if($scope.rentalCodeSearch !== '' && $userID)
                {
                    var $facilityString = $scope.getFacilityString();

                    var req = {
                        method: 'POST',
                        url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/submitreservationrequest/',
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
                            'alcohol': $scope.alcohol,
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

                $scope.eventSource = [];

                $scope.reservationDetails = '';
                $scope.reservationNotes = '';

                $scope.alcohol = '';

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
    }])

    .config(function($dropdownProvider) {
        angular.extend($dropdownProvider.defaults, {
            html: true
        });
    });
