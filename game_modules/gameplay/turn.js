
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
		logHandler.log('Could not move player: User is not authenticated', 3);
		return false;
	}
		
	// get user object
	var userObject = storageHandler.get(sessionObject.user);
		
	// check if session has an attached user
	if ((!userObject) || (userObject.type != "UserObject")) {
		logHandler.log('Could not move player: No user object found', 3);
		return false;
	}	
	
	// get the game object
	var gameObject = storageHandler.get(userObject.game);

	// check if object is really a game
	if ((!gameObject) || (gameObject.type != "GameObject")) {
		logHandler.log('Could not move player: No game object received', 3);
		return false;
	}
	
	// check if it's the current players turn
	if (gameObject.gameParticipants[gameObject.gameState['activePlayer']] != userObject.id) {
		logHandler.log('Could not move player: Not current users turn', 3);
		return false;
	}

	// check if parameters are handed over
	if ((!data) || (typeof data.orientation == 'undefined')  || (isNaN(parseInt(data.orientation)))) {
		logHandler.log('Could not move player: Data object does not contain coordinates', 3);
		return false;
	}
	
	// orientations: 0 = facing north (0,+1), 1 = facing east (+1,0), 2 = facing south (0,-1), 3 = facing west (-1,0)
	
	// set new orientation
	if ((parseInt(data.orientation) >= 0) && (parseInt(data.orientation) <= 3)) {
		gameObject.playerStates[gameObject.gameState['activePlayer']].tank.orientation = data.orientation;
	}
	
	// store updated game object
	storageHandler.set(gameObject.id, gameObject);

	// send game update to all clients
	var event = '{ "module": "game", "action": "playerturned", "data": ' + data.orientation + ' }';
	communicationHandler.sendToUserList(event, gameObject.gameParticipants);
	
	// done
	return true;
};

module.exports = run;