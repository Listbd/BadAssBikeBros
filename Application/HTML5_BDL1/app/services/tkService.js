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
        var url = 'https://csgprohackathonapi.azurewebsites.net/api/' + 'policies';
        var service = {
            getUserById: getUserById,
            //createUser: createUser,
            //updateUser: updateUser
        };

        return service;

        function getUserById(userId) {
            return $http.get(url + "/" + userId + "?format=json&callId=" + common.generateGuid());
        }
    }
})();