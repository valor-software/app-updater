'use strict';

const fs = require('fs');
const request = require('request');
const path = require('path');
const unzip = require('unzip');
const semver = require('semver');
const download = require('download-file');

class Updater {
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

  downloadUpdate(newVersion, onDownloadCompleted) {
    const zipFileName = this.options.zipFilePattern.replace('#version', newVersion);

    download(
      this.options.url + '/' + zipFileName,
      {
        directory: this.options.cacheDir,
        filename: zipFileName
      },
      err => {
        if (err) {
          onDownloadCompleted(err);
          return;
        }

        const unzipExtractor = unzip.Extract({path: this.options.cacheDir});

        fs.createReadStream(path.resolve(this.options.cacheDir, zipFileName)).pipe(unzipExtractor);

        unzipExtractor.on('error', err => {
          onDownloadCompleted(err);
        });
        unzipExtractor.on('close', () => {
          onDownloadCompleted();
        });
      });
  }
}

module.exports = Updater;
