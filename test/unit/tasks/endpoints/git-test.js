'use strict';

var grunt = {
  option: function() {},
  util: {
    spawn: function() {}
  },
  verbose: {
    writeln: function() {}
  }
};

var done = function() {};

var sinon = require('sinon');

exports['should call remove tag when removing version tags'] = function(test) {
  test.expect(1);

  var async = {
    eachSeries: function() {}
  };

  var tags = ['1.0.0-SNAPSHOT+1', '1.0.0-SNAPSHOT+2'];

  var asyncMock = sinon.mock(async);

  var testee = require('../../../../tasks/endpoints/git.js')(grunt, async);
  asyncMock.expects('eachSeries').withExactArgs(tags, testee.removeLocalTag, done).once();
  testee.removeVersionTags(tags, done);

  test.doesNotThrow(function () {
    asyncMock.verify();
  });

  test.done();
};

exports['should remove local git tag'] = function(test) {
  test.expect(1);

  var tag = '1.0.0-SNAPSHOT+1';

  var gruntMock = sinon.mock(grunt.util);
  gruntMock.expects('spawn').withExactArgs({
    cmd: 'git',
    args: ['tag', '-d', tag],
    opts: { stdio: [undefined, undefined, undefined] }
  }, sinon.match.func).once();

  var testee = require('../../../../tasks/endpoints/git.js')(grunt);
  testee.removeLocalTag(tag, done);

  test.doesNotThrow(function() {
    gruntMock.verify();
  });

  test.done();
};

exports['should remove remote git tag'] = function(test) {
  test.expect(1);

  var tag = '1.0.0-SNAPSHOT+1';

  var gruntMock = sinon.mock(grunt.util);

  gruntMock.expects('spawn').withExactArgs({
    cmd: 'git',
    args: ['push', 'origin', ':refs/tags/' + tag],
    opts: { stdio: [undefined, undefined, undefined]}
  }, done).once();

  var testee = require('../../../../tasks/endpoints/git.js')(grunt);
  testee.removeRemoteTag(tag, done);

  test.doesNotThrow(function () {
    gruntMock.verify();
  });

  test.done();
};
