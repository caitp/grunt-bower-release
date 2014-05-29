'use strict';

module.exports = function (grunt) {
  var async = require('async');

  return {
    'grunt': ['value', grunt],
    'async': ['value', async]
  };
}
