'use strict';

const path = require('path');
const log = require('./log');
const extract = require('extract-zip');
const DecompressZip = require('decompress-zip');
const os = require('os');
const isWin = /^win32/.test(os.platform());

const win = (options, onProgress, onUnpacked) => {
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

const nix = (options, onProgress, onUnpacked) => {
  const fullPath = options.directory + path.sep + options.file;

  extract(fullPath, {dir: path.resolve(options.directory)}, function (err) {
    if (err) {
      log(`unpack::error ${fullPath} ${err.message}`);
    }

    onProgress(100);
    onUnpacked(err);
  });
};


module.exports = isWin ? win : nix;
