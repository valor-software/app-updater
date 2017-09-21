'use strict';

const path = require('path');
const DecompressZip = require('decompress-zip');
const log = require('./log');

module.exports = (options, onProgress, onUnpacked) => {
  const fullPath = options.directory + path.sep + options.file;
  const unzipper = new DecompressZip(fullPath);

  let progress = 0;
  let prevProgress = 0;

  unzipper.on('error', err => {
    log(`${fullPath} ${err.message}`);

    onUnpacked(err);
  });
  unzipper.on('extract', () => onUnpacked());
  unzipper.on('progress', (fileIndex, fileCount) => {
    progress = (100.0 * fileIndex / fileCount).toFixed(0);

    if (progress !== prevProgress) {
      onProgress(progress);
    }

    prevProgress = progress;
  });

  unzipper.extract({
    path: options.directory,
    follow: true
  });
};
