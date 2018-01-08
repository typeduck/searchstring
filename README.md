# Search String

Parse a search string into list of conditions, for parsing simple combinations
of search conditions.

```javascript
const searchstring = require("searchstring");
const conds = searchstring("color:black type:'small box' size:>5 !'evil'");
conds[0];// {value: "black", prop: "color"}
conds[1];// {value: "small box", prop: "type"}
conds[2];// {value: 5, prop: "size", op: ">"}
conds[3];// {value: "evil", op: "!"}
```

## Parsing

The search string is a series of space-separated terms. A term consists of:

- (optional) property name followed by a colon (":"), possibly quoted. e.g.:
    - myProperty:
    - 'spaced property':
- (optional) operator, any of: !, =, <=, <, >=, >
- value, possibly quoted, e.g.:
    - aStringValue
    - "a string value",
    - 'singled-quote value'
    - 'it\'s with an escaped quote'

The value returned is parsed into a number if it looks like a number.

## Quoting & Escaping

Both property names and values may be quoted. This allows you to keep spaces,
whereas a space normally move the parser on to the next
property/operator/value). You can use single or double quotes:

- 'the same thing'
- "the same thing"

What if you need to include a quote in a value? You can either use the "other"
type of quote, or use the backslash to escape the next character. In fact, the
backslash *always* escapes the next character, even outside of quotes:

- "it's the same"
- 'it\'s the same'
- it\'s\ the\ same

All of these variants are handled only because humans the world over agree that
backslashes should be used in moderation and when absolutely necessary.

## Using the Result

```javascript
const searchstring = require("searchstring");
let result = searchstring(myStringFromSomewhere);
```

The result is an an array of parsed property/operator/value objects. Each object
may have the following properties:

- value: the mandatory value portion, quotes and escapes handled
- op: if operator used, this is a literal string containing the operator
- prop: if property name was used, this is is set to it


## Examples

What you do further with this is up to you.

One possibility would be, for example, to run a database query where *all* the
given conditions are satisfied. In this scenario, you could search particular
fields (say, indexed ones), when there is no "prop" available. Otherwise, you
could limit the search to the given field.

In this example we are translating the searchstring results into a MongoDB
query.

```javascript
function mongoQueryFromSearchString (ss, indexedFields, availableFields) {
  if (!ss.length) { throw new Error('no search terms!') }
  const andQuery = []
  for (let res of ss) {
    if (!res.prop) {
      const orQuery = []
      for (let field of indexedFields) {
        orQuery.push(getQuery(res.value, res.op, field))
      }
      andQuery.push({$or: orQuery})
    } else if (availableFields.indexOf(res.prop) !== -1) {
      andQuery.push(getQuery(res.value, res.op, res.prop))
    } else { // given a property not searchable
      console.error(`User searched on unavailable property ${res.prop}`)
    }
  }
  if (!andQuery.length) { throw new Error('no usable filter!') }
  return {$and: andQuery}
}

function getQuery (value, op, field) {
  const q = {}
  switch (op) {
    case '!': q[field] = {$not: value}; break
    case '<': q[field] = {$lt: value}; break
    case '<=': q[field] = {$lte: value}; break
    case '>': q[field] = {$gt: value}; break
    case '>=': q[field] = {$gte: value}; break
    case '=':
    default: q[field] = value
  }
  return q
}

let query = mongoQueryFromSearchString(searchstring(queryString, ixFields, avFields))
database.collection.find(query).then((documents) => {
  sendDocumentsToCliBecauseEveryoneUsesCli(documents)
})
```

## TODO

Document value as RegExp (and support flags).
