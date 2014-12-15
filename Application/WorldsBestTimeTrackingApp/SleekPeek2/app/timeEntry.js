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
        vm.activeTimer = {};

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
            // set active timer
            vm.activeTimer = common.$timeout(updateTime, 1000, true);
        }

        // Need to clean up timer
        // ?????
        //vm.$on('$destroy', function () {
        //    if (vm.activeTimer !== undefined) {
        //        common.$timeout.cancel(vm.activeTimer);
        //    }
        //});

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
                "Comment": "",
                "isInEditMode" : false
            }

        }

        // custom order by so days are from today into the past
        vm.daysOrderBy = function (day) {
            return -moment(day.dateDisplay);
        };

        vm.formatDuration = function (dur) {
            var t = moment.duration(dur);
            return Math.floor(t.asHours()) + moment.utc(t.asMilliseconds()).format(":mm:ss");
        }

        vm.formatToTime = function (datetime, relativeTo) {
            if (datetime) {
                var suffix = "";
                if (relativeTo) {
                    var daysDiff = moment(datetime).dayOfYear() - moment(relativeTo).dayOfYear();
                    if (daysDiff > 0) {
                        suffix = " (+" + daysDiff + ")";
                    }
                    else if (daysDiff < 0) {
                        suffix = " (" + daysDiff + ")";
                    }
                }
                return moment(datetime).format("h:mm A") + suffix;
            }
            else {
                return "";
            }
        }

        vm.updateTasks = function () {
            vm.blankTimeEntry.Task = undefined;
            vm.blankTimeEntry.Tasks = vm.blankTimeEntry.Project.ProjectTasks;
            if (vm.blankTimeEntry.Tasks.length === 1)
                vm.blankTimeEntry.Task = vm.blankTimeEntry.Tasks[0];

            // If we don't have a role, let's add one called "Default".
            if (vm.blankTimeEntry.Project.ProjectRoles.length === 0) {
                var newDefaultRole = {
                    "Name": "Default",
                    "ProjectId": vm.blankTimeEntry.Project.ProjectId
                }
                timeTracking.postProjectRole(newDefaultRole).success(function (response) {
                    common.$timeout(function () {
                        var role = response;
                        vm.blankTimeEntry.Project.ProjectRoles.push(role);
                        // Set the role ID on our blank time entry entity
                        vm.blankTimeEntry.ProjectRoleId = role.ProjectRoleId;
                    })
                    return null;
                }).error(function (error) {
                    common.reportError(error);
                    return null;
                });
            }
            // Otherwise, let's hard-code the role to the first in the collection.
            else {
                vm.blankTimeEntry.ProjectRoleId = vm.blankTimeEntry.Project.ProjectRoles[0].ProjectRoleId;
            }
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

            return vm.updateEntry(te, true);
        }

        vm.resumeWork = function (te) {

            var newEntry = {
                "ProjectRoleId": te.ProjectRoleId,
                "ProjectTaskId": te.ProjectTaskId,
                "Billable": te.Billable,
                "TimeIn": moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                "TimeOut": undefined,
                "Hours": 0,
                "Comment": te.Comment,
                "isInEditMode": false
            }
            
            return timeTracking.postTimeEntry(newEntry)
            .success(function (response) {
                common.$timeout(function () {
                    // Refresh the day
                    refreshDay(newEntry.TimeIn);
                })
                return null;
            }).error(function (error) {
                common.reportError(error);
                return null;
            });
        }

        vm.updateEntry = function (te, resetBlankDay) {
            // validate times
            // This is the regular expression for date, time, or datetime (MM/DD/YYYY hh:mm:ss), military or am/pm separators of /-.
            //var rr = "^(?ni:(?=\d)(?'month'0?[1-9]|1[012])(?'sep'[/.-])((?'day'((?<!(\2((0?[2469])|11)\2))31)|(?<!\2(0?2)\2)(29|30)|((?<=((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|(16|[2468][048]|[3579][26])00)\2\3\2)29)|((0?[1-9])|(1\d)|(2[0-8])))\2(?'year'((1[6-9])|([2-9]\d))\d\d)(?:(?=\x20\d)\x20|$))?((?<time>((0?[1-9]|1[012])(:[0-5]\d){0,2}(\x20[AP]M))|([01]\d|2[0-3])(:[0-5]\d){1,2}))?)$";
            return timeTracking.putTimeEntry(te)
            .success(function (response) {
                common.$timeout(function () {
                    if (resetBlankDay) {
                        resetBlankTimeEntry();
                    }
                    else {
                        te.isInEditMode = false;
                    }
                    // Refresh the day
                    refreshDay(te.TimeIn);
                })
                return null;
            }).error(function (error) {
                common.reportError(error);
                return null;
            });
        }

        vm.beginEditEntry = function (te) {
            for (var dayIndex = 0; dayIndex < vm.timeEntries.length; dayIndex++) {
                for (var timeEntryIndex = 0; timeEntryIndex < vm.timeEntries[dayIndex].data.length; timeEntryIndex++) {
                    vm.timeEntries[dayIndex].data[timeEntryIndex].isInEditMode = false;
                }
            }
            te.isInEditMode = true;
        }

        vm.cancelEditEntry = function (te) {
            te.isInEditMode = false;
        }

        vm.deleteEntry = function (te) {
            //if (confirm('Are you sure you want to delete?') == true)
            {
                return timeTracking.deleteTimeEntry(te)
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
        }

        vm.totalDay = function (data) {
            if (data.length > 0) {
                var total = moment.duration(data[0].TotalTime);
                for (var i = 1; i < data.length; i++) {
                    var t = moment.duration(data[i].TotalTime).add(total);
                    total = t;
                }
                return vm.formatDuration(total);
            }
            else {
                return 0;
            }
        }

        vm.onTimeInSet = function (newDate, oldDate, te) {
            newDate = moment(newDate).format("YYYY-MM-DD HH:mm:ss");
            te.TimeIn = newDate;
        }
        vm.onTimeOutSet = function (newDate, oldDate, te) {
            newDate = moment(newDate).format("YYYY-MM-DD HH:mm:ss");
            te.TimeOut = newDate;
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