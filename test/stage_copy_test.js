'use strict';

var grunt = require('grunt');

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

exports.bowerRelease = {
  develFilesOk: [
  ],
  setUp: function(done) {
    // setup here if necessary
    done();
  },
  tearDown: function(done) {
    // setup here if necessary
    done();
  },
  stableFiles: function(test) {
    test.expect(11);
    var stableFilesOk = [
      './test/tmp/staging-stable/css/a/a-1.css',
      './test/tmp/staging-stable/css/a/a-2.css',
      './test/tmp/staging-stable/css/b/b.css',
      './test/tmp/staging-stable/bower.json',
      './test/tmp/staging-stable/library.js',
      './test/tmp/staging-stable/library.min.js'
    ], stableFilesNotOk = [
      './test/tmp/staging-stable/css/a/a-1.less',
      './test/tmp/staging-stable/css/a/a-2.less',
      './test/tmp/staging-stable/css/b/b.less',
      './test/tmp/staging-stable/jquery.js',
      './test/tmp/staging-stable/jquery.min.js'
    ], i;
    for(i = 0; i < stableFilesOk.length; i++) {
      test.ok(grunt.file.isFile(stableFilesOk[i]), 'File should have been copied.');
    }
    for(i = 0; i < stableFilesNotOk.length; i++) {
      test.ok(!grunt.file.isFile(stableFilesNotOk[i]), 'File should not have been copied.');
    }
    test.done();
  },
  develFiles: function(test) {
    test.expect(11);
    var develFilesOk = [
      './test/tmp/staging-devel/css/a/a-1.css',
      './test/tmp/staging-devel/css/a/a-2.css',
      './test/tmp/staging-devel/css/b/b.css',
      './test/tmp/staging-devel/bower.json',
      './test/tmp/staging-devel/library.js',
      './test/tmp/staging-devel/library.min.js',
      './test/tmp/staging-devel/css/a/a-1.less',
      './test/tmp/staging-devel/css/a/a-2.less',
      './test/tmp/staging-devel/css/b/b.less',
      './test/tmp/staging-devel/jquery.js',
      './test/tmp/staging-devel/jquery.min.js'
    ];

    for(var i = 0; i < develFilesOk.length; i++) {
      test.ok(grunt.file.isFile(develFilesOk[i]), 'File should have been copied.');
    }
    test.done()
  }
};
