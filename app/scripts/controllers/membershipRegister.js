'use strict';

/**
 * @ngdoc function
 * @name bluereconlineApp.controller:ProgramList
 * @description
 * # ProgramList
 * Controller of the bluereconlineApp
 */
angular.module('bluereconlineApp')
  .controller('MembershipRegister', ['$scope', 'ActiveUser', 'MemInfoLoader', 'BLUEREC_ONLINE_CONFIG', '$routeParams', '$http', '$filter', 'md5', '$location', '$anchorScroll', function ($scope,ActiveUser,MemInfoLoader,BLUEREC_ONLINE_CONFIG,$routeParams,$http,$filter,md5,$location, $anchorScroll) {
        var memReg = this;

        memReg.registered = false;
        memReg.household = {};

        ActiveUser.getFromLocal().then(function() {
            console.log('register data:');
            console.log(ActiveUser.userData);
            memReg.household = ActiveUser.userData.household;
            }, function() {
                sendToLogin();
            }, function() {
        });

        function sendToLogin()
        {
            $location.path('/' + $routeParams.orgurl + '/login');
        }


        $scope.memReg = memReg;

        $scope.memInfo = [];

        $scope.memInfo = MemInfoLoader;
        $scope.memInfo.loadMembership();

        $scope.memInfo.totalMembershipFee = 0;
        $scope.memInfo.toPayToday = 0;

        $scope.memInfo.totalSteps = 4;
        $scope.memInfo.step = 1;

        $scope.memForm = {};

        $scope.householdForm = {};
        //memReg.householdForm = $scope.memInfo.returnData.data[0];

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
                                    memReg.household[p].fees[userFeeCount].item_fee_id = memberFees[f].item_fee_id;
                                    memReg.household[p].fees[userFeeCount].fee_amount = memberFees[f].fee_amount;
                                    userFeeCount++;
                                }
                                else if (!userFeeSelected && memberFees[f].mem_add_family_member_fee === '0') {
                                    totalFee += Number(memberFees[f].fee_amount);
                                    userFeeSelected = true;
                                    memReg.household[p].fees[userFeeCount] = {};
                                    memReg.household[p].fees[userFeeCount].item_fee_id = memberFees[f].item_fee_id;
                                    memReg.household[p].fees[userFeeCount].fee_amount = memberFees[f].fee_amount;
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
  }]);
