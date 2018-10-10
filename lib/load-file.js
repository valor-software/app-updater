'use strict';

const request = require('request');

module.exports = (options, onFileLoaded) => {
    request({
        url: options.url, json: true
    }, (error, response, body) => {
        if (error || response.statusCode !== 200) {
            onFileLoaded(error || response.statusCode);
            return;
        }

        onFileLoaded(null, body);
    });
};
