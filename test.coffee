###############################################################################
# Mocha tests for the SearchString API
###############################################################################

require("should")

SS = require("./")

describe "SearchString", () ->
  it "should parse complicated string", () ->
    search = SS("type:fruit color:red multi:'quoted string' this and that moar:\"quoted\"")
    search.props.type.should.equal("fruit")
    search.props.color.should.equal("red")
    search.props.multi.should.equal("quoted string")
    search.terms.length.should.equal(3)
    search.terms.indexOf("this").should.not.equal(-1)
    search.terms.indexOf("and").should.not.equal(-1)
    search.terms.indexOf("that").should.not.equal(-1)
    search.words.length.should.equal(7)
    search.words.indexOf("fruit").should.not.equal(-1)
    search.words.indexOf("red").should.not.equal(-1)
    search.words.indexOf("quoted").should.not.equal(-1)
    search.words.indexOf("string").should.not.equal(-1)
    search.words.indexOf("this").should.not.equal(-1)
    search.words.indexOf("and").should.not.equal(-1)
    search.words.indexOf("that").should.not.equal(-1)
  it "should fail non-matching quotes", () ->
    search = SS("i am a bad:' person in this case")
    search.props.bad.should.equal("'")
    search.terms.length.should.equal(7)
    search.terms.indexOf("i").should.not.equal(-1)
    search.terms.indexOf("am").should.not.equal(-1)
    search.terms.indexOf("a").should.not.equal(-1)
    search.terms.indexOf("person").should.not.equal(-1)
    search.terms.indexOf("in").should.not.equal(-1)
    search.terms.indexOf("this").should.not.equal(-1)
    search.terms.indexOf("case").should.not.equal(-1)
  it "should lowercase prop names", () ->
    search = SS("SHOUTING:yes!")
    search.props.shouting.should.equal("yes!")
    search.terms.length.should.equal(0)
    search.words.length.should.equal(1)
    search.words.indexOf("yes!").should.not.equal(-1)
  it "should ignore incomplete props", () ->
    search = SS("incomplete:")
    search.props.incomplete.should.equal("")
    search.terms.length.should.equal(0)
    search.words.length.should.equal(0)
  it "should handle quotes in quotes", () ->
    search = SS("quoted:\"'quoted string'\"")
    search.props.quoted.should.equal("'quoted string'")
    search.terms.length.should.equal(0)
    search.words.length.should.equal(2)
    search.words.indexOf("'quoted").should.not.equal(-1)
    search.words.indexOf("string'").should.not.equal(-1)
  it "should not separate quoted terms", () ->
    search = SS("'needed and wanted' \"also needed\"")
    search.terms.length.should.equal(2)
    search.terms.indexOf("needed and wanted").should.not.equal(-1)
    search.terms.indexOf("also needed").should.not.equal(-1)
    search.words.length.should.equal(4)
    search.words.indexOf("needed").should.not.equal(-1)
    search.words.indexOf("and").should.not.equal(-1)
    search.words.indexOf("wanted").should.not.equal(-1)
    search.words.indexOf("also").should.not.equal(-1)
  it "should ignore repeats in terms/words", () ->
    search = SS("'yes yes' 'yes yes' 'no no' 'no no' yes no yes foo:'yes yes'")
    search.terms.indexOf("yes yes").should.not.equal(-1)
    search.terms.indexOf("no no").should.not.equal(-1)
    search.terms.indexOf("yes").should.not.equal(-1)
    search.terms.indexOf("no").should.not.equal(-1)
    search.words.length.should.equal(2)
    search.words.indexOf("yes").should.not.equal(-1)
    search.words.indexOf("no").should.not.equal(-1)
