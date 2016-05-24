'use strict';
const fs = require('fs');
const download = require('download-file');
const path = require('path');
const AdmZip = require('adm-zip');
const request = require('request');
const DecompressZip = require('decompress-zip');

const options = {
  url: 'http://192.168.1.71:8080',
  zipFilePattern: 'GapminderOffline-darwin-#version.zip',
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
  const url = options.url + '/' + zipFileName;

  console.log(`<div>Starting download from ${url}. This operation will take some time. Wait please...</div>`);


  /*const out = fs.createWriteStream(options.cacheDir + '/' + zipFileName);
  const req = request({
    method: 'GET',
    uri: url
  });
  
  req.pipe(out);
  req.on('end', () => {
      console.log(`<div>Download was finished</div>`);
      console.log('<div>Starting unpack process. This operation will take some time. Wait please...</div>');

      const unzipper = new DecompressZip(path.resolve(options.cacheDir, zipFileName));
      
      unzipper.on('error', err => {
        console.log(`<div>Download failed from ${err}</div>`);
        onDownloadCompleted(err);            
      });      
      
      unzipper.on('extract', () => {
        console.log('<div>Update was unpacked.</div>');

        fs.chmodSync(path.resolve(options.cacheDir, 'Gapminder Offline-darwin-x64', 'updater'), '777');
        fs.chmodSync(path.resolve(options.cacheDir, 'Gapminder Offline-darwin-x64', 'run'), '777');

        console.log('<div>Now program will be restarted.</div>');

        onDownloadCompleted();        
      });
      
      unzipper.extract({path: options.cacheDir});
  });*/


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

        fs.chmodSync(path.resolve(options.cacheDir, 'Gapminder Offline-darwin-x64', 'updater'), '777');
        fs.chmodSync(path.resolve(options.cacheDir, 'Gapminder Offline-darwin-x64', 'run'), '777');

        console.log('<div>Now program will be restarted.</div>');

  
      onDownloadCompleted();
    });
    
    unzipper.extract({path: options.cacheDir});
    
    
  });

  /*download(
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

      const zip = new AdmZip(path.resolve(options.cacheDir, zipFileName));
      zip.extractAllTo(options.cacheDir);

      console.log('<div>Update was unpacked.</div>');

      fs.chmodSync(path.resolve(options.cacheDir, 'Gapminder Offline-darwin-x64', 'updater'), '777');
      fs.chmodSync(path.resolve(options.cacheDir, 'Gapminder Offline-darwin-x64', 'run'), '777');

      console.log('<div>Now program will be restarted.</div>');

      onDownloadCompleted();
    });*/
}

const newVersion = process.argv[2];

downloadUpdate(newVersion, err => {
  process.exit(err ? -1 : 0);
});
