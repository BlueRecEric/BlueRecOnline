'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:RequestReservation
 * @description
 * # RequestReservation
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
    .controller('RequestReservation', ['$scope', '$http',  'BLUEREC_ONLINE_CONFIG', '$routeParams','ActiveUser',  function ($scope, $http, BLUEREC_ONLINE_CONFIG, $routeParams, ActiveUser) {

        ActiveUser.getFromLocal();
        if(ActiveUser.userData != undefined) {
            console.log(ActiveUser.userData.user_id);
        }

        $scope.hideBasicInfo=true;

        $scope.rentalCodeSearch = '';

        $scope.rentalDescription = 'N/A';

        //$scope.eventSource=[];

        $scope.startTime = new Date(1970, 0, 1, 9, 0, 40);
        $scope.endTime = new Date(1970, 0, 1, 9, 0, 40);

        $scope.feeAmount = 0.00;

        $http.post(BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/requestreservation/')
            .success(function (data) {
                $scope.rentalDropDown = data;
               // console.log( $scope.rentalDropDown[1]);
            });

        $scope.agreementSigned = {
            'checked': false
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
                    }
                }

                $http.post(BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/reservationfacilities/'+$scope.rentalCodeSearch)
                    .success(function (data) {
                        $scope.rentalFacilities = data;

                        $scope.hideBasicInfo=false;
                    });

                if( $scope.rentalDescription === '')
                {
                    $scope.rentalDescription = 'N/A';
                }
            }
            else
            {$scope.hideBasicInfo=true;}
        };

        $scope.onSubmitRequest = function()
        {



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

                $http(req)
                    .success(function (data) {



                        $scope.eventSource  = data;

                        console.log( $scope.eventSource);
                    });
            }
            else
            {
                //$scope.eventSource=[];
            }

            $scope.calculateFeeAmount();
        };

        $scope.timeChanged = function()
        {

            $scope.calculateFeeAmount();
        };




        $scope.changeMode = function (mode) {
            $scope.mode = mode;
        };

        $scope.changeMode('week');

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


    }])

    .config(function($dropdownProvider) {
        angular.extend($dropdownProvider.defaults, {
            html: true
        });
    });
