const io = require("socket.io");
const format = require("date-fns/format");
const userList = require("./UserList");

class SocketServer {
  constructor(server) {
    this.ioServer = io(server);
  }
  watchConnection() {
    this.ioServer.on("connection", socket => {
      console.log("Connected", `"Socket connected - ${socket.id}"`);
      this.subscribe(socket);
    });
  }

  subscribe(socket) {
    socket.on("join", (data, cb) => this.roomJoinHandler(socket, data, cb));
    socket.on("createMessage", (data, cb) =>
      this.messageHandler(socket, data, cb)
    );
    socket.on("typing", data => this.typingHandler(socket, data));

    socket.on("stop typing", data => this.stopTypingHandler(socket, data));
    socket.on("error", error => this.onErrorHandler(socket, error));

    socket.on("disconnect", () => this.onDisconnectHandler(socket));
  }

  roomJoinHandler(socket, request, cb) {
    console.log("join", request);
    socket.join(request.room);
    userList.removeUser(socket.id);
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
    (message.created = Date.now()),
      //TODO store message in database
      (message.created = format(message.created, "HH:mm:ss"));
    this.ioServer.to(request.room).emit("newMessage", message);
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
    const user = userList.removeUser(socket.id);
    console.log("user:", user);
    if (!user) return;
    this.ioServer
      .to(user.room)
      .emit("updateUserList", userList.getUserList(user.room));
    socket.broadcast
      .to(user.room)
      .emit("newMessage", { system: true, message: `${user.name} left...` });
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
