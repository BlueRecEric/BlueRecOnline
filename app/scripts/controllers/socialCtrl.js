'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
    .controller('SocialCtrl', ['$scope', '$routeParams', '$route', 'BLUEREC_ONLINE_CONFIG', '$http', function ($scope, $routeParams, $route, BLUEREC_ONLINE_CONFIG, $http) {

        $scope.hasFacebook = false;
        $scope.hasInstagram = false;
        $scope.hasTwitter = false;
        $scope.hasGoogle = false;

        $scope.linkFacebook = '';
        $scope.linkTwitter = '';
        $scope.linkInstagram = '';
        $scope.linkGoogle = '';

        $scope.getSocialLinks = function () {

            var req = {
                method: 'GET',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/social/links',
                headers: {
                    'Content-Type': undefined
                }
            };

            $http(req)
                .success(function (response) {

                    console.log(response);

                    if(response.data.facebook.length > 0)
                    {
                        $scope.hasFacebook = true;
                        $scope.linkFacebook = response.data.facebook;
                    }

                    if(response.data.twitter.length > 0)
                    {
                        $scope.hasTwitter = true;
                        $scope.linkTwitter = response.data.twitter;
                    }

                    if(response.data.google.length > 0)
                    {
                        $scope.hasGoogle = true;
                        $scope.linkGoogle = response.data.google;
                    }

                    if(response.data.instagram.length > 0)
                    {
                        $scope.hasInstagram = true;
                        $scope.linkInstagram = response.data.instagram;
                    }

                });

        };

        $scope.$on('$routeChangeSuccess', function() {
            $scope.getSocialLinks();
        });

    }]);
