
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
	var boosterItemIds = userObject.userData.boostercards;
	
	// object to hold the garage items
	var boosterItems = new Array();
	
	// get actual data for garage items
	for (var i = 0, len = boosterItemIds.length; i < len; i++) {
		boosterItems.push(storageHandler.get(boosterItemIds[i]));
	}

	// send garage items to client
	var boosterItemsString = JSON.stringify(boosterItems);
	var event = '{ "module": "boostercards", "action": "items", "data": ' + boosterItemsString + ' }';
	communicationHandler.sendToSession(event, sessionObject);

	// done
	return true;
};

module.exports = run;