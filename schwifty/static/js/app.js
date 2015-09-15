var schwifty = angular.module('schwifty', ['ngRoute', 'ui.bootstrap']);

schwifty.config(['$routeProvider',
  function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'search.html',
      controller: 'SearchController',
      reloadOnSearch: true,
      resolve: {
        results: loadSearchResult
      }
    });
}]);

schwifty.controller('AppController', ['$scope', '$rootScope', '$http', '$location', 'queryState',
  function($scope, $rootScope, $http, $location, queryState) {

  $scope.query = queryState;

  $rootScope.$on("$routeChangeStart", function (event, next, current) {
    queryState.get();
  });

  $scope.submitSearch = function(form) {
    $scope.query.state.detail = null;
    $location.search($scope.query.state);
  };

}]);