import { observable, action, computed, flow } from "mobx";
import openSocket from "socket.io-client";
import { navigate } from "@reach/router";
import { authState } from "./authState";

const generateMessage = (user, room, message) => ({
  user,
  room,
  message: escapeHtml(message)
});

function escapeHtml(str) {
  var div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}
const DEFAULT_ROOM = "world";

class SocketIOState {
  constructor() {
    this.socket = openSocket("/");
  }

  socket = null;
  @observable
  currentRoom = "";
  @observable
  roomMessages = [];
  @observable
  userList = [];

  @action
  changeRoom = room => {
    this.currentRoom = room;
  };
  @action
  joinRoom = (room, name) => {
    this.socket.emit(
      "join",
      {
        user: name,
        room: room || DEFAULT_ROOM
      },
      roomId => {
        navigate(`/room/${roomId}`);
        this.changeRoom(roomId);
      }
    );
  };

  @action
  createMessage = message => {
    this.socket.emit(
      "createMessage",
      generateMessage(authState.username, this.currentRoom, message)
    );
  };
  @action
  logMessage = data => {
    this.roomMessages.push(data);
  };
  @action
  updateUserList = list => {
    this.userList = list;
  };

  @action
  subscribe = () => {
    this.socket.on("newMessage", (data, cb) => {
      console.log(data);
      this.logMessage(data);
    });
    this.socket.on("connection", (data, cb) => {
      console.log("connection:", data);
      this.logMessage(data);
    });
    this.socket.on("disconnect", (data, cb) => {
      console.log("disconnect:", data);
      this.logMessage(data);
    });
    this.socket.on("updateUserList", (data, cb) => {
      console.log("data:", data);
      this.updateUserList(data);
    });
  };
}

export const socketState = new SocketIOState();
