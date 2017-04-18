'use strict';

const request = require('request');
const semver = require('semver');

module.exports = (options, onVersionDetected) => {
  request({
    url: options.url, json: true
  }, (error, response, body) => {
    const hasVersion = () => body && body.modern && body.modern.version;
    const greaterThanCurrent = () => semver.gt(body.modern.version, options.version);
    const diff = () => semver.diff(body.modern.version, options.version);

    if (error || response.statusCode !== 200) {
      onVersionDetected(error || response.statusCode);
      return;
    }

    onVersionDetected(null, hasVersion() && greaterThanCurrent() ? body.modern.version : null, diff());
  });
};
