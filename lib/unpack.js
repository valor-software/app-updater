'use strict';

const DecompressZip = require('decompress-zip');

module.exports = (options, onProgress, onUnpacked) => {
  const unzipper = new DecompressZip(options.source);

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
    path: options.target,
    // return file.type !== "SymbolicLink";
    filter: file => true
  });
};
