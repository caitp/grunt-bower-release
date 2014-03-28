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

module.exports = function(grunt) {
  /* Verbosity */
  var streams = [undefined, undefined, undefined],
    parent = {},
    fs = require('fs.extra');
  if(grunt.option('verbose')) {
    streams[1] = process.stdout
    streams[2] = process.stderr
  }

  var endPoint = {
    /* Ensure that the VCS is installed on the system, and therefore usable. */
    setUp: function(parentArg, done) {
      parent = parentArg;
      endPoint.called.call('setUp', arguments);
      done()
    },

    tearDown: function (done) {
      endPoint.called.call('tearDown', arguments);

      grunt.file.write('../tmp/'+parent.target+'-endpoint.json',
          JSON.stringify(endPoint, null, 2))
      done()
    },

    /* Clone the repository at 'endpoint' into the current directory */
    clone: function(endpoint, branch, dir, done) {
      endPoint.called.call('clone', arguments);
      done();
    },

    /* Add the array of files into the repository, relative to the CWD */
    add: function(files, done) {
      endPoint.called.call('add', arguments);
      done();
    },

    /* Commit the current changes to a changeset, with the specified message. */
    commit: function(message, done) {
      endPoint.called.call('commit', arguments);
      done()
    },

    /* 'Tag' the release */
    tag: function(tagname, msg, done) {
      endPoint.called.call('tag', arguments);
      done()
    },

    /* Push the changesets to the server */
    push: function(branch, tag, done) {
      endPoint.called.call('push', arguments);
      done()
    },
    called: {
      call: function(method, args) {
        if(typeof endPoint.called[method] === 'undefined'){
          endPoint.called[method] = {
            times: 1,
            with: args
          }
        } else {
          endPoint.called[method].times++;
          endPoint.called[method].with = args;
        }

      }
    }
  }

  return endPoint;
}

