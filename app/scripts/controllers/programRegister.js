'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:ProgramList
 * @description
 * # ProgramList
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
  .controller('ProgramRegister', ['$scope', 'ActiveUser', 'ProInfoLoader', 'BLUEREC_ONLINE_CONFIG', '$routeParams', '$http', '$filter', 'md5', '$location', '$anchorScroll', '$modal', function ($scope,ActiveUser,ProInfoLoader,BLUEREC_ONLINE_CONFIG,$routeParams,$http,$filter,md5,$location, $anchorScroll,$modal) {
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

    proReg.gotoUserTop = function(idx) {
      // set the location.hash to the id of
      // the element you wish to scroll to.
      //$location.hash(proReg.household[idx].anchorHash);

      // call $anchorScroll()
      $anchorScroll.yOffset = 80;
      $anchorScroll(proReg.household[idx].anchorHash);
    };

    function startRegistration(idx)
    {
      if(proReg.household[idx].registrationSelected)
      {
        getStartingRegistrationData(idx).then(
          function success(response) {

            resetUserRegistration(idx);

            proReg.household[idx].anchorHash = md5.createHash(proReg.household[idx].user_id + idx);

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
              proReg.household[idx].stepName = 'user';
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
      proReg.household[idx].stepName = '';
      proReg.household[idx].totalSteps = 3;
      proReg.household[idx].has_custom_fields = false;
      proReg.household[idx].has_packages = false;
      proReg.household[idx].has_payments = false;
      proReg.household[idx].paymentsForm = {};
      proReg.household[idx].packageForm = {};
      proReg.household[idx].waiverForm = {};
      proReg.household[idx].customForm = {};
      proReg.household[idx].partForm = {};
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
            proReg.household[idx].stepName = 'waiver';
            console.log('go to waivers');
            createWaiverForm(idx);
          }
          return true;
        }
      );
    }

    function createCustomFieldForm(idx)
    {
      proReg.household[idx].stepName = 'custom';
      proReg.gotoUserTop(idx);

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

      proReg.household[idx].showLoadingRegistration = true;

      var req = {
        method: 'POST',
        url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/program/registration/' + $routeParams.itemid + '/savecustom',
        headers: {
          'Content-Type': undefined
        },
        data: {'formData':angular.toJson(proReg.household[idx].customForm),'uid':proReg.household[idx].user_id}
      };

      return $http(req)
        .then(
        function success(response) {
          proReg.household[idx].showLoadingRegistration = false;
          console.log('Here is the savecustom response:');
          console.log(response.data);

          proReg.household[idx].step++;

          console.log('go to waivers');
          createWaiverForm(idx);
          return true;
        }
      );
    }

    function createWaiverForm(idx)
    {
      proReg.household[idx].stepName = 'waiver';
      proReg.gotoUserTop(idx);

      getWaiverData(idx).then(
        function success(response) {
          console.log('waiver response');
          console.log(response);
          proReg.household[idx].waiverForm = response;
        }
      );
    }

    function getWaiverData(idx)
    {
      proReg.household[idx].showLoadingRegistration = true;

      var req = {
        method: 'POST',
        url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/program/registration/' + $routeParams.itemid + '/waivers',
        headers: {
          'Content-Type': undefined
        },
        data: {'uid': proReg.household[idx].user_id}
      };

      return $http(req)
        .then(
        function success(response) {
          proReg.household[idx].showLoadingRegistration = false;
          console.log('Here is the waiver response:');
          console.log(response.data);
          return response.data;
        }
      );
    }

    function submitWaiverForm(idx)
    {
      proReg.household[idx].showLoadingRegistration = true;

      console.log('submit waiver form');
      console.log(angular.toJson(proReg.household[idx].waiverForm));

      proReg.household[idx].completedWaivers = proReg.household[idx].waiverForm;

      proReg.household[idx].step++;

      if(proReg.household[idx].has_packages)
      {
        proReg.household[idx].stepName = 'packages';
        console.log('go to packages');
      }
      else if(proReg.household[idx].has_payments)
      {
        console.log('go to payments');
        createPaymentsForm(idx);
      }
    }

    function createPaymentsForm(idx)
    {
      proReg.household[idx].stepName = 'payments';
      proReg.gotoUserTop(idx);

      getPaymentData(idx).then(
        function success(response) {
          proReg.household[idx].showLoadingRegistration = false;

          console.log('payments response');
          console.log(response);
          proReg.household[idx].paymentsForm = response;
        }
      );
    }

    function getPaymentData(idx)
    {
      proReg.household[idx].showLoadingRegistration = true;

      var req = {
        method: 'POST',
        url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/program/registration/' + $routeParams.itemid + '/payments',
        headers: {
          'Content-Type': undefined
        },
        data: {'uid': proReg.household[idx].user_id}
      };

      return $http(req)
        .then(
        function success(response) {
          console.log('Here is the payments response:');
          console.log(response.data);
          return response.data;
        }
      );
    }

    function submitPaymentsForm(idx)
    {
      proReg.household[idx].showLoadingRegistration = true;

      console.log('submit payments form');
      console.log(angular.toJson(proReg.household[idx].paymentsForm));

      proReg.household[idx].completedPayments = proReg.household[idx].paymentsForm;


      //proReg.household[idx].stepName = 'final';
      console.log('go to last page');
      proReg.household[idx].step++;
      createLastPage(idx);
    }

    function createLastPage(idx)
    {
      proReg.household[idx].showLoadingRegistration = true;
      proReg.household[idx].stepName = 'review';
      proReg.gotoUserTop(idx);
      proReg.household[idx].showLoadingRegistration = false;
    }

    function submitFinalForm(idx)
    {
      console.log(idx);
      $scope.openGatewayAlert();
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

    $scope.openGatewayAlert = function (size) {

      var modalInstance = $modal.open({
        animation: false,
        templateUrl: 'noPaymentGateway.html',
        controller: 'NoGatewayCtrl',
        size: size
      });

      modalInstance.result.then(function () {
        console.log('Modal closed at: ' + new Date());
      }, function () {
        console.log('Modal dismissed at: ' + new Date());
      });
    };

    proReg.submitFinalForm = submitFinalForm;
    proReg.submitPaymentsForm = submitPaymentsForm;
    proReg.submitWaiverForm = submitWaiverForm;
    proReg.createWaiverForm = createWaiverForm;
    proReg.submitCustomForm = submitCustomForm;
    proReg.getCustomFieldData = getCustomFieldData;
    proReg.createCustomFieldForm = createCustomFieldForm;
    proReg.submitPartForm = submitPartForm;
    proReg.getStartingRegistrationData = getStartingRegistrationData;
    proReg.startRegistration = startRegistration;
    proReg.birthdayOpen = birthdayOpen;
  }])
  .controller('NoGatewayCtrl', function ($scope, $modalInstance) {
    $scope.selected = {};
    $scope.ok = function () {
      $modalInstance.close();
    };
  });
