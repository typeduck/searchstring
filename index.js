'use strict'

module.exports = function searchstring (orig) {
  const stack = []
  const len = orig.length
  const ret = []
  let buffer = ''
  let field = null
  let op = ''
  for (let i = 0; i <= len; i++) {
    const c = i === len ? ' ' : orig[i] // virtual end space advances parsing
    const s = stack[0]
    if (s === '\\') { // backslash as escape ANYthing
      stack.shift()
      buffer += c
    } else if (c === '\\') { // escape the NEXT anything
      stack.unshift(c)
    } else if (s === "'" || s === '"' || s === '/') { // inside a string/regexp
      if (c !== s) {
        buffer += c
      } else {
        stack.shift()
        if (c === '/') {
          buffer = new RegExp(buffer)
        }
      }
    } else if (c === "'" || c === '"' || c === '/') { // start string/regexp
      if (buffer) {
        if (!isOperator(buffer)) {
          throw new Error(`(${i}): unescaped "${c}" with buffer ${buffer}`)
        }
        op = buffer
        buffer = ''
      }
      stack.unshift(c)
    } else if (c === ':') { // end of a field
      if (field) {
        throw new Error(`(${i}): encountered ":" when field already read`)
      }
      field = buffer
      buffer = ''
    } else if (c === ' ') { // whitespace triggers finishing
      const parsed = {value: finalizeValue(buffer)}
      if (op) { parsed.op = op }
      if (field) { parsed.prop = field }
      if (field || buffer) { ret.push(parsed) } // ignore multiple spaces
      field = ''
      buffer = ''
      op = ''
    } else if (buffer) { // default: push to buffer (and check for operator)
      // NOTE: dumb implementation - uses the fact that no operator is
      // currently larger than two charachters!
      if (isOperator(buffer + c)) {
        op = buffer + c
        buffer = ''
      } else if (isOperator(buffer)) {
        op = buffer
        buffer = c
      } else {
        buffer += c
      }
    } else { // new buffer is started with char
      buffer = c
    }
  }
  return ret
}

function isOperator (s) {
  return ['!', '=', '<=', '<', '>=', '>'].indexOf(s) !== -1
}

// http://json.org/ (railroad diagram into RegExp)
const rxNumber = /^-?(0|[1-9]\d*)(\.\d+)?((e|E)([+-])?\d+)?$/
function finalizeValue (s) {
  if (rxNumber.test(s)) { return parseFloat(s, 10) }
  return s
}
