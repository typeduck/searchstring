/* eslint-env mocha */
'use strict'
require('should')

const searchstring = require('./')

describe('searchstring', function () {
  it('should parse all operators', function () {
    const ss = searchstring('a:A b:=B c:>C d:>=D e:<E f:<=F g:!G H =I <J <=K >L >=M !N')
    ss.should.eql([
      {value: 'A', prop: 'a'},
      {value: 'B', op: '=', prop: 'b'},
      {value: 'C', op: '>', prop: 'c'},
      {value: 'D', op: '>=', prop: 'd'},
      {value: 'E', op: '<', prop: 'e'},
      {value: 'F', op: '<=', prop: 'f'},
      {value: 'G', op: '!', prop: 'g'},
      {value: 'H'},
      {value: 'I', op: '='},
      {value: 'J', op: '<'},
      {value: 'K', op: '<='},
      {value: 'L', op: '>'},
      {value: 'M', op: '>='},
      {value: 'N', op: '!'}
    ])
  })
  it('should parse quoted values', function () {
    const ss = searchstring('a:"A A" b:="B B" c:>\'C C\' d:>="D D" e:<"E E" f:<="F F" g:!"G G" "H & H" =\'I & I\' <"J J" <="K K" >"L L" >="M M" !"N N"')
    ss.should.eql([
      {value: 'A A', prop: 'a'},
      {value: 'B B', op: '=', prop: 'b'},
      {value: 'C C', op: '>', prop: 'c'},
      {value: 'D D', op: '>=', prop: 'd'},
      {value: 'E E', op: '<', prop: 'e'},
      {value: 'F F', op: '<=', prop: 'f'},
      {value: 'G G', op: '!', prop: 'g'},
      {value: 'H & H'},
      {value: 'I & I', op: '='},
      {value: 'J J', op: '<'},
      {value: 'K K', op: '<='},
      {value: 'L L', op: '>'},
      {value: 'M M', op: '>='},
      {value: 'N N', op: '!'}
    ])
  })
  it('should parse quoted fields', function () {
    const ss = searchstring('"a":A "b":=B \'c\':>C "d":>=D "e e":<E "f\'f":<=F "g":!G H =I <J <=K >L >=M !N')
    ss.should.eql([
      {value: 'A', prop: 'a'},
      {value: 'B', op: '=', prop: 'b'},
      {value: 'C', op: '>', prop: 'c'},
      {value: 'D', op: '>=', prop: 'd'},
      {value: 'E', op: '<', prop: 'e e'},
      {value: 'F', op: '<=', prop: "f'f"},
      {value: 'G', op: '!', prop: 'g'},
      {value: 'H'},
      {value: 'I', op: '='},
      {value: 'J', op: '<'},
      {value: 'K', op: '<='},
      {value: 'L', op: '>'},
      {value: 'M', op: '>='},
      {value: 'N', op: '!'}
    ])
  })
  it('should parse values with escaped strings', function () {
    const ss = searchstring('a:"quote \\"in\\side"')
    ss.should.eql([
      {value: 'quote "inside', prop: 'a'}
    ])
  })
  it('should parse regex values', function () {
    const ss = searchstring('a:/reg(exp)\\/regular expression/')
    ss.should.eql([
      {value: /reg(exp)\/regular expression/, prop: 'a'}
    ])
  })
  it('should allow backslash to escape spaces', function () {
    const ss = searchstring('some\\ term:some\\ value')
    ss.should.eql([
      {value: 'some value', prop: 'some term'}
    ])
  })
})
describe('README sample query conversion', function () {
  it('should do demo translation', function () {
    const ixFields = ['lastName', 'city']
    const avFields = ['firstName', 'lastName', 'street', 'city', 'postal', 'height']
    const ss = searchstring('firstName:"donald" !orlando height:>=180')
    let query = mongoQueryFromSearchString(ss, ixFields, avFields)
    query.should.eql({
      $and: [
        {firstName: 'donald'},
        {$or: [
          {lastName: {$not: 'orlando'}},
          {city: {$not: 'orlando'}}
        ]},
        {height: {$gte: 180}}
      ]
    })
  })
})

// just to make sure the README code is correct!
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
