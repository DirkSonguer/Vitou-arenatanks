# Proof of Concept Game

The proof of concept tries to implement a simple tanks-like game as example. The goal is to have as much game logic, data and structures dynamic as possible. Ideally everything should be changable via an online editor (changing the data files) or very easy scripting files.

For game details, see documentation in /documentation/examplegame.

## Demo scenario

We expect two clients (Player1, Player2) that connect and play together. This is the "script" they might go through from a server view.

## Player 1: Connect to the server as socket

This is basically just the first client connecting to the server at the respective socket.

## Player 1: Create a new user for player 1 (system/user/create/-)

We assume that both players are not registered with the game yet, thus player 1 starts with registering a new user by creating one.

The new user will be added to the user storage and /successors/onusercreated will fill the newly created user object with standard game values, like the default tank, money and so on. 

## Player 1: Check what items are available in the shop (game/shop/getitems/-)

Let's assume player 1 wants to buy a new item, so he requests all available items to buy in the shop.

The call will return all game entities that have the component HasPriceComponent, thus a user is able to buy them.

## Player 1: Buy a new tank (game/shop/buyitem/$tank_id)

The player chooses a tank from the list of available items and buys it.

The server will handle the transaction including validating and updating bank accounts.

## Player 1: Select new tank as main tank (game/garage/selectitem/$tank_id)

The player selects the new tank as his main tank to play with.

This does not change the default weapon turret the user has equipped. The game simply assumes that the weapon turret has been transferred to the new tank.

## Player 2: Connect to the server as socket

The second client connecting to the server at the respective socket.

## Player 2: Create a new user for player 2 (system/user/create/-)

Again, player 2 creates itself a new user with default state and possessions.

## Player 2: Check what items are available in the shop (game/shop/getitems/-)

Let's assume player 2 also wants to buy a new item, so he requests all available items to buy in the shop as well.

## Player 2: Buy a new weapon turret (game/shop/buyitem/$weaponturret_id)

The player chooses a weapon turret from the list of available items and buys it.

## Player 2: Use new turret with current tank (game/garage/selectitem/$weaponturret_id)

The player selects the new weapon turret as his main turret to play with.

This does not change the default tank the user has equipped. The game simply assumes that the weapon turret is replaced on the existing tank.

## Player 1: Open a new lobby (system/lobby/create/-)

Player 1 wants to play, so he opens a lobby and waits for other players.

The call will create a new lobby in storage and add the initiating player automatically to it.

## Player 2: Search for currently available lobbies (system/lobby/list/-)

Player 2 wants to play and searches for available lobbies.

The call returns the list of open and available lobbies to the requesting user.

## Player 2: Join the lobby created by player 1 (system/lobby/join/$lobby_id)

Player 2 selects the lobby of player 1 and joins it.

This will add player 2 to the participants list of the respective lobby id. All players already in the lobby get a message that a new player has joined.

## Player 1: Confirms the match (system/lobby/confirm/lobby_id)

Participants in a lobby have to confirm that they want to play with each other. Player 1 confirms first.

This will send send a message to all other participants in the lobby that player 1 has confirmed.

## Player 2: Also confirms the match (system/lobby/confirm/lobby_id)

Since both players have confirmed now, the game automatically starts. A new game is created in the system with both players attached to it. Both players get a notification that their game started with the respective game id.

The first player gets an additional message that informs him that it's his turn.

## ..

## Player 1: Disconnect from the server
## Player 2: Disconnect from the server
