'use strict';

var grunt = require('grunt');
var path = require('path');
var fs = require('fs');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

var projectRoot = path.resolve(__dirname, '..').replace(/\\/g,'/');

function processFile(contents) {
  return contents
    .replace(/%%PROJECT_ROOT%%/g, projectRoot);
}

function processJSON(contents) {
  return JSON.parse(processFile(contents));
}

exports.bowerRelease = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },
  tearDown: function(done) {
    // teardown here if necessary
    done();
  },
  stable: function(test) {
    test.expect(1);
    var actual = processJSON(fs.readFileSync('test/tmp/stable-endpoint.json', 'utf8'));
    var expected = processJSON(fs.readFileSync('test/expected/stable-endpoint.json', 'utf8'));
    test.deepEqual(actual, expected, 'should call all vcs methods with correct arguments');
    test.done();
  },
  devel: function(test) {
    test.expect(1);
    var actual = processJSON(fs.readFileSync('test/tmp/devel-endpoint.json', 'utf8'));
    var expected = processJSON(fs.readFileSync('test/expected/devel-endpoint.json', 'utf8'));
    test.deepEqual(actual, expected, 'should call all vcs methods with correct arguments');
    test.done();
  },
  overwriteTag: function(test) {
    test.expect(1);
    var actual = processJSON(fs.readFileSync('test/tmp/overwriteTag-endpoint.json', 'utf8'));
    var expected = processJSON(fs.readFileSync('test/expected/overwriteTag-endpoint.json', 'utf8'));
    test.deepEqual(actual, expected, 'should call all vcs methods with correct arguments');
    test.done();
  },
  removeVersionTags: function(test) {
    test.expect(1);
    var actual = processJSON(fs.readFileSync('test/tmp/removeVersionTags-endpoint.json', 'utf8'));
    var expected = processJSON(fs.readFileSync('test/expected/removeVersionTags-endpoint.json', 'utf8'));
    test.deepEqual(actual, expected, 'should call all vcs methods with correct arguments');
    test.done();
  },
  suffixTagWithTimestamp: function(test) {
    test.expect(2);
    var actual = processJSON(fs.readFileSync('test/tmp/suffixTagWithTimestamp-endpoint.json', 'utf8'));
    test.equal(actual.called.tag.times, 1);
    var hasSuffixPattern = /^1\.0\.0\+[0-9]+$/;
    test.ok(hasSuffixPattern.test(actual.called.tag.with['0']),
        'should suffix a tag with a timestamp prefix, but the tag was [' + actual.called.tag.with['0'] + ']');
    test.done();
  }
};
