(function () {
    'use strict';

    // Controller name is handy for logging
    var controllerId = 'login';

    // Define the controller on the module.
    // Inject the dependencies. 
    // Point to the controller definition function.
    angular.module('app').controller(controllerId,
        ['common', '$location', 'timeTracking', login]);

    function login(common, $location, timeTracking) {
        // Using 'Controller As' syntax, so we assign this to the vm variable (for viewmodel).
        var vm = this;

        // Bindable properties and functions are placed on vm.
        vm.errorMessage = '';
        vm.login = login;
        vm.username = '';
        vm.password = '';
        vm.rememberme = false;
        vm.isProcessing = false;

        activate();

        function activate() {
            var promises = [];
            common.activateController(promises, controllerId)
                .then(function () { /*log('Activated View');*/ });
        }

        //#region Internal Methods   

        function login() {
            vm.isProcessing = true;
            vm.errorMessage = '';

            var loginModel = {
                Username: vm.username,
                Password: vm.password,
                //RememberMe: vm.rememberme
            };

            return timeTracking.getUser(vm.username, vm.password)
                .success(function (response) {
                    $location.path('/projects/');
                    msgSuccess("Welcome Back!");
                }).error(function (error) {
                    vm.errorMessage = "Unauthorized";
                });


            if (loginModel.Username == 'admin' && loginModel.Password == "rocks") {
                $location.path('/projects');
            }
            else {
                vm.errorMessage = "Unauthorized";
            }

            //authService.login(loginModel).then(function () {
            //    vm.isCertPrinter = authService.isCertPrinter();
            //    if (authService.isAdmin() || authService.isUser()) {
            //        $location.path('/');
            //    }
            //    else if (vm.isCertPrinter) {
            //        $location.url('/certprint');
            //        $location.path('/certprint');
            //    }
            //}, function (error) {
            //    vm.isProcessing = false;
            //    vm.errorMessage = error.data.ResponseStatus.Message;
            //});
        }

        //#endregion
    }
})();