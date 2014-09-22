(function () {
    'use strict';

    var app = angular.module('app', ['ngCookies', 'ngRoute', 'ngGrid', 'ngResource', 'angular-loading-bar', 'common']);

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

    app.controller('navController', function ($scope, $location) {
        // Brian, not sure how to get rid of $scope here...
        $scope.isActive = function (route) {
            return route === $location.path();
        }
    });

})();
