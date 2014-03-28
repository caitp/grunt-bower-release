'use strict';

var grunt = require('grunt');
var path = require('path');

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

var projectRoot = path.resolve(__dirname, '..');

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
    // setup here if necessary
    done();
  },
  stable: function(test) {
    test.expect(1);
    var actual = processJSON(grunt.file.read('test/tmp/stable-endpoint.json'));
    var expected = processJSON(grunt.file.read('test/expected/stable-endpoint.json'));
    test.deepEqual(actual, expected, 'should call all vcs methods with correct arguments');
    test.done();
  },
  devel: function(test) {
    test.expect(1);
    var actual = processJSON(grunt.file.read('test/tmp/devel-endpoint.json'));
    var expected = processJSON(grunt.file.read('test/expected/devel-endpoint.json'));
    test.deepEqual(actual, expected, 'should call all vcs methods with correct arguments');
    test.done();
  }
};
