'use strict';

const fs = require('fs');

module.exports = message => {
  const date = new Date().toISOString();

  fs.appendFileSync('./auto-update-err.log', `${date}: ${message}\n`);
};
