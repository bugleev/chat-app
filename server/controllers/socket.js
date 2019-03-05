const User = require("../models/user");
const Room = require("../models/room");
const Message = require("../models/message");
const userList = require("./UserList");
const format = require("date-fns/format");

exports.createRoomHandler = async function(socket, request, cb) {
  try {
    const { userId, room } = request;
    if (!room) throw new Error("No room provided!");
    console.log("room:", room, request);
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
    socket.emit("error", { message });
  }
};
exports.updateRoomList = async function(socket, request, cb) {
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
  // leave current room
  this.leaveRoomAndUpdateUserList(socket);
  // enter new room
  socket.join(request.room);
  // if (rooms) {
  //   console.log("request:", rooms[request.room].length);
  // }
  userList.addUser({
    socketId: socket.id,
    name: request.user,
    room: request.room
  });
  ////POPULATE rOOM messages
  // const room = await Room.findOne({ name: request.room }).populate({
  //   path: "messages",
  //   populate: { path: "author", select: "username -_id" },
  //   select: "author text -_id"
  // });

  // console.log("room:", room.messages);
  this.ioServer
    .to(request.room)
    .emit("updateUserList", userList.getUserList(request.room));
  socket.broadcast
    .to(request.room)
    .emit("newMessage", { system: true, message: `${request.user} joined!` });
  cb(request.room);
};

exports.leaveRoomAndUpdateUserList = function(socket) {
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
exports.messageHandler = async function(socket, request, cb) {
  try {
    request.created = Date.now();
    //TODO store message in database
    if (!request.message) throw new Error("No message provided!");
    const { _id } = await Room.findOne({ name: request.room }).select("_id");
    const message = new Message({
      author: request.id,
      room: _id,
      text: request.message
    });
    request.created = format(request.created, "HH:mm:ss");
    this.ioServer.to(request.room).emit("newMessage", request);
    const savedMessage = await message.save();
  } catch (error) {
    socket.emit("error", error);
  }
};

exports.populateMessages = function(socket, request, cb) {
  const messages = [];
  socket.emit("getMessages", { messages });
};
exports.typingHandler = function(socket, request) {
  const user = userList.getUser(socket.id);
  if (!user) return;
  socket.broadcast.to(user.room).emit("typing", {
    user: user.name
  });
};
exports.stopTypingHandler = function(socket, request) {
  const user = userList.getUser(socket.id);
  if (!user) return;
  socket.broadcast.to(user.room).emit("stop typing", {
    user: user.name
  });
};
exports.onErrorHandler = function(socket, error) {
  console.log("Error in socket", error);
  socket.emit("appError", error);
};

exports.onDisconnectHandler = function(socket) {
  console.log("Disconnected", "Socket disconnected");
  this.leaveRoomAndUpdateUserList(socket);
};
