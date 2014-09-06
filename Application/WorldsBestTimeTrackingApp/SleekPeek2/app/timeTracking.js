(function () {
    'user strict';

    var factoryId = 'timeTracking';

    angular.module('app').factory(factoryId, ['common', 'commonConfig', 'authService', timeTracking]);

    function timeTracking(common, cfg, authService) {
        var $http = common.$http;
        var $q = common.$q;
        var apiurl = "https://csgprohackathonapi.azurewebsites.net/api";

        var service = {
            getUser: getUser,
            postUser: postUser,
            getProjects: getProjects,
            getProject: getProject,
            postProjectRole: postProjectRole,
            deleteProjectRole : deleteProjectRole
        };
        return service;

        function getUser(user, password) {
            var url = apiurl + "/users?format=json&callId=" + common.generateGuid();
            //$http.defaults.headers.common.Authorization = 'Basic RHVkZTg6cGFzc3dvcmQ=';
            //return $http.get(url, { withCredentials: true });

            var auth = btoa(user + ":" + password);

            var r = $http({
                url: url,
                method: 'GET',
                headers: { 'Authorization': 'Basic ' + auth } // RHVkZTg6cGFzc3dvcmQ=' }
            });
            return r;
        }

        function postUser(user, password) {
            var url = apiurl + "/users?format=json&callId=" + common.generateGuid();

            var userdata = {
                "Password": password,
                "UserName": user,
                "Name": user,
                "Email": user + "@" + user + ".com",
                "TimeZoneId": "Pacific Standard Time",
                "UseStopwatchApproachToTimeEntry": true,
                "ExternalSystemKey": user
            };

            var r = $http.post(url, userdata);
            return r;
        }


        function getProjects() {
            var url = apiurl + "/Projects?format=json&callId=" + common.generateGuid();

            var auth = authService.getAuthCode();

            var r = $http({
                url: url,
                method: 'GET',
                headers: { 'Authorization': 'Basic ' + auth } // RHVkZTg6cGFzc3dvcmQ=' }
            });
            return r;

        }

        function getProject(projectId) {
            var url = apiurl + "/Projects/" + projectId + "?format=json&callId=" + common.generateGuid();

            var auth = authService.getAuthCode();

            var r = $http({
                url: url,
                method: 'GET',
                headers: { 'Authorization': 'Basic ' + auth } // RHVkZTg6cGFzc3dvcmQ=' }
            });
            return r;

        }

        function postProject(project) {
            var url = apiurl + "/Projects?format=json&callId=" + common.generateGuid();
            var auth = authService.getAuthCode();

            var r = $http({
                url: url,
                method: 'POST',
                headers: { 'Authorization': 'Basic ' + auth },
                data: project
            });
            return r;
        }

        function postProjectRole(projectRole) {
            var url = apiurl + "/ProjectRoles?format=json&callId=" + common.generateGuid();
            var auth = authService.getAuthCode();

            var r = $http({
                url: url,
                method: 'POST',
                headers: { 'Authorization': 'Basic ' + auth },
                data: projectRole
            });
            return r;
        }

        function deleteProjectRole(projectRoleId) {
            var url = apiurl + "/ProjectRoles/" + projectRoleId + "?format=json&callId=" + common.generateGuid();
            var auth = btoa(user + ":" + password);

            var r = $http({
                url: url,
                method: 'DELETE',
                headers: { 'Authorization': 'Basic ' + auth }
            });
            return r;
        }


    }

})();