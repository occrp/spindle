
spindle.directive('entityTableColumn', [function() {
  return {
    restrict: 'E',
    replace: true,
    require: '^entityTable',
    scope: {
      'path': '@',
      'title': '@',
      'width': '@'
    },
    templateUrl: 'entity_table_column.html',
    link: function (scope, element, attrs, entityTable) {
      entityTable.addColumn(scope.path);
    }
  };
}]);
