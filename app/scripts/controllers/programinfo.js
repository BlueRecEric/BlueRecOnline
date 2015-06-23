'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:ProgramList
 * @description
 * # ProgramList
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
  .controller('ProgramInfo', ['$scope', 'ProInfoLoader', function ($scope,ProInfoLoader) {
    //var itemID = $routeParams.itemid;

    $scope.proinfo = ProInfoLoader;
    $scope.proinfo.loadProgram();
  }]);
