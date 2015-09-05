/*
Input: direction, angle, power

// check if player turret allows shot (angle)
if (Player.CurrentWeaponTurretEntity.CanFireComponent.maxAngle < Input.angle) {
	return ERROR;
}

// check if player turret allows shot (power)
if (Player.CurrentWeaponTurretEntity.CanFireComponent.maxPower < Input.power) {
	return ERROR;
}

// calculate impact position
impactPosition = ..

impactedPlayerEntities = GetAllPlayersAffectedByShot(impactPosition);

foreach (impactedPlayerEntities as impactedPlayerEntity) {
	// check if opponent is destroyed
	if (impactedPlayerEntity.CurrentTankEntity.HitpointComponent.hitpoints < Player.CurrentWeaponTurretEntity.CanFireComponent.damage)
	{
		// current player has won
		..
	}
	
	// send message to other player with impact
	queueMessage(HIT_BY_WEAPON, impactedPlayerEntity, Player.CurrentWeaponTurretEntity);
	return OK;
}
*/


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
	
	// angle = the angle from the current players position relative to north (0/+1)
	// power = the length of the line
		
	// calculate distances and lengths
	var xDistance = data.power * Math.sin(data.angle);
	var yDistance = Math.sqrt((data.power * data.power) - (xDistance * xDistance));
	
	// calculate hit x position
	var targetX = 0;
	if ((data.angle >= 0) && (data.angle <= 180)) {
		targetX = gameObject.playerStates[userObject.id].tank.x + xDistance;
	} else {
		targetX = gameObject.playerStates[userObject.id].tank.x - xDistance;
	}

	// calculate hit y position
	var targetY = 0;
	if ((data.angle >= 90) && (data.angle <= 270)) {
		targetY = gameObject.playerStates[userObject.id].tank.y - yDistance;
	} else {
		targetY = gameObject.playerStates[userObject.id].tank.y + yDistance;
	}
	
	// check all players for hits
	var playerHitList = new Array();
	for (var i = 0, ilen = gameObject.gameParticipants.length; i < ilen; i++) {
		var playerHit = 1;
		if (
			((gameObject.playerStates[gameObject.gameParticipants[i]].tank.x - gameObject.playerStates[gameObject.gameParticipants[i]].tank.hitbox) < targetX)
			|| ((gameObject.playerStates[gameObject.gameParticipants[i]].tank.x - gameObject.playerStates[gameObject.gameParticipants[i]].tank.hitbox) > targetX)
			) playerHit = 0;
		if (
			((gameObject.playerStates[gameObject.gameParticipants[i]].tank.y - gameObject.playerStates[gameObject.gameParticipants[i]].tank.hitbox) < targetY)
			|| ((gameObject.playerStates[gameObject.gameParticipants[i]].tank.y - gameObject.playerStates[gameObject.gameParticipants[i]].tank.hitbox) > targetY)
			) playerHit = 0;
		if (playerHit == 1) {
			playerHitList.push(gameObject.gameParticipants[i]);
		};
	}

	// check hits
	if (playerHitList.length > 0) {
		for (var j = 0, jlen = playerHitList.length; j < jlen; j++) {
			// reduce hitpoints on hit
			gameObject.playerStates[playerHitList.length[j]].tank.hitpoints -= gameObject.playerStates[userObject.id].weaponturret.damage;

			// send hit data
			var event = '{ "module": "game", "action": "playerhit", "data": "' + playerHitList[j] + '" };';
			communicationHandler.sendToUserList(event, gameObject.gameParticipants);
		}
	}
	
	// store updated game object
	storageHandler.set(gameObject.id, gameObject);

	// send game update to all clients
	var gameObjectString = JSON.stringify(gameObject);
	var event = '{ "module": "game", "action": "playershot", "data": ' + gameObjectString + ' };';
	communicationHandler.sendToUserList(event, gameObject.gameParticipants);
	
	// done
	return true;
};

module.exports = run;
