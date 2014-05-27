(function () {
    'use strict';

    // Controller name is handy for logging
    var serviceId = 'tkService';

    // Define the controller on the module.
    // Inject the dependencies. 
    // Point to the controller definition function.
    angular.module('app').factory(serviceId,
        ['common', 'commonConfig', tkService]);

    function tkService(common, cfg) {
        var $q = common.$q;
        var $http = common.$http;
        var baseServiceUrl = cfg.config.baseServiceUrl;
        var url = 'https://csgprohackathonapi.azurewebsites.net/api/';
        var service = {
            getUserById: getUserById,
            createUser: createUser,
            //updateUser: updateUser
        };

        return service;

        function createUser(userName, password, name, email, timezone) {
            var poststr = url + "users?Username=" + userName +
                "&Password=" + password + "&Name=" + name + "&email=" + email +
                "&timezoneid=" + timezone + "&format=json&callId=" + common.generateGuid()
            return $http.post(poststr);
        }

        function getUserById(userId) {
            var getstr = url + "users/" + userId + "?format=json&callId=" + common.generateGuid();
            return $http.get(getstr);
        }
    }
})();