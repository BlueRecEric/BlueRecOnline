'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:CustomFieldsCtrl
 * @description
 * # CustomFieldsCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
  .controller('CustomFieldsCtrl', ['$scope', 'ActiveUser', 'CustomFieldsLoader', function ($scope,ActiveUser,CustomFieldsLoader) {
      $scope.customFieldList = [];
      $scope.updateFieldList = [];

      if(ActiveUser.isLoggedIn())
      {
            CustomFieldsLoader.getCustomFields(ActiveUser.userData.household_id).then(function(response) {
                $scope.customFieldList = response.data.data;
                console.log('Returned custom field list:');
                console.log($scope.customFieldList);
            });
      }

      $scope.onFieldGroupSubmit = function (fieldGroup)
      {
          console.log('submit this group:');
          console.log(fieldGroup);

          fieldGroup.buttonLabel = 'Saving...';
          CustomFieldsLoader.updateCustomFields(ActiveUser.userData.household_id, fieldGroup).then(function(response) {
              $scope.updateFieldList = response.data;
              console.log('Returned custom field update:');
              console.log($scope.updateFieldList);
              fieldGroup.buttonLabel = 'Saved!';
          });
      };
  }])
    .factory('CustomFieldsLoader', ['$http', 'BLUEREC_ONLINE_CONFIG', '$routeParams', function($http,BLUEREC_ONLINE_CONFIG,$routeParams) {

        var fieldLoader = this;

        fieldLoader.getCustomFields = function(householdID) {
            var req = {
                method: 'GET',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/mycustomfields/' + householdID,
                headers: {
                    'Content-Type': undefined
                }
            };

            return $http(req);
        };

        fieldLoader.updateCustomFields = function(householdID, fieldGroup) {
            var req = {
                method: 'POST',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/mycustomfields/' + householdID,
                headers: {
                    'Content-Type': undefined
                },
                data: {'fieldGroup' : fieldGroup}
            };

            return $http(req);
        };

        return fieldLoader;
  }]);