# Shop - Get Items

This gets all items currently in the system that have the "HasPriceComponent".

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

