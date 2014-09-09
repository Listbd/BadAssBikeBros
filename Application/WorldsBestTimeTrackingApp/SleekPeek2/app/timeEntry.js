(function () {
    'use strict';

    var controllerId = 'timeEntry'; // must match... what?

    // ??? why can it not find the function when common is passed
    angular.module('app').controller(controllerId, ['common', 'timeTracking', '$routeParams', '$scope', timeEntry]);

    function timeEntry(common, timeTracking, $routeParams, $scope) {
        var getMsgFn = common.logger.getLogFn;
        var msg = getMsgFn(controllerId);
        var msgSuccess = getMsgFn(controllerId, 'success');
        var msgError = getMsgFn(controllerId, 'error');
        var msgWarning = getMsgFn(controllerId, 'warning');

        var vm = this;

        activate();

        function activate() {
            resetBlankTimeEntry();
            var promises = [getProjects()];
            common.activateController(promises, controllerId).then(function () { });

            //    vm.name = "fiduciary";
        }

        function getProjects() {
            return timeTracking.getProjects()
                .success(function (response) {
                    common.$timeout(function () {
                        var projects = response;
                        if (projects.length > 0) {
                            vm.projects = response;
                        }

                    })
                    return null;
                }).error(function (error) {
                    common.reportError(error);
                    return null;
                });

        }

        function resetBlankTimeEntry()
        {
            vm.blankTimeEntry = {
                'Projects': [],
                'Tasks': [],
                "ProjectRoleId": undefined,
                "ProjectTaskId": undefined,
                "Billable": true,
                "TimeIn": undefined,
                "TimeOut": undefined,
                "Hours": 0,
                "Comment": ""
            }

        }

        vm.updateTasks = function () {
            vm.blankTimeEntry.Tasks = [{
                "ProjectTaskId": 1,
                "Name": "Development",
                "Billable": true,
                "RequireComment": true,
                "ExternalSystemKey": "sample string 6"
            },
            {
                "ProjectTaskId": 2,
                "Name": "Screwing Around",
                "Billable": true,
                "RequireComment": true,
                "ExternalSystemKey": "sample string 6"
            }]
        }



    }
})();