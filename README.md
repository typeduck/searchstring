# Search String

Parse a search string into individual words and properties.

```javascript
var searchstring = require("searchstring");
var s = searchstring("color:black type:'small box' round square");
s.props.color;// "black"
s.props.type;// "small box"
s.terms;// ["round", "square"]
s.words;// ["black", "small", "box", "round", "square"]
```

## Properties

The **searchstring** instance creates an object with four Getters.

### orig

**orig** is the original provided String.

### props

**props** is an Object:

- keys (lowercased) come from words prior to ":" in search string
- values come from word(s) following ":" in search string
- values that are quoted can contain spaces

### terms

**terms** is an Array of unique, non-empty "leftover" search terms (i.e. *not*
  prefixed with a property name)

- values that are quoted can contain spaces

### words

**words** is an Array of unique *individual words* collected from all property
  values (from **props**) and "leftover" search terms.

- values will **NOT** contain spaces
