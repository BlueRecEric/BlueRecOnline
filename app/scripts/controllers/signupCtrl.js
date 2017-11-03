'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
    .controller('SignupCtrl',['$scope', '$routeParams','SignupFactory', 'uiGmapGoogleMapApi', '$filter', function ($scope,$routeParams,SignupFactory,uiGmapGoogleMapApi, $filter) {
        var sign = this;

        $scope.addrResult = '';
        $scope.addrOptions = null;

        $scope.$watch('addrDetails', function () {
            console.log('details changed');
            if(angular.isDefined($scope.addrDetails))
            {
                console.log($scope.addrDetails.formatted_address);
            }
            $scope.splitAddress();
        }, true);


        $scope.splitAddress = function()
        {
            var address = '';

            if(angular.isDefined($scope.addrDetails))
            {
                address = $scope.addrDetails.formatted_address;
            }

            var splitAddr = address.split(',');

            var stateZip = '';

            if(splitAddr.length > 2)
            {
                console.log('split result');
                console.log(splitAddr);

                console.log('city:' + splitAddr[1].trim());
                $scope.sign.newAccount.city = splitAddr[1].trim();

                console.log('state:' + splitAddr[2].trim());
                stateZip = splitAddr[2].trim().split(' ');

                if(stateZip.length > 1)
                {
                    $scope.sign.newAccount.state = stateZip[0].trim();
                    console.log('zip:' + stateZip[1].trim());
                    $scope.sign.newAccount.zip = stateZip[1].trim();
                }

                console.log('addr:' + splitAddr[0].trim());
                $scope.sign.newAccount.addr = splitAddr[0].trim();
            }
        };

        sign.newAccount = {};


        sign.newAccount.birthday = null;
        sign.remote = SignupFactory;
        sign.remote.accountCreated = false;

        function sendSignupRequest()
        {
            console.log('send signup request');
            sign.remote.sendSignup(sign.newAccount);
        }

        function getSignupConfig() {
            console.log('get signup config');
            sign.config = sign.remote.getSignupConfig().then(function(result){
                sign.newAccount.requireGender = result.requireGender;
                console.log('config result:');
                console.log(result);
            });
        }

        uiGmapGoogleMapApi.then(function(maps) {});

        sign.sendSignupRequest = sendSignupRequest;
        sign.signError = false;
        sign.orgurl = $routeParams.orgurl;

        SignupFactory.getSettings().then(function (result) {
            $scope.config = result.data;
            console.log('config');
            console.log($scope.config);
            sign.newAccount.requireGender = $scope.config.data.requireGender;
            $scope.signupVideo = $scope.config.data.signupTutorialVideo;
        });
    }])

    .config(function($datepickerProvider) {
        angular.extend($datepickerProvider.defaults, {
            dateFormat: 'MM/dd/yyyy',
            startWeek: 0
        });
    })

    .factory('SignupFactory', ['$http', 'BLUEREC_ONLINE_CONFIG', '$routeParams', '$filter', '$location', 'MakeToast', 'AuthService', 'ActiveUser', function($http,BLUEREC_ONLINE_CONFIG,$routeParams,$filter,$location,MakeToast,AuthService,ActiveUser) {
        var signRemote = this;

        signRemote.accountCreated = false;

        signRemote.formData = {};

        function sendUserToHome(orgurl)
        {
            $location.path('/' + orgurl + '/home');
        }

        function sendUserToAccountUpdate(orgurl)
        {
            $location.path('/' + orgurl + '/accountupdate');
        }

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

        function processPostSignup(response)
        {
            ActiveUser.updateUser().then
            (
                function success() {
                    ActiveUser.setActiveUser(response.data).then(
                        function success() {

                            console.log('activeuser set to');
                            console.log(ActiveUser.userData);

                            console.log('submit email ' + ActiveUser.userData.user_id);

                            var reqTwo = {
                                method: 'POST',
                                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/email/resendverification',
                                headers: {
                                    'Content-Type': undefined
                                },
                                data: {'uid': ActiveUser.userData.user_id}
                            };

                            $http(reqTwo);

                            if(response.data.questions_answered == '1')
                            {
                                setTimeout(sendUserToHome, 500, $routeParams.orgurl);
                            }
                            else
                            {
                                setTimeout(sendUserToAccountUpdate, 500, $routeParams.orgurl);
                            }
                        }, function () {
                        }, function () {
                        }
                    );
                }
            );
        }

        var sendSignup = function(formData) {

            signRemote.busy = false;

            signRemote.formData = formData;

            /*if(angular.isDefined(signRemote.formData.birthday))
            {
                signRemote.formData.formatBirthday = $filter('date')(signRemote.formData.birthday, 'yyyy-MM-dd');
            }*/
            console.log('birthday', signRemote.formData.birthday);

            signRemote.formError = false;

            console.log('signRemote.formData:',  signRemote.formData);
            signRemote.formData.firstnameError = [];
            signRemote.formData.firstnameError.error = false;
            signRemote.formData.firstnameError.message = '';

            signRemote.formData.lastnameError = [];
            signRemote.formData.lastnameError.error = false;
            signRemote.formData.lastnameError.message = '';

            signRemote.formData.genderError = [];
            signRemote.formData.genderError.error = false;
            signRemote.formData.genderError.message = '';

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

            signRemote.formData.addressError = [];
            signRemote.formData.addressError.error = false;
            signRemote.formData.addressError.message = '';

            signRemote.formData.phoneError = [];
            signRemote.formData.phoneError.error = false;
            signRemote.formData.phoneError.message = '';

            signRemote.formData.phoneTypeError = [];
            signRemote.formData.phoneTypeError.error = false;
            signRemote.formData.phoneTypeError.message = '';

            signRemote.formData.cityError = [];
            signRemote.formData.cityError.error = false;
            signRemote.formData.cityError.message = '';

            signRemote.formData.stateError = [];
            signRemote.formData.stateError.error = false;
            signRemote.formData.stateError.message = '';

            signRemote.formData.zipError = [];
            signRemote.formData.zipError.error = false;
            signRemote.formData.zipError.message = '';

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

            if(signRemote.formData.requireGender == '1' && (!angular.isDefined(signRemote.formData.gender) || signRemote.formData.gender.length === 0 || signRemote.formData.gender == 'NS'))
            {
                signRemote.formError = true;
                signRemote.formData.genderError.error = true;
                signRemote.formData.genderError.message = 'Please select your gender.';
            }

            if(signRemote.formData.birthday !== null)
            {
                if(angular.isUndefined(signRemote.formData.birthday))
                {
                    signRemote.formError = true;
                    signRemote.formData.birthdayError.error = true;
                    signRemote.formData.birthdayError.message = 'Invalid birthday format. Please use the format "MM/DD/YYYY".';
                }
                else
                {
                    signRemote.formData.formatBirthday = $filter('date')(signRemote.formData.birthday, 'yyyy-MM-dd');
                }

                if(!angular.isDefined(signRemote.formData.formatBirthday) || signRemote.formData.formatBirthday === 0)
                {
                    signRemote.formError = true;
                    signRemote.formData.birthdayError.error = true;
                    signRemote.formData.birthdayError.message = 'Invalid birthday format. Please use the format "MM/DD/YYYY".';
                }
            }
            else
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

            if(!angular.isDefined(signRemote.formData.phone) || signRemote.formData.phone.length === 0)
            {
                signRemote.formError = true;
                signRemote.formData.phoneError.error = true;
                signRemote.formData.phoneError.message = 'Please enter your phone number.';
            }

            if(!angular.isDefined(signRemote.formData.zip) || signRemote.formData.zip.length === 0)
            {
                signRemote.formError = true;
                signRemote.formData.zipError.error = true;
                signRemote.formData.zipError.message = 'Please enter your zipcode.';
            }

            if(!angular.isDefined(signRemote.formData.state) || signRemote.formData.state.length === 0)
            {
                signRemote.formError = true;
                signRemote.formData.stateError.error = true;
                signRemote.formData.stateError.message = 'Please enter your state.';
            }

            if(!angular.isDefined(signRemote.formData.city) || signRemote.formData.city.length === 0)
            {
                signRemote.formError = true;
                signRemote.formData.cityError.error = true;
                signRemote.formData.cityError.message = 'Please enter your city.';
            }

            if(!angular.isDefined(signRemote.formData.addr) || signRemote.formData.addr.length === 0)
            {
                signRemote.formError = true;
                signRemote.formData.addressError.error = true;
                signRemote.formData.addressError.message = 'Please enter your street address.';
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

            if(!angular.isDefined(signRemote.formData.phoneType) || signRemote.formData.phoneType.length === 0)
            {
                signRemote.formError = true;
                signRemote.formData.phoneTypeError.error = true;
                signRemote.formData.phoneTypeError.message = 'Please select your primary phone type.';
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

                            if(response.data.errors.length > 0)
                            {
                                if(response.data.errors[0].error.text.length > 0)
                                {
                                    signRemote.formData.remoteError.message = response.data.errors[0].error.text;
                                }
                            }
                        }
                        else
                        {
                            MakeToast.popOn('success', 'New Account', 'Your account was created!');
                            signRemote.accountCreated = response.data.data.accountCreated;

                            AuthService.login(signRemote.formData.email, signRemote.formData.password).then(
                                function success(response) {
                                    console.log('login response');
                                    console.log(response);

                                    if(response.data.validLogin)
                                    {
                                        setTimeout(processPostSignup, 500, response);
                                    }
                                    else
                                    {

                                    }

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

        signRemote.getSettings = getSettings;
        signRemote.processPostSignup = processPostSignup;
        signRemote.sendSignup = sendSignup;
        signRemote.returnData = '';
        signRemote.busy = false;

        return signRemote;
    }]);
