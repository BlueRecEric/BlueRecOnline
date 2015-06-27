'use strict';

/**
 * @ngdoc function
 * @name rebrandedTtcApp.controller:userRememberController
 * @description
 * # userRememberController
 * Controller of the rebrandedTtcApp
 */
angular.module('bluereconlineApp')
    .controller('userRememberController', ['ActiveUser',function(ActiveUser)
    {
      ActiveUser.getFromLocal();
/*
        var logx = this;

        ActiveUser


        function init()
        {
            if(AuthService.getToken())
            {
                logx.checkUser();
            }
        }

        function setUser(data)
        {
            $scope.$root.currentUser = data;
            //console.log('currentUser:' + angular.toJson($scope.$root.currentUser));
        }

        function checkUser() {
            AuthService.getUser().then(function success(response) {
                logx.setUser(response.data);
            });
        }

        logx.checkUser = checkUser;
        logx.setUser = setUser;
        logx.init = init;

        logx.init();
*/
    }]);
