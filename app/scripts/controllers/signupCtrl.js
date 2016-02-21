'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
    .controller('SignupCtrl',['$routeParams','SignupFactory', function ($routeParams,SignupFactory) {
        var sign = this;

        sign.newAccount = {};
        sign.remote = SignupFactory;
        sign.remote.accountCreated = false;

        function sendSignupRequest()
        {
            console.log('send signup request');
            sign.remote.sendSignup(sign.newAccount);
        }

        sign.sendSignupRequest = sendSignupRequest;
        sign.signError = false;
        sign.orgurl = $routeParams.orgurl;
    }])
    .factory('SignupFactory', ['$http', 'BLUEREC_ONLINE_CONFIG', '$routeParams', '$filter', '$location', 'MakeToast', 'AuthService', 'ActiveUser', function($http,BLUEREC_ONLINE_CONFIG,$routeParams,$filter,$location,MakeToast,AuthService,ActiveUser) {
        var signRemote = this;

        signRemote.accountCreated = false;

        signRemote.formData = {};

        var sendSignup = function(formData) {

            signRemote.formData = formData;

            if(angular.isDefined(signRemote.formData.birthday))
            {
                signRemote.formData.formatBirthday = $filter('date')(signRemote.formData.birthday, 'yyyy-MM-dd');
            }

            signRemote.formError = false;

            signRemote.formData.firstnameError = [];
            signRemote.formData.firstnameError.error = false;
            signRemote.formData.firstnameError.message = '';

            signRemote.formData.lastnameError = [];
            signRemote.formData.lastnameError.error = false;
            signRemote.formData.lastnameError.message = '';

            signRemote.formData.birthdayError = [];
            signRemote.formData.birthdayError.error = false;
            signRemote.formData.birthdayError.message = '';

            signRemote.formData.emailError = [];
            signRemote.formData.emailError.error = false;
            signRemote.formData.emailError.message = '';

            signRemote.formData.passwordError = [];
            signRemote.formData.passwordError.error = false;
            signRemote.formData.passwordError.message = '';

            signRemote.formData.cPasswordError = [];
            signRemote.formData.cPasswordError.error = false;
            signRemote.formData.cPasswordError.message = '';

            signRemote.formData.remoteError = [];
            signRemote.formData.remoteError.error = false;
            signRemote.formData.remoteError.message = '';

            if(!angular.isDefined(signRemote.formData.firstname) || signRemote.formData.firstname.length === 0)
            {
                signRemote.formError = true;
                signRemote.formData.firstnameError.error = true;
                signRemote.formData.firstnameError.message = 'Please enter your first name.';
            }

            if(!angular.isDefined(signRemote.formData.lastname) || signRemote.formData.lastname.length === 0)
            {
                signRemote.formError = true;
                signRemote.formData.lastnameError.error = true;
                signRemote.formData.lastnameError.message = 'Please enter your last name.';
            }

            if(!angular.isDefined(signRemote.formData.formatBirthday) || signRemote.formData.formatBirthday === 0)
            {
                signRemote.formError = true;
                signRemote.formData.birthdayError.error = true;
                signRemote.formData.birthdayError.message = 'Please enter your birthday.';
            }

            if(!angular.isDefined(signRemote.formData.email) || signRemote.formData.email.length === 0)
            {
                signRemote.formError = true;
                signRemote.formData.emailError.error = true;
                signRemote.formData.emailError.message = 'Please enter your email address.';
            }

            if(!angular.isDefined(signRemote.formData.password) || signRemote.formData.password.length === 0)
            {
                signRemote.formError = true;
                signRemote.formData.passwordError.error = true;
                signRemote.formData.passwordError.message = 'Please enter a password.';
            }

            if(!angular.isDefined(signRemote.formData.cpassword) || signRemote.formData.cpassword.length === 0)
            {
                signRemote.formError = true;
                signRemote.formData.cPasswordError.error = true;
                signRemote.formData.cPasswordError.message = 'Please confirm your password.';
            }
            else if((angular.isDefined(signRemote.formData.cpassword) && angular.isDefined(signRemote.formData.password)) && signRemote.formData.cpassword != signRemote.formData.password)
            {
                signRemote.formError = true;
                signRemote.formData.passwordError.error = true;
                signRemote.formData.passwordError.message = 'Your passwords do not match.';
            }

            console.log('busy:');
            console.log(signRemote.busy);

            console.log('formError:');
            console.log(signRemote.formError);

            console.log('form data:');
            console.log(signRemote.formData);

            if(!signRemote.formError) {
                if (signRemote.busy) {
                    return false;
                }
                signRemote.busy = true;
                signRemote.birthday = null;

                var requestData = angular.toJson(signRemote.formData);

                console.log('requestData:');
                console.log(requestData);

                var req = {
                    method: 'POST',
                    url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/signup',
                    headers: {
                        'Content-Type': undefined
                    },
                    data: requestData
                };

                $http(req).then(function (response) {
                    signRemote.returnData = {};
                    console.log('signup response');
                    console.log(response.data);
                    signRemote.returnData = response.data.data;
                    signRemote.busy = false;

                    // display errors
                    if(angular.isDefined(response.data.data.accountCreated))
                    {
                        if(response.data.data.accountCreated === false)
                        {
                            signRemote.formData.remoteError = [];
                            signRemote.formData.remoteError.error = true;
                            signRemote.formData.remoteError.message = 'Unable to create a new account.';
                        }
                        else
                        {
                            MakeToast.popOn('success', 'New Account', 'Your account was created!');
                            signRemote.accountCreated = response.data.data.accountCreated;

                            AuthService.login(signRemote.formData.email, signRemote.formData.password).then(
                                function success(response) {
                                    ActiveUser.setActiveUser(response.data).then(
                                        function success() {
                                            $location.path('/' + $routeParams.orgurl + '/home');
                                        }, function () {
                                        }, function () {
                                        }
                                    );
                                }
                            );
                        }
                    }

                    if(angular.isDefined(response.data.errors) && response.data.errors.length > 0)
                    {
                        console.log('Loop through errors');

                        for(var e = 0; e < response.data.errors.length; e++)
                        {
                            var errorData = response.data.errors[e].error;

                            if(errorData.code == '1101' || errorData.code == 1101)
                            {
                                console.log('found email error');
                                signRemote.formData.emailError.error = true;
                                signRemote.formData.emailError.message = errorData.text;
                            }
                        }
                    }

                }.bind(this));
            }
            else
            {
                console.log('Unable to send form data due to error');
            }
        };

        signRemote.sendSignup = sendSignup;
        signRemote.returnData = '';
        signRemote.busy = false;

        return signRemote;
    }]);