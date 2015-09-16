###############################################################################
# For parsing a string with prefixed "attribute:value" into specific
# search values.
###############################################################################

module.exports = (s, o) -> new SearchString(s, o)

rxMulti = /(\S+):(\'|\")(.*?)(\2)/g
rxSingle = /(\S+):(\S*)/g
rxQuoted = /(\'|\")(.*?)(\1)/g

class SearchString
  constructor: (orig, opts = {}) ->
    s = orig
    opts.lowercase ?= true
    props = {}
    terms = [] # unique (non-property) words and quoted multi-word values
    words = [] # unique aggregation of all words
    makeProp = (k) -> if opts.lowercase then k.toLowerCase() else k
    # Pull out quoted properties
    while( m = rxMulti.exec(s) )
      props[makeProp(m[1])] = m[3]
    s = s.replace(rxMulti, "")
    # Pull out non-quoted properties
    while( m = rxSingle.exec(s) )
      props[makeProp(m[1])] = m[2]
    s = s.replace(rxSingle, "")
    # Pull out quoted strings into the terms
    while ( m = rxQuoted.exec(s) )
      terms.push(m[2])
    s = s.replace(rxQuoted, "")
    # Add any remaining words to the terms, ensure uniqueness
    terms = uniqExists(terms.concat(s.trim().split(/\s+/)))
    for k, v of props
      words = words.concat(v.split(/\s+/))
    for v in terms
      words = words.concat(v.split(/\s+/))
    words = uniqExists(words)
    # Define getters to make search string immutable
    Object.defineProperty(@, "orig", {enumerable: true, get: () -> orig})
    Object.defineProperty(@, "words", {enumerable: true, get: () -> words.slice()})
    Object.defineProperty(@, "terms", {enumerable: true, get: () -> terms.slice()})
    Object.defineProperty(@, "props", {enumerable: true, get: () ->
      ret = {}
      ret[k] = v for k, v of props
      return ret
    })

uniqExists = (arr) ->
  seen = {}
  arr.filter((s) -> if not s or seen[s] then false else seen[s] = true)
