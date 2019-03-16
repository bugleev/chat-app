const fs = require("fs");
const path = require("path");
const serverPath = require("../util/path");
const User = require("../models/user");
const Room = require("../models/room");
const Message = require("../models/message");
const userList = require("./UserList");

const isOlderThan = (created, interval) =>
  Date.now() - new Date(created).getTime() > 1000 * 60 * 60 * 24 * interval;

exports.createRoomHandler = async function(socket, request, cb) {
  try {
    const { username, room } = request;
    if (!room) throw new Error("No room provided!");
    const { _id } = await User.findOne({ username }).select("_id");
    const roomsCreated = await Room.find({ creator: _id }).countDocuments();
    if (roomsCreated >= 2) {
      throw new Error("Only 2 rooms per user allowed!");
    }
    const newRoom = new Room({
      name: room,
      creator: _id
    });
    const savedRoom = await newRoom.save();
    this.updateRoomList(null);
    cb(savedRoom.name);
  } catch (error) {
    let message = "";
    if (error.code === 11000) {
      message += "room name taken!";
    }
    socket.emit("error", { message: message || error.message });
  }
};
exports.updateRoomList = async function(socket) {
  // emit to all on room create, otherwise update only socket
  const emitTarget = socket || this.ioServer;
  try {
    const roomList = await Room.find().select("name -_id");
    emitTarget.emit("updateRoomList", { rooms: roomList });
  } catch (error) {
    emitTarget.emit("error", error);
  }
};
exports.joinRoomHandler = async function(socket, request, cb) {
  try {
    // leave current room
    this.leaveRoomAndUpdateUserList(socket);
    // enter new room
    const room = await Room.findOne({ name: request.room });
    if (!room) {
      throw new Error("No room found with that name!");
    }
    socket.join(request.room);
    userList.addUser({
      socketId: socket.id,
      name: request.user,
      room: request.room
    });
    const roomUserList = userList.getUserList(request.room);
    this.ioServer.to(request.room).emit("updateUserList", roomUserList);
    // broadcast the join event only on one open connection
    if (!roomUserList.includes(request.user)) {
      socket.broadcast.to(request.room).emit("newMessage", {
        system: true,
        message: `${request.user} joined!`
      });
    }
    cb(request.room);
  } catch (error) {
    socket.emit("error", { message: error.message });
  }
};

exports.leaveRoomAndUpdateUserList = function(socket) {
  const user = userList.removeUser(socket.id);
  if (!user) return;
  socket.leave(user.room);
  const roomUserList = userList.getUserList(user.room);
  this.ioServer.to(user.room).emit("updateUserList", roomUserList);
  // broadcast the leave event only on one open connection
  if (!roomUserList.includes(user.name)) {
    socket.broadcast
      .to(user.room)
      .emit("newMessage", { system: true, message: `${user.name} left...` });
  }
};
exports.messageHandler = async function(socket, request) {
  try {
    if (!request.text) throw new Error("No message provided!");
    request.created = Date.now();
    const user = await User.findOne({ username: request.user }).select("_id");
    const room = await Room.findOne({ name: request.room }).select("_id");
    const message = new Message({
      author: user._id,
      room: room._id,
      text: request.text
    });
    this.ioServer.to(request.room).emit("newMessage", request);
    message.save();
  } catch (error) {
    socket.emit("error", error);
  }
};
exports.uploadFileMessage = function(socket, request, file, cb) {
  try {
    if (!request.filename) throw new Error("No file provided!");
    const splitName = request.filename.split(".");
    const downloadLink = `${splitName[0]}_${new Date().getTime().toString()}.${
      splitName[1]
    }`;
    var stream = fs.createWriteStream(
      path.join(serverPath, process.env.UPLOADS_DIR, downloadLink)
    );
    stream.once("open", () => {
      stream.write(file);
      stream.end(async () => {
        request.created = Date.now();
        const room = await Room.findOne({ name: request.room }).select("_id");
        const user = await User.findOne({ username: request.user }).select(
          "_id"
        );
        const message = new Message({
          author: user._id,
          room: room._id,
          text: request.filename,
          isFile: true,
          fileLink: downloadLink
        });
        const fileMessage = { ...request };
        fileMessage.text = request.filename;
        fileMessage.isFile = true;
        fileMessage.fileLink = downloadLink;
        this.ioServer.to(request.room).emit("newMessage", fileMessage);
        message.save();
        cb();
      });
    });
  } catch (error) {
    socket.emit("error", error);
  }
};

exports.downloadFile = (req, res, next) => {
  const { link } = req.params;
  var filePath = path.join(serverPath, process.env.UPLOADS_DIR, link);
  return res.download(filePath, err => {
    if (err) {
      const error = new Error("No file found!");
      error.statusCode = err.statusCode || 500;
      next(error);
    }
  });
};

exports.populateMessages = async function(socket, { limit, skip, room }) {
  /*
   * 1. Populate virtual field on provided room, and populate author field in found messages
   * 2. Set limit and skip options from request
   * 3. Sort messages by date to apply skip from the most recent messages
   */
  const { messages } = await Room.findOne({ name: room }).populate({
    path: "messages",
    populate: { path: "author", select: "username -_id" },
    select: "-_id",
    options: { limit, skip, sort: { created: -1 } }
  });

  /**
   * 1.sort found messages backwards to display in a correct order on UI, map them to the           expected format
     2. files will be deleted from temp folder on the server every 10 days, so we won't display links older than 10 days   
 */
  const formattedMessages = messages
    .sort((a, b) => a.created - b.created)
    .map(el => ({
      user: el.author.username,
      text: el.isFile
        ? isOlderThan(el.created, process.env.CLEAN_UPLOADS_DAYS)
          ? "link expired"
          : el.text
        : el.text,
      created: el.created,
      isFile: !!el.isFile,
      fileLink: el.fileLink
    }));
  socket.emit("populateMessagesFromDB", { messages: formattedMessages });
};
exports.typingHandler = function(socket) {
  const user = userList.getUser(socket.id);
  if (!user) return;
  socket.broadcast.to(user.room).emit("typing", {
    user: user.name
  });
};
exports.stopTypingHandler = function(socket) {
  const user = userList.getUser(socket.id);
  if (!user) return;
  socket.broadcast.to(user.room).emit("stop typing", {
    user: user.name
  });
};
exports.onErrorHandler = function(socket, error) {
  // emit different type of error event to handle it on the UI, on the "error" type socket would just close
  socket.emit("appError", error);
};

exports.onDisconnectHandler = function(socket) {
  this.leaveRoomAndUpdateUserList(socket);
};
