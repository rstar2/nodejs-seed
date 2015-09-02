// Example model

var mongoose = require('mongoose');

var ArticleSchema = new mongoose.Schema({
  title: String,
  url: String,
  text: String
});

ArticleSchema.virtual('date').get(function () {
  return this._id.getTimestamp();
});

var ArticleModel = mongoose.model('Article', ArticleSchema);

module.exports = ArticleModel;

