'use strict';

angular.module('bluereconlineApp')
    .factory('RegistrationFactory',[function() {

        var reg = this;
        reg.data = [];

        function addRegistration(userID, itemID)
        {
            if(isFinite(userID) && userID !== null)
            {
                if(isFinite(itemID) && itemID !== null)
                {
                    var regData = {};
                    regData.userID = userID;
                    regData.itemID = itemID;

                    reg.data.push(regData);
                }
            }
        }


        reg.addRegistration = addRegistration;
        return reg;

    }]);