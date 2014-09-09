(function () {
    'use strict';

    var app = angular.module('app', ['ngCookies', 'ngRoute', 'ngGrid', 'ngResource', 'common']);

    app.config(function ($routeProvider) {
        $routeProvider
            .when('/timeEntry', {
                templateUrl: 'app/timeEntry.html'
            })
          .when('/projects', {
              templateUrl: 'app/projects.html'
          })            
          .when('/project/:projectId', {
              templateUrl: 'app/project.html'
          })        
          .when('/', {
              templateUrl: 'app/login.html'
          })
          .otherwise({
              redirectTo: '/'
          });
    })

})();
