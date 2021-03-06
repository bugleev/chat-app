import { observable, action, computed, flow } from "mobx";
import openSocket from "socket.io-client";
import { navigate, createHistory } from "@reach/router";
import format from "date-fns/format";
import isSameDay from "date-fns/is_same_day";
import saveAs from "file-saver";

import { authState, fetchState } from "./";

const generateMessage = (room, message) => ({
  room,
  text: escapeHtml(message)
});

const escapeHtml = str => {
  var div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
};
const insertDatesInMessages = messages => {
  messages.reduce((acc, cur, idx) => {
    const same = isSameDay(acc.created, cur.created);
    if (!same && !acc.system && !cur.system) {
      messages.splice(idx, 0, {
        system: true,
        message: `${format(cur.created, "DD MMMM YYYY")}`
      });
    }
    return cur;
  });
  return messages;
};

const DEFAULT_ROOM = "General";
const TYPING_TIMER_LENGTH = 400;
const MESSAGES_LIMIT = 20;

class SocketIOState {
  socket = null;
  @observable
  currentRoom = "";
  @observable
  messages = [];
  @observable
  userList = [];
  @observable
  roomList = [];

  @observable
  roomList = [];
  @observable
  fileUploading = false;

  typing = false;
  lastTypingTime = null;
  uploadedFile = null;

  @computed get skippedAmount() {
    // amount of messages to skip when quering a database (excluding system messages)
    return this.messages.filter(el => !el.system).length;
  }
  @computed get roomMessages() {
    // format dates to display on UI
    return this.messages.map(el => ({
      timeStamp: format(el.created, "HH:mm:ss"),
      ...el
    }));
  }
  @action
  disconnectSocket = () => {
    this.socket.destroy();
  };
  @action
  connectSocket = token => {
    // pass jwt token along on connection
    this.socket = openSocket("/", {
      path: "/buybots_chat",
      query: { token }
    });
    if (this.socket) {
      // check for URL to have a specific room to connect
      let history = createHistory(window);
      let room = null;
      if (history.location.pathname.slice(0, 6) === "/room/") {
        room = decodeURI(history.location.pathname.slice(6));
      }
      this.subscribe();
      this.joinRoom(room);
    }
  };
  @action
  createRoom = ({ room }) => {
    this.socket.emit(
      "createRoom",
      {
        room
      },
      // navigate to room on callback from server
      room => {
        this.joinRoom(room);
      }
    );
  };

  @action
  joinRoom = room => {
    this.socket.emit(
      "joinRoom",
      {
        room: room || DEFAULT_ROOM
      },
      // navigate to room on callback from server
      roomId => {
        navigate(`/room/${roomId}`);
        this.changeRoom(roomId);
        this.getMesssagesFromServer(roomId);
      }
    );
  };

  @action
  changeRoom = room => {
    this.currentRoom = room;
    this.messages = [];
  };

  @action
  createMessage = message => {
    this.socket.emit(
      "createMessage",
      generateMessage(this.currentRoom, message)
    );
  };
  @action
  logMessageFromUser = data => {
    this.messages.push(data);
  };
  @action
  getMesssagesFromServer = (room = this.currentRoom) => {
    this.socket.emit("getMessagesFromDB", {
      room,
      skip: this.skippedAmount,
      limit: MESSAGES_LIMIT
    });
  };
  @action
  updateUserList = list => {
    this.userList = list.map(el => ({
      name: el.name,
      role: el.role,
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
  updateTypingEvent = () => {
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
  downloadYandex = () => {
    this.socket.emit("yandex");
  };
  @action
  handleFileUpload = e => {
    const file = e.target.files[0];
    if (file && file.size / 1000000 > 10) {
      e.target.value = "";
      fetchState.fetchError("Недопустимый размер файла!");
      return;
    }
    this.uploadedFile = file;
    this.fileUploading = true;
    this.socket.emit(
      "upload",
      {
        room: this.currentRoom,
        filename: file.name
      },
      file,
      () => {
        this.fileUploading = false;
      }
    );
  };
  @action
  receiveFile = flow(function*(fileLink, fileName) {
    if (fileName === "link expired") return;
    fetchState.startFetching();
    let request = new Request(`/api/download/${fileLink}`, {
      method: "GET",
      headers: {
        Authorization: `bearer ${authState.token}`
      }
    });
    const response = yield fetchState.fetchAndVerifyResponse(request);
    if (!response) return;
    const data = yield response.blob();
    yield saveAs(data, fileName);
    fetchState.fetchStop();
  });
  @action
  subscribe = () => {
    this.socket.on("newMessage", data => {
      this.logMessageFromUser(data);
    });
    this.socket.on("populateMessagesFromDB", ({ messages }) => {
      if (messages.length) {
        this.messages.unshift(...insertDatesInMessages(messages));
      } else {
        this.messages.unshift({
          system: true,
          message: `No messages found...`
        });
      }
    });
    this.socket.on("reconnect", () => {
      this.joinRoom(this.currentRoom);
      console.log("you have been reconnected");
    });
    this.socket.on("disconnect", data => {
      console.log("disconnect:", data);
    });
    this.socket.on("error", error => {
      if (error.type == "UnauthorizedError" || error.code == "invalid_token") {
        authState.logoutHandler();
      }
    });
    this.socket.on("appError", error => {
      fetchState.fetchError(error.message || "server error!");
      if (error.message === "No room found with that name!") {
        navigate("/rooms/add");
      }
    });
    this.socket.on("updateUserList", data => {
      this.updateUserList(data);
    });
    this.socket.on("updateRoomList", data => {
      this.roomList = data.rooms;
    });
    this.socket.on("typing", data => {
      if (data.user === authState.username) return;
      this.updateTypingUser({ name: data.user, typing: true });
    });
    this.socket.on("stop typing", data => {
      if (data.user === authState.username) return;
      this.updateTypingUser({ name: data.user, typing: false });
    });
  };
}

export const socketState = new SocketIOState();
