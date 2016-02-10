'use strict';

angular.module('bluereconlineApp')
    .filter('sanitize', ['$sce', function($sce) {
    return function(htmlCode){
        return $sce.trustAsHtml(htmlCode);
    };
}]);