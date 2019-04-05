'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:ProgramList
 * @description
 * # ProgramList
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
  .controller('MembershipRegister', ['$scope', 'ActiveUser', 'MemInfoLoader', 'CustomFieldLoader', 'BLUEREC_ONLINE_CONFIG', '$routeParams', '$http', '$filter', 'md5', '$location', '$anchorScroll', function ($scope,ActiveUser,MemInfoLoader,CustomFieldLoader,BLUEREC_ONLINE_CONFIG,$routeParams,$http,$filter,md5,$location, $anchorScroll) {
        var memReg = this;

        memReg.registered = false;
        memReg.household = {};



        function sendToLogin()
        {
            $location.path('/' + $routeParams.orgurl + '/login');
        }

        function setHouseholdData()
        {
            console.log('setting user data after update');
            console.log(ActiveUser.userData);
            memReg.household = ActiveUser.userData.household;

            console.log('memReg household');
            console.log(memReg.household);            
        }

        function updateHouseholdData()
        {
            console.log('is the user logged in?');
            if(ActiveUser.isLoggedIn())
            {
                console.log('Yes, do the update');
                ActiveUser.updateUser().then(function(){
                  console.log('updated, set the data');
                  setTimeout(setHouseholdData, 250);
                });
            }
        }  

        if(ActiveUser.isLoggedIn())
        {
            setTimeout(updateHouseholdData,250);
        }

        $scope.memReg = memReg;

        $scope.memInfo = [];

        $scope.memInfo = MemInfoLoader;

        $scope.memInfo.loadMembershipForHousehold(ActiveUser.userData.user_id, ActiveUser.userData.household_id);

        $scope.customFieldInfo = CustomFieldLoader;

        console.log('passing ' + ActiveUser.userData.user_id + ' as user id');
        $scope.$watch(function(){return $scope.memInfo.busy;}, $scope.customFieldInfo.loadCustomFields(ActiveUser.userData.user_id));

        console.log('custom fields');
        console.log($scope.customFieldInfo);

        $scope.memInfo.totalMembershipFee = 0;
        $scope.memInfo.toPayToday = 0;

        $scope.memInfo.totalSteps = 4;
        $scope.memInfo.step = 1;

        $scope.memForm = {};

        $scope.householdForm = {};
        //memReg.householdForm = $scope.memInfo.returnData.data[0];

        function submitMembershipForm()
        {
            var submitData = {};
            submitData.householdID = ActiveUser.userData.household_id;
            submitData.itemID = $routeParams.itemid;
            submitData.userID = ActiveUser.userData.user_id;
            submitData.addedByUserID = ActiveUser.userData.user_id;
            submitData.usePaymentPlan = ($scope.memForm.use_payment_plan)?'1':'0';
            submitData.itemType = 'MEMBERSHIP';
            submitData.familyMembership = $scope.memInfo.returnData.is_family;
            submitData.totalCharge = $scope.memInfo.totalMembershipFee;
            submitData.waivers = [];
            submitData.members = [];

            var waiverCount = 0;

            if($scope.memInfo.returnData.waivers != null) {
                for (var waivers = 0; waivers < $scope.memInfo.returnData.waivers.data.length; waivers++) {
                    if ($scope.memInfo.returnData.waivers.data[waivers].agreed === true) {
                        submitData.waivers[waiverCount] = {};
                        submitData.waivers[waiverCount].waiverID = $scope.memInfo.returnData.waivers.data[waivers].waiver_id;
                        waiverCount++;
                    }
                }
            }

            var selectedMembers = 0;

            for (var p = 0; p < memReg.household.length; p++) {
                if (memReg.household[p].members_selected) {
                    submitData.members[selectedMembers] = memReg.household[p];
                    selectedMembers++;
                }
            }

            console.log('here is what we will submit');
            console.log(submitData);

            $scope.memInfo.submittingCart = true;

            var req = {
                method: 'POST',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/cart/add',
                headers: {
                    'Content-Type': undefined
                },
                data: submitData
            };

            return $http(req)
                .then(
                function success(response) {
                    submitData = {};
                    $scope.memInfo.submittingCart = false;
                    $location.path('/' + $routeParams.orgurl + '/addedtocart');
                    return response.data;
                }
            );
        }

        function calculatePaymentFee()
        {
            if(angular.isDefined($scope.memInfo) && angular.isDefined($scope.memInfo.totalMembershipFee)) {
                if ($scope.memForm.use_payment_plan) {
                    $scope.memInfo.toPayToday = ($scope.memInfo.totalMembershipFee / $scope.memInfo.returnData.num_of_payments).toFixed(2);
                }
                else {
                    $scope.memInfo.toPayToday = $scope.memInfo.totalMembershipFee;
                }
            }
        }

        function calculateFee()
        {
            console.log('memInfo');
            console.log($scope.memInfo);
            var memInfo = $scope.memInfo;
            if(!memInfo.busy) {
                var selectedUsers = 0;
                var totalFee = 0;
                var memberFees = {};
                var userFeeSelected = false;
                var userFeeCount = 0;


                console.log('Membership info:');
                console.log(memInfo);
                //console.log('Form data:');
                //console.log(memReg.householdForm);
                if (angular.isDefined(memInfo.returnData.fees)) {
                    console.log('Fees:');
                    memberFees = memInfo.returnData.fees.data;
                    console.log(memberFees);
                }

                console.log('Number of selected users has changed...');

                for (var p = 0; p < memReg.household.length; p++) {
                    if (memReg.household[p].members_selected) {
                        userFeeCount = 0;
                        memReg.household[p].fees = [];
                        console.log(memReg.household[p].firstname + ' selected');
                        selectedUsers++;
                        if (angular.isDefined(memberFees)) {
                            for (var f = 0; f < memberFees.length; f++) {
                                if (!userFeeSelected && selectedUsers > 0 && memberFees[f].mem_add_family_member_fee === '1' && selectedUsers > memberFees[f].additional_after) {
                                    totalFee += Number(memberFees[f].fee_amount);
                                    userFeeSelected = true;
                                    memReg.household[p].fees[userFeeCount] = {};
                                    memReg.household[p].fees[userFeeCount].itemFeeID = memberFees[f].item_fee_id;
                                    memReg.household[p].fees[userFeeCount].feeAmount = memberFees[f].fee_amount;
                                    userFeeCount++;
                                }
                                else if (!userFeeSelected && memberFees[f].mem_add_family_member_fee === '0') {
                                    totalFee += Number(memberFees[f].fee_amount);
                                    userFeeSelected = true;
                                    memReg.household[p].fees[userFeeCount] = {};
                                    memReg.household[p].fees[userFeeCount].itemFeeID = memberFees[f].item_fee_id;
                                    memReg.household[p].fees[userFeeCount].feeAmount = memberFees[f].fee_amount;
                                    userFeeCount++;
                                }
                            }
                        }
                        userFeeSelected = false;
                        console.log('Total fee: $' + totalFee);
                    }
                }

                console.log('Reg info:');
                console.log(memReg);
                $scope.memInfo.totalMembershipFee = (totalFee).toFixed(2);
                $scope.memInfo.toPayToday = (totalFee).toFixed(2);

                calculatePaymentFee();
            }
        }

        $scope.calculateFee = calculateFee;
        $scope.calculatePaymentFee = calculatePaymentFee;
        $scope.submitMembershipForm = submitMembershipForm;
  }]);
