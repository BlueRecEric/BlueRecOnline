'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:CurrentMembershipCtrl
 * @description
 * # AboutCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
  .controller('MyHouseholdCtrl', ['$scope', '$rootScope', 'ActiveUser', 'UserUpdate', 'md5', '$filter', '$location', '$anchorScroll', function ($scope,$rootScope,ActiveUser,UserUpdate,md5,$filter,$location,$anchorScroll) {
      //$scope.household = {};

      function setHouseholdData()
      {
          console.log('setting user data after update');
          console.log(ActiveUser.userData);
          $scope.household = ActiveUser.userData.household;

          for(var p = 0; p < $scope.household.length; p++)
          {
              $scope.household[p].user_updated = false;

              /*console.log('$scope.household[p].birthday: ' + $scope.household[p].birthday);
              var userBirthday = $filter('date')($scope.household[p].birthday, 'yyyy-MM-dd');
              console.log('userbirthday: ' + userBirthday);
              $scope.household[p].birthday = userBirthday;*/
          }

          //console.log($scope.household);
      }

      function updateHouseholdData()
      {
          if(ActiveUser.isLoggedIn())
          {
              ActiveUser.updateUser().then(function(){
                setTimeout(setHouseholdData, 500);
              });
          }
      }

      if(ActiveUser.isLoggedIn())
      {
          //console.log('The active user is logged in.');
          setTimeout(updateHouseholdData,500);
      }

      $scope.$on('user:updated', function() {
          //console.log('looks like household data was updated.');
          setTimeout(updateHouseholdData,500);
      });

      $scope.displayBirthday = function (birthday) {
          return $filter('date')(birthday, 'MM/dd/yyyy', '-0500');
      };

      $scope.showNewMember = false;
      $scope.showEmergencyContact = false;
      $scope.newMemberForm = [];
      $scope.emergencyContactForm = [];

      $scope.emergencyContactError = '';
      $scope.emergencyContactUpdates = '';

      $scope.saveEmergencyContacts = function() {
          $scope.emergencyContactError = '';
          $scope.emergencyContactUpdates = '';

          var Updater = UserUpdate;
          Updater.submitEmergencyContacts($scope.emergencyContactForm).then(
              function handleContactsUpdate(updateResult) {

                  console.log('update result');
                  console.log(updateResult);

                  if(updateResult.data.errors)
                  {
                      $scope.emergencyContactError = updateResult.data.errortext;
                  }
                  else
                  {
                      ActiveUser.userData.emergencycontacts = updateResult.data.contacts;
                      updateHouseholdData();
                      $scope.showEmergencyContact = false;
                      $scope.emergencyContactUpdates = 'Emergency contacts updated.';
                  }

              }
          );
      };

      $scope.editEmergencyContacts = function() {

          $scope.showNewMember = false;

          if(!angular.isNumber(ActiveUser.userData.requiredEmergencyCount))
          {
              ActiveUser.userData.requiredEmergencyCount = 0;
          }

          if(angular.isDefined(ActiveUser.userData.emergencycontacts) &&
              angular.isDefined(ActiveUser.userData.emergencycontacts.data) &&
              ActiveUser.userData.emergencycontacts.data.length >= ActiveUser.userData.requiredEmergencyCount)
          {
              $scope.emergencyContactForm = ActiveUser.userData.emergencycontacts.data;
              $scope.showEmergencyContact = true;
          }
          else
          {
              $scope.showEmergencyContact = true;
              $scope.emergencyContactForm = [];
          }
      };

      $scope.newMemberClicked = function() {

          $scope.showEmergencyContact = false;

          var blankContacts = false;

          if(!angular.isNumber(ActiveUser.userData.requiredEmergencyCount))
          {
              ActiveUser.userData.requiredEmergencyCount = 0;
          }

          console.log('active user on new member click');
          console.log(ActiveUser.userData);

          if(angular.isDefined(ActiveUser.userData.emergencycontacts) &&
              angular.isDefined(ActiveUser.userData.emergencycontacts.data) &&
              ActiveUser.userData.emergencycontacts.data.length >= ActiveUser.userData.requiredEmergencyCount)
          {
              $scope.emergencyContactForm = ActiveUser.userData.emergencycontacts.data;

              var reqContactCount = 0;

              for(var ec = 0; ec < ActiveUser.userData.emergencycontacts.data.length; ec++)
              {
                  if(ActiveUser.userData.emergencycontacts.data[ec].contactID == '')
                  {
                      blankContacts = true;
                  }
                  else
                  {
                      reqContactCount++;
                  }
              }

              console.log('we have ' + reqContactCount + ' contacts');
              console.log('we need ' + ActiveUser.userData.requiredEmergencyCount + ' contacts');

              if(blankContacts && ActiveUser.userData.requiredEmergencyCount > 0 && reqContactCount < ActiveUser.userData.requiredEmergencyCount)
              {
                  $scope.showEmergencyContact = true;
              }
              else
              {
                  $scope.showNewMember = true;
                  $scope.newMemberForm = [];
              }
          }
          else
          {
              $scope.showEmergencyContact = true;
              $scope.emergencyContactForm = [];
          }


      };

        $scope.newMemberCancelClicked = function() {
            $scope.showNewMember = false;
            $scope.newMemberForm = [];
        };

      $scope.saveNewUser = function () {
        //console.log('save new user');
        //console.log($scope.newMemberForm);
        var Updater = UserUpdate;
        Updater.submitNewMemberForm($scope.newMemberForm, ActiveUser.userData).then(
            function handleNewPartResult(UpdateResult) {
              $scope.resetMessages();

              //console.log('Update Result');
              console.log(UpdateResult.data);

              if(UpdateResult.data.added)
              {
                updateHouseholdData();
                $scope.showNewMember = false;
                $scope.newMemberForm = [];
                $scope.newMemberAdded = true;
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

       $scope.gotoAnchor = function (anchorID, offset) {
            $anchorScroll.yOffset = offset;

           $anchorScroll(anchorID);
        };

      $scope.resetMessages = function() {
        $scope.newMemberError = false;
        $scope.newMemberErrorText = '';
        $scope.newMemberAdded = false;
      };

      $scope.updateUser = function(person, updateIndex)
      {
        var Updater = UserUpdate;

        //console.log(person);
        Updater.submitPartForm(person).then(
            function success(response) {
                //console.log(response);
                if(response.data.update === '1') {
                    //console.log(updateIndex);

                    $scope.household[updateIndex].user_updated = true;

                    //$scope.gotoAnchor('user_'+updateIndex, 60);

                    ActiveUser.updateUser();
                }
                else
                {
                    $scope.household[updateIndex].user_updated = false;
                    person.memberUpdateErrorText = response.data.errorText;
                }
            }
        );
      };

      UserUpdate.getSettings().then(function (result) {
          $scope.config = result.data;
          console.log('config');
          console.log($scope.config);
      });
  }])
  .factory('UserUpdate', ['$http', 'BLUEREC_ONLINE_CONFIG', 'md5', '$routeParams', '$filter', 'ActiveUser', function($http,BLUEREC_ONLINE_CONFIG,md5,$routeParams,$filter,ActiveUser) {

      var usrUpdate = this;

      usrUpdate.getSettings = function()
      {
          var req = {
              method: 'GET',
              url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/config',
              headers: {
                  'Content-Type': undefined
              }
          };

          return $http(req);
      };

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

        return $http(req);

      }

      function submitEmergencyContacts(formData)
      {
          var req = {
              method: 'POST',
              url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/myaccount' + '?action=save_emergency_contacts',
              headers: {
                  'Content-Type': undefined
              },
              data: formData
          };

          return $http(req);
      }

      function submitNewMemberForm(formData, loggedInUser)
      {
        //console.log('active user');
        //console.log(loggedInUser);
        formData.formatBirthday = $filter('date')(formData.birthday, 'yyyy-MM-dd');

        console.log('birthday', formData.formatBirthday);
          var gradeValue = angular.isDefined(formData.grade)?formData.grade.value:'NA';

          if(gradeValue === null)
          {
              gradeValue = 'NA';
          }

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
            'grade': gradeValue,
            'birthday': formData.formatBirthday,
            'emerNameOne': formData.emerNameOne,
            'emerRelOne': formData.emerRelOne,
            'emerPhoneOne': formData.emerPhoneOne,
            'allergies': formData.allergies,
            'medications': formData.medications,
            'disabilities': formData.disabilities
          }
        };

        return $http(req);
      }

      usrUpdate.submitEmergencyContacts = submitEmergencyContacts;
      usrUpdate.submitPartForm = submitPartForm;
      usrUpdate.submitNewMemberForm = submitNewMemberForm;

      return usrUpdate;
}]);