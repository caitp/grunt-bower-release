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

'use strict';

module.exports = function(grunt) {
  /*
   * Other VCS tools can be added here as needed in the future.
   * The following functions are required:
   *
   * setUp(this, done)                     -- Ensure that the VCS is installed on the system, and therefore usable.
   * tearDown(done)                     -- Do any cleanup necessary.
   * clone(endpoint, branchName, done)     -- Clone the repository at 'endpoint' into the current directory.
   * add(files, done)                  -- Add the array of files into the repository, relative to CWD
   * commit(message, done)             -- Commit the current changes to a changeset, with the specified message.
   * tag(tagname, done)                -- 'Tag' the release
   * push(endpoint, branchName, tag, done) -- Push the changesets to the server
   *
   * For any of these operations, returning 'false' indicates an error. Any other return value (even other
   * falsy ones) are ignored.
   */
  var endpoints = {
    git: require('./endpoints/git')(grunt),
    test: require('./endpoints/test-ep')(grunt)
  }

  grunt.registerMultiTask('bowerRelease',
    'Push bower component files to git endpoint and publish', function() {
    var fs = require('fs.extra'),
        path = require('path'),
        os = require('os'),
        startDir = process.cwd(), endpoint,
        finish = this.async(),
        options = this.options({
          'stageDir': 'staging',
          'endpointType': 'git'
        }),
        self = this,
        bowerJSON,
        bowerFile

    if(grunt.option('verbose')) {
      grunt.log.writeln("Options: ".cyan)
      Object.keys(options).forEach(function(key) {
        grunt.log.writeln('  ' + key.cyan + ': ' + options[key].yellow)
      })
    }

    /* Read Bower configuration */
    ['bower.json', 'component.json'].forEach(function (configFile) {
      if (!bowerJSON && grunt.file.isFile(configFile)) {
        bowerJSON = grunt.file.readJSON(configFile)
        bowerFile = configFile
      }
    })

    /* Fail if we don't have a bower configuration */
    if(!bowerJSON) {
      return finish(new Error('Missing \'bower.json\' or \'component.json\''))
    }

    /* 
     * TODO: Convert any such comments into jsdoc/yuidoc format, so that they can easily be transformed into markup.
     *
     * Supported properties:
     *   'files'       -- Array of objects/strings describing files meant to be added to the published commit.
     *   'endpoint'    -- String representing the git endpoint to use. (Currently only git is supported)
     *   'branchName'      -- An optional branchName name for the endpoint
     *   'packageName' -- The name of the package in the Bower repository.
     *   'stageDir'    -- Directory to build temporary git repository in (defaults to 'staging')
     */

    if(typeof options.endpoint === 'undefined')
      options.endpoint = bowerJSON.endpoint

    /* Fail if we don't have an endpoint */
    if(typeof options.endpoint === 'undefined')
      return finish(new Error('Missing required \'endpoint\' parameter'))

    bowerJSON.endpoint = options.endpoint

    /* Override package name */
    if(typeof options.packageName === 'string')
      bowerJSON.name = options.packageName

    /* Override main files */
    if(typeof options.main === 'string' || options.main instanceof Array)
      bowerJSON.main = options.main

    var dependencies = {};

    if (options.extendDependencies === true)
      dependencies = bowerJSON.dependencies || {};

    delete bowerJSON.dependencies;

    /* TODO: Support overriding dependencies by either extending, or
     * replacing the existing ones... For now just extend
     */
    if(typeof options.dependencies === 'object' || options.extendDependencies)
      bowerJSON.dependencies = grunt.util._.extend(dependencies || {}, options.dependencies || {})

    /* TODO: Support devDependency overriding? Is that really needed? */

    /* For now, 'git' is the only supported endpoint type, and we aren't doing anything
     * complicated to figure out the correct VCS or protocol. So just assume 'git'
     */
    endpoint = endpoints[options.endpointType]

    /* Make sure that the endpoint is actually usable (eg, git or mercurial or whatever is installed) */
    endpoint.setUp(this, ready)

    function ready(err) {
      if(err) return finish(err)

      /* Make stageDir absolute */
      options.stageDir = path.resolve(options.stageDir)

      /* Fail if stageDir is the current directory */
      if(options.stageDir === startDir) {
        finish(new Error('Cannot use current working directory as stageDir'))
        return false
      }

      /* Make sure stageDir either does not exist, or is a directory */
      var stat
      try {
        stat = fs.statSync(options.stageDir)
        if(stat && !stat.isDirectory()) {
          finish(new Error('stageDir is not a directory'))
          return false
        }
      } catch(e) { /* ENOENT */ }

      if(typeof stat !== 'undefined')
        fs.rmrfSync(options.stageDir)
      fs.mkdirRecursiveSync(options.stageDir)
      process.chdir(options.stageDir)
      /* Once we're in the stageDir, we can check out the existing code.
       * It doesn't matter if checkout fails, however.
       */
      endpoint.clone(options.endpoint, options.branchName, '.', cloned)
      function cloned(err) {
        /* An error may have happened, but isn't really consequential.
         * Now, copy in each of the files that we care about.
         */
        process.chdir(startDir)
        var files = [];
        /* bower.json / component.json needs to be copied specially, because
         * some fields in it may be overridden
         */
        files.push(bowerFile)
        grunt.file.write(options.stageDir + '/' + bowerFile,
          JSON.stringify(bowerJSON, null, 2))
        copyBuildFilesToStage()
      }

      function copyBuildFilesToStage(){
        grunt.util.async.map(self.files, function(item, next) {
          grunt.util.async.map(item.src, copyItemSrcsToDest(item), function(err, results) {
            next(err, results)
          })

        }, copiedFiles)
      }

      function copyItemSrcsToDest(item) {
        return function copySrcToDest (src, next) {
          var dest
          if(typeof item.orig.dest === 'undefined')
            dest = getExpandedStageDest(item)
          else if(detectDestType(item.orig.dest) === 'directory')
            dest = getUserDefinedDestDir(item)
          else
            dest = getUserDefinedDestFile(item)

          if(grunt.file.isDir(src)) {
            grunt.verbose.writeln('Creating ' + dest.cyan)
            grunt.file.mkdir(dest)
            next()
          } else {
            grunt.verbose.writeln('Copying ' + src.cyan + ' -> ' + dest.cyan)
            grunt.file.copy(src, dest)
            next(null, dest)
          }

        }
      }

      function getExpandedStageDest (item) {
        var stageFile = grunt.file.expandMapping([item.dest], options.stageDir, {
          cwd: item.orig.cwd || startDir
        })
        return stageFile[0].dest
      }

      function getUserDefinedDestFile(item){
        return item.dest
      }

      function getUserDefinedDestDir(item, src){
        var isExpandedPair = item.orig.expand || false
        return (isExpandedPair) ? item.dest : unixifyPath(path.join(item.dest, src))
      }

      function detectDestType(dest) {
        if(grunt.util._.endsWith(dest, '/'))
          return 'directory'
        return 'file'
      }
      function unixifyPath(filepath) {
        if(process.platform === 'win32')
          return filepath.replace(/\\/g, '/')
        return filepath
      }

      function copiedFiles(err, results) {
        var files = []
        results.forEach(function(item) {
          if(item instanceof Array)
            item.forEach(function(item) { files.push(item) })
          else if(typeof item === 'string')
            files.push(item)
        })
        /* After copying files in, it is necessary to add them to the repository.
         * The VCS plugin is not responsible for comprehension of the grunt file
         * objects, and so we can do that here.
         */
        process.chdir(options.stageDir)
        endpoint.add(files, addedFiles)
      }

      function addedFiles(err) {
        /* Files have been added to the repository (assuming this didn't fail)
         * At this point, commit and tag the changeset
         */
        var msg = grunt.option('m') || grunt.option('message')
        if(typeof msg !== 'string' || !msg.length)
          msg = 'Bumped version to ' + bowerJSON.version
        endpoint.commit(msg, function(err) {
          /* Tag name must be valid semver -- but I'm not validating this here. */
          /* TODO: Validate this here! */
          endpoint.tag(bowerJSON.version, makeTagMsg(options.packageName), tagged)
        })
      }

      function tagged(err) {
        /* After commiting/tagging the release, push to the server */
        endpoint.push(options.branchName, bowerJSON.version, pushed)
      }

      function pushed(err) {
        /* Once we've made it this far, we're pretty much finished... */
        process.chdir(startDir)

        /* TODO:
         * Should we check if a package is registered, and register it if not?
         * I sort of feel like this should remain the responsibility of the
         * user, just to be safe.
         */

        /* If we're debugging, don't delete the stage directory,
         * we might want to see the contents
         */
        if(!grunt.option('debug'))
          fs.rmrfSync(options.stageDir)
        endpoint.tearDown(function(err){
          if(err)
            finish(err);
          finish();
        });
      }

      function makeTagMsg(name) {
        return name + '@' + bowerJSON.version
      }
    }
 })
}

