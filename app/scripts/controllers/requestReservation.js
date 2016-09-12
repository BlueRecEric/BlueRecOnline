'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:RequestReservation
 * @description
 * # RequestReservation
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
    .controller('RequestReservation', ['$scope', '$rootScope', '$http', '$location', 'BLUEREC_ONLINE_CONFIG', '$routeParams', '$modal', '$q', '$timeout', 'moment', 'ActiveUser',
        function ($scope, $rootScope, $http, $location, BLUEREC_ONLINE_CONFIG, $routeParams, $modal, $q, $timeout, moment, ActiveUser) {

            $scope.displayApprovedRentals = false;

            $scope.approvedRentalData = [];
            $scope.approvedRentalCollection = [];

            $scope.userLoggedIn = false;

            $scope.userLoggedIn = ActiveUser.isLoggedIn();

            $scope.depositAmount = 0.00;

            $scope.feeAmount = 0.00;
            $scope.feeItemID = 0;

            $scope.itemsByPage = 15;

            $scope.selectedLocation = 0;
            $scope.locationData = [];

            $scope.getLocationData = function () {
                var req = {
                    method: 'GET',
                    url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/reservation/reservationlocations',
                    headers: {
                        'Content-Type': undefined
                    }
                };

                $http(req)
                    .success(function (data) {
                        $scope.locationData = data;
                        console.log($scope.locationData);
                    });
            };

            $scope.getLocationData();

            $scope.onRentalClick = function(rentalRow) {
                console.log('rentalRow');
                console.log(rentalRow);

                $location.path('/' +  $routeParams.orgurl + '/reservationtimes/' + rentalRow.rental_code_item_id);

                /*selectTimeModal2.show().then(function (res) {
                 //$scope.searchRentalTimeSelected(res);
                 });*/
            };

            $scope.anchorRentalCode = false;

           $scope.getRentalData = function () {
               var req = {
                   method: 'POST',
                   url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/reservation/requestreservation',
                   headers: {
                       'Content-Type': undefined
                   },
                   data: {
                       user_id: ActiveUser.userData.user_id,
                       location_id: $scope.selectedLocation
                   }
               };

               $http(req)
                   .then(function (response) {

                       for ( var i = 0; i < response.data.length; i++)
                       {
                           response.data[i].rental_code_desc_short = response.data[i].rental_code_description.substr(0, 125)+'...';
                       }

                       $scope.rentalDropDown = response.data;

                       console.log('rental data:  ');
                       console.log($scope.rentalDropDown);
                   });
           };

            $scope.getRentalData();

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
                        $rootScope.$emit('updateCartCount', {});

                        $scope.getUserApprovedRequests();

                        // //console.table(data);

                        /*$scope.approvedRentalCollection = data;

                         if($scope.approvedRentalCollection.length > 0) {
                         $scope.displayApprovedRentals = true;
                         }*/
                    });
            };
        }])

    .config(function ($dropdownProvider) {
        angular.extend($dropdownProvider.defaults, {
            html: true
        });
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
    });
