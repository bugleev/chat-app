const mongoose = require("mongoose");

mongoose.set("useCreateIndex", true);
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: "Please provide username",
    unique: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    required: "Please provide an email",
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  registered: {
    type: Date,
    default: Date.now
  },
  resetToken: String,
  resetTokenExpires: Date
});
module.exports = mongoose.model("User", userSchema);
