'use strict';

/**
 * Created by Eric on 7/3/2015.
 */
angular.module('bluereconlineApp')
.directive('questionSelect', function() {
    return {
        templateUrl: 'template/questionselect/questionSelect.tpl.html',
        scope: {
        questions: '=',
            selectedQuestion: '=',
            selectedQuestions: '='
        },
        controller: function($scope) {
            $scope.isDisabled = function(question) {
                console.log('this question:');
                console.log(question.question_name);

                console.log('selected question:');
                console.log($scope.selectedQuestion);
                return ($scope.selectedQuestions.indexOf(question) > -1 && question.question_name !== $scope.selectedQuestion);
            };
        }
    };
});