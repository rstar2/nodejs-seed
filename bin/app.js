var _ = require('lodash');
var express = require('express');
var config = require('./../config/config');

// configure the model settings
require('./../config/model')(config);

// configure the express app settings
var app = express();
require('./../config/express')(app, config);

// create a normal HTTP server
var http = require('http');
http.createServer(app).
  on('error', onError.bind(this, config.port)).
  listen(config.port, function () {
    console.log('Express HTTP server listening on port ' + config.port);
  });


// create additional HTTPS server
if (_.isNumber(config.portSecure)) {
  var fs = require('fs');
  var https = require('https');

  var httpsOptions = {
    key: fs.readFileSync(config.root + '/private.key'),
    cert: fs.readFileSync(config.root + '/certificate.pem')
  };
  https.createServer(httpsOptions, app).
    on('error', onError.bind(this, config.portSecure)).
    listen(config.portSecure, function () {
    console.log('Express HTTPS server listening on port ' + config.portSecure);
  });


  // Secure traffic only if desired
  if (config.httpRedirectToHttps) {
    app.all('*', function (req, res, next) {
      if (req.secure) {
        return next();
      }
      res.redirect('https://' + req.hostname + ':' + config.portSecure + req.url);
    });
  }
}

// Event listener for HTTP server "error" event.
function onError(port, error) {
  if (error.syscall !== 'listen') {
    throw error;
  }
  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(port + ' requires elevated privileges');
      process.exit(1);
      break;

    case 'EADDRINUSE':
      console.error(port + ' is already in use');
      process.exit(1);
      break;

    default:
      throw error;
  }
}

