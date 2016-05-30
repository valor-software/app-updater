'use strict';
const fs = require('fs');
const download = require('download-file');
const path = require('path');

function downloadUpdate(onDownloadCompleted) {
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

        onDownloadCompleted();
      });

      fs.createReadStream(path.resolve(options.cacheDir, zipFileName)).pipe(unzipExtractor);
    });
}

const options = {
  newVersion: process.argv[2],
  platform: process.argv[3],
  zipHost: process.argv[4],
  zipPostfix: process.argv[5],
  jsonHost: process.argv[6],
  zipFilePattern: process.argv[7],
  directoryPattern: process.argv[8],
  cacheDir: process.argv[9]
};


downloadUpdate(err => {
  process.exit(err ? -1 : 0);
});
