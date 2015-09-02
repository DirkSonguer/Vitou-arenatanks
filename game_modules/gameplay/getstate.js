
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
		logHandler.log('Could not get game state: User is not authenticated', 3);
		return false;
	}
	
	// get user object
	var userObject = storageHandler.get(sessionObject.user);
		
	// check if session has an attached user
	if ((!userObject) || (userObject.type != "UserObject")) {
		logHandler.log('Could not get game state: No user object found', 3);
		return false;
	}	
	
	// get the game object
	var gameObject = storageHandler.get(userObject.game);

	// send state to client
	var gameObjectString = util.inspect(gameObject, { depth: null });
	var event = '{ "module": "game", "action": "state", "data": "' + gameObjectString + '" }';
	communicationHandler.sendToSession(event, sessionObject);
	
	// done
	return true;
};

module.exports = run;