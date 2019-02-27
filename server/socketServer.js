const io = require("socket.io");

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
    socket.on("join", (data, cb) => this.onDataHandler(socket, data, cb));

    socket.on("error", error => this.onErrorHandler(socket, error));

    socket.on("disconnect", () => this.onDisconnectHandler(socket));
  }

  async onDataHandler(socket, request, cb) {
    console.log(request);
    socket.join("world");
    socket.emit("Admin", "welcome to chat room 'World'");
    socket.broadcast.to("world").emit("newMessage", "new user joined!");
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
