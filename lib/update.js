'use strict';

const rmdir = require('rmdir');
const fs = require('fs');
const fse = require('fs-extra');
const childProcess = require('child_process');
const spawn = childProcess.spawn;

module.exports = (options, onFinished) => {
  setTimeout(() => {
    const filter = name => name.indexOf('updater-') < 0;

    fse.copy(options.source, options.target, {filter, clobber: true}, err => {
      if (err) {
        onFinished(err);
        return;
      }

      spawn(
        options.toRun,
        [],
        {
          stdio: 'ignore',
          detached: true
        }
      ).unref();

      fs.writeFile('./update-required', '1', writeFlagFileErr => {
        onFinished(writeFlagFileErr);
      });
    });
  }, 2000);
};
