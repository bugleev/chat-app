import { observable, action, computed, flow } from "mobx";
import openSocket from "socket.io-client";
import { navigate } from "@reach/router";
import { authState } from "./authState";

class SocketIOState {
  constructor() {
    // get data from local storage on startup
    this.socket = openSocket("/");
    if (authState.isAuth) this.joinRoom();
    this.subscribe();
  }
  @observable
  socket = null;

  @action
  joinRoom = flow(
    function*() {
      yield this.socket.emit("join", "some text", () => {
        console.log("joined from client!");
      });
    }.bind(this)
  );

  @action
  subscribe = () => {
    this.socket.on("newMessage", (data, cb) => {
      console.log(data);
    });
    this.socket.on("Admin", (data, cb) => {
      console.log(data);
    });
  };
}

export const socketState = new SocketIOState();
