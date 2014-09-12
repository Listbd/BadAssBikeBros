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

        vm.timeEntries = [];

        activate();

        function activate() {
            resetBlankTimeEntry();

            //var today = moment(Date.now()).format('YYYY-MM-DD');
            //var yesterday = moment(Date.now()).subtract(1, 'days').format('YYYY-MM-DD');
            var daysToPull = 10;
            for (var i = 0; i < daysToPull; i++)
            {
                getTimeEntriesForDate(moment(Date.now()).subtract(i, 'days').format('YYYY-MM-DD'), i);
            }

            //getTimeEntriesForDate(today);
            //getTimeEntriesForDate(yesterday);
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
                    // Refresh the day
                    refreshDay(vm.blankTimeEntry.TimeIn);
                    resetBlankTimeEntry();
                })
                return null;
            }).error(function (error) {
                common.reportError(error);
                return null;
            });
        }

        vm.stopWork = function (te) {
            //vm.blankTimeEntry.TimeIn = Date.now();
            //vm.blankTimeEntry.TimeIn = '2014-09-09T00:29:10.0334982+00:00';
            if (te.TimeOut == undefined || te.TimeOut.length == 0) {
                te.TimeOut = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");
            }

            return timeTracking.putTimeEntry(te)
            .success(function (response) {
                common.$timeout(function () {
                    // Refresh the day
                    refreshDay(te.TimeIn);
                    resetBlankTimeEntry();
                })
                return null;
            }).error(function (error) {
                common.reportError(error);
                return null;
            });
        }

        function refreshDay(day) {
            var dayOnly = day.substring(0, 10);
            for (var i = 0; i < vm.timeEntries.length; i++)
            {
                if (vm.timeEntries[i].dateDisplay == dayOnly)
                {
                    return timeTracking.getTimeEntriesForDate(dayOnly)
                    .success(function (response) {
                        common.$timeout(function () {
                            var timeEntries = response;
                            if (timeEntries.length > 0) {
                                vm.timeEntries[i].data = response.reverse();
                            }

                        })
                        return null;
                    }).error(function (error) {
                        common.reportError(error);
                        return null;
                    });
                }
            }
        }


        function getTimeEntriesForDate(dateToGet, sortIndex) {
            return timeTracking.getTimeEntriesForDate(dateToGet)
                .success(function (response) {
                    common.$timeout(function () {
                        var timeEntries = response;
                        if (timeEntries.length > 0) {
                            var newEntry = {
                                'data': response.reverse(),
                                'dateDisplay' : dateToGet,
                                'sortIndex' : sortIndex
                            }
                            vm.timeEntries.push(newEntry);
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