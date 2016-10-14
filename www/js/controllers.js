var TABLE_STATE = 'nptel_state',
    TABLE_CENTER = 'nptel_center',
    TABLE_EXAM = 'nptel_exam',
    TABLE_QUESTION = 'nptel_question',
    TABLE_ANSWER = 'nptel_answer',
    TABLE_SESSION = 'nptel_session',
    TABLE_USER = 'nptel_user',
    TABLE_SESSION_CENTER = 'nptel_session_center';

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

  $scope.logout = function () {
    hasura.logout();
    $scope.authorized = hasura.authorized;
    $window.location = "#/app/main";
  }

  $scope.authorized = hasura.authorized;

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    $scope.button = "Logging In..."
    hasura.login($scope.loginData.username, $scope.loginData.password)
      .then(function() {
        $scope.button = "Login Successful!"
        $scope.authorized = hasura.authorized;
        $timeout(function() {
          $scope.button = "Login"
          $scope.closeLogin();
        }, 500);
      }, function(data) {
        $scope.button = data['message'];
      });


  };
})

.controller('QuestionsCtrl', function($scope, $stateParams, hasura, localdb, $window, loading) {
  var session_id = parseInt($stateParams.sessionId, 10);
  $scope.session_id = session_id;
  $scope.session = localdb.getSessions(session_id);
  $scope.answers = localdb.getAnswers(session_id);
  $scope.isSynced = localdb.isSynced;
  if ($scope.session) {
    $scope.questions = localdb.getQuestions();
  }
  $scope.save = function(){
    loading.show()
    $window.localStorage.setItem('synced_'+session_id.toString(), JSON.stringify(false));
    console.log($scope.answers);
    localdb.setAnswers(session_id, $scope.answers);
  }
})

.controller('MainCtrl', function($scope, $stateParams, hasura, localdb, loading, $ionicPopup) {
  // A confirm dialog
  $scope.showConfirm = function() {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Reload data',
      template: 'Are you sure you want to reload data? There are unsynced changes, they will be lost!'
    });

    confirmPopup.then(function(res) {
      if(res) {
        console.log('You are sure');
        loading.show();
        var result = localdb.update(
          function(){
            console.log(result);
            $scope.sessions = localdb.getSessions();
          }
        );
        loading.hide();
      } else {
        console.log('You are not sure');
      }
    });
  };
  $scope.localdb = localdb;
  $scope.loadData = function () {
    loading.show();

    if (!hasura.authorized) {
      $ionicPopup.alert({
     title: 'Error!',
     template: 'Please login to load data'
   });
    }
    var unsaved = false;
    var sessions = localdb.getSessions();
    for (i in sessions) {
      if (!localdb.isSynced(sessions[i].id)) {
        unsaved = true;
      }
    }
    if(unsaved){
      $scope.showConfirm();
    } else {
      var result = localdb.update(
        function(){
          console.log(result);
          $scope.sessions = localdb.getSessions();
        }
      );
      loading.hide();
    }
    loading.hide();
    
  }
  $scope.sessions = localdb.getSessions();


});
