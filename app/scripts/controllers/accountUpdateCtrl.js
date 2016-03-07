'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:CurrentMembershipCtrl
 * @description
 * # AboutCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
  .controller('AccountUpdateCtrl', ['$scope', 'ActiveUser', 'AccountUpdateLoader', '$location', '$routeParams', function ($scope,ActiveUser,AccountUpdateLoader,$location,$routeParams) {
      if(ActiveUser.isLoggedIn())
      {
          $scope.updateQuestionForm = {};
          $scope.updateQuestionForm.uid = ActiveUser.userData.user_id;
          $scope.updateQuestionForm.qOne = '';
          $scope.updateQuestionForm.aOne = '';
          $scope.updateQuestionForm.qTwo = '';
          $scope.updateQuestionForm.aTwo = '';

          $scope.accountUpdater = AccountUpdateLoader;
          $scope.accountUpdater.getSecurityQuestions();

          $scope.saveQuestions = function() {
              AccountUpdateLoader.saveSecurityQuestions($scope.updateQuestionForm).then(function(response) {
                  console.log(response);
                    if(response.data.updated == '1')
                      {
                          $location.path('/' + $routeParams.orgurl + '/home');
                      }
                      else
                      {
                          console.log(response.data);
                      }
                  }
              );
          };
      }
  }])
    .factory('AccountUpdateLoader', ['$http', 'BLUEREC_ONLINE_CONFIG', '$routeParams', function($http,BLUEREC_ONLINE_CONFIG,$routeParams) {
        var updateLoader = this;

        var saveSecurityQuestions = function(qForm) {

            console.log(qForm);

            var req = {
                method: 'POST',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/updatequestions',
                headers: {
                    'Content-Type': undefined
                },
                data: angular.toJson(qForm)
            };

            $http(req).then(function(response) {

            }.bind(this));

        };

        var getSecurityQuestions = function() {

            var req = {
                method: 'GET',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/securityquestions',
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            $http(req).then(function(response) {
                updateLoader.securityQuestions = response.data.data;
            }.bind(this));

        };
        updateLoader.saveSecurityQuestions = saveSecurityQuestions;
        updateLoader.getSecurityQuestions = getSecurityQuestions;

        return updateLoader;
  }]);