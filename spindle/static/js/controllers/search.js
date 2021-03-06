
var loadSearchResult = ['query', function(query) {
  return query.execute();
}];


spindle.controller('SearchController', ['$scope', '$http', '$location', '$sce', 'results', 'metadata',
  function($scope, $http, $location, $sce, results, metadata) {

  var processResults = function(results) {
    for (var i in results.results) {
      var result = results.results[i];
      if (result.$highlight) {
        var longest = 0;
        result.$hltHtml = null;
        for (var j in result.$highlight) {
          var hlt = result.$highlight[j];
          if (hlt.length > longest) {
            longest = hlt.length;
            result.$hltHtml = $sce.trustAsHtml(hlt);
          }
        }
      }
    }
    return results;
  };

  $scope.loading = false;
  $scope.metadata = metadata;
  $scope.results = processResults(results);
  $scope.shown = Math.min(results.total, results.limit + results.offset);

  $scope.loadNext = function() {
    if ($scope.loading || !$scope.results.next) {
      return;
    }
    $scope.loading = true;
    $http.get($scope.results.next).then(function(res) {
      var results = processResults(res.data);
      $scope.results.next = results.next;
      $scope.shown = Math.min(results.total, results.limit + results.offset);
      $scope.loading = false;
      $scope.results.results = $scope.results.results.concat(results.results);
    });
  };

}]);
