const mongoose = require('mongoose');

const User = new mongoose.Schema({
  fullName: {
    type: String,
    allowNull: false,
  },
  email: {
    type: String,
    allowNull: false,
  },
  password: {
    type: String,
    allowNull: false,
  },
  phoneNo: {
    type: String,
    allowNull: false
  },
  address: {
    type: String,
    allowNull: false
  },
  access: {
    type: Boolean,
    allowNull: false
  },
  role: {
    type: Number,
    allowNull: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('users', User, "users");