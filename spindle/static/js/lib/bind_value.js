
libSpindle.directive('bindValue', ['$sce', 'metadataService', function($sce, metadataService) {
  var countries = {};
  metadataService.get().then(function(metadata) {
    countries = metadata.countries;
  });

  var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
  };

  function escapeHtml(string) {
    return String(string).replace(/[&<>"'\/]/g, function (s) {
      return entityMap[s];
    });
  }

  return {
    restrict: 'E',
    replace: false,
    scope: {
      'bind': '=',
      'link': '='
    },
    template: '<span ng-bind-html="html"></span>',
    link: function (scope, element, attrs, model) {
      scope.$watch('bind.data', function(data) {
        var bind = scope.bind,
            model = bind.model,
            html = '&nbsp;';
        if (bind && bind.model && data) {
          var schema = bind.schema,
              value = data,
              url = false,
              classes = false;
          if (model.isObject) {
            url = '#/entities/' + bind.data.id;
            value = bind.data.name;
          } else if (model.isCountry) {
            value = countries[value] ? countries[value].title : value;
          } else if (model.isURI) {
            url = value;
          } else if (model.isNumber) {
            //value = numeral(value).format('0.00a');
            value = numeral(value).format();
            classes = 'numeric';
          } else if (model.isTemporal) {
            value = moment(value).format('LL');
            classes = 'date-time';
          }

          if (url) {
            html = '<a href="' + url + '">' + value + '</a>';
          } else if (classes) {
            html = '<span class="' + classes + '">' + value + '</span>';
          } else {
            html = escapeHtml(value);
          }
        }
        scope.html = $sce.trustAsHtml(html);
      });
    }
  };
}]);
