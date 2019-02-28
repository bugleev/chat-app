const io = require("socket.io");
const format = require("date-fns/format");
const userList = require("./core/UserList");

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

    socket.on("error", error => this.onErrorHandler(socket, error));

    socket.on("disconnect", () => this.onDisconnectHandler(socket));
  }

  roomJoinHandler(socket, request, cb) {
    console.log("join", request);
    socket.join(request.room);
    userList.removeUser(request.from);
    userList.addUser(request);
    this.ioServer
      .to(request.room)
      .emit("updateUserList", userList.getUserList(request.room));
    socket.broadcast
      .to(request.room)
      .emit("newMessage", { system: true, message: `${request.from} joined!` });
    cb(request.room);
  }
  messageHandler(socket, request, cb) {
    console.log("request:", request);
    const formatted = { ...request };
    formatted.created = format(formatted.created, "HH:mm:ss");
    this.ioServer.to("world").emit("newMessage", formatted);
  }

  onErrorHandler(socket, error) {
    console.log("Error in socket", error);
  }

  onDisconnectHandler(socket) {
    console.log("Disconnected", "Socket disconnected");
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
