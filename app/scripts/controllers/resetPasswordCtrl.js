'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:ResetPasswordCtrl
 * @description
 * # ResetPasswordCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
    .controller('ResetPasswordCtrl', ['$scope', '$routeParams', 'ResetPasswordFactory', function ($scope,$routeParams,ResetPasswordFactory) {

        $scope.serverData = ResetPasswordFactory;
        $scope.serverData.getUserFromToken($routeParams.token);

        $scope.aOne = '';
        $scope.aTwo = '';

        $scope.verifySecurityAnswers = function (aOne, aTwo)
        {
            $scope.serverData.checkSecurityQuestions(aOne, aTwo);
        };

        $scope.submitPasswordChangeForm = function (passwd, cpasswd)
        {
            $scope.serverData.submitPasswordChange(passwd, cpasswd);
        };

        console.log($scope.serverData);
    }])
.factory('ResetPasswordFactory', ['$http', 'BLUEREC_ONLINE_CONFIG', '$routeParams', function($http,BLUEREC_ONLINE_CONFIG,$routeParams) {

    var factoryData = this;

    factoryData.hasQuestions = true;
    factoryData.showChangePassword = false;
    factoryData.passwordUpdated = false;

    var getUserFromToken = function(token) {

        console.log('try to get user data using token');

        var req = {
            method: 'GET',
            url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/userTokenData/' + token,
            headers: {
                'Content-Type': undefined
            }
        };

        return $http(req).then(function (response) {
            console.log('getUserFromToken response');
            console.log(response);
            factoryData.tokenData = response.data;

            if(factoryData.data.questions.length == 0)
            {
                factoryData.hasQuestions = false;
                factoryData.showChangePassword = true;
            }
        });
    };

    var checkSecurityQuestions = function(aOne, aTwo) {

        console.log('try to check security questions');

        var req = {
            method: 'POST',
            url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/checkquestions',
            headers: {
                'Content-Type': undefined
            },
            data: {'uid': factoryData.tokenData.data.user_id, 'qOne': factoryData.tokenData.data.questions[0].question_id, 'qTwo': factoryData.tokenData.data.questions[1].question_id, 'aOne': aOne, 'aTwo': aTwo}
        };

        return $http(req).then(function (response) {
            console.log('checkSecurityQuestions response');
            console.log(response);
            factoryData.questionData = response.data;

            if(factoryData.questionData.data.correct)
            {
                factoryData.showChangePassword = true;
            }
        });
    };

    var submitPasswordChange = function(passwd, cpasswd) {
        var req = {
            method: 'POST',
            url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/changePassword',
            headers: {
                'Content-Type': undefined
            },
            data: {'uid': factoryData.tokenData.data.user_id, 'token': $routeParams.token, 'newPwd': passwd, 'conPwd': cpasswd}
        };

        return $http(req)
            .then(
                function success(response) {
                    console.log('submitPasswordChange response');
                    console.log(response);

                    factoryData.passwordData = response.data;

                    if(factoryData.passwordData.updated)
                    {
                        factoryData.passwordUpdated = true;
                    }
                }
            );
    };

    factoryData.submitPasswordChange = submitPasswordChange;
    factoryData.checkSecurityQuestions = checkSecurityQuestions;
    factoryData.getUserFromToken = getUserFromToken;
    return factoryData;

}]);
