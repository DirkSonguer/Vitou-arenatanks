
// log handler
var logHandler = require('../../classes/loghandler.js');

// storage handler
var storageHandler = require('../../classes/storagehandler.js');

// game data handler
var gamedataHandler = require('../../classes/gamedatahandler.js');

var run = function (session, data) {
	// get initial data structure for the new user
	// this should be handed over by the system create user function
	var userObject = data;

	// check if given object is really a user
	if ((!userObject) || (userObject.type != "UserObject")) {
		logHandler.log('Could not create user (successor): User is not authenticated', 3);
		return false;
	}
	
	// get initial structure for user assembly
	var userData = gamedataHandler.gameDataStructures.user;	
	
	// import initial tank
	var defaultTank = storageHandler.getByProperty('assemblage', 'tank');
	userData.garage.push(defaultTank[0].id);
	userData.activeTank = defaultTank[0].id;
		
	// import initial weaponturret
	var defaultWeaponTurret = storageHandler.getByProperty('assemblage', 'weaponturret');
	userData.garage.push(defaultWeaponTurret[0].id);
	userData.activeWeaponTurret = defaultWeaponTurret[0].id

	// store data in user object
	// add created user data to existing user object
	userObject.userData = userData;
	
	// add new user to storage
	storageHandler.set(userObject.id, userObject);
	
	// done
	return true;
};

module.exports = run;