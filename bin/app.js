var express = require('express');
var config = require('./../config/config');

// configure the model settings
require('./../config/model')(config);

// configure the express settings
var app = express();
require('./../config/express')(app, config);

app.listen(config.port, function () {
  console.log('Express server listening on port ' + config.port);
});

