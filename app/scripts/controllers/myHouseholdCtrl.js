'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:CurrentMembershipCtrl
 * @description
 * # AboutCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
  .controller('MyHouseholdCtrl', ['$scope', 'ActiveUser', 'UserUpdate', function ($scope,ActiveUser,UserUpdate) {
      $scope.household = {};

      $scope.genderOptions = [
        {
          'value':'NS',
          'name':'Not Specified'
        },
        {
          'value':'M',
          'name':'Male'
        },
        {
          'value':'F',
          'name':'Female'
        }
      ];

      ActiveUser.getFromLocal().then(function() {
        $scope.household = ActiveUser.userData.household;
        console.log($scope.household);
      }, function() {
      }, function() {
      });

      $scope.gradeOptions = [
        {
          'value':'0',
          'name':'NA'
        },
        {
          'value':'PreK',
          'name':'Pre-K'
        },
        {
          'value':'K',
          'name':'K'
        },
        {
          'value':'1',
          'name':'1'
        },
        {
          'value':'2',
          'name':'2'
        },
        {
          'value':'3',
          'name':'3'
        },
        {
          'value':'4',
          'name':'4'
        },
        {
          'value':'5',
          'name':'5'
        },
        {
          'value':'6',
          'name':'6'
        },
        {
          'value':'7',
          'name':'7'
        },
        {
          'value':'8',
          'name':'8'
        },
        {
          'value':'9',
          'name':'9'
        },
        {
          'value':'10',
          'name':'10'
        },
        {
          'value':'11',
          'name':'11'
        },
        {
          'value':'12',
          'name':'12'
        },
      ];

      $scope.updateUser = function(person) {
        var Updater = UserUpdate;
        console.log(person);
        Updater.submitPartForm(person);
      };
  }])
  .factory('UserUpdate', ['$http', 'BLUEREC_ONLINE_CONFIG', 'md5', '$routeParams', '$filter', function($http,BLUEREC_ONLINE_CONFIG,md5,$routeParams,$filter) {

      var usrUpdate = this;

      function submitPartForm(person)
      {
        person.formatBirthday = $filter('date')(person.birthday, 'yyyy-MM-dd');

        var req = {
          method: 'POST',
          url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/myaccount' + '?action=update_profile',
          headers: {
            'Content-Type': undefined
          },
          data: person
        };

        return $http(req)
            .then(
            function success(response) {
              console.log(response);
            }
        );
      }

      usrUpdate.submitPartForm = submitPartForm;

      return usrUpdate;
}]);