
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
		logHandler.log('Could not get garage items: User is not authenticated', 3);
		return false;
	}
	
	// get user object
	var userObject = storageHandler.get(sessionObject.user);
		
	// check if session has an attached user
	if ((!userObject) || (userObject.type != "UserObject")) {
		logHandler.log('Could not get garage items: No user object found', 3);
		return false;
	}
		
	// get all item ids in the users garage
	var garageItemIds = userObject.userData.garage;
	
	// object to hold the garage items
	var garageItems = new Array();
	
	// get actual data for garage items
	for (var i = 0, len = garageItemIds.length; i < len; i++) {
		garageItems.push(storageHandler.get(garageItemIds[i]));
	}

	// send garage items to client
	var garageItemsString = util.inspect(garageItems, { depth: null });
	var event = '{ "module": "garage", "action": "items", "data": "' + garageItemsString + '" }';
	communicationHandler.sendToSession(event, sessionObject);

	// done
	return true;
};

module.exports = run;