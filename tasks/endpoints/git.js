/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2013 Caitlin Potter and Contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

function Git(grunt, async) {
  /* Verbosity */
  var streams = [undefined, undefined, undefined]
  if(grunt.option('verbose')) {
    streams[1] = process.stdout
    streams[2] = process.stderr
  }
  var gitEndpoint = {
    /* Ensure that the VCS is installed on the system, and therefore usable. */
    setUp: function(parentArg, done) {
      grunt.util.spawn({
        cmd: 'git',
        args: ['version'],
        opts: {
          /* Don't spam */
          stdio: 'ignore'
        }
      }, done)
    },

    tearDown: function(done) {
      done();
    },

    /* Clone the repository at 'endpoint' into the current directory */
    clone: function(endpoint, branch, dir, done) {
      if(typeof dir === 'function') {
        done = dir
        dir = '.'
      }
      var args = ['clone', endpoint, dir]
      if(typeof branch === 'string') {
        args.push('-b')
        args.push(branch)
      }
      grunt.verbose.writeln('git ' + args.join(' '))
      grunt.util.spawn({
        cmd: 'git',
        args: args,
        opts: { stdio: streams }
      }, function(err) {
        if(err || typeof branch !== 'string') return done(err)
        else {
          args = ['checkout', '-B', branch]
          grunt.verbose.writeln('git ' + args.join(' '))
          grunt.util.spawn({
            cmd: 'git',
            args: args
          }, done)
        }
      })
    },

    /* Add the array of files into the repository, relative to the CWD */
    add: function(files, done) {
      async.eachSeries(files, function(file, done) {
        //Double check for avoiding failing on undefined files in array
        if (!file) return done()
        var args = ['add', file]
        grunt.verbose.writeln('git ' + args.join(' '))
        grunt.util.spawn({
          cmd: 'git',
          args: args,
          opts: { stdio: streams }
        }, done)
      }, done);
    },

    /* Commit the current changes to a changeset, with the specified message. */
    commit: function(message, done) {
      var args = [ 'commit', '-m', message]
      grunt.verbose.writeln('git ' + args.join(' '))
      grunt.util.spawn({
        cmd: 'git',
        args: args,
        opts: { stdio: streams }
      }, done)
    },

    removeVersionTags: function(tags, done) {
      grunt.verbose.writeln('remove version tags: ' + tags);
      async.eachSeries(tags, gitEndpoint.removeLocalTag, done);
    },

    getVersionTags: function(version, done) {
      grunt.verbose.writeln('git tag');

      grunt.util.spawn({
        cmd: 'git',
        args: ['tag']
      }, function(error, result) {
        var tags = result.stdout.split(/\n/);
        done(tags.filter(function(tag) {
          return tag.indexOf(version) === 0;
        }));
      });
    },

    removeLocalTag: function(tag, done) {
      var args = ['tag', '-d', tag];
      grunt.verbose.writeln('git ' + args.join(' '));
      grunt.util.spawn({
        cmd: 'git',
        args: args,
        opts: { stdio: streams }
      }, function () {
        gitEndpoint.removeRemoteTag(tag, done);
      });
    },

    removeRemoteTag: function(tag, done) {
      var args = ['push', 'origin', ':refs/tags/' + tag];
      grunt.verbose.writeln('git ' + args.join(' '));
      grunt.util.spawn({
        cmd: 'git',
        args: args,
        opts: { stdio: streams }
      }, done);
    },

    /* 'Tag' the release */
    tag: function(tagname, msg, done) {
      var args = ['tag', tagname]
      if(typeof msg === 'string') {
        args.push('-m')
        args.push(msg)
      } else if(typeof msg === 'function') {
        done = msg
      }
      grunt.verbose.writeln('git ' + args.join(' '))
      grunt.util.spawn({
        cmd: 'git',
        args: args,
        opts: { stdio: streams }
      }, done)
    },

    /* Push the changesets to the server */
    push: function(branch, tag, done) {
      var args = []
      args.push('push')
      args.push('origin')
      if(typeof branch === 'string')
        args.push(branch)
      args.push(tag)
      grunt.verbose.writeln('git ' + args.join(' '))
      grunt.util.spawn({
        cmd: 'git',
        args: args,
        opts: { stdio: streams }
      }, done)
    }
  };

  return gitEndpoint;
}

Git.$inject = ['grunt', 'async'];

module.exports = Git;
