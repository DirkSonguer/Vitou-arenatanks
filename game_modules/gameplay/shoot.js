
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
		logHandler.log('Could not shoot weapon: User is not authenticated', 3);
		return false;
	}
		
	// get user object
	var userObject = storageHandler.get(sessionObject.user);
		
	// check if session has an attached user
	if ((!userObject) || (userObject.type != "UserObject")) {
		logHandler.log('Could not shoot weapon: No user object found', 3);
		return false;
	}	
	
	// get the game object
	var gameObject = storageHandler.get(userObject.game);

	// check if object is really a game
	if ((!gameObject) || (gameObject.type != "GameObject")) {
		logHandler.log('Could not shoot weapon: No game object received', 3);
		return false;
	}
	
	// check if it's the current players turn
	if (gameObject.gameParticipants[gameObject.gameState['activePlayer']] != userObject.id) {
		logHandler.log('Could not shoot weapon: Not current users turn', 3);
		return false;
	}

	// check if parameters are handed over
	if ((!data) || (typeof data.angle == 'undefined') || (typeof data.power == 'undefined')) {
		logHandler.log('Could not shoot weapon: Data object does not contain target parameters', 3);
		return false;
	}

	// check if parameters are numbers
	if ((isNaN(parseInt(data.angle))) || (isNaN(parseInt(data.power)))) {
		logHandler.log('Could not shoot weapon: Data object does not contain valid target parameters', 3);
		return false;
	}
	
	// orientations: 0 = facing north (0,+1), 1 = facing east (+1,0), 2 = facing south (0,-1), 3 = facing west (-1,0)
	// angle = the angle from the current players position relative to its orientation
	// positive angle means going clockwise from the orientation, negative means going counter clockwise
	// solution: we'll add the angle to (orientation * 90)
	// power = the length of the line along the vector (orientation + angle)
	
	// check if angle is within the allowed range
	if (Math.abs(data.angle) > parseInt(gameObject.playerStates[gameObject.gameState['activePlayer']].tank.maxAngle)) {
		logHandler.log('Could not shoot weapon: Angle is outside the allowed bounds of the current weapon turret', 3);
		return false;
	}

	// check if power is within the allowed range
	if (Math.abs(data.power) > parseInt(gameObject.playerStates[gameObject.gameState['activePlayer']].tank.maxPower)) {
		logHandler.log('Could not shoot weapon: Power is outside the allowed bounds of the current weapon turret', 3);
		return false;
	}
	
	// correct angle with current orientation
	logHandler.log('Original angle ' + data.angle + ' with orientation ' + gameObject.playerStates[gameObject.gameState['activePlayer']].tank.orientation, 3);
	data.angle = parseInt(data.angle) + (parseInt(gameObject.playerStates[gameObject.gameState['activePlayer']].tank.orientation) * 90);

	// calculate distances and lengths
	var xDistance = Math.floor(data.power * Math.sin(data.angle / 180 * Math.PI));
	var yDistance = Math.floor(Math.sqrt((data.power * data.power) - (xDistance * xDistance)));
	logHandler.log('Math.floor(Math.sqrt((' + data.power + ' * ' + data.power + ') - (' + xDistance + ' * ' + xDistance + ')))', 3);
		
	// calculate hit x position
	var targetX = 0;
	targetX = parseInt(gameObject.playerStates[gameObject.gameState['activePlayer']].tank.x) + xDistance;

	// calculate hit y position
	var targetY = 0;
	yDistance *= -1;
	if ((data.angle >= 90) && (data.angle <= 270)) {
		yDistance *= -1;
	}
	targetY = parseInt(gameObject.playerStates[gameObject.gameState['activePlayer']].tank.y) + yDistance;

	logHandler.log('Angle ' + data.angle + ' + Power ' + data.power + ' from position ' + parseInt(gameObject.playerStates[gameObject.gameState['activePlayer']].tank.x) + ' / ' + parseInt(gameObject.playerStates[gameObject.gameState['activePlayer']].tank.y), 3);
	logHandler.log('XXX: Position ' + parseInt(gameObject.playerStates[gameObject.gameState['activePlayer']].tank.x) + ' + xDistance ' + xDistance + ' is ' + targetX, 3);
	logHandler.log('YYY Position ' + parseInt(gameObject.playerStates[gameObject.gameState['activePlayer']].tank.y) + ' + yDistance ' + yDistance + ' is ' + targetY, 3);
	
	// check all players for hits
	var playerHitList = new Array();
	for (var i = 0, ilen = gameObject.gameParticipants.length; i < ilen; i++) {
		var playerHit = 1;

		var hbxmin = Math.floor((parseInt(gameObject.playerStates[i].tank.x) - parseInt(gameObject.playerStates[i].tank.hitbox)/2));
		var hbxmax = Math.floor((parseInt(gameObject.playerStates[i].tank.x) + parseInt(gameObject.playerStates[i].tank.hitbox)/2));

		logHandler.log('Hitbox X from ' + hbxmin + ' to ' + hbxmax + ' (shot to ' + targetX + ')', 4);
		if ((hbxmin > targetX) || (hbxmax < targetX)) {
			logHandler.log('X seems out of bounds', 3);
			playerHit = 0;
		}

		var hbymin = parseInt(gameObject.playerStates[i].tank.y) - parseInt(gameObject.playerStates[i].tank.hitbox);
		var hbymax = parseInt(gameObject.playerStates[i].tank.y) + parseInt(gameObject.playerStates[i].tank.hitbox);

		logHandler.log('Hitbox Y from ' + hbymin + ' to ' + hbymax + ' (shot to ' + targetY + ')', 4);
		if ((hbymin > targetY) || (hbymax < targetY)) {
			logHandler.log('Y seems out of bounds', 3);
			playerHit = 0;
		}

		if (playerHit == 1) {
			playerHitList.push(i);
		};
	}
	
	// check hits
	if (playerHitList.length > 0) {
		for (var j = 0, jlen = playerHitList.length; j < jlen; j++) {
			// reduce hitpoints on hit
			gameObject.playerStates[playerHitList[j]].tank.currentHitpoints -= gameObject.playerStates[gameObject.gameState['activePlayer']].tank.damage;

			// send hit data
			var event = '{ "module": "game", "action": "playerhit", "data": "' + playerHitList[j] + '" }';
			communicationHandler.sendToUserList(event, gameObject.gameParticipants);
		}
	}
	
	// store updated game object
	storageHandler.set(gameObject.id, gameObject);

	// send game update to all clients	
	var shotResult = {};
	shotResult['x'] = targetX;
	shotResult['y'] = targetY;
	shotResult = JSON.stringify(shotResult);

	var event = '{ "module": "game", "action": "playershot", "data": ' + shotResult + ' }';
	communicationHandler.sendToUserList(event, gameObject.gameParticipants);
	
	// done
	return true;
};

module.exports = run;
