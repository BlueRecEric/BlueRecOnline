'use strict';

/**
 * @ngdoc function
 * @name rebrandedTtcApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the rebrandedTtcApp
 */
angular.module('rebrandedTtcApp')
  .controller('newUserController', ['$scope', '$http', 'BLUEREC_ONLINE_CONFIG', 'AuthService', function($scope,$http,BLUEREC_ONLINE_CONFIG,AuthService){
        var newUser = this;

        function init () {
            $scope.ttcNewUser = {};
            $scope.ttcNewUser.mcname = '';
            $scope.ttcNewUser.email = '';
            $scope.ttcNewUser.password = '';
            $scope.ttcNewUser.cpassword = '';
        }

        init();

        function login(em,pass)
        {
            //console.log('trying to log in with');
            //console.log(em);
            //console.log(pass);
            AuthService.login(em, pass).then(
                function success(response) {
                    newUser.setUser(response.data);
                }
            );
        }

        function setUser(data)
        {
            $scope.$root.currentUser = data;
            //console.log('currentUser:' + angular.toJson($scope.$root.currentUser));
        }

        function submitUser() {
            if($scope.ttcNewUserForm.$valid)
            {
                var req = {
                    method: 'POST',
                    url: BLUEREC_ONLINE_CONFIG.API_URL + '/register',
                    data: {
                        'mcname': $scope.ttcNewUser.mcname,
                        'email': $scope.ttcNewUser.email,
                        'pass': $scope.ttcNewUser.password,
                        'cpass': $scope.ttcNewUser.cpassword
                    },
                    headers: {
                        'Content-Type': undefined
                    }
                };

                $http(req).then(
                    function success(response) {
                        if(response.data.validRegistration)
                        {
                            //console.log('Registration worked, now login.');
                            newUser.login($scope.ttcNewUser.email,$scope.ttcNewUser.password);
                        }
                        else
                        {
                            //console.log('validRegistration is false.');
                            //console.log(response.data);
                        }
                    }
                );
            }
            else
            {
                window.alert('One or more values you have entered is invalid.');
            }
        }

        newUser.login = login;
        newUser.init = init;
        newUser.submitUser = submitUser;
        newUser.setUser = setUser;
}]);
