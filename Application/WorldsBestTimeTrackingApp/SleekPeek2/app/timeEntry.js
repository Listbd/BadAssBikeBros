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
            getTimeEntries();
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
            vm.blankTimeEntry.Task = undefined;
            vm.blankTimeEntry.Tasks = vm.blankTimeEntry.Project.ProjectTasks;
            if (vm.blankTimeEntry.Tasks.length === 1)
                vm.blankTimeEntry.Task = vm.blankTimeEntry.Tasks[0];
            // Hard-code role
            vm.blankTimeEntry.ProjectRoleId = vm.blankTimeEntry.Project.ProjectRoles[0].ProjectRoleId;
        }

        vm.startWork = function () {
            //vm.blankTimeEntry.TimeIn = Date.now();
            //vm.blankTimeEntry.TimeIn = '2014-09-09T00:29:10.0334982+00:00';
            if (vm.blankTimeEntry.TimeIn == undefined || vm.blankTimeEntry.TimeIn.length == 0) {
                vm.blankTimeEntry.TimeIn = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");
            }

            vm.blankTimeEntry.ProjectTaskId = vm.blankTimeEntry.Task.ProjectTaskId;
            return timeTracking.postTimeEntry(vm.blankTimeEntry)
            .success(function (response) {
                common.$timeout(function () {
                    // Heavy-handed, but, let's update the project....
                    getTimeEntries();
                    resetBlankTimeEntry();
                })
                return null;
            }).error(function (error) {
                common.reportError(error);
                return null;
            });
        }

        function getTimeEntries() {
            return timeTracking.getTimeEntries()
                .success(function (response) {
                    common.$timeout(function () {
                        var timeEntries = response;
                        if (timeEntries.length > 0) {
                            vm.timeEntries = response;
                            vm.timeEntries.reverse(); // TEMP, should sort, but not sure why it doesn't work
                            //vm.timeEntries.sort(
                            //    function (a, b) {
                            //        var aa = new Date(a.TimeIn);
                            //        var bb = new Date(b.TimeIn);
                            //        var result = aa > bb;
                            //        return result;
                            //    });
                        }

                    })
                    return null;
                }).error(function (error) {
                    common.reportError(error);
                    return null;
                });
        }

    }
})();