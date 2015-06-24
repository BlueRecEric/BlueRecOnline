'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:RequestReservation
 * @description
 * # RequestReservation
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
  .controller('RequestReservation', ['$scope', function ($scope) {

        $scope.startTime = new Date(1970, 0, 1, 9, 0, 40);
        $scope.endTime = new Date(1970, 0, 1, 9, 0, 40);

        $scope.dropdown = [
            {text: '<i class="fa"></i>&nbsp;Rental 1', href: '#anotherAction'},
            {text: '<i class="fa"></i>&nbsp;Rental 2', click: '$alert("Holy guacamole!")'},
            {text: '<i class="fa"></i>&nbsp;Rental 3', href: '/auth/facebook', target: '_self'}
        ];


        $scope.tooltip = {
            "checked": true
        };

    }])

    .config(function($dropdownProvider) {
        angular.extend($dropdownProvider.defaults, {
            html: true
        });
    });
