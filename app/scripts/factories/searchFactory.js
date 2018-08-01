'use strict';

angular.module('bluereconlineApp')
    .factory('SearchFactory',['localStorageService', '$q', function(localStorageService,$q) {

        var search = this;

        search.programSearch = {};
        search.programSearch.keyword = '';
        search.programSearch.type = '';
        search.programSearch.location = '';
        search.programSearch.sortBy = '';
        search.programSearch.selectedAgeMin = '';
        search.programSearch.selectedAgeMax = '';

        search.setProgramSearch = function () {
            var defer = $q.defer();

            console.log('set program search:');
            console.log(search.programSearch);

            defer.resolve(localStorageService.set('search-program', search.programSearch));

            return defer.promise;
        };

        search.getProgramSearch = function () {
            var defer = $q.defer();


            search.programSearch = search.getProgramSearchFromStorage();

            if(!angular.isDefined(search.programSearch) || search.programSearch == null)
            {
                search.programSearch = {};
                search.programSearch.keyword = '';
                search.programSearch.type = '';
                search.programSearch.location = '';
                search.programSearch.selectedAgeMin = '';
                search.programSearch.selectedAgeMax = '';
                search.programSearch.sortBy = 'date';
            }

            if(search.programSearch.sortBy == '')
            {
                search.programSearch.sortBy = 'date';
            }

            console.log('after getting program search:');
            console.log(search.programSearch);
            setTimeout(function() {defer.resolve(true);}, 250);
            return defer.promise;
        };

        search.getProgramSearchFromStorage = function () {
            return localStorageService.get('search-program');
        };

        return search;

    }]);