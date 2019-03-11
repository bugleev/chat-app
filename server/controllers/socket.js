const ss = require('socket.io-stream');
const fs = require('fs');
const path = require('path');
const User = require("../models/user");
const Room = require("../models/room");
const Message = require("../models/message");
const userList = require("./UserList");

exports.createRoomHandler = async function (socket, request, cb) {
  try {
    const { userId, room } = request;
    if (!room) throw new Error("No room provided!");
    const roomsCreated = await Room.find({ creator: userId }).countDocuments();
    if (roomsCreated >= 2) {
      throw new Error("Only 2 rooms per user allowed!");
    }
    const newRoom = new Room({
      name: room,
      creator: userId
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
exports.updateRoomList = async function (socket) {
  // emit to all on room create, otherwise update only socket
  const emitTarget = socket || this.ioServer;
  try {
    const roomList = await Room.find().select("name -_id");
    emitTarget.emit("updateRoomList", { rooms: roomList });
  } catch (error) {
    emitTarget.emit("error", error);
  }
};
exports.joinRoomHandler = async function (socket, request, cb) {
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
    this.ioServer
      .to(request.room)
      .emit("updateUserList", userList.getUserList(request.room));
    socket.broadcast.to(request.room).emit("newMessage", {
      system: true,
      message: `${request.user} joined!`
    });
    cb(request.room);
  } catch (error) {
    socket.emit("error", { message: error.message });
  }
};

exports.leaveRoomAndUpdateUserList = function (socket) {
  const user = userList.removeUser(socket.id);
  if (!user) return;
  socket.leave(user.room);
  this.ioServer
    .to(user.room)
    .emit("updateUserList", userList.getUserList(user.room));
  socket.broadcast
    .to(user.room)
    .emit("newMessage", { system: true, message: `${user.name} left...` });
};
exports.messageHandler = async function (socket, request, cb) {
  try {
    request.created = Date.now();
    if (!request.text) throw new Error("No message provided!");
    const { _id } = await Room.findOne({ name: request.room }).select("_id");
    const message = new Message({
      author: request.id,
      room: _id,
      text: request.text
    });

    this.ioServer.to(request.room).emit("newMessage", request);
    message.save();
  } catch (error) {
    socket.emit("error", error);
  }
};
exports.uploadFileMessage = function (socket, request, file, cb) {
  const splitName = request.filename.split(".");
  const fileName = `${splitName[0]}_${new Date().getTime().toString()}.${splitName[1]}`;
  var stream = fs.createWriteStream(path.join(__dirname, '../uploads', fileName));
  stream.once('open', () => {
    stream.write(file);
    stream.end(async () => {
      try {
        request.created = Date.now();
        if (!request.filename) throw new Error("No file provided!");
        const { _id } = await Room.findOne({ name: request.room }).select("_id");
        const message = new Message({
          author: request.id,
          room: _id,
          text: request.filename,
          isFile: true
        });
        const fileMessage = { ...request };
        fileMessage.text = request.filename;
        fileMessage.isFile = true;
        this.ioServer.to(request.room).emit("newMessage", fileMessage);
        message.save();
        cb();
      } catch (error) {
        socket.emit("error", error);
      }
    });
  });

};
exports.startFileTransfer = async function (socket, request, cb) {
  const socketToSendFile = userList.getSocketId(request.fileOwner)
  this.ioServer.to(socketToSendFile.socketId).emit("transfer.start", {
    file: request.filename, recepient: socket.id
  });
};
exports.progressFileTransfer = function (socket, incomingstream, data) {
  for (let i in this.ioServer.sockets.connected) {
    if (this.ioServer.sockets.connected[i].id === data.recepient) {
      var socketTo = this.ioServer.sockets.connected[i]
      ss(socketTo).emit('transfer.progress', incomingstream, data);
    }
  }

};

exports.populateMessages = async function (socket, { limit, skip, room }, cb) {
  /***
   * 1. Populate virtual field on provided room, and populate author field in found messages
   * 2. Set limit and skip options from request
   * 3. Sort messages by date to apply skip from the most recent messages
   */
  const { messages } = await Room.findOne({ name: room }).populate({
    path: "messages",
    populate: { path: "author", select: "username -_id" },
    select: "author text created isFile -_id",
    options: { limit, skip, sort: { created: -1 } }
  });
  // sort found messages backwards to display in a correct order on UI, map them to the expected format
  const formattedMessages = messages
    .sort((a, b) => a.created - b.created)
    .map(el => ({
      user: el.author.username,
      text: el.text,
      created: el.created,
      isFile: !!el.isFile
    }));
  socket.emit("populateMessagesFromDB", { messages: formattedMessages });
};
exports.typingHandler = function (socket, request) {
  const user = userList.getUser(socket.id);
  if (!user) return;
  socket.broadcast.to(user.room).emit("typing", {
    user: user.name
  });
};
exports.stopTypingHandler = function (socket, request) {
  const user = userList.getUser(socket.id);
  if (!user) return;
  socket.broadcast.to(user.room).emit("stop typing", {
    user: user.name
  });
};
exports.onErrorHandler = function (socket, error) {
  // emit different type of error event to handle it on the UI, on the "error" type socket would just close
  console.log("Error in socket", error);
  socket.emit("appError", error);
};

exports.onDisconnectHandler = function (socket) {
  console.log("Disconnected", "Socket disconnected");
  this.leaveRoomAndUpdateUserList(socket);
};
