'use strict';
const fs = require('fs');
const download = require('download-file');
const path = require('path');
// const unzip = require('unzip');
const AdmZip = require('adm-zip');

const options = {
  url: 'http://127.0.0.1:8080',
  zipFilePattern: 'GapminderOffline-linux-#version.zip',
  cacheDir: './cache'
};

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


      /*const zip = new AdmZip(path.resolve(options.cacheDir, zipFileName));
       zip.extractAllTo(options.cacheDir);

       fs.chmodSync(path.resolve(options.cacheDir, 'Gapminder Offline-linux-x64', 'Gapminder Offline'), '777');*/

      //deleteFolderRecursive('./resources');

      const zip = new AdmZip(path.resolve(options.cacheDir, zipFileName));
      zip.extractAllTo(options.cacheDir);

      fs.chmodSync(path.resolve(options.cacheDir, 'Gapminder Offline-linux-x64', 'Gapminder Offline'), '777');
      fs.chmodSync(path.resolve(options.cacheDir, 'Gapminder Offline-linux-x64', 'libnode.so'), '777');
      fs.chmodSync(path.resolve(options.cacheDir, 'Gapminder Offline-linux-x64', 'updater'), '777');
      fs.chmodSync(path.resolve(options.cacheDir, 'Gapminder Offline-linux-x64', 'run'), '777');

      onDownloadCompleted();
    });
}

const newVersion = process.argv[2];

downloadUpdate(newVersion, err => {
  process.exit(err ? -1 : 0);
});
