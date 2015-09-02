var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var AccountSchema = new mongoose.Schema({
  local: {
    email: String,
    password: String
  },
  facebook: {
    id: String,
    token: String,
    email: String,
    name: String
  },
  google: {
    id: String,
    token: String,
    email: String,
    name: String
  }
});

// generating a hash (this will be saved later as this.local.password)
AccountSchema.methods.generateHash = function (password) {
  //return password;
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
};

// checking if password is valid
AccountSchema.methods.validPassword = function (password) {
  //return password = this.local.password;
  return bcrypt.compareSync(password, this.local.password);
};

var AccountModel = mongoose.model('Account', AccountSchema);

module.exports = AccountModel;
