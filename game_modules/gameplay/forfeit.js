
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
		logHandler.log('Could not forfeit game: User is not authenticated', 3);
		return false;
	}
		
	// get user object
	var userObject = storageHandler.get(sessionObject.user);
		
	// check if session has an attached user
	if ((!userObject) || (userObject.type != "UserObject")) {
		logHandler.log('Could not forfeit game: No user object found', 3);
		return false;
	}	
	
	// get the game object
	var gameObject = storageHandler.get(userObject.game);

	// check if object is really a game
	if ((!gameObject) || (gameObject.type != "GameObject")) {
		logHandler.log('Could not forfeit game: No game object received', 3);
		return false;
	}

	// check if player could be found in attached game
	if (gameObject.gameParticipants.indexOf(userObject.id) < 0) {
		logHandler.log('Could not forfeit game: Player not part of found game', 3);
		return false;
	}
	
	// get actual player id for the game
	// this is not the id in the system, but the currently running game
	var playerId = gameObject.gameParticipants.indexOf(userObject.id);

	// set hitpoints of player to zero
	// this will lead to the player being removed from the game by the successor
	gameObject.playerStates[playerId].tank.currentHitpoints = 0;
		
	// store updated game object
	storageHandler.set(gameObject.id, gameObject);
	
	// done
	return true;
};

module.exports = run;
