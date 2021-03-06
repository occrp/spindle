
spindle.directive('entityIcon', ['schemaService', function(schemaService) {
  var icons = {};
  return {
    restrict: 'E',
    scope: {
      'schema': '='
    },
    replace: true,
    templateUrl: 'entities/icon.html',
    link: function (scope, element, attrs, model) {
      scope.icon = 'fa-question-circle';
      if (scope.schema) {
        if (icons[scope.schema]) {
          scope.icon = icons[scope.schema];
        }
        schemaService.loadSchema(scope.schema).then(function(data) {
          if (data.faIcon) {
            icons[scope.schema] = data.faIcon;
            scope.icon = data.faIcon;
          }
        })
      }
    }
  };
}]);
