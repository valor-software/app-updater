'use strict';

const fs = require('fs');
const fse = require('fs-extra');

module.exports = (options, onFinished) => {
  setTimeout(() => {
    const filter = name => name.indexOf('updater-') < 0;

    fse.copy(options.source, options.target, {filter, clobber: true}, err => {
      if (err) {
        onFinished(err);
        return;
      }

      fs.writeFile('./update-required', '1', writeFlagFileErr => {
        onFinished(writeFlagFileErr);
      });
    });
  }, 2000);
};
