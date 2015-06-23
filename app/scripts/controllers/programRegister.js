'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:ProgramList
 * @description
 * # ProgramList
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
  .controller('ProgramRegister', ['$scope', 'ActiveUser', 'ProInfoLoader', 'BLUEREC_ONLINE_CONFIG', '$routeParams', '$http', function ($scope,ActiveUser,ProInfoLoader,BLUEREC_ONLINE_CONFIG,$routeParams,$http) {
    var proReg = this;

    $scope.someData = '';

    proReg.registered = false;
    ActiveUser.getFromLocal();
    proReg.household = ActiveUser.userData.household;

    $scope.proinfo = ProInfoLoader;
    $scope.proinfo.loadProgram();

    $scope.formData = {};
    //$scope.formTemplate = {"fieldset":{"type":"fieldset","label":"Additional Information","fields":{"field_16":{"type":"number","label":"Number of numbers","model":"person.customFormResponse.field_16"},"submit":{"type":"submit","label":"Submit","model":"person.customFormResponse.field_submit"}}}};

    function submitCustomForm(idx)
    {
      console.log('submit form');
      console.log(proReg.household[idx].customForm);
    }

    function checkRegistration(idx) {
      if(proReg.household[idx].registrationSelected)
      {
        proReg.household[idx].progress = 0;

        console.log(idx);
        console.log(proReg.household[idx]);

        getProgramRequirementData(idx).then(
          function success(response) {
            proReg.household[idx].failed = response.failed_requirement;

            if(angular.isDefined(response.customForm))
            {
              proReg.household[idx].hasCustomFields = true;
              proReg.household[idx].customForm = JSON.parse(angular.toJson(response.customForm));
              //$scope.formTemplate = JSON.parse(angular.toJson(response.customForm));
              //$scope.formTemplate = "[{'type':'text','label':'Number of numbers','model':'field_16'},{'type':'submit','label':'Submit','model':'field_submit'}]";
            }
            else
            {
              proReg.household[idx].hasCustomFields = false;
              proReg.household[idx].customFormResponse = {};
              proReg.household[idx].customForm = [];
            }

            if(angular.isDefined(response.failed_requirement))
            {
              proReg.household[idx].progress = 10;
              proReg.household[idx].failedCount = response.failed_requirement.length;
            }
            else
            {
              proReg.household[idx].progress = 20;
              proReg.household[idx].failedCount = 0;
            }
            proReg.household[idx].waivers = response.waivers;
            console.log('show failed requirements:');
            console.log(proReg.household[idx]);
          }
        );
      }
      else{
        proReg.household[idx].showLoadingRegistration = false;
        proReg.household[idx].failed = null;
        proReg.household[idx].waivers = null;
        proReg.household[idx].progress = 0;
        proReg.household[idx].hasCustomFields = false;
      }
    }

    function getProgramRequirementData(idx)
    {
      proReg.household[idx].showLoadingRegistration = true;

      var req = {
        method: 'POST',
        url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/checkUserProgramRequirements',
        headers: {
          'Content-Type': undefined
        },
        data: {'uid': proReg.household[idx].user_id, 'pid':$scope.proinfo.returnData.item_id}
      };

      return $http(req)
        .then(
        function success(response) {
          proReg.household[idx].showLoadingRegistration = false;
          console.log('Here is the requirements response:');
          console.log(response.data);
          return response.data;
        }
      );
    }

    proReg.checkRegistration = checkRegistration;
    proReg.getProgramRequirementData = getProgramRequirementData;
    proReg.submitCustomForm = submitCustomForm;
  }]);
