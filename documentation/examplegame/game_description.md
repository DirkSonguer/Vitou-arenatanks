# Example Game: Tanks

The proof of concept tries to implement a simple tanks-like game as example.

## Meta - General
* 2 player vs. game

## Meta - Player tanks
* Each player can own multiple tanks
* Each tank has hitpoints (=life)
* Each tank has a size (=hitbox)
* Each tank has a position on the map
* Each tank has a speed he can move with
* Each tank can be equiped with a weapon turret
* There are multiple types of tanks, each with different values for hitpoints, size and speed
* Each tank type has a price
* Each player starts with one tank of default type on account creation
* Players can buy more tanks for money

## Meta - Tank weapon turrets
* Each weapon turret causes damage on hit
* Each weapon turret can be fired in each direction (0°*360°) around the tanks position
* Each weapon turret can be angled at a max angle (0°*max°) in height
* Each weapon can be fired with a specific power (0*max power), making the projectile go further
* Players can buy tank weapon turrets
* Every type of weapon turret can be mounted to every type of tank

## Meta - Game start
* Players connect and either join a game or create a lobby
* Once 2 players connected via the lobby, they can confirm to start the game

## Main Game - Tank fight
* Each player is represented one of his his personl tanks he choses in the lobby
* Tanks have randomised starting positions on a 2D map
* Starting player is chosen at random
* Each round a player can either move up to his total speed along a vector or shoot
* Players take turns
* When a weapon hits a tank, it reduces the hitpoints of the hit tank
* If a tank has <= 0 hitpoints, it is destroyed
* A player wins if he destorys the other players tank
* The winner gets 10 money
