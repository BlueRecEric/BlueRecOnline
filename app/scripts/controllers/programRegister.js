'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:ProgramList
 * @description
 * # ProgramList
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
  .controller('ProgramRegister', ['$scope', 'ActiveUser', 'ProInfoLoader', 'BLUEREC_ONLINE_CONFIG', '$routeParams', '$http', '$filter', 'md5', '$location', '$anchorScroll', function ($scope,ActiveUser,ProInfoLoader,BLUEREC_ONLINE_CONFIG,$routeParams,$http,$filter,md5,$location, $anchorScroll) {
    var proReg = this;

    proReg.registered = false;
    proReg.household = {};

    ActiveUser.getFromLocal().then(function() {
      console.log('register data:');
      console.log(ActiveUser.userData);
      proReg.household = ActiveUser.userData.household;
      //$scope.$root.currentUser = response.data;
    }, function() {
      sendToLogin();
    }, function() {
    });

    function sendToLogin()
    {
      $location.path('/' + $routeParams.orgurl + '/login');
    }

    //console.log('household data:');
    //console.log(proReg.household);

    $scope.proinfo = ProInfoLoader;
    $scope.proinfo.loadProgram();

      console.log('program info');
      console.log($scope.proinfo);

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
        'value':'0',
        'name':'NA'
      },
      {
        'value':'PreK',
        'name':'Pre-K'
      },
      {
        'value':'K',
        'name':'K'
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

    proReg.goToUserTop = function(idx) {
      $anchorScroll.yOffset = 60;
      $anchorScroll(proReg.household[idx].anchorHash);
    };

    function startRegistrationLink(idx)
    {
      proReg.household[idx].registrationSelected = (proReg.household[idx].registrationSelected)?false:true;
      startRegistration(idx);
    }

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
              proReg.household[idx].totalSteps++;
              proReg.household[idx].has_custom_fields = true;
            }

            if(response.has_packages === '1')
            {
              proReg.household[idx].totalSteps++;
              proReg.household[idx].has_packages = true;
            }

            if(response.has_payments === '1')
            {
              proReg.household[idx].totalSteps++;
              proReg.household[idx].has_payments = true;
            }


            proReg.household[idx].step = 1;
            proReg.household[idx].stepName = 'user';
            proReg.household[idx].partForm.userID = response.user_id;
            proReg.household[idx].partForm.firstname = response.firstname;
            proReg.household[idx].partForm.lastname = response.lastname;
            proReg.household[idx].partForm.gender = response.gender;
            proReg.household[idx].partForm.grade = response.grade;
            proReg.household[idx].partForm.birthday = new Date(response.birth_year, (response.birth_month > 0)?(response.birth_month - 1):0, response.birth_day);

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
      proReg.household[idx].addedToCart = false;
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
          return response.data;
        }
      );
    }

    function submitPartForm(idx)
    {
      proReg.household[idx].partForm.formatBirthday = $filter('date')(proReg.household[idx].partForm.birthday, 'yyyy-MM-dd');
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

          proReg.household[idx].failed = {};
          proReg.household[idx].failedCount = 0;

          getStartingRegistrationData(idx).then(
            function success(response) {
              if(angular.isDefined(response.failed_requirement))
              {
                proReg.household[idx].failed = response.failed_requirement;
                proReg.household[idx].failedCount = response.failed_requirement.length;
                return false;
              }
              else
              {
                proReg.household[idx].step++;

                if(proReg.household[idx].has_custom_fields)
                {
                  createCustomFieldForm(idx);
                }
                else
                {
                  proReg.household[idx].stepName = 'waiver';
                  createWaiverForm(idx);
                }
                return true;
              }
            }
          );
        }
      );
    }

    function createCustomFieldForm(idx)
    {
      proReg.household[idx].stepName = 'custom';
      proReg.goToUserTop(idx);

      getCustomFieldData(idx).then(
        function success(response) {
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
          return response.data;
        }
      );
    }

    function submitCustomForm(idx)
    {
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
          proReg.household[idx].step++;

          createWaiverForm(idx);
          return true;
        }
      );
    }

    function createWaiverForm(idx)
    {
      proReg.household[idx].stepName = 'waiver';
      proReg.goToUserTop(idx);

      getWaiverData(idx).then(
        function success(response) {
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
          return response.data;
        }
      );
    }

    function submitWaiverForm(idx)
    {
      proReg.household[idx].showLoadingRegistration = true;
      proReg.household[idx].completedWaivers = proReg.household[idx].waiverForm;

      proReg.household[idx].step++;

      if(proReg.household[idx].has_packages)
      {
        createPackageForm(idx);
      }
      else if(proReg.household[idx].has_payments)
      {
        createPaymentsForm(idx);
      }
      else
      {
        createLastPage(idx);
      }

    }

    function createPackageForm(idx)
    {
      proReg.household[idx].stepName = 'packages';
      proReg.goToUserTop(idx);

      getPackageData(idx).then(
        function success(response) {
          proReg.household[idx].showLoadingRegistration = false;
          proReg.household[idx].packageForm = response;
        }
      );
    }

    function getPackageData(idx)
    {
      proReg.household[idx].showLoadingRegistration = true;

      var req = {
        method: 'POST',
        url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/program/registration/' + $routeParams.itemid + '/packages',
        headers: {
          'Content-Type': undefined
        },
        data: {'uid': proReg.household[idx].user_id}
      };

      return $http(req)
        .then(
        function success(response) {
          return response.data;
        }
      );
    }

    function submitPackageForm(idx)
    {
      proReg.household[idx].showLoadingRegistration = true;
      proReg.household[idx].completedPackages = proReg.household[idx].packageForm;

      proReg.household[idx].step++;
      if(proReg.household[idx].has_payments)
      {
        createPaymentsForm(idx);
      }
      else
      {
        createLastPage(idx);
      }
    }

    function createPaymentsForm(idx)
    {
      proReg.household[idx].stepName = 'payments';
      proReg.goToUserTop(idx);

      getPaymentData(idx).then(
        function success(response) {
          proReg.household[idx].showLoadingRegistration = false;
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
          return response.data;
        }
      );
    }

    function submitPaymentsForm(idx)
    {
      proReg.household[idx].showLoadingRegistration = true;
      proReg.household[idx].completedPayments = proReg.household[idx].paymentsForm;
      proReg.household[idx].step++;
      createLastPage(idx);
    }

    function createLastPage(idx)
    {
      proReg.household[idx].submittingCart = false;
      proReg.household[idx].showLoadingRegistration = true;
      proReg.household[idx].stepName = 'review';
      proReg.goToUserTop(idx);
      proReg.household[idx].showLoadingRegistration = false;

      // create the array that we will use to add the item to the shopping cart

      proReg.submitData = {};
      proReg.submitData.householdID = ActiveUser.userData.household_id;
      proReg.submitData.userID = proReg.household[idx].user_id;
      proReg.submitData.addedByUserID = ActiveUser.userData.user_id;
      proReg.submitData.itemID = $routeParams.itemid;
      proReg.submitData.waivers = [];
      proReg.submitData.fees = [];
      proReg.submitData.addons = [];
      proReg.submitData.paymentPlans = [];

      var feeCount = 0;
      if($scope.proinfo.returnData.fees.length > 0) {
        for (var fees = 0; fees < 1; fees++) {
          proReg.submitData.fees[feeCount] = {};
          proReg.submitData.fees[feeCount].itemFeeID = $scope.proinfo.returnData.fees[fees].item_fee_id;
          proReg.submitData.fees[feeCount].feeAmount = $scope.proinfo.returnData.fees[fees].fee_amount;
          feeCount++;
        }
      }

      var waiverCount = 0;

      for(var waivers = 0; waivers < proReg.household[idx].waiverForm.length; waivers++)
      {
        if(proReg.household[idx].waiverForm[waivers].agreed === true)
        {
          proReg.submitData.waivers[waiverCount] = {};
          proReg.submitData.waivers[waiverCount].waiverID = proReg.household[idx].waiverForm[waivers].waiver_id;
          waiverCount++;
        }
      }

      var addonCount = 0;

      for(var addons = 0; addons < proReg.household[idx].packageForm.length; addons++)
      {
        if(proReg.household[idx].packageForm[addons].selected === true)
        {
          proReg.submitData.addons[addonCount] = {};
          proReg.submitData.addons[addonCount].itemID = proReg.household[idx].packageForm[addons].item_id;
          proReg.submitData.addons[addonCount].quantity = 1;
          proReg.submitData.addons[addonCount].fees = [];

          for(var addonFee = 0; addonFee < proReg.household[idx].packageForm[addons].fees.length; addonFee++)
          {
            proReg.submitData.addons[addonCount].fees[addonFee] = {};
            proReg.submitData.addons[addonCount].fees[addonFee].itemFeeID = proReg.household[idx].packageForm[addons].fees[addonFee].item_fee_id;
            proReg.submitData.addons[addonCount].fees[addonFee].feeAmount = proReg.household[idx].packageForm[addons].fees[addonFee].fee_amount;
          }

          addonCount++;
        }
      }

      var payPlanCount = 0;

      for(var payPlans = 0; payPlans < proReg.household[idx].paymentsForm.length; payPlans++)
      {
        if(proReg.household[idx].paymentsForm[payPlans].selected === true)
        {
          proReg.submitData.paymentPlans[payPlanCount] = {};
          proReg.submitData.paymentPlans[payPlanCount].itemID = proReg.household[idx].paymentsForm[payPlans].item_id;
          proReg.submitData.paymentPlans[payPlanCount].quantity = 1;
          proReg.submitData.paymentPlans[payPlanCount].fees = [];

          for(var planFee = 0; planFee < proReg.household[idx].paymentsForm[payPlans].fees.length; planFee++)
          {
            proReg.submitData.paymentPlans[payPlanCount].fees[planFee] = {};
            proReg.submitData.paymentPlans[payPlanCount].fees[planFee].itemFeeID = proReg.household[idx].paymentsForm[payPlans].fees[planFee].item_fee_id;
            proReg.submitData.paymentPlans[payPlanCount].fees[planFee].feeAmount = proReg.household[idx].paymentsForm[payPlans].fees[planFee].fee_amount;
          }

          payPlanCount++;
        }
      }

      console.log('Here is what we are submitting');
      console.log(proReg.submitData);
      console.log(angular.toJson(proReg.submitData));
    }

    function submitFinalForm(idx)
    {
      proReg.household[idx].showLoadingRegistration = true;
      proReg.household[idx].submittingCart = true;

      var req = {
        method: 'POST',
        url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/program/registration/' + $routeParams.itemid + '/addtocart',
        headers: {
          'Content-Type': undefined
        },
        data: proReg.submitData
      };

      return $http(req)
          .then(
          function success(response) {
            proReg.submitData = {};
            resetUserRegistration(idx);
            proReg.household[idx].showLoadingRegistration = false;
            proReg.household[idx].submittingCart    `````````````````````````````````````````````````````````````````````````````
              11    `   `11111111111= false;
            proReg.household[idx].registrationSelected = false;
            proReg.household[idx].addedToCart = true;
            $location.path('/' + $routeParams.orgurl + '/addedtocart');
            return response.data;
          }
      );
    }

    function birthdayOpen($event,bdidx) {
      $event.preventDefault();
      $event.stopPropagation();

      proReg.datepickers[bdidx] = true;
    }

    proReg.dateOptions = {
      formatYear: 'yy',
      startingDay: 1
    };

    proReg.datepickers = {};

    proReg.startRegistrationLink = startRegistrationLink;
    proReg.submitPackageForm = submitPackageForm;
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
  }]);
