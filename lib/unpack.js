'use strict';

const path = require('path');
const DecompressZip = require('decompress-zip');

module.exports = (options, onProgress, onUnpacked) => {
  const unzipper = new DecompressZip(path.resolve(options.directory, options.file));

  let progress = 0;
  let prevProgress = 0;

  unzipper.on('error', err => onUnpacked(err));
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
    // return file.type !== "SymbolicLink";
    filter: file => true
  });
};
