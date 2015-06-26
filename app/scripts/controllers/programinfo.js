'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:ProgramList
 * @description
 * # ProgramList
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
  .controller('ProgramInfo', ['$scope', 'ProInfoLoader', '$routeParams', function ($scope,ProInfoLoader,$routeParams) {
    //var itemID = $routeParams.itemid;

    $scope.orgcode = $routeParams.orgurl;
    $scope.itemid = $routeParams.itemid;
    $scope.proinfo = ProInfoLoader;
    $scope.proinfo.loadProgram();
  }]);
