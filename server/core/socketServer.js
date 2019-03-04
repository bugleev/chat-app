const io = require("socket.io");
const format = require("date-fns/format");
const userList = require("./UserList");
const socketioJwt = require("socketio-jwt");

class SocketServer {
  constructor(server) {
    this.ioServer = io(server);
  }
  watchConnection() {
    this.ioServer
      .use(
        socketioJwt.authorize({
          secret: process.env.JWT_SECRET,
          handshake: true
        })
      )
      .on("connection", socket => {
        console.log("Connected", `"Socket connected - ${socket.id}"`);
        this.subscribe(socket);
      });
  }

  subscribe(socket) {
    socket.on("join", (data, cb) => this.roomJoinHandler(socket, data, cb));
    socket.on("createMessage", (data, cb) =>
      this.messageHandler(socket, data, cb)
    );
    socket.on("getMessages", (data, cb) =>
      this.populateMessages(socket, data, cb)
    );
    socket.on("typing", data => this.typingHandler(socket, data));

    socket.on("stop typing", data => this.stopTypingHandler(socket, data));
    socket.on("error", error => this.onErrorHandler(socket, error));

    socket.on("disconnect", () => this.onDisconnectHandler(socket));
  }
  leaveRoomAndUpdateUserList(socket) {
    const user = userList.removeUser(socket.id);
    if (!user) return;
    socket.leave(user.room);
    this.ioServer
      .to(user.room)
      .emit("updateUserList", userList.getUserList(user.room));
    socket.broadcast
      .to(user.room)
      .emit("newMessage", { system: true, message: `${user.name} left...` });
  }
  roomJoinHandler(socket, request, cb) {
    // leave current room
    this.leaveRoomAndUpdateUserList(socket);
    const rooms = this.ioServer.sockets.adapter.rooms;
    // enter new room
    socket.join(request.room);
    if (rooms) {
      console.log("request:", rooms[request.room].length);
    }
    userList.addUser({
      socketId: socket.id,
      name: request.user,
      room: request.room
    });
    this.ioServer
      .to(request.room)
      .emit("updateUserList", userList.getUserList(request.room));
    socket.broadcast
      .to(request.room)
      .emit("newMessage", { system: true, message: `${request.user} joined!` });
    cb(request.room);
  }

  messageHandler(socket, request, cb) {
    console.log("request:", request);
    const message = { ...request };
    message.created = Date.now();
    //TODO store message in database
    message.created = format(message.created, "HH:mm:ss");
    this.ioServer.to(request.room).emit("newMessage", message);
  }

  populateMessages(socket, request, cb) {
    const messages = [];
    socket.emit("getMessages", { messages });
  }
  typingHandler(socket, request) {
    const user = userList.getUser(socket.id);
    if (!user) return;
    socket.broadcast.to(user.room).emit("typing", {
      user: user.name
    });
  }
  stopTypingHandler(socket, request) {
    const user = userList.getUser(socket.id);
    if (!user) return;
    socket.broadcast.to(user.room).emit("stop typing", {
      user: user.name
    });
  }
  onErrorHandler(socket, error) {
    console.log("Error in socket", error);
  }

  onDisconnectHandler(socket) {
    console.log("Disconnected", "Socket disconnected");
    this.leaveRoomAndUpdateUserList(socket);
  }
}

let socket;
module.exports = {
  init: server => {
    socket = new SocketServer(server);
    return socket;
  },
  getServer: () => {
    if (!socket) {
      throw new Error("Socket IO was not initialized");
    }
    return socket;
  }
};
