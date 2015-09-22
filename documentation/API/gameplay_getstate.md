# Gameplay - Get State

This gets the entire game state for the game the user is currently participating in.

Optionally you can hand over an assemblage and only items from this type will be returned.

## Request

```javascript
{
	"type": "game",
	"module": "shop",
	"action": "getitems",
	"data": "$ITEM_ASSEMBLAGE"
}
```

## Result

The items from the data storage.

```javascript
{
	"module": "shop",
	"action": "items",
	"data": "[$DATA_ITEMS]"
}
```

## To Do

