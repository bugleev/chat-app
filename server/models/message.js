const mongoose = require("mongoose");

mongoose.set("useCreateIndex", true);
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: "Please provide username"
  },
  room: {
    type: Schema.Types.ObjectId,
    ref: "Room",
    required: "Please provide room"
  },
  text: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Message", messageSchema);
