angular.module('starter.controllers', [])

.service('hasura', function($q, $http){
  this.authorized = false;
  this.token = '';
  this.appname = "waviness63";
  this.login = function(username, password){
    var defer = $q.defer(),
    _this = this; // Don't know a better way
    $http.post('https://auth.'+ this.appname + '.hasura-app.io/login', {
      "username":username,
      "password":password})
      .success(function(data) {
        _this.token = data['auth_token']; 
        $http.defaults.headers.common['Authorization'] = "Bearer " + _this.token;
        _this.authorized = true;
        defer.resolve();      
        })
      .error(function(data) {
        defer.reject(data);  
      });
      return defer.promise;
  };
  this.logout = function(){
    this.token = '';
    this.authorized = false;
    $http.defaults.headers.common['Authorization'] ='';
  };
  this.query = function(type, args){
    var defer = $q.defer(),
      query = angular.toJson(
        {"type": type,
         "args": args
        });
    if (this.authorized != true) {  
      defer.reject("Not authorized.") 
    } else {
      $http.post('https://data.' + this.appname + '.hasura-app.io/v1/query', query)
      .success(function(data){
        defer.resolve(data);
      })
      .error(function(data){
        defer.reject(data)
      })
    }
    return defer.promise;
  }
})

.controller('AppCtrl', function($scope, $ionicModal, $http, $window, $timeout, hasura) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Button text
  $scope.button = "Log In"

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    $scope.button = "Logging In..."
    hasura.login($scope.loginData.username, $scope.loginData.password)
      .then(function() {
        $scope.button = "Login Successful!"
        $timeout(function() {
          $scope.closeLogin();
        }, 900);
      }, function(data) {
        $scope.button = data['message'];
      });


  };
})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
});
