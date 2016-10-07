angular.module('starter.controllers', ['ionic'])

.service('hasura', function($q, $http, $window){
  this.authorized = false;
  this.token = '';
  this.appname = "waviness63.hasura-app.io";
  this.login = function(username, password){
    var defer = $q.defer(),
    _this = this; // Don't know a better way
    $http.post('https://auth.'+ this.appname + '/login', {
      "username":username,
      "password":password})
      .success(function(data) {
        _this.token = data['auth_token'];
        $window.localStorage.setItem('token', _this.token)
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
      $http.post('https://data.' + this.appname + '/v1/query', query)
      .success(function(data){
        defer.resolve(data);
      })
      .error(function(data){
        defer.reject(data)
      })
    }
    return defer.promise;
  };
})
.service('localdb', function($q, $window, hasura){
  this.update = function(){
    var defer = $q.defer(),
    argq = [
    {type: 'select', args:{table:'nptel_center', columns:['id','name','state','address',{'name':'exams',columns:['id','name','date',{'name':'course','columns':['*']},'start_time','end_time']}]}},
    {type: 'select', args:{table:'nptel_question', columns:['*']}},
    ],
    _this = this;
    hasura.query(type='bulk', args=argq)
    .then(function(data){
      $window.localStorage['centers'] = JSON.stringify(data[0]);
      $window.localStorage['questions'] = JSON.stringify(data[1]);
      _this.localupdate();
      defer.resolve();
    }, function(error){
      defer.reject(error);
    });
    return defer.promise;
  };
  this.localupdate = function(){
    this.centers = JSON.parse($window.localStorage['centers']);
    this.questions = JSON.parse($window.localStorage['questions'])
  }
})
