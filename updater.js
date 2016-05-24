'use strict';
const fs = require('fs');
const download = require('download-file');
const path = require('path');
const DecompressZip = require('decompress-zip');

function deleteFolderRecursive(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file) {
      var curPath = path + '/' + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

function downloadUpdate(onDownloadCompleted) {
  const zipFileName = options.zipFilePattern
    .replace('#version', options.newVersion)
    .replace('#platform', options.platform);
  const url = options.url + '/' + zipFileName;

  console.log(`<div>Starting download from ${url}. This operation will take some time. Wait please...</div>`);

  download(
    url,
    {
      directory: options.cacheDir,
      filename: zipFileName
    },
    err => {
      if (err) {
        console.log(`<div>Download failed from ${err}</div>`);
        onDownloadCompleted(err);
        return;
      }

      console.log(`<div>Download was finished</div>`);
      console.log('<div>Starting unpack process. This operation will take some time. Wait please...</div>');

      const unzipper = new DecompressZip(path.resolve(options.cacheDir, zipFileName));

      unzipper.on('error', err => {
        console.log(`<div>Download failed from ${err}</div>`);
        onDownloadCompleted(err);
      });

      unzipper.on('extract', () => {
        console.log('<div>Update was unpacked.</div>');

        const expectedDirectory = options.directoryPattern.replace('#platform', options.platform);

        if (options.platform === 'linux') {
          fs.chmodSync(path.resolve(options.cacheDir, expectedDirectory, 'Gapminder Offline'), '777');
          fs.chmodSync(path.resolve(options.cacheDir, expectedDirectory, 'libnode.so'), '777');
        }

        if (options.platform === 'linux' || options.platform === 'darwin') {
          fs.chmodSync(path.resolve(options.cacheDir, expectedDirectory, 'updater'), '777');
          fs.chmodSync(path.resolve(options.cacheDir, expectedDirectory, 'run'), '777');
        }

        console.log('<div>Now program will be restarted.</div>');


        onDownloadCompleted();
      });

      unzipper.extract({path: options.cacheDir});
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
