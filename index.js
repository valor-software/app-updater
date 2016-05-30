'use strict';

const request = require('request');
const semver = require('semver');
const fs = require('fs');
const download = require('download-file');
const path = require('path');

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

  downloadUpdate(inp, onDownloadCompleted) {

    const options = {
      newVersion: inp[0],
      platform: inp[1],
      zipHost: inp[2],
      zipPostfix: inp[3],
      jsonHost: inp[4],
      zipFilePattern: inp[5],
      directoryPattern: inp[6],
      cacheDir: inp[7]
    };

    var noAsarTmp = process.noAsar;
    process.noAsar = true;

    const zipFileName = options.zipFilePattern
      .replace('#platform', options.platform);
    const host = options.zipHost
      .replace('#version', options.newVersion);
    const url = host + '/' + zipFileName + options.zipPostfix;

    console.log('#start-download@ok');

    download(
      url,
      {
        directory: options.cacheDir,
        filename: zipFileName
      },
      err => {
        if (err) {
          console.log('#finish-download@fail');
          onDownloadCompleted(err);
          return;
        }

        console.log('#finish-download@ok');

        const unzip = require('unzip');
        const unzipExtractor = unzip.Extract({path: options.cacheDir});
        unzipExtractor.on('error', err => {
          console.log('#unpack@fail');
          onDownloadCompleted(err);
        });
        unzipExtractor.on('close', () => {
          console.log('#unpack@ok');

          process.noAsar = noAsarTmp;
          onDownloadCompleted();
        });

        fs.createReadStream(path.resolve(options.cacheDir, zipFileName)).pipe(unzipExtractor);
      });
  }
}

module.exports = Checker;
