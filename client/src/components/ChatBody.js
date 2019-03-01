import React, { Component } from "react";
import { Router, Redirect, Location, navigate } from "@reach/router";
import { observer } from "mobx-react";
import { socketState, authState } from "../AppState";

import chatStyles from "../styles/Chat.module.sass";
import UserList from "./UserList";

@observer
class Room extends Component {
  componentDidMount() {
    document
      .getElementById("chat-input")
      .addEventListener("keypress", this.submitOnEnter);
  }
  componentWillUnMount() {
    document
      .getElementById("chat-input")
      .removeEventListener("keypress", this.submitOnEnter);
  }

  submitOnEnter = event => {
    socketState.updateTyping();
    if (event.which === 13 && !event.target.value.trim()) {
      event.preventDefault();
      return;
    }
    if (event.which === 13 && !event.shiftKey) {
      event.target.form.dispatchEvent(
        new Event("submit", { cancelable: true })
      );
      event.preventDefault();
      event.target.value = "";
    }
  };
  submitForm = e => {
    e.preventDefault();
    if (!e.target[0].value.trim()) return;
    socketState.createMessage(e.target[0].value);
    event.target[0].value = "";
  };
  render() {
    return (
      <React.Fragment>
        <div className={chatStyles.currentRoom}>
          <span>{this.props.roomId}</span>
        </div>
        <div className={chatStyles.chatList}>
          {socketState.roomMessages.map((el, i) =>
            el.system ? (
              <div className={chatStyles.chatLineMessage} key={i}>
                <span className={chatStyles.systemMessage}>{el.message}</span>
              </div>
            ) : (
              <div className={chatStyles.chatLineMessage} key={i}>
                <span className={chatStyles.timeStamp}>{el.created}</span>
                <span
                  className={chatStyles.userName}
                  style={{ color: authState.color }}
                >
                  {el.user}
                </span>
                <span style={{ marginRight: 5 }}>:</span>
                <span className={chatStyles.message}>{el.message}</span>
              </div>
            )
          )}
        </div>
        <UserList />
        <div className={chatStyles.chatInputBox}>
          <form action="POST" onSubmit={this.submitForm}>
            <div>
              <textarea
                name="chat-input"
                placeholder={`Send a message #${this.props.roomId}`}
                id="chat-input"
              />
            </div>
            <div className={chatStyles.inputButtons}>
              <button className={chatStyles.chatButton} type="submit">
                Chat
              </button>
            </div>
          </form>
        </div>
      </React.Fragment>
    );
  }
}
const UnmatchedRoute = () => <Redirect to="/" noThrow />;
export default class ChatBody extends Component {
  render() {
    return (
      <React.Fragment>
        <main className={chatStyles.chatContent}>
          <Router>
            <Room path="room/:roomId" />
            <UnmatchedRoute default />
          </Router>
        </main>
      </React.Fragment>
    );
  }
}
