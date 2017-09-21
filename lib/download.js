'use strict';

const path = require('path');
const fs = require('fs');
const http = require('follow-redirects').http;
const https = require('follow-redirects').https;
const log = require('./log');
const TIMEOUT = 120000;

module.exports = (options, onProgress, onDownloadCompleted) => {
  const mode = parseInt('0777', 8) & (~process.umask());
  const optionsToOut = JSON.stringify(options, null, 2);

  fs.mkdir(options.path, mode, pathErr => {
    if (pathErr) {
      log(`download::mkdir ${pathErr} ${optionsToOut}`);

      onDownloadCompleted(pathErr);
      return;
    }

    const file = fs.createWriteStream(options.path + path.sep + options.file);
    const timeoutWrapper = req => () => {
      log(`download::timeout ${optionsToOut}`);
      req.abort();
      onDownloadCompleted('File transfer timeout!');
    };

    const relatedLib = options.url.indexOf('https://') === 0 ? https : http;
    const request = relatedLib.get(options.url)
      .on('response', res => {
        const len = parseInt(res.headers['content-length'], 10);

        let downloaded = 0;
        let progress = 0;
        let prevProgress = 0;

        res
          .on('data', chunk => {
            file.write(chunk);
            downloaded += chunk.length;

            progress = (100.0 * downloaded / len).toFixed(0);

            if (progress !== prevProgress) {
              onProgress(progress)
            }

            prevProgress = progress;

            clearTimeout(timeoutId);
            timeoutId = setTimeout(timeoutAction, TIMEOUT);
          })
          .on('end', () => {
            clearTimeout(timeoutId);
            file.end();

            onDownloadCompleted();
          })
          .on('error', err => {
            clearTimeout(timeoutId);

            log(`download::error ${err.message} ${optionsToOut}`);

            onDownloadCompleted(err.message);
          });
      });

    const timeoutAction = timeoutWrapper(request);

    let timeoutId = setTimeout(timeoutAction, TIMEOUT);
  });
};
