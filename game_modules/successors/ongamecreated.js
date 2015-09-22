
// log handler
var logHandler = require('../../classes/loghandler.js');

// storage handler
var storageHandler = require('../../classes/storagehandler.js');

// game data handler
var gamedataHandler = require('../../classes/gamedatahandler.js');

// communication handler
var communicationHandler = require('../../classes/communicationhandler.js');

var run = function (session, data) {
	// get initial data structure for the new game
	// this should be handed over by the system create game function
	var gameObject = data;

	// check if given object is really a game
	if ((!gameObject) || (gameObject.type != "GameObject")) {
		logHandler.log('Could not create game (successor): No game object received', 3);
		return false;
	}

	// define start states for all players
	for (var i = 0, len = gameObject.gameParticipants.length; i < len; i++) {
		var playerState = {};
		
		// get current player object (= user object)
		var playerObject = storageHandler.get(gameObject.gameParticipants[i]);

		// check if given object is really a user
		if ((!playerObject) || (playerObject.type != "UserObject")) {
			logHandler.log('Could not create game (successor): No user object found', 3);
			return false;
		}
		
		// set initial position for tank
		var tankData = storageHandler.get(playerObject.userData.activeTank);
		tankData.data.x = Math.floor(Math.random() * 32) + 3;
		tankData.data.y = Math.floor(Math.random() * 20) + 2;
		playerState['tank'] = tankData.data;
		
		// add weapon turret
		var weaponturretData = storageHandler.get(playerObject.userData.activeWeaponTurret);
		playerState['weaponturret'] = weaponturretData.data;

		// add player state to game object
		gameObject.playerStates.push(playerState);
	}
	
	// set global game states
	var gameState = {};
	gameState['activePlayer'] = 0;
	gameState['round'] = 1;
	
	// add game state to game object
	gameObject.gameState = gameState;
	
	// store updated game object
	storageHandler.set(gameObject.id, gameObject);
	
	// done
	return true;
};

module.exports = run;