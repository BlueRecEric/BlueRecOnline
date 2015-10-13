'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:ProgramList
 * @description
 * # ProgramList
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
  .controller('LeaguePage', ['$scope', '$routeParams', function ($scope, $routeParams) {

      if(angular.isDefined($routeParams.current)) {
        $scope.orgurl = $routeParams.orgurl;
        console.log('use current route');
      }

      $scope.$on('$routeChangeSuccess', function() {
        $scope.orgurl = $routeParams.orgurl;
        console.log('use routeparams');
      });



  }]);
