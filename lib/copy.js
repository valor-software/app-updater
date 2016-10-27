'use strict';

const rmdir = require('rmdir');
const ncp = require('ncp').ncp;

ncp.limit = 16;

module.exports = (options, onCopied) => {
  ncp(options.source, options.target, err => {
    if (err) {
      onCopied(err);
      return;
    }

    rmdir(options.toDelete, err => {
      if (err) {
        onCopied(err);
        return;
      }

      onCopied();
    });
  });
};
