'use strict';
const fs = require('fs');
const download = require('download-file');
const path = require('path');

function downloadUpdate(onDownloadCompleted) {
  const zipFileName = options.zipFilePattern
    .replace('#version', options.newVersion)
    .replace('#platform', options.platform);
  const url = options.url + '/' + zipFileName;

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
  url: process.argv[4],
  zipFilePattern: process.argv[5],
  directoryPattern: process.argv[6],
  cacheDir: process.argv[7]
};


downloadUpdate(err => {
  process.exit(err ? -1 : 0);
});
