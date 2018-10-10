'use strict';

const request = require('request');
const semver = require('semver');

module.exports = (options, onVersionDetected) => {
  request({
    url: options.url, json: true
  }, (error, response, body) => {
    if (error || response.statusCode !== 200) {
      onVersionDetected(error || response.statusCode);
      return;
    }

    let version = body.version;

    if (body.modern && body.modern.version) {
      version = body.modern.version;
    }

    if (body.modern3 && body.modern3.version) {
       version = body.modern3.version;
    }

    const greaterThanCurrent = () => semver.gt(version, options.version);
    const diff = () => semver.diff(version, options.version);


    onVersionDetected(null, version && greaterThanCurrent() ? version : null, diff());
  });
};
