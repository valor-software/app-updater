'use strict';

const rmdir = require('rmdir');
const fs = require('fs');
const fse = require('fs-extra');

module.exports = (options, onFinished) => {
  setTimeout(() => {
    const filter = name => name.indexOf('updater-') >= 0;

    fse.copy(options.source, options.target, {filter, clobber: true}, err => {
      if (err) {
        onFinished(err);
        return;
      }

      rmdir(options.toDelete, remDirErr => {
        fs.unlink('./update-required', remUpdateRequiredFileErr => {
          onFinished(remDirErr || remUpdateRequiredFileErr);
        });
      });
    });
  }, 2000);
};
