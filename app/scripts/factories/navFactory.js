'use strict';

angular.module('bluereconlineApp')
    .factory('NavFactory',['$http', 'BLUEREC_ONLINE_CONFIG', '$routeParams', function($http,BLUEREC_ONLINE_CONFIG,$routeParams) {

        var nav = {};
        nav.options = {};
        var API = BLUEREC_ONLINE_CONFIG.API_URL;
        var orgUrl = '';
        var busyLoading = false;

        function getNavSettings() {

            orgUrl = $routeParams.orgurl;
            console.log('Request nav config from ' + API + '/ORG/' + orgUrl + '/navconfig');

            if(busyLoading) {
                return false;
            }

            busyLoading = true;

            var req = {
                method: 'GET',
                url: API + '/ORG/' + orgUrl + '/navconfig',
                headers: {
                    'Content-Type': undefined
                }
            };

            $http(req).then(function(response) {

                nav.options = response.data;
                console.log('nav results');
                console.log(nav.options);
                busyLoading = false;
            });
        }

        nav.getNavSettings = getNavSettings;
        return nav;

    }]);