(function () {
    'use strict';

    var controllerId = 'summary';

    angular.module('app').controller(controllerId, ['common', '$location', 'timeTracking', summary]);

    function summary(common, $location, timeTracking) {
        var vm = this;

        var getMsgFn = common.logger.getLogFn;
        var msg = getMsgFn(controllerId);
        var msgSuccess = getMsgFn(controllerId, 'success');
        var msgError = getMsgFn(controllerId, 'error');
        var msgWarning = getMsgFn(controllerId, 'warning');

        vm.projects = [];
        
        vm.dataGridHeight = dataGridHeight;
        var detailCellTemplate = "<button style=\"text-align:center\" class=\"btn btn-default btn-xs center-block\" ng-click=\"vm.goToDetail(row)\">Details</button>";
        vm.goToDetail = function (row) {
            goToDetail(row.entity);
        };
        vm.projectsDataGrid = {
            data: 'vm.projects',
            multiSelect: false,
            enableRowSelection: false,
            enableColumnResize: true,
            columnDefs: [
                {
                    field: 'Name',
                    displayName: 'Project Name',
                    width: '**'
                },
                {
                    field: '',
                    cellTemplate: detailCellTemplate
                }
            ],
        }

        function goToDetail(connector) {
            var detailPath = "/connector/" + connector.ConnectorName;
            $location.path(detailPath);
        }

        function dataGridHeight(items, hasFooter) {
            var rowHeight = 30;
            var headerHeight = 30;
            var footerHeight = 0;
            if (hasFooter) {
                footerHeight = 50;
            }
            return {
                height: ((items.length + 1) * rowHeight + headerHeight + footerHeight) + "px",
                border: "1px solid rgb(212,212,212)"
            };
        };
        
        activate();

        function activate() {
            var promises = [getProjects()];
            common.activateController(promises, controllerId)
                .then(function () { /*log('Activated View');*/
                    vm.isProcessing = false;
                });
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
                    msgError('Error: ' + error.Message + error.ExceptionMessage);
                    vm.projects = [];
                    return null;
                });

        }


        function getSummary() {
            return null;
            /*
            return connectorFactory.getConnectorConfig() // gets all configs
                .success(function (response) {
                    common.$timeout(function () {
                        var projects = response;
                        if (projects.length > 0) {
                            vm.projects = response;
                        }
                        msgSuccess("done");
                    })
                    return null;
                }).error(function (error) {
                    msgError('Error: ' + error.Message + error.ExceptionMessage);
                    vm.projects = [];
                    return null;
                });
                */
        }
    }

})();