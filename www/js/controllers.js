var TABLE_STATE = 'nptel_state';
var TABLE_CENTER = 'nptel_center';
var TABLE_EXAM = 'nptel_exam';
var TABLE_QUESTION = 'nptel_question';
var TABLE_ANSWER = 'nptel_answer';

angular.module('starter.controllers')

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

.controller('StatesCtrl', function($scope, $stateParams, hasura) {
  function refresh(){
    hasura.query('select', {
      table: TABLE_STATE,
      columns: ['id', 'name']
    })
    .then(function(data){
      $scope.states = data;
      $scope.$broadcast('scroll.refreshComplete');
    }, function(error) {
      console.log(error)
    })
  }
  $scope.$on('$ionicView.enter', function(e) {
    refresh();
  });
  $scope.doRefresh = function() {
    refresh();
  };

})

.controller('CentersCtrl', function($scope, $stateParams, hasura) {
  $scope.$on('$ionicView.enter', function(e) {
    hasura.query('select', {
      table: TABLE_CENTER,
      columns: ['id', 'name'],
      where: {
        state: $stateParams.stateId
      }
    })
    .then(function(data){
      $scope.centers = data;
    }, function(error) {
      console.log(error)
    })
  });
})

.controller('ExamsCtrl', function($scope, $stateParams, hasura) {
  $scope.$on('$ionicView.enter', function(e) {
    hasura.query('select', {
      table: TABLE_EXAM,
      columns: ['id', 'name'],
      where: {
        center_id: parseInt($stateParams.centerId, 10)
      }
    })
    .then(function(data){
      $scope.exams = data;
    }, function(error) {
      console.log(error)
    })
  });
})

.controller('QuestionsCtrl', function($scope, $stateParams, hasura) {
  $scope.answers = {};
  hasura.query('select', {
    table: TABLE_QUESTION,
    columns: ['id', 'text', 'level', 'type', 'parent_question_id'],
    order_by: '+id'
  })
  .then(function(data){
    console.log(data);
    $scope.questions = data;
  }, function(error) {
    console.log(error)
  });


})

.controller('MainCtrl', function($scope, $stateParams, hasura) {

});
