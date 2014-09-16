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

            var promises = [getProjects(), updateTime()];

            //var today = moment(Date.now()).format('YYYY-MM-DD');
            //var yesterday = moment(Date.now()).subtract(1, 'days').format('YYYY-MM-DD');
            var daysToPull = 10;
            for (var i = 0; i < daysToPull; i++)
            {
                promises.push(getTimeEntriesForDate(moment(Date.now()).subtract(i, 'days').format('YYYY-MM-DD')));
            }

            common.activateController(promises, controllerId).then(function () { 
                if (vm.timeEntries.length === 0) {
                    // Nothing yet exists, so make the first group (today) manually
                    var newEntry = {
                        'data': [],
                        'dateDisplay': moment(Date.now()).format('YYYY-MM-DD'),
                    }
                    vm.timeEntries.push(newEntry);
                }
            });
        }

        // TODO - refactor to be more efficient and just keep track of the entries with
        // no TimeOut instead of looping through everything
        function updateTime() {
            if (vm.timeEntries !== undefined) {
                for (var i = 0; i < vm.timeEntries.length; i++) {
                    if (vm.timeEntries[i] !== undefined && vm.timeEntries[i].data != undefined) {
                        for (var j = 0; j < vm.timeEntries[i].data.length; j++) {
                            if (vm.timeEntries[i].data[j].TimeOut == undefined) {
                                var tin = moment(vm.timeEntries[i].data[j].TimeIn);
                                var tout = moment(Date.now());
                                var ms = tout.diff(tin);
                                var d = moment.duration(ms);
                                vm.timeEntries[i].data[j].TotalTime = Math.floor(d.asHours()) + moment.utc(ms).format(":mm:ss");
                            }
                        }
                    }
                }
            }
            common.$timeout(updateTime, 1000, true);
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

        // custom order by so days are from today into the past
        vm.daysOrderBy = function (day) {
            return -moment(day.dateDisplay);
        };

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

        vm.totalDay = function (data) {
            var total = moment.duration(data[0].TotalTime);
            for (var i = 1; i < data.length; i++) {
                var t = moment.duration(data[i].TotalTime).add(total);
                total = t;
            }
            return Math.floor(total.asHours()) + moment.utc(total.asMilliseconds()).format(":mm:ss");
        }

        // A bit ugly - refactor
        function refreshDay(day) {
            var found = false;
            var dayOnly = day.substring(0, 10);
            for (var i = 0; i < vm.timeEntries.length; i++)
            {
                if (vm.timeEntries[i].dateDisplay == dayOnly)
                {
                    found = true;
                    return timeTracking.getTimeEntriesForDate(dayOnly)
                    .success(function (response) {
                        common.$timeout(function () {
                            if (response.length > 0) {
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
            if (!found) {
                // new day, brand new, something makes you feel like seeing it through
                return timeTracking.getTimeEntriesForDate(dayOnly)
                .success(function (response) {
                    common.$timeout(function () {
                        if (response.length > 0) {
                            var newEntry = {
                                'data': response.reverse(),
                                'dateDisplay': dayOnly,
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


        function getTimeEntriesForDate(dateToGet) {
            return timeTracking.getTimeEntriesForDate(dateToGet)
                .success(function (response) {
                    common.$timeout(function () {
                        if (response.length > 0) {
                            var newEntry = {
                                'data': response.reverse(),
                                'dateDisplay' : dateToGet,
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