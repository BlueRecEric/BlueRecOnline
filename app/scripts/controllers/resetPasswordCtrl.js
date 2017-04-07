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

        if(angular.isDefined($routeParams.token)) {
            $scope.serverData.getUserFromToken($routeParams.token);
        }

        $scope.orgurl = $routeParams.orgurl;

        $scope.aOne = '';
        $scope.aTwo = '';

        $scope.sendPasswordRequest = function (email,claim) {
            if(!angular.isDefined(claim))
            {
                claim = false;
            }
            $scope.serverData.sendPasswordRequestEmail(email,claim);
        };

        $scope.verifySecurityAnswers = function (aOne, aTwo)
        {
            $scope.serverData.checkSecurityQuestions(aOne, aTwo);
        };

        $scope.submitPasswordChangeForm = function (passwd, cpasswd)
        {
            $scope.serverData.submitPasswordChange(passwd, cpasswd);
        };

        ResetPasswordFactory.getSettings().then(function (result) {
            $scope.config = result.data;
            console.log('config');
            console.log($scope.config);
            $scope.claimAccountVideo = $scope.config.data.claimAccountVideo;
        });

        console.log($scope.serverData);
    }])
.factory('ResetPasswordFactory', ['$http', 'BLUEREC_ONLINE_CONFIG', '$routeParams', function($http,BLUEREC_ONLINE_CONFIG,$routeParams) {

    var factoryData = this;

    factoryData.hasQuestions = true;
    factoryData.showChangePassword = false;
    factoryData.passwordUpdated = false;
    factoryData.emailSent = false;

    factoryData.busySendingEmail = false;

    function getSettings()
    {
        var req = {
            method: 'GET',
            url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/config/signup',
            headers: {
                'Content-Type': undefined
            }
        };

        return $http(req);
    }

    var sendPasswordRequestEmail = function(email,claim) {
        console.log('try to send password request email');

        if(!angular.isDefined(claim))
        {
            claim = false;
        }

        var claimAccount = '0';

        if(claim)
        {
            claimAccount = '1';
        }

        var req = {
            method: 'POST',
            url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/recoverpassword',
            headers: {
                'Content-Type': undefined
            },
            data: {'email': email,'claim': claimAccount}
        };

        factoryData.busySendingEmail = true;

        return $http(req).then(function (response) {
            console.log('sendPasswordRequestEmail response');
            console.log(response);
            factoryData.recoverData = response.data;

            if(factoryData.recoverData.data.emailSent)
            {
                factoryData.emailSent = true;
            }

            factoryData.busySendingEmail = false;
        });
    };

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

            if(angular.isDefined(factoryData.tokenData))
            {
                if(factoryData.tokenData.data.questions.length == 0)
                {
                    factoryData.hasQuestions = false;
                    factoryData.showChangePassword = true;
                }
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

                    if(factoryData.passwordData.data.passwordUpdated)
                    {
                        factoryData.passwordUpdated = true;
                    }
                }
            );
    };

    factoryData.getSettings = getSettings;
    factoryData.sendPasswordRequestEmail = sendPasswordRequestEmail;
    factoryData.submitPasswordChange = submitPasswordChange;
    factoryData.checkSecurityQuestions = checkSecurityQuestions;
    factoryData.getUserFromToken = getUserFromToken;
    return factoryData;

}]);
