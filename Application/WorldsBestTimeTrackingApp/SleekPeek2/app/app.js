(function () {
    'use strict';

    var app = angular.module('app', ['ngRoute', 'ngGrid', 'ngResource', 'common']);

    app.config(function ($routeProvider) {
        $routeProvider            
          .when('/projects', {
              templateUrl: 'app/projects.html'
          })
            /*
          .when('/project/:projectId', {
              templateUrl: 'app/project.html'
          })
          */
          .when('/', {
              templateUrl: 'app/login.html'
          })
          .otherwise({
              redirectTo: '/'
          });
    })

})();
