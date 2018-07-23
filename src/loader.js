'use strict';

var isGlob = require('is-glob');
var unique = require('array-unique');
var loaderUtils =  require('loader-utils');

function gitignore(source, options) {
  var str = source;
  var lines = str.split(/\r\n|\n/);
  var arr = unique(gitignore.parse(lines, options));
  return arr;
}

gitignore.parse = function parse(arr, opts) {
  arr = arrayify(arr);
  var len = arr.length, i = -1;
  var res = [];

  while (++i < len) {
    var str = arr[i];
    str = (str || '').trim();

    if (!str || str.charAt(0) === '#') {
      continue;
    }

    var parsed = gitignore.toGlob(str);
    addPattern(res, parsed.patterns, parsed.stats, opts);
  }
  return res;
};

gitignore.toGlob = function toGlob(str) {
  var parsed = {}, stats = {};

  stats.first = str.charAt(0);
  stats.last = str.slice(-1);

  stats.isNegated = stats.first === '!';
  stats.isGlob = isGlob(str);

  if (stats.isNegated) {
    str = str.slice(1);
    stats.first = str.charAt(0);
  }

  if (!/^[\*\.\\]*\//.test(str) && !/\*$/.test(str)) {
    str = '**/' + str;
  }

  if (stats.first === '/') {
    str = str.slice(1);
  }

  if (/\w\/[*]{2}\/\w/.test(str)) {
    str += '|' + str.split('/**/').join('/');
  }

  if (/^(\*\*\/)?[\w.]/.test(str) && /\w$/.test(str) && !stats.isGlob) {
    str += '|' + str + '/**';

  } else if (/\/$/.test(str)) {
    str += '**';
  }

  parsed.stats = stats;
  parsed.patterns = str.split('|');
  return parsed;
};

function addPattern(res, arr, stats, options) {
  arr = arrayify(arr);
  var len = arr.length, i = -1;
  while (++i < len) {
    var str = arr[i];
    if (stats.isNegated) {
      str = '!' + str;
    }
    if (options.invert) {
      str = invert(str);
    }
    if (res.indexOf(str) === -1) {
      res.push(str);
    }
  }
  return res;
}

function invert(str) {
  if (str.charAt(0) === '!') {
    return str.slice(1);
  }
  return '!' + str;
}

function arrayify(val) {
  return Array.isArray(val) ? val : [val];
}

module.exports = function (source) {
    if (this.cachable) {
        this.cachable();
    }

    const options = loaderUtils.getOptions(this);

    const parsed = gitignore(source, options);

    return 'module.exports = ' + JSON.stringify(parsed) + ';';
}