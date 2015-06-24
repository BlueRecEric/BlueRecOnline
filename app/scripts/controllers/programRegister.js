'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:ProgramList
 * @description
 * # ProgramList
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
  .controller('ProgramRegister', ['$scope', 'ActiveUser', 'ProInfoLoader', 'BLUEREC_ONLINE_CONFIG', '$routeParams', '$http', '$filter', function ($scope,ActiveUser,ProInfoLoader,BLUEREC_ONLINE_CONFIG,$routeParams,$http,$filter) {
    var proReg = this;

    $scope.someData = '';

    proReg.registered = false;
    ActiveUser.getFromLocal();
    proReg.household = ActiveUser.userData.household;

    $scope.proinfo = ProInfoLoader;
    $scope.proinfo.loadProgram();

    $scope.formData = {};
    //$scope.formTemplate = {"fieldset":{"type":"fieldset","label":"Additional Information","fields":{"field_16":{"type":"number","label":"Number of numbers","model":"person.customFormResponse.field_16"},"submit":{"type":"submit","label":"Submit","model":"person.customFormResponse.field_submit"}}}};

    proReg.genderOptions = [
      {
        'value':'NS',
        'name':'Not Specified'
      },
      {
        'value':'M',
        'name':'Male'
      },
      {
        'value':'F',
        'name':'Female'
      }
    ];

    proReg.gradeOptions = [
      {
        'value':'NA',
        'name':'NA'
      },
      {
        'value':'K',
        'name':'0'
      },
      {
        'value':'1',
        'name':'1'
      },
      {
        'value':'2',
        'name':'2'
      },
      {
        'value':'3',
        'name':'3'
      },
      {
        'value':'4',
        'name':'4'
      },
      {
        'value':'5',
        'name':'5'
      },
      {
        'value':'6',
        'name':'6'
      },
      {
        'value':'7',
        'name':'7'
      },
      {
        'value':'8',
        'name':'8'
      },
      {
        'value':'9',
        'name':'9'
      },
      {
        'value':'10',
        'name':'10'
      },
      {
        'value':'11',
        'name':'11'
      },
      {
        'value':'12',
        'name':'12'
      },
    ];


    function startRegistration(idx)
    {
      if(proReg.household[idx].registrationSelected)
      {
        getStartingRegistrationData(idx).then(
          function success(response) {

            resetUserRegistration(idx);

            if(angular.isDefined(response.failed_requirement))
            {
              proReg.household[idx].failed = response.failed_requirement;
              proReg.household[idx].failedCount = response.failed_requirement.length;
            }

            if(response.has_custom_fields === '1')
            {
              console.log('has custom fields');
              proReg.household[idx].totalSteps++;
              proReg.household[idx].has_custom_fields = true;
            }

            if(response.has_packages === '1')
            {
              console.log('has packages');
              proReg.household[idx].totalSteps++;
              proReg.household[idx].has_packages = true;
            }

            if(response.has_payments === '1')
            {
              console.log('has payments');
              proReg.household[idx].totalSteps++;
              proReg.household[idx].has_payments = true;
            }

            if(proReg.household[idx].failedCount === 0)
            {
              proReg.household[idx].step = 1;
              proReg.household[idx].partForm = {};
              proReg.household[idx].partForm.userID = response.user_id;
              proReg.household[idx].partForm.firstname = response.firstname;
              proReg.household[idx].partForm.lastname = response.lastname;
              proReg.household[idx].partForm.gender = response.gender;
              proReg.household[idx].partForm.grade = response.grade;
              proReg.household[idx].partForm.birthday = new Date(response.birth_year, (response.birth_month > 0)?(response.birth_month - 1):0, response.birth_day);
            }
          }
        );
      }
      else
      {
        resetUserRegistration(idx);
      }
    }

    function resetUserRegistration(idx)
    {
      proReg.household[idx].failed = null;
      proReg.household[idx].failedCount = 0;
      proReg.household[idx].step = 0;
      proReg.household[idx].totalSteps = 2;
      proReg.household[idx].has_custom_fields = false;
      proReg.household[idx].has_packages = false;
      proReg.household[idx].has_payments = false;
    }

    function getStartingRegistrationData(idx)
    {
      proReg.household[idx].showLoadingRegistration = true;

      var req = {
        method: 'POST',
        url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/program/registration/' + $routeParams.itemid,
        headers: {
          'Content-Type': undefined
        },
        data: {'uid': proReg.household[idx].user_id}
      };

      return $http(req)
        .then(
        function success(response) {
          proReg.household[idx].showLoadingRegistration = false;
          console.log('Here is the starting response:');
          console.log(response.data);
          return response.data;
        }
      );
    }

    function submitPartForm(idx)
    {
      proReg.household[idx].partForm.formatBirthday = $filter('date')(proReg.household[idx].partForm.birthday, 'yyyy-MM-dd');

      console.log('submit form');
      console.log(proReg.household[idx].partForm);

      proReg.household[idx].showLoadingRegistration = true;

      var req = {
        method: 'POST',
        url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/program/registration/' + $routeParams.itemid + '/saveuser',
        headers: {
          'Content-Type': undefined
        },
        data: proReg.household[idx].partForm
      };

      return $http(req)
        .then(
        function success(response) {
          proReg.household[idx].showLoadingRegistration = false;
          console.log('Here is the saveuser response:');
          console.log(response.data);

          proReg.household[idx].step++;

          if(proReg.household[idx].has_custom_fields)
          {
            console.log('go to custom fields');
            createCustomFieldForm(idx);
          }
          else
          {
            console.log('go to waivers');
          }
          return true;
        }
      );
    }

    function createCustomFieldForm(idx)
    {
      getCustomFieldData(idx).then(
        function success(response) {
          console.log('custom field response');
          console.log(response);
          proReg.household[idx].customForm = response.customForm;
        }
      );
    }


    function getCustomFieldData(idx)
    {
      proReg.household[idx].showLoadingRegistration = true;

      var req = {
        method: 'POST',
        url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/program/registration/' + $routeParams.itemid + '/customfields',
        headers: {
          'Content-Type': undefined
        },
        data: {'uid': proReg.household[idx].user_id}
      };

      return $http(req)
        .then(
        function success(response) {
          proReg.household[idx].showLoadingRegistration = false;
          console.log('Here is the starting response:');
          console.log(response.data);
          return response.data;
        }
      );
    }

    function submitCustomForm(idx)
    {
      console.log('submit form');
      console.log(angular.toJson(proReg.household[idx].customForm));
    }


















    function birthdayOpen($event,bdidx) {
      $event.preventDefault();
      $event.stopPropagation();

      console.log('birthday popup should open');

      proReg.datepickers[bdidx] = true;
    }

    proReg.dateOptions = {
      formatYear: 'yy',
      startingDay: 1
    };

    proReg.datepickers = {};

    var memberIndex = 0;

    angular.forEach(proReg.household, function() {
      proReg.datepickers[memberIndex] = false;
      console.log('forEach iterated ' + memberIndex + ' times');
      memberIndex++;
    });

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
              proReg.household[idx].userForm = {};
              proReg.household[idx].userForm.birthday = new Date(response.birth_year, response.birth_month, response.birth_day);
              proReg.household[idx].userForm.firstname = response.firstname;
              proReg.household[idx].userForm.lastname = response.lastname;
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

    proReg.submitCustomForm = submitCustomForm;
    proReg.getCustomFieldData = getCustomFieldData;
    proReg.createCustomFieldForm = createCustomFieldForm;
    proReg.submitPartForm = submitPartForm;
    proReg.getStartingRegistrationData = getStartingRegistrationData;
    proReg.startRegistration = startRegistration;
    proReg.birthdayOpen = birthdayOpen;
    proReg.checkRegistration = checkRegistration;
    proReg.getProgramRequirementData = getProgramRequirementData;
    proReg.submitCustomForm = submitCustomForm;
  }]);
