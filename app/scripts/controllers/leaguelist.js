'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:ProgramList
 * @description
 * # ProgramList
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
    .controller('LeagueList', ['$scope', '$routeParams', '$filter', 'ActiveUser', 'LeagueLoader', function ($scope, $routeParams, $filter, ActiveUser, LeagueLoader) {

        $scope.addingTeamMember = false;
        $scope.confirmPastTeamMember = false;
        $scope.newTeamMemberForm = {};
        $scope.newTeamMemberErrors = [];

        if(ActiveUser.isLoggedIn())
        {
            $scope.league = LeagueLoader;

            $scope.league.getUserLeagues(ActiveUser.userData.user_id).then(function (response) {
                console.log('working data:');
                console.log(response);
            });

            $scope.onSaveEditTeamMember = function(player)
            {
                player.teamID = player.team_id;
                player.phone = player.phone_number;
                player.email = player.email_address;

                player.birthday = player.formatBirthday;
                player.formatBirthday = $filter('date')(player.birthday, 'yyyy-MM-dd');

                console.log('edit member form:');
                console.log(player);

                $scope.league.saveEditTeamMember(player).then(function (response) {
                    $scope.league.getUserLeagues(ActiveUser.userData.user_id).then(function (response) {
                        console.log('working data:');
                        console.log(response);
                    });
                });
            };

            $scope.onRemoveTeamMember = function(player)
            {
                var remUser = {};

                remUser.teamID = player.team_id;
                remUser.registered = player.registered_user;
                remUser.userID = player.user_id;

                console.log('remove member form:');
                console.log(remUser);

                $scope.league.removeTeamMember(remUser).then(function (response) {
                    $scope.league.getUserLeagues(ActiveUser.userData.user_id).then(function (response) {
                        console.log('working data:');
                        console.log(response);
                    });
                });
            };

            $scope.importPastTeamMembers = function(teamID)
            {
                console.log('import past team members:');
                $scope.league.importPastTeamMembers(ActiveUser.userData.user_id, teamID).then(function () {
                    $scope.league.getUserLeagues(ActiveUser.userData.user_id).then(function (response) {
                        console.log('working data:');
                        console.log(response);
                    });
                });
            };

            $scope.getPastTeamMembers = function()
            {
                console.log('get past team members:');
                $scope.league.getPastTeamMembers(ActiveUser.userData.user_id).then(function (response) {
                });
            };

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

        var importPastTeamMembers = function (captainUserID,teamID) {

            var requestData = {'uid':captainUserID,'import':true,'teamID':teamID};

            var req = {
                method: 'POST',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/leagues/pastTeamMembers',
                headers: {
                    'Content-Type': undefined
                },
                data: requestData
            };

            return $http(req);
        };

        var getPastTeamMembers = function (captainUserID) {

            var requestData = {'uid':captainUserID,'import':false};

            var req = {
                method: 'POST',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/leagues/pastTeamMembers',
                headers: {
                    'Content-Type': undefined
                },
                data: requestData
            };

            return $http(req);
        };

        var removeTeamMember = function (removeForm) {
            var req = {
                method: 'POST',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/leagues/removeTeamMember',
                headers: {
                    'Content-Type': undefined
                },
                data: removeForm
            };

            return $http(req);
        };

        var saveEditTeamMember = function (playerForm) {
            var req = {
                method: 'POST',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/leagues/editTeamMember',
                headers: {
                    'Content-Type': undefined
                },
                data: playerForm
            };

            return $http(req);
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
        leagueData.saveEditTeamMember = saveEditTeamMember;
        leagueData.removeTeamMember = removeTeamMember;
        leagueData.getPastTeamMembers = getPastTeamMembers;
        leagueData.importPastTeamMembers = importPastTeamMembers;
        return leagueData;
    }]);
