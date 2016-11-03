'use strict';

const rmdir = require('rmdir');
const ncp = require('ncp').ncp;
const childProcess = require('child_process');
const spawn = childProcess.spawn;

ncp.limit = 16;

module.exports = (options, onFinished) => {
  ncp(options.source, options.target, err => {
    if (err) {
      onFinished(err);
      return;
    }

    setTimeout(() => {
      spawn(
        options.toRun,
        [],
        {
          stdio: 'ignore',
          detached: true
        }
      ).unref();

      rmdir(options.toDelete, err => {
        onFinished(err);
      });
    }, 1000);
  });
};
