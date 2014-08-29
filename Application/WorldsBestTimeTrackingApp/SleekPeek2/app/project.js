(function () {
    'use strict';

    var controllerId = 'project'; // must match... what?

    // ??? why can it not find the function when common is passed
    angular.module('app').controller(controllerId, ['common', 'timeTracking', '$routeParams', project]);

    function project(common, timeTracking, $routeParams) {
        var getMsgFn = common.logger.getLogFn;
        var msg = getMsgFn(controllerId);
        var msgSuccess = getMsgFn(controllerId, 'success');
        var msgError = getMsgFn(controllerId, 'error');
        var msgWarning = getMsgFn(controllerId, 'warning');

        var vm = this;

        vm.formatDate = formatDate;

        vm.projectId = undefined;
        if ($routeParams.projectId) {
            vm.projectId = $routeParams.projectId;
        }

        activate();

        function activate() {
            var dt = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));
            var from = moment(dt).format("YYYY-MM-DD HH:mm:ss");
            var promises = [getProject(vm.projectId)];
            common.activateController(promises, controllerId).then(function () { });

            //    vm.name = "fiduciary";
        }

        function getProject(id) {
            return timeTracking.getProject(id)
                .success(function (response) {
                    common.$timeout(function () {
                        vm.project = response;
                    })
                    return null;
                }).error(function (error) {
                    msgError('Error: ' + error.Message);
                    vm.project = undefined;
                    return null;
                });
        }

        function getTasks(projectId) {
            return connectorFactory.getProjectTasks(projectId)
                .success(function (response) {
                    common.$timeout(function () {
                        vm.tasks = response.Tasks;
                    })
                    return null;
                }).error(function (error) {
                    vm.tasks = [];
                    return null;
                });
        }

        vm.dataGridHeight = tasksGridHeight;
        //vm.totalServerItems = 0;
        //vm.pagingOptions = {
        //    pageSizes: [20, 50, 100],
        //    pageSize: 20,
        //    currentPage: 1
        //};
        vm.tasksDataGrid = {
            data: 'vm.tasks',
            //selectedItems: vm.selectedItem,
            multiSelect: false,
            enableRowSelection: true,
            enableColumnResize: true,
            //enablePaging: true,
            //showFooter: true,
            //totalServerItems: 'vm.totalServerItems',
            //pagingOptions: vm.pagingOptions,
            columnDefs: [
                {
                    field: 'Date',
                    displayName: 'Date/Time',
                    cellTemplate: '<div class=\"ngCellText ng-scope col3 colt3\" ng-class=\"col.colIndex()\"><span class=\"ng-binding\" style=\"cursor: default;\" ng-cell-text=\"\" >{{vm.formatDate(row.entity[col.field]);}}</span></div>',
                    width: '*'
                },
                {
                    field: 'Message',
                    displayName: 'Message',
                    width: '**'
                },
                {
                    field: 'Level',
                    displayName: 'Level',
                    width: '*'
                }
            ],
        }

        function formatDate(date) {
            return moment(date).format("MM/DD/YYYY  HH:mm:ss");
        }

        function tasksGridHeight() {
            var rowHeight = 30;
            var headerHeight = 30;
            var footerHeight = 0;
            var itemsVisible = 20; // (vm.log.length + 1)
            return {
                height: (itemsVisible * rowHeight + headerHeight + footerHeight) + "px",
                border: "1px solid rgb(212,212,212)"
            };
        };


    }

})();