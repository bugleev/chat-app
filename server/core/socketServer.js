const io = require("socket.io");
const socketioJwt = require("socketio-jwt");
let socketController = require("../controllers/socket");

class SocketServer {
  constructor(server) {
    this.ioServer = io(server, {
      path: "/da_chat"
    });
    socketController = Object.assign(this, socketController);
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
        socketController.updateRoomList(socket);
      });
  }

  subscribe(socket) {
    socket.on("createRoom", (data, cb) =>
      socketController.createRoomHandler(socket, data, cb)
    );
    socket.on("joinRoom", (data, cb) =>
      socketController.joinRoomHandler(socket, data, cb)
    );
    socket.on("createMessage", (data, cb) =>
      socketController.messageHandler(socket, data, cb)
    );
    socket.on("getMessagesFromDB", (data, cb) =>
      socketController.populateMessages(socket, data, cb)
    );
    socket.on("typing", data => socketController.typingHandler(socket, data));
    socket.on("stop typing", data =>
      socketController.stopTypingHandler(socket, data)
    );
    socket.on("error", error => socketController.onErrorHandler(socket, error));
    socket.on("disconnect", () => socketController.onDisconnectHandler(socket));
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
