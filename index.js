'use strict';

const fs = require('fs');
const request = require('request');
const semver = require('semver');
const download = require('download-file');
const path = require('path');
const AdmZip = require('adm-zip');

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

        const zip = new AdmZip(path.resolve(this.options.cacheDir, zipFileName));
        zip.extractAllTo(this.options.cacheDir);

        fs.chmodSync(path.resolve(options.cacheDir, 'Gapminder Offline-linux-x64', 'Gapminder Offline'), '777');
        fs.chmodSync(path.resolve(options.cacheDir, 'Gapminder Offline-linux-x64', 'libnode.so'), '777');
        fs.chmodSync(path.resolve(options.cacheDir, 'Gapminder Offline-linux-x64', 'updater'), '777');
        fs.chmodSync(path.resolve(options.cacheDir, 'Gapminder Offline-linux-x64', 'run'), '777');

        onDownloadCompleted();
      });
  }
}

module.exports = Checker;
