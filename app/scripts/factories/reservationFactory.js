'use strict';

angular.module('bluereconlineApp')
    .factory('ReservationFactory',['$rootScope','$routeParams', 'ActiveUser', function($rootScope, $routeParams, ActiveUser) {

        var service = {};

        //var reservationData = {};
        //var reservationTimes = {};

        service.setReservationData = function(data) {
            localStorage.setItem('savedReservationData', JSON.stringify(data));
        };

        service.getReservationData = function() {
            return JSON.parse(localStorage.getItem('savedReservationData'));
        };

        service.clearReservationData = function() {
            localStorage.removeItem('savedReservationData');
        };

        service.setReservationTimes = function(data) {
            localStorage.setItem('savedReservationTimes', JSON.stringify(data));
        };

        service.getReservationTimes = function() {
            return JSON.parse(localStorage.getItem('savedReservationTimes'));
        };

        service.clearReservationTimes = function() {
            localStorage.removeItem('savedReservationTimes');
        };

        return service;
    }]);