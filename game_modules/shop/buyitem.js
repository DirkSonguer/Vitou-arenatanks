
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
		logHandler.log('Could not buy item: User is not authenticated', 3);
		return false;
	}
	
	// get user object
	var userObject = storageHandler.get(sessionObject.user);
		
	// check if session has an attached user
	if ((!userObject) || (userObject.type != "UserObject")) {
		logHandler.log('Could not buy item: No user object found', 3);
		return false;
	}

	// get item that should be bought
	var requestedItem = storageHandler.get(data);
	if ((!requestedItem) || (requestedItem.type != "GameDataObject")) {
		logHandler.log('Could not buy item: No game data object found', 3);
		return false;
	}

	// check if item is really for sale	
	if (requestedItem.components.indexOf('HasPriceComponent') < 0) {
		logHandler.log('Could not buy item: Item is not for sale', 3);
		return false;
	}
	
	// check if user has enough money
	if (userObject.userData.money < requestedItem.data.price) {
		logHandler.log('Could not buy item: User does not have enough money', 3);
		return false;
	}
	
	// TODO: Make transaction safe
	userObject.userData.money -= requestedItem.data.price;
	if (requestedItem.assemblage == 'tank') {
		userObject.userData.garage.push(data);	
	} else {
		userObject.userData.boostercards.push(data);	
	}
	storageHandler.set(userObject.id, userObject);
	
	// send confirmation to client
	var event = '{ "module": "shop", "action": "buyitem", "data": "' + data + '" }';
	communicationHandler.sendToSession(event, sessionObject);

	// done
	return true;
};

module.exports = run;