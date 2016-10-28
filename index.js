'use strict';

const versionCheck = require('./lib/version-check');
const download = require('./lib/download');
const unpack = require('./lib/unpack');
const copy = require('./lib/copy');
const mode = process.argv[2];
const processCheck = options => {
  versionCheck(options, (err, newVersion) => {
    if (err) {
      process.stdout.write(`!check@${err}\n`);
      return;
    }

    process.stdout.write(`$check@${newVersion}\n`);
  });
};
const processDownload = options => {
  download(
    options,
    progress => {
      process.stdout.write(`$download-progress@${progress}\n`);
    },
    err => {
      if (err) {
        process.stdout.write(`!download@${err}\n`);
        return;
      }

      process.stdout.write(`$download@\n`);
    });
};
const processUnpack = options => {
  unpack(options,
    progress => {
      process.stdout.write(`$unpack-progress@${progress}\n`);
    },
    err => {
      if (err) {
        process.stdout.write(`!unpack@${err}\n`);
        return;
      }

      process.stdout.write(`$unpack@\n`);
    });
};
const processCopy = options => {
  copy(options,
    err => {
      if (err) {
        process.stdout.write(`!copy@${err}\n`);
        return;
      }

      process.stdout.write(`$copy@\n`);
    });
};

if (mode === 'check') {
  const url = process.argv[3];
  const version = process.argv[4];

  processCheck({url, version});
}

if (mode === 'download') {
  const url = process.argv[3];
  const version = process.argv[4];
  const path = process.argv[5];
  const file = process.argv[6];

  if (url && version && file) {
    processDownload({url, version, path, file});
  }
}

if (mode === 'unpack') {
  const directory = process.argv[3];
  const file = process.argv[4];

  if (directory && file) {
    processUnpack({directory, file});
  }
}

if (mode === 'copy') {
  const source = process.argv[3];
  const target = process.argv[4];
  const toDelete = process.argv[5];

  if (source && target) {
    processCopy({source, target, toDelete});
  }
}
