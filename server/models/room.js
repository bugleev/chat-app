const mongoose = require("mongoose");

mongoose.set("useCreateIndex", true);
const Schema = mongoose.Schema;

const roomSchema = new Schema(
  {
    name: {
      type: String,
      required: "Please provide room name",
      trim: true,
      unique: "Room with that name already exists!"
    },
    created: {
      type: Date,
      default: Date.now
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: "Please provide username"
    }
  },
  {
    toJSON: {
      virtuals: true
    },
    toObject: {
      virtuals: true
    }
  }
);

// populate virtual field from Messages collection
roomSchema.virtual("messages", {
  ref: "Message",
  localField: "_id",
  foreignField: "room"
});

module.exports = mongoose.model("Room", roomSchema);
