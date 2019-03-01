import { observable, action, computed, flow } from "mobx";
import openSocket from "socket.io-client";
import { navigate } from "@reach/router";
import { authState } from "./authState";

const generateMessage = (user, room, message) => ({
  user,
  room,
  message: escapeHtml(message)
});

const escapeHtml = str => {
  var div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
};
const DEFAULT_ROOM = "world";
const TYPING_TIMER_LENGTH = 400;
class SocketIOState {
  socket = null;
  @observable
  currentRoom = "";
  @observable
  roomMessages = [];
  @observable
  userList = [];

  typing = false;
  lastTypingTime = null;

  @action
  disconnectSocket = () => {
    this.socket.destroy();
  };
  @action
  connectSocket = () => {
    this.socket = openSocket("/");
    this.subscribe();
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
  changeRoom = room => {
    this.currentRoom = room;
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
    this.userList = list.map(el => ({
      name: el,
      typing: false
    }));
  };
  @action
  setTyping = bool => {
    this.typing = bool;
  };
  @action
  updateTypingUser = ({ name, typing }) => {
    const user = this.userList.find(el => el.name === name);
    if (!user) return;
    user.typing = typing;
  };
  @action
  updateTyping = () => {
    if (this.socket) {
      if (!this.typing) {
        this.typing = true;
        this.socket.emit("typing");
      }
      this.lastTypingTime = new Date().getTime();
      setTimeout(() => {
        const typingTimer = new Date().getTime();
        const timeDiff = typingTimer - this.lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && this.typing) {
          this.socket.emit("stop typing");
          this.typing = false;
        }
      }, TYPING_TIMER_LENGTH);
    }
  };
  @action
  subscribe = () => {
    this.socket.on("newMessage", (data, cb) => {
      console.log(data);
      this.logMessage(data);
    });
    this.socket.on("reconnect", () => {
      this.joinRoom(this.currentRoom, authState.username);
      console.log("you have been reconnected");
    });
    this.socket.on("disconnect", (data, cb) => {
      console.log("disconnect:", data);
    });
    this.socket.on("updateUserList", (data, cb) => {
      console.log("data:", data);
      this.updateUserList(data);
    });
    this.socket.on("typing", data => {
      this.updateTypingUser({ name: data.user, typing: true });
    });
    this.socket.on("stop typing", data => {
      this.updateTypingUser({ name: data.user, typing: false });
    });
  };
}

export const socketState = new SocketIOState();
