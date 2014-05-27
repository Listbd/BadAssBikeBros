(function () {
    'use strict';
    var controllerId = 'admin';
    angular.module('app').controller(controllerId,
        ['common', 'tkService', admin]);

    function admin(common, tkService) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var logError = getLogFn(controllerId, 'error');

        var vm = this;
        vm.title = 'Admin';

        vm.getUser = getUser;

        activate();

        function activate() {
            var promises = [getUser()];
            common.activateController(promises, controllerId)
                .then(function () { log('Activated Admin View'); });
        }

        function TESTcreateUser()
        {
            return tkService.createUser("Dude3", "password", "name 3", "dude3@dude3.com", "1")
                .success(function(response) {
                    common.$timeout(function () {
                        vm.user = response.user;
                    })
                    return null;
                }).error(function (error) {
                    logError('Error: ' + error);
                    vm.user = {};
                    return null;
                });
        }

        function getUser() {
            TESTcreateUser();
            /*
            // https://csgprohackathonapi.azurewebsites.net/api/users/2
            if (vm.userId && !isNaN(vm.userId)) {
                return tkService.getUserById(vm.userId)
                    .success(function(response) {
                        common.$timeout(function() {
                            vm.user = response.user;
                        })
                        return null;
                    }).error(function (error) {
                        logError('Error: ' + error);
                        vm.user = {};
                        return null;
                    });
            }
            */
        }



    }
})();