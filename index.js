'use strict';

const request = require('request');
const semver = require('semver');

class Checker {
  constructor(options) {
    this.options = options;
  }

  checkVersion(onVersionDetected) {
    request({
      url: this.options.url + '/' + this.options.versionJsonFile,
      json: true
    }, (error, response, body) => {
      const hasVersion = () => body && body.version;
      const greaterThanCurrent = () => semver.gt(body.version, this.options.version);

      if (error || response.statusCode !== 200) {
        onVersionDetected(error || response.statusCode);
        return;
      }

      onVersionDetected(null, hasVersion() && greaterThanCurrent() ? body.version : null);
    });
  }

}

module.exports = Checker;
