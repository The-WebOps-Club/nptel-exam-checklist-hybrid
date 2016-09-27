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