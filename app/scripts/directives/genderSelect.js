'use strict';

/**
 * Created by Eric on 3/6/2017.
 */
angular.module('bluereconlineApp')
.directive('genderSelect', function() {
    return {
        restrict: 'E',
        template: '<select ng-options="gender.abbreviation as gender.name for gender in genders" prompt="{{$scope.emptyName}}"></select>',
        replace: true,
        scope: true,

        link: function ($scope, element, attributes) {
            $scope.emptyName = attributes.emptyname || 'Gender';
        },

        controller: [ '$scope', function ($scope) {
            $scope.selectedGender = '';

            $scope.genders = [
                {
                    'name': 'Not Specified',
                    'abbreviation': 'NS'
                },
                {
                    'name': 'Male',
                    'abbreviation': 'M'
                },
                {
                    'name': 'Female',
                    'abbreviation': 'F'
                }
            ];
        }]

    };
});