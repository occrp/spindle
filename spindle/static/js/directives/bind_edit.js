
spindle.directive('bindEdit', ['metadataService', '$timeout', '$http', '$q',
    function(metadataService, $timeout, $http, $q) {

  var countries = [], countryLabels = {};
  metadataService.get().then(function(metadata) {
    for (var code in metadata.countries) {
      countries.push({code: code, title: metadata.countries[code].title});
      countryLabels[code] =  metadata.countries[code].title;
    }
  });

  return {
    restrict: 'E',
    replace: false,
    scope: {
      'bind': '=',
      'collection': '=',
      'entity': '='
    },
    templateUrl: 'bind/edit.html',
    link: function (scope, element, attrs, model) {
      var bind = scope.bind,
          model = bind.model,
          oldData = null;

      // this shouldn't be hard-coded
      scope.stubEntry = scope.entity && !scope.entity.id && model.name == 'name';
      scope.entitySchema = scope.stubEntry ? scope.entity.$schema : model.schema.id;
      scope.textEntry = !model.isTemporal && !model.isCountry && !model.isObject && !scope.stubEntry;
      scope.countries = countries;

      if (model.isTemporal && bind.data) {
        scope.picker = new Pikaday({
          format: 'YYYY-MM-DD',
          setDefaultDate: true,
          defaultDate: new Date(bind.data)
        });
      }

      scope.onPikadaySelect = function(pikaday) {
        bind.data = moment(pikaday.getDate()).format('YYYY-MM-DD');
      };

      scope.formatCountry = function($model) {
        return countryLabels[$model];
      };

      scope.formatEntity = function($model) {
        if ($model) {
          return $model.name;
        }
      };

      scope.fillStub = function($item, $model, $label) {
        bind.data = undefined;
        $http.get('/api/entities/' + $item.id).then(function(res) {
          scope.$emit('fillStub', res.data.data);
        });
      };

      scope.suggestEntities = function($viewValue) {
        var params = {
          text: $viewValue,
          $schema: scope.entitySchema
        };
        if (scope.stubEntry) {
          params.exclude_collection = scope.collection.id;
        } else {
          params.boost_collection = scope.collection.id;
        }
        var dfd = $q.defer();
        $http.get('/api/suggest', {params: params}).then(function(res) {
          dfd.resolve(res.data.options);
        });
        return dfd.promise;
      };

      scope.$on('editBind', function(e, serial, newData) {
        if (scope.bind.serial == serial) {
          oldData = scope.bind.data;
          if (newData) {
            scope.bind.data = newData;
          }
          var el = angular.element(element).find('input');
          $timeout(function() {
            el.focus();
          });
        }
      });

      scope.$on('cancelEditBind', function(e, serial) {
        if (scope.bind.serial == serial) {
          scope.bind.data = oldData;
        }
      });
    }
  };
}]);
