
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
		logHandler.log('Could not select garage items: User is not authenticated', 3);
		return false;
	}
	
	// get user object
	var userObject = storageHandler.get(sessionObject.user);
		
	// check if session has an attached user
	if ((!userObject) || (userObject.type != "UserObject")) {
		logHandler.log('Could not select garage items: No user object found', 3);
		return false;
	}
		
	// get all item ids in the users garage
	var garageItemIds = userObject.userData.garage;
	
	// check if the given tank is actually in the users garage
	if (garageItemIds.indexOf(data) < 0) {
		logHandler.log('Could not select garage items: Item not in garage', 3);
		return false;
	}

	// check if item is actually a tank
	var garageItem = storageHandler.get(data);
	
	// check if garage item is really a game data object
	if ((!garageItem) || (garageItem.type != "GameDataObject")) {
		logHandler.log('Could not select garage items: No game data object found', 3);
		return false;
	}

	// check if item is a tank
	if (garageItem.assemblage != 'tank') {
		logHandler.log('Could not select garage items: Item is not a tank', 3);
		return false;
	}

	// set user data
	if (garageItem.assemblage == 'tank') {
		userObject.userData.activeTank = data;
	}
	
	storageHandler.set(userObject.id, userObject);

	// send confirmation to client
	var event = '{ "module": "garage", "action": "selectedtank", "data": "' + data + '" }';
	communicationHandler.sendToSession(event, sessionObject);

	// done
	return true;
};

module.exports = run;