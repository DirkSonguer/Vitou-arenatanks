
// node utilities
var util = require('util');

// log handler
var logHandler = require('../../classes/loghandler.js');

// storage handler
var storageHandler = require('../../classes/storagehandler.js');

// communication handler
var communicationHandler = require('../../classes/communicationhandler.js');

var run = function (session, data) {
	// get session object
	var sessionObject = storageHandler.get(session.id);
	
	// check if session has an attached user
	if (sessionObject.user == "") {
		logHandler.log('Could not end turn: User is not authenticated', 3);
		return false;
	}
		
	// get user object
	var userObject = storageHandler.get(sessionObject.user);
		
	// check if session has an attached user
	if ((!userObject) || (userObject.type != "UserObject")) {
		logHandler.log('Could not end turn: No user object found', 3);
		return false;
	}	
	
	// get the game object
	var gameObject = storageHandler.get(userObject.game);

	// check if object is really a game
	if ((!gameObject) || (gameObject.type != "GameObject")) {
		logHandler.log('Could not end turn: No game object received', 3);
		return false;
	}
	
	// check if it's the current players turn
	if (gameObject.gameParticipants[gameObject.gameState['activePlayer']] != userObject.id) {
		logHandler.log('Could not end turn: Not current users turn', 3);
		return false;
	}

	// end turn and hand to next player
	if ((gameObject.gameState['activePlayer'] + 1) < gameObject.gameParticipants.length) {
		gameObject.gameState['activePlayer'] += 1;
	} else {
		gameObject.gameState['activePlayer'] = 0;
		gameObject.gameState['round'] += 1;
	}
	
	// store updated game object
	storageHandler.set(gameObject.id, gameObject);

	// send game update to all clients
	var gameObjectString = JSON.stringify(gameObject);
	var event = '{ "module": "game", "action": "nextturn", "data": ' + gameObjectString + ' };';
	communicationHandler.sendToUserList(event, gameObject.gameParticipants);
	
	// done
	return true;
};

module.exports = run;