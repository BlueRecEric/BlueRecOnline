'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:RequestReservation
 * @description
 * # RequestReservation
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
    .controller('RequestReservation', ['$scope', '$rootScope', '$http', '$location', 'BLUEREC_ONLINE_CONFIG', '$routeParams', 'MakeToast', '$modal', '$q', '$timeout', 'moment', 'ActiveUser',
        function ($scope, $rootScope, $http, $location, BLUEREC_ONLINE_CONFIG, $routeParams, MakeToast, $modal, $q, $timeout, moment, ActiveUser) {

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

            $scope.purposeOfUseData = [];

            $scope.selectedPurposeOfUse = {};
            $scope.selectedPurposeOfUse.selected = [];

            $scope.search = {};
            $scope.search.keyword = [];

            $scope.numberSelected = function ($select) {
                // clear search text
                $select.search = '';

                $scope.getRentalData();
            };

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
                        //console.log($scope.locationData);
                    });
            };

            $scope.getLocationData();

            $scope.$getPurposeOfUseData = function () {
                var req = {
                    method: 'GET',
                    url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/reservation/reservationpurposeofuse',
                    headers: {
                        'Content-Type': undefined
                    }
                };

                $http(req)
                    .success(function (data) {
                        $scope.purposeOfUseData = data;

                        //console.log('Purpose Of Use Date:  ');
                        //console.log($scope.purposeOfUseData);
                    });
            };

            $scope.$getPurposeOfUseData();

            $scope.onRentalClick = function(rentalRow) {
                //console.log('rentalRow');
                //console.log(rentalRow);

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
                       location_id: $scope.selectedLocation,
                       purpose_of_use: $scope.selectedPurposeOfUse.selected,
                       keyword: $scope.search.keyword
                   }
               };

               $http(req)
                   .then(function (response) {
                       for ( var i = 0; i < response.data.length; i++)
                       {
                           response.data[i].rental_code_desc_short = response.data[i].rental_code_description.substr(0, 125)+'...';
                       }

                       $scope.rentalGroupData = response.data;

                       //console.log('rental data:  ');
                       //console.log($scope.rentalGroupData);
                   });
           };

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
                        $scope.approvedRentalCollection = data;

                        if ($scope.approvedRentalCollection.length > 0) {
                            $scope.displayApprovedRentals = true;
                        }
                    });

                $scope.approvedRentalData = [].concat($scope.approvedRentalCollection);
            };

            $scope.getRentalData();

            if ($scope.userLoggedIn) {
                $scope.getUserApprovedRequests();
            }

            $scope.onSelectApprovedRental = function (selectedRow) {

                console.log('selectedRow:', selectedRow);

                var req = {
                    method: 'POST',
                    url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/reservation/addapprovedrentaltocart',
                    headers: {
                        'Content-Type': undefined
                    },
                    data: {request_id:  selectedRow.request_id,
                        addedByUserID: ActiveUser.userData.user_id}
                };

                $http(req)
                    .success(function (data) {

                        //console.log('addapprovedrentaltocart', data);

                        $rootScope.$emit('updateCartCount', {});

                        $scope.getUserApprovedRequests();

                        MakeToast.popOn('success', 'Added to Cart', 'Your approved rental request has been added to your cart!');

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
    })

    .filter('propsFilter', function() {
        return function(items, props) {
            var out = [];

            if (angular.isArray(items)) {
                items.forEach(function(item) {
                    var itemMatches = false;

                    var keys = Object.keys(props);
                    for (var i = 0; i < keys.length; i++) {
                        var prop = keys[i];
                        var text = props[prop].toLowerCase();
                        if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                            itemMatches = true;
                            break;
                        }
                    }

                    if (itemMatches) {
                        out.push(item);
                    }
                });
            } else {
                // Let the output be the input untouched
                out = items;
            }

            return out;
        };
    });
