var _ = require('lodash');
var express = require('express');
var config = require('./../config/config');

// configure the model settings
require('./../config/model')(config);

// configure the express app settings
var app = express();


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

  // Generate the private key and certificate with these commands    
  // openssl genrsa 1024 > private.key
  // openssl req -new -key private.key -out cert.csr
  // openssl x509 -req -in cert.csr -signkey private.key -out certificate.pem
  var httpsOptions = {
    key: fs.readFileSync(config.root + '/private.key'),
    cert: fs.readFileSync(config.root + '/certificate.pem')
  };
  https.createServer(httpsOptions, app).
    on('error', onError.bind(this, config.portSecure)).
    listen(config.portSecure, function () {
    console.log('Express HTTPS server listening on port ' + config.portSecure);
  });


  // Secure traffic only if desired -needs to be the first middleware
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

// configure all the express routes
require('./../config/express')(app, config);

