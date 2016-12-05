'use strict';

const mkpath = require('mkpath');
const path = require('path');
const fs = require('fs');
const http = require('http');
const TIMEOUT = 20000;

module.exports = (options, onProgress, onDownloadCompleted) => {
  mkpath(options.path, pathErr => {
    if (pathErr) {
      onDownloadCompleted(pathErr);
      return;
    }

    const file = fs.createWriteStream(path.resolve(options.path, options.file));
    const timeoutWrapper = req => () => {
      req.abort();
      onDownloadCompleted('File transfer timeout!');
    };

    const request = http.get(options.url)
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
            onDownloadCompleted(err.message);
          });
      });

    const timeoutAction = timeoutWrapper(request);

    let timeoutId = setTimeout(timeoutAction, TIMEOUT);
  });
};
