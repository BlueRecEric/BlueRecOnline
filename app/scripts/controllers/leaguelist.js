'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:ProgramList
 * @description
 * # ProgramList
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
    .controller('LeagueList', ['$scope', '$routeParams', 'ActiveUser', 'LeagueLoader', function ($scope, $routeParams, ActiveUser, LeagueLoader) {

        $scope.addingTeamMember = false;
        $scope.newTeamMemberForm = {};
        $scope.newTeamMemberErrors = [];

        if(ActiveUser.isLoggedIn())
        {
            $scope.league = LeagueLoader;

            $scope.league.getUserLeagues(ActiveUser.userData.user_id).then(function (response) {
                console.log('working data:');
                console.log(response);
            });

            $scope.onSaveNewTeamMember = function(teamID)
            {
                $scope.newTeamMemberForm.teamID = teamID;
                $scope.newTeamMemberForm.addedBy = ActiveUser.userData.user_id;

                console.log('new member form:');
                console.log($scope.newTeamMemberForm);
                $scope.newTeamMemberErrors = [];

                $scope.league.saveNewTeamMember($scope.newTeamMemberForm).then(function (response) {
                    console.log('add user response:');
                    console.log(response);

                    if(response.data.errors.length > 0)
                    {
                        $scope.newTeamMemberErrors = response.data.errors;
                    }
                    else
                    {
                        if(response.data.data.added)
                        {
                            $scope.newTeamMemberForm = {};
                            $scope.addingTeamMember = false;

                            $scope.league.getUserLeagues(ActiveUser.userData.user_id).then(function (response) {
                                console.log('working data:');
                                console.log(response);
                            });
                        }
                    }
                });
            };

        }
        else
        {
            $scope.league = {};
            $scope.league.userLeagues = [];
        }

    }])
    .factory('LeagueLoader', ['$http', '$filter', 'BLUEREC_ONLINE_CONFIG', '$routeParams', function($http,$filter,BLUEREC_ONLINE_CONFIG,$routeParams) {

        var leagueData = this;

        var getUserLeagues = function (userID) {
            var req = {
                method: 'GET',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/leagues/user/' + userID,
                headers: {
                    'Content-Type': undefined
                }
            };

            return $http(req).then(function (response) {
                leagueData.userLeagues = response.data.data;
            });
        };

        var saveNewTeamMember = function (userForm) {

            userForm.formatBirthday = '';

            if(angular.isDefined(userForm.birthday))
            {
                userForm.formatBirthday = $filter('date')(userForm.birthday, 'yyyy-MM-dd');
            }

            var req = {
                method: 'POST',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/leagues/addTeamMember',
                headers: {
                    'Content-Type': undefined
                },
                data: userForm
            };

            return $http(req);
        };

        leagueData.getUserLeagues = getUserLeagues;
        leagueData.saveNewTeamMember = saveNewTeamMember;
        return leagueData;
    }]);
