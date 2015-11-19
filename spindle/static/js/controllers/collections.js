
var loadCollections = ['$q', '$http', function($q, $http) {
  var dfd = $q.defer();
  $http.get('/api/collections').then(function(res) {
    dfd.resolve(res.data);
  }, function(err) {
    dfd.reject();
  });
  return dfd.promise;
}];


spindle.controller('CollectionNewDialog', ['$scope', '$http', '$uibModalInstance', 'sessionService',
    function($scope, $http, $uibModalInstance, sessionService) {
  $scope.collection = {title: ''};

  $scope.validTitle = function() {
    return $scope.collection.title.length > 2;
  }

  $scope.create = function() {
    if ($scope.validTitle()) {
      $http.post('/api/collections', $scope.collection).then(function(res) {
        // re-fetch ACLs.
        sessionService.flush().then(function() {
          $uibModalInstance.close(res.data.data);  
        });
        
      });
    }
  };

  $scope.close = function() {
    $uibModalInstance.dismiss('ok');
  };

}]);


var loadCollection = ['$q', '$http', '$route', function($q, $http, $route) {
  var dfd = $q.defer(),
      url = '/api/collections/' + $route.current.params.id;
  $http.get(url).then(function(res) {
    dfd.resolve(res.data.data);
  }, function(err) {
    dfd.reject();
  });
  return dfd.promise;
}];


var loadSchemaModels = ['$q', '$http', 'metadataService', 'schemaService', function($q, $http, metadataService, schemaService) {
  var dfd = $q.defer();
  metadataService.get().then(function(metadata) {
    var dfds = [];
    for (var schema in metadata.schemas) {
      dfds.push(schemaService.getModel(schema));
    }
    $q.all(dfds).then(function(models) {
      dfd.resolve({
        models: models,
        metadata: metadata
      });
    }, function(err) {
      dfd.reject(err);
    });
  });
  return dfd.promise;
}];


spindle.controller('CollectionController', ['$scope', '$http', '$location', '$uibModal', 'schemaModels', 'authz', 'collection',
    function($scope, $http, $location, $uibModal, schemaModels, authz, collection) {
  $scope.collection = collection;
  $scope.model = {};
  $scope.editable = authz.collection(authz.WRITE, collection.id);

  $scope.setSchema = function(model) {
    var search = $location.search();
    search.$schema = model.schema.id;
    $location.search(search);
    return false;
  }
    
  $scope.editSettings = function() {
    var d = $uibModal.open({
      templateUrl: 'collections/settings.html',
      controller: 'CollectionSettingsDialog',
      backdrop: true,
      resolve: {
        collection: function() {
          return angular.copy($scope.collection);
        }
      }
    });

    d.result.then(function(collection) {
      $scope.collection = collection;
    });
  };

  var init = function() {
    var models = [];
    for (var i in schemaModels.models) {
      var model = schemaModels.models[i];
      if (model.schema.id == $location.search().$schema) {
        model.active = true;
        $scope.model = model;
      }
      models.push(model);
    }
    $scope.models = models.sort(spindleModelSort);  
  }

  init();
}]);


spindle.controller('CollectionSettingsDialog', ['$scope', '$http', '$uibModalInstance', 'collection',
    function($scope, $http, $uibModalInstance, collection) {
  $scope.collection = collection;

  $scope.validTitle = function() {
    return $scope.collection.title.length > 2;
  }

  $scope.save = function() {
    if ($scope.validTitle()) {
      var apiUrl = '/api/collections/' + $scope.collection.id;
      $http.post(apiUrl, $scope.collection).then(function(res) {
        $scope.$on('permissionsSaved', function() {
          $uibModalInstance.close(res.data.data);
        });
        $scope.$broadcast('savePermissions', res.data);
      });
    }
  };

  $scope.close = function() {
    $uibModalInstance.dismiss('ok');
  };

}]);
