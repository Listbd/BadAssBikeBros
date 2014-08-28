(function () {
    'user strict';

    var factoryId = 'timeTracking';

    angular.module('app').factory(factoryId, ['common', 'commonConfig', timeTracking]);

    function timeTracking(common, cfg) {
        var $http = common.$http;
        var $q = common.$q;
        var url = "https://csgprohackathonapi.azurewebsites.net/api";

        var service = {
            getUser: getUser,
            getProjects: getProjects
        };
        return service;

        function getUser(user, password) {
            var getstr = url + "/users?format=json&callId=" + common.generateGuid();
            //$http.defaults.headers.common.Authorization = 'Basic RHVkZTg6cGFzc3dvcmQ=';
            //return $http.get(getstr, { withCredentials: true });

            var auth = btoa(user + ":" + "password");

            var r = $http({
                url: getstr,
                method: 'GET',
                headers: { 'Authorization': 'Basic ' + auth } // RHVkZTg6cGFzc3dvcmQ=' }
            });
            return r;
        }

        function getProjects(user, password) {
            var getstr = url + "/Projects?format=json&callId=" + common.generateGuid();

            //var auth = btoa(user + ":" + password);
            auth = btoa("dude:password");

            var r = $http({
                url: getstr,
                method: 'GET',
                headers: { 'Authorization': 'Basic ' + auth } // RHVkZTg6cGFzc3dvcmQ=' }
            });
            return r;

        }
    }

})();