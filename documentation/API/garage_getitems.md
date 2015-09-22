# Garage - Get Items

This gets all items currently in the garage component of the user.

## Request

```javascript
{
	"type": "game",
	"module": "garage",
	"action": "getitems",
	"data": ""
}
```

## Result

The items from the user data storage.

```javascript
{
	"module": "shop",
	"action": "items",
	"data": "[$DATA_ITEMS]"
}
```

## To Do

