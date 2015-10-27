    var socket = io('http://localhost:8888');
    
    var currentUserId = '';
    var currentUserIndex = '';

        $('form').submit(function(){
          return false;
        });      
        
        function sendEvent(t, m, a, d) {
          var msgType = JSON.stringify(t);
          var msgModule = JSON.stringify(m);
          var msgAction = JSON.stringify(a);
          var msgData = JSON.stringify(d);
          socket.emit('event', '{"type": ' + msgType + ', "module": ' + msgModule + ', "action": ' + msgAction + ', "data": ' + msgData + '}');          
        }

        function hideShowDebug() {
            if ($('#debugmessages').css('display') !== 'none') {
              $('#debugmessages').css('display', 'none');
            } else {
              $('#debugmessages').css('display', 'block');
            }
          }

        function createNewUser() {
          var userData = {'login':$('#createuserlogin').val(), 'password':$('#createuserpass').val()};
          sendEvent('system', 'user', 'create', userData);
        }        

        function createRandomUser() {
          var userTestname = 'Testuser' + Math.floor((Math.random() * 1000) + 1);
          var userData = {'login':userTestname, 'password':'test'};
          sendEvent('system', 'user', 'create', userData);
        }        
        
        function loginUser() {
          var loginData = {'login':$('#loginlogin').val(), 'password':$('#loginpass').val()};
          sendEvent('system', 'user', 'authenticate', loginData);
        }
        
        function moveTank() {
          var shotData = {'x':$('#movex').val(), 'y':$('#movey').val()};
          sendEvent('game', 'gameplay', 'move', shotData);
        }        

        function turnTank() {
          var turnData = {'orientation':$('#tankorientation').val()};
          sendEvent('game', 'gameplay', 'turn', turnData);
        }
        
        function fireWeaponTurret() {
          var shotData = {'angle':$('#shotangle').val(), 'power':$('#shotpower').val()};
          sendEvent('game', 'gameplay', 'shoot', shotData);
        }
        
        function hideNotification() {
          $('#gamenotification').css('display', 'none');
        }

        function sendChat() {
          if ($('#chatuser').val() == "") {
            var chatData = $('#chatmessage').val();
            sendEvent('system', 'chat', 'broadcast', chatData);
          } else {
            var userlist = $('#chatuser').val();

            if (userlist.indexOf(";") >= 0) {
              var userlistarray = userlist.split(";");
              var chatData = {'message':$('#chatmessage').val(), 'to':userlistarray};
              sendEvent('system', 'chat', 'group', chatData);
            } else {
              var chatData = {'message':$('#chatmessage').val(), 'to':userlist};
              sendEvent('system', 'chat', 'message', chatData);
            }
          }
        }
        