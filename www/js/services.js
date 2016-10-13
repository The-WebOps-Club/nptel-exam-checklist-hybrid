angular.module('starter.controllers', ['ionic'])

.service('hasura', function($q, $http, $window){
  this.authorized = false;
  this.token = '';
  this.appname = "waviness63.hasura-app.io";
  // var token = $window.localStorage.getItem('token');
  // if (token) {
  //   $http.defaults.headers.common['Authorization'] = "Bearer " + this.token;
  // }

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
    $window.localStorage.clear();

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
.service('localdb', function($window, hasura){
  var _this = this;
  this.update = function(cb){
    var argq = [
  		{ // 0
  			"type": "select",
  			"args": {
  				"table": TABLE_USER,
  				"columns": ["id", "name", "email"]
  			}
  		},
  		{ // 1
  			"type": "select",
  			"args": {
  				"table": TABLE_SESSION_CENTER,
          "where": {
            "is_visible": true
          },
  				"columns": [
  					"id",
  					{"name": "center", "columns":["id", "name", "state"]},
  					{"name": "session", "columns":["id", "name", "date", "start_time", "end_time"]}
  				]
  			}
  		},
  		{ // 2
  			"type": "select",
  			"args": {
  				"table": TABLE_QUESTION,
          "columns": ['id', 'text', 'level', 'type', 'parent_question_id'],
          "order_by": '+id'
  			}
  		},
      { // 3
  			"type": "select",
  			"args": {
  				"table": TABLE_ANSWER,
          "columns": ['id', 'session_center_id', 'answers']
  			}
  		}
  	];
    hasura.query(type='bulk', args=argq)
    .then(function(data){
      $window.localStorage.setItem('user', JSON.stringify(data[0]));
      $window.localStorage.setItem('session_centers', JSON.stringify(data[1]));
      $window.localStorage.setItem('questions', JSON.stringify(data[2]));

      for (i in data[3]) {
        _this.setAnswers(data[3][i]['session_center_id'], data[3][i]['answers'], false);
      }
      $window.localStorage.setItem('hasData', 1);
      cb(true);
      return true;
    }, function(error){
      cb(false);
      return error;
    });
  };
  this.hasData = function() {
    return parseInt($window.localStorage.getItem('hasData'), 10) === 1;
  };
  this.getUser = function() {
    return JSON.parse($window.localStorage.getItem('user'));
  };
  this.getSessions = function(id=0) {
    var sessions = JSON.parse($window.localStorage.getItem('session_centers'));
    if (id === 0) {
      return sessions;
    } else {
      for (i in sessions) {
        if (sessions[i].id === id) {
          return sessions[i];
        }
      }
      return null;
    }
  };
  this.getQuestions = function() {
    return JSON.parse($window.localStorage.getItem('questions'));
  };

  this.setAnswers = function (id, answers, sync=true) {
    $window.localStorage.setItem('answers_'+id.toString(), JSON.stringify(answers));
    console.log('Updated local', answers);
    // Make save API call
    var args = {
      table: TABLE_ANSWER,
      objects: [{
        session_center_id: id,
        answers: answers
      }]
    }
    if (sync){
      hasura.query('insert', args)
        .then(function(data){
          console.log('Inserted ', data);
        }, function(error){
          console.log('Insert failed', error);
          // Check if error is insert error
          if (error) {
            if (error.error.indexOf("Uniqueness violation") > -1) {
              args['where'] = {session_center_id: id}
              args['$set'] = {answers: answers}
              delete(args.objects)
              console.log('uniqueness error try updating')
              return hasura.query('update', args);
            }
          }
        })
        .then(function(data){
          console.log('Updated', data);
        }, function (error) {
          console.log('update error', error);
        });
    }
  }

  this.getAnswers = function (id) {
    var answers = $window.localStorage.getItem('answers_'+id.toString());
    if (answers) {
      return JSON.parse(answers);
    } else {
      return {};
    }
  }

})
