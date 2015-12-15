    
        $(function() {
          $( "#gameui" ).draggable();
          $( "#debugwindow" ).draggable();
        });
      

        socket.io.on('connect_error', function(err) {
          $('#main').css('display', 'none');
          $('#debugmessages').append($('<li>').text('Can\'t connect to server. Try reloading. ' + err));
        });
        
        socket.on('connect', function() { 
          $('#main').css('display', 'block');
        });        
        
        socket.on('message', function(msg){
          $('#debugmessages').prepend($('<li>').text(msg));

          var serverMessage = JSON.parse(msg);

          if ((serverMessage.module == 'chat') && (serverMessage.action == 'message')) {
            $('#chatmessages').prepend($('<li>').text(serverMessage.data.from + ": " + serverMessage.data.message));
          }

          if (((serverMessage.module == 'user') && (serverMessage.action == 'created'))
          || ((serverMessage.module == 'user') && (serverMessage.action == 'authenticated'))) {
            currentUserId = serverMessage.data.id;
            $('#createuser').css('display', 'none');
            $('#lobbyhandling').css('display', 'block');
            $('#itemhandling').css('display', 'block');
            $('#gameui-playerstate').text('User logged in');
            sendEvent('system', 'user', 'getstate', '');
          }
          
          if ((serverMessage.module == 'user') && (serverMessage.action == 'state')) {
            $('#gameui-playerstate').text('User logged in (' + serverMessage.data.id + ')');
            $('#gameui-playermoney').text('Money: ' + serverMessage.data.userData.money);
            $('#gameui-playertank').text('Current tank: ' + serverMessage.data.userData.activeTank);
          }
                    
          if ((serverMessage.module == 'shop') && (serverMessage.action == 'items')) {
            $('#shoplist').empty();
            	for (var i = 0, len = serverMessage.data.length; i < len; i++) {
                var itemObj = '<button class="green" onclick="sendEvent(\'game\', \'shop\', \'buyitem\', \'' + serverMessage.data[i].id + '\')">Buy ' + serverMessage.data[i].assemblage + ' ' + serverMessage.data[i].data.name + ' (Price: ' + serverMessage.data[i].data.price + ')</button>';
                $('#shoplist').append($('<li>').append(itemObj));
              }
          }
          
          if (((serverMessage.module == 'shop') && (serverMessage.action == 'buyitem')) ||
          ((serverMessage.module == 'boostercards') && (serverMessage.action == 'selectedtank')) ||
          ((serverMessage.module == 'garage') && (serverMessage.action == 'selectedbooster'))) {
            sendEvent('game', 'garage', 'gettanks', '');
            sendEvent('game', 'boostercards', 'getboosters', '');
            sendEvent('system', 'user', 'getstate', '');
          }

          if ((serverMessage.module == 'garage') && (serverMessage.action == 'items')) {
            $('#garagelist').empty();
            	for (var i = 0, len = serverMessage.data.length; i < len; i++) {
                var itemObj = '<button onclick="sendEvent(\'game\', \'garage\', \'selecttank\', \'' + serverMessage.data[i].id + '\')">Select ' + serverMessage.data[i].assemblage + ' ' + serverMessage.data[i].data.name + '</button>';
                $('#garagelist').append($('<li>').append(itemObj));
              }
          }
          
          if ((serverMessage.module == 'boostercards') && (serverMessage.action == 'items')) {
            $('#boosterlist').empty();
            	for (var i = 0, len = serverMessage.data.length; i < len; i++) {
                var itemObj = '<button onclick="sendEvent(\'game\', \'boostercards\', \'selectbooster\', \'' + serverMessage.data[i].id + '\')">Select ' + serverMessage.data[i].assemblage + ' ' + serverMessage.data[i].data.name + '</button>';
                $('#boosterlist').append($('<li>').append(itemObj));
              }
          }
          
          if ((serverMessage.module == 'lobby') && (serverMessage.action == 'created')) {
            $('#itemhandling').css('display', 'none');
            $('#lobbyhandling').css('display', 'none');
            $('#currentlobby').css('display', 'block');
            sendEvent('system', 'lobby', 'getstate', '');
          }

          if ((serverMessage.module == 'lobby') && (serverMessage.action == 'list')) {
            $('#lobbylist').empty();
            	for (var i = 0, len = serverMessage.data.length; i < len; i++) {
                var lobbyObj = '<button class="confirm" onclick="sendEvent(\'system\', \'lobby\', \'join\', \'' + serverMessage.data[i].id + '\')">Join lobby ' + serverMessage.data[i].id + '</button>';
                $('#lobbylist').append($('<li>').append(lobbyObj));
              }
          }

          if ((serverMessage.module == 'lobby') && (serverMessage.action == 'playerjoined')) {
            $('#itemhandling').css('display', 'none');
            $('#lobbyhandling').css('display', 'none');
            $('#currentlobby').css('display', 'block');
            sendEvent('system', 'lobby', 'getstate', '');
          }

          if ((serverMessage.module == 'lobby') && (serverMessage.action == 'playerconfirmed')) {
            sendEvent('system', 'lobby', 'getstate', '');
          }

          if ((serverMessage.module == 'lobby') && (serverMessage.action == 'playerleft')) {
            if (serverMessage.data == currentUserId) {
              $('#currentlobby').css('display', 'none');
              $('#lobbyhandling').css('display', 'block');
              $('#itemhandling').css('display', 'block');
            } else {            
              sendEvent('system', 'lobby', 'getstate', '');
            }
          }
          
          if ((serverMessage.module == 'lobby') && (serverMessage.action == 'state')) {
            $('#currentlobbydata').empty();
            	for (var i = 0, len = serverMessage.data.lobbyParticipants.length; i < len; i++) {
                  var playerState = 'Player: ' + serverMessage.data.lobbyParticipants[i];
                  if (serverMessage.data.lobbyParticipantsConfirmed.indexOf(serverMessage.data.lobbyParticipants[i]) > -1) {
                    playerState += ' (confirmed!)';
                  } else {
                    playerState += ' (unconfirmed!)';
                  }
                   $('#currentlobbydata').append($('<li>').text(playerState));
              }           
          }
          
          if ((serverMessage.module == 'game') && (serverMessage.action == 'created')) {
            clearLayer(groundLayer, 79);
            $('#itemhandling').css('display', 'none');
            $('#currentlobby').css('display', 'none');
            $('#gameui').css('display', 'block');
            $('#battlefield').css('display', 'block');
            sendEvent('game', 'gameplay', 'getstate', '');
          }

          if ((serverMessage.module == 'game') && (serverMessage.action == 'playerhit')) {
            if (serverMessage.data == currentUserIndex) {
              $('#notificationmessage').text('You have been hit!');
            } else {
              $('#notificationmessage').text('Looks like you hit the other tank');
            }
            $('#gamenotification').css('display', 'block');
          }

          if ((serverMessage.module == 'game') && (serverMessage.action == 'ended')) {
            if (serverMessage.data.playerStates[currentUserIndex].tank.currentHitpoints > 0) {
              $('#notificationmessage').text('YOU WON!');
            } else {
              $('#notificationmessage').text('YOU LOST!');
            }
            $('#gamenotification').css('display', 'block');
            $('#itemhandling').css('display', 'block');
            $('#lobbyhandling').css('display', 'block');
            $('#lobbylist').empty();
            $('#gameui').css('display', 'none');
            $('#battlefield').css('display', 'none');
          }

          if ((serverMessage.module == 'game') && (serverMessage.action == 'playershot')) {
            var xPos = parseInt(serverMessage.data.x);
            var yPos = parseInt(serverMessage.data.y);
            explosionLayer[yPos][xPos] = 151;
            
            if (groundLayer[yPos-1][xPos-1] != 28) groundLayer[yPos-1][xPos-1] = 11;
            if (groundLayer[yPos-1][xPos] != 28) groundLayer[yPos-1][xPos] = 12;
            if (groundLayer[yPos-1][xPos+1] != 28) groundLayer[yPos-1][xPos+1] = 13;
            if (groundLayer[yPos][xPos-1] != 28) groundLayer[yPos][xPos-1] = 27;
            if (groundLayer[yPos][xPos] != 28) groundLayer[yPos][xPos] = 28;
            if (groundLayer[yPos][xPos+1] != 28) groundLayer[yPos][xPos+1] = 29;
            if (groundLayer[yPos+1][xPos-1] != 28) groundLayer[yPos+1][xPos-1] = 43;
            if (groundLayer[yPos+1][xPos] != 28) groundLayer[yPos+1][xPos] = 44;
            if (groundLayer[yPos+1][xPos+1] != 28) groundLayer[yPos+1][xPos+1] = 45;
            drawImage();
          }

          if ((serverMessage.module == 'game') && (serverMessage.action == 'playermoved')) {
            // layer02[yPos][xPos] = 204;
            // sendEvent('game', 'gameplay', 'getstate', '');
          }

          if ((serverMessage.module == 'game') && (serverMessage.action == 'nextturn')) {
            // layer02[yPos][xPos] = 204;
            // sendEvent('game', 'gameplay', 'getstate', '');
          }
                    
          if (((serverMessage.module == 'game') && (serverMessage.action == 'state'))
          || ((serverMessage.module == 'game') && (serverMessage.action == 'nextturn'))) {
            
            $('#gamedata-players').empty();
            clearLayer(groundEffectLayer, 0);
            clearLayer(tankLayer, 0);
            clearLayer(explosionLayer, 0);
            
            for (var i = 0, len = serverMessage.data.gameParticipants.length; i < len; i++) {
              if (serverMessage.data.gameParticipants[i] == currentUserId) {
                currentUserIndex = i;
              }

              var xPos = serverMessage.data.playerStates[i].tank.x;
              var yPos = serverMessage.data.playerStates[i].tank.y;
              $('#gamedata-players').append($('<li>').text('Player ' + i + ': ' + serverMessage.data.gameParticipants[i]));
              
              var tankImage = 199; // default Brutus
              if (serverMessage.data.playerStates[i].tank.name == "Spike") tankImage = 228;
              if (serverMessage.data.playerStates[i].tank.name == "Tower") tankImage = 196;
              
              if (serverMessage.data.playerStates[i].tank.orientation == 1) tankImage += 1;
              if (serverMessage.data.playerStates[i].tank.orientation == 2) tankImage += 17;
              if (serverMessage.data.playerStates[i].tank.orientation == 3) tankImage += 16;
              tankLayer[yPos][xPos] = tankImage;

              if ((parseInt(serverMessage.data.playerStates[i].tank.maxHitpoints)*0.5) > serverMessage.data.playerStates[i].tank.currentHitpoints) {
                explosionLayer[yPos][xPos] = 148;
              }              
            }

            var xPos = serverMessage.data.playerStates[serverMessage.data.gameState.activePlayer].tank.x;
            var yPos = serverMessage.data.playerStates[serverMessage.data.gameState.activePlayer].tank.y;
            groundEffectLayer[yPos][xPos] = 150;

            var currentPlayerInfo = '';
            if (serverMessage.data.gameState.activePlayer == currentUserIndex) {
              currentPlayerInfo += "It's your turn!";
              $('#tankactions').css('display', 'block');
            } else {
              currentPlayerInfo += "It's an opponents turn";
              $('#tankactions').css('display', 'none');
            }
            
            $('#gamedata-currentplayer').text(currentPlayerInfo);
            $('#gamedata-currenthitpoints').text('Your current hitpoints: ' + serverMessage.data.playerStates[currentUserIndex].tank.currentHitpoints);
            drawImage();
          }
        });