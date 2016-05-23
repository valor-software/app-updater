'use strict';
const fs = require('fs');
const download = require('download-file');
const path = require('path');
const unzip = require('unzip');

const options = {
  url: 'http://127.0.0.1:8080',
  zipFilePattern: 'GapminderOffline-linux-#version.zip',
  cacheDir: './cache'
};

function downloadUpdate(newVersion, onDownloadCompleted) {
  const zipFileName = options.zipFilePattern.replace('#version', newVersion);

  download(
    options.url + '/' + zipFileName,
    {
      directory: options.cacheDir,
      filename: zipFileName
    },
    err => {
      if (err) {
        onDownloadCompleted(err);
        return;
      }

      const unzipExtractor = unzip.Extract({path: options.cacheDir});

      fs.createReadStream(path.resolve(options.cacheDir, zipFileName)).pipe(unzipExtractor);

      unzipExtractor.on('error', err => {
        onDownloadCompleted(err);
      });
      unzipExtractor.on('close', () => {
        onDownloadCompleted();
      });
    });
}

const newVersion = process.argv[2];

downloadUpdate(newVersion, err => {
  process.exit(err ? -1 : 0);
});
