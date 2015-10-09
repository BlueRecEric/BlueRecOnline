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
      $scope.showNewMember = false;
      $scope.newMemberForm = [];

      $scope.newMemberClicked = function() {
        $scope.showNewMember = true;
        $scope.newMemberForm = [];
      };

      $scope.saveNewUser = function () {
        console.log('save new user');
        console.log($scope.newMemberForm);
        var Updater = UserUpdate;
        Updater.submitNewMemberForm($scope.newMemberForm, ActiveUser.userData).then(
            function handleNewPartResult(UpdateResult) {
              $scope.resetMessages();

              console.log('Update Result');
              console.log(UpdateResult.data);

              if(UpdateResult.data.added)
              {
                $scope.showNewMember = false;
                $scope.newMemberForm = [];
                $scope.newMemberAdded = true;
                ActiveUser.checkUser().then($scope.updateHousehold());
              }
              else
              {
                $scope.newMemberError = true;
                $scope.newMemberErrorText = UpdateResult.data.errorText;
              }
            }
        );
      };

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

      $scope.updateHousehold = function()
      {
        ActiveUser.getFromLocal().then(function() {
          $scope.household = ActiveUser.userData.household;
          console.log($scope.household);
        }, function() {
        }, function() {
        });
      };

      $scope.gradeOptions = [
        {
          'value':'NA',
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

      $scope.resetMessages = function() {
        $scope.newMemberError = false;
        $scope.newMemberErrorText = '';
        $scope.newMemberAdded = false;
      };

      $scope.updateUser = function(person) {
        var Updater = UserUpdate;
        console.log(person);
        Updater.submitPartForm(person);
      };

      $scope.updateHousehold();
  }])
  .factory('UserUpdate', ['$http', 'BLUEREC_ONLINE_CONFIG', 'md5', '$routeParams', '$filter', 'ActiveUser', function($http,BLUEREC_ONLINE_CONFIG,md5,$routeParams,$filter,ActiveUser) {

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

      function submitNewMemberForm(formData, loggedInUser)
      {
        console.log('active user');
        console.log(loggedInUser);
        formData.formatBirthday = $filter('date')(formData.birthday, 'yyyy-MM-dd');

        var req = {
          method: 'POST',
          url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/myaccount' + '?action=add_member',
          headers: {
            'Content-Type': undefined
          },
          data: {
            'uid': loggedInUser.user_id,
            'hid': loggedInUser.household_id,
            'firstname': formData.firstname,
            'lastname': formData.lastname,
            'gender': formData.gender,
            'grade': formData.grade.value,
            'birthday': formData.formatBirthday
          }
        };

        return $http(req);
      }

      usrUpdate.submitPartForm = submitPartForm;
      usrUpdate.submitNewMemberForm = submitNewMemberForm;

      return usrUpdate;
}]);