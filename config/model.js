var mongoose = require('mongoose');
var glob = require('glob');

module.exports = function (config) {
  // configure the MongoDB connection and the Mongoose layer
  mongoose.connect(config.db);
  var db = mongoose.connection;
  db.on('error', function () {
    throw new Error('unable to connect to database at ' + config.db);
  });

// configure all models used by mongoose
  var models = glob.sync(config.root + '/app/models/*.js');
  models.forEach(function (model) {
    require(model);
  });

};
