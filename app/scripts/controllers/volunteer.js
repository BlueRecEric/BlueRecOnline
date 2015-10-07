'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:CurrentMembershipCtrl
 * @description
 * # AboutCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
  .controller('Volunteer', ['$scope', 'ActiveUser', 'VolunteerRequest', function ($scope,ActiveUser,VolunteerRequest) {
        $scope.volForm = [];

        if(ActiveUser.isLoggedIn())
        {
            var volLoad = VolunteerRequest;
            volLoad.getItemRoles().then(
                function()
                {
                    console.log('volLoad roles');
                    console.log(volLoad.roles);
                    $scope.volLoad = volLoad;
                }
            );
            $scope.household = ActiveUser.userData.household;

            var submitVolForm = function() {
                volLoad.submitVolunteerRequest($scope.volForm);
            };

            $scope.submitVolForm = submitVolForm;
        }
  }])
    .factory('VolunteerRequest', ['$http', 'BLUEREC_ONLINE_CONFIG', '$routeParams', function($http,BLUEREC_ONLINE_CONFIG,$routeParams) {
        var volunteer = this;
        volunteer.roles = [];
        volunteer.errors = [];
        volunteer.messages = [];

        var getItemRoles = function () {
            console.log('submit request');

            var req = {
                method: 'GET',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/item/' + $routeParams.itemid + '/volunteer/positions',
                headers: {
                    'Content-Type': undefined
                },
            };

            return $http(req).then(
                function success(response) {
                    volunteer.roles = [];
                    var roles = JSON.parse(angular.toJson(response.data.data));
                    volunteer.roles = roles;
                    console.log('request roles');
                    console.log(volunteer.roles);
                }
            );


        };

        var submitVolunteerRequest = function (volForm) {
            console.log('request');
            console.log(volForm);

            var req = {
                method: 'POST',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/item/' + $routeParams.itemid + '/volunteer/add',
                headers: {
                    'Content-Type': undefined
                },
                data: {'uid': volForm.vol_user_id, 'roleID': volForm.role_id, 'comments': volForm.vol_comments}
            };

            $http(req).then(
                function success(response) {
                    console.log(response.data);
                    volunteer.errors = response.data.errors;
                    volunteer.messages = response.data.messages;
                }
            );
        };

        volunteer.submitVolunteerRequest = submitVolunteerRequest;
        volunteer.getItemRoles = getItemRoles;

        return volunteer;
    }]);