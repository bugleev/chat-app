import React, { Component } from "react";
import { Router, Redirect, Location, navigate } from "@reach/router";
import { observer } from "mobx-react";
import { socketState, authState } from "../AppState";

import chatStyles from "../styles/Chat.module.sass";
import UserList from "./UserList";
import { getUsernameColor } from "../utils/getUsernameColor";

@observer
class Room extends Component {
  chatList = React.createRef();
  componentDidMount() {
    const chatNode = this.chatList.current;
    chatNode.addEventListener("scroll", this.fetchMessagesOnscroll);
    document
      .getElementById("chat-input")
      .addEventListener("keypress", this.submitOnEnter);
  }
  componentWillUnMount() {
    const chatNode = this.chatList.current;
    chatNode.removeEventListener("scroll", this.fetchMessagesOnscroll);
    document
      .getElementById("chat-input")
      .removeEventListener("keypress", this.submitOnEnter);
  }
  getSnapshotBeforeUpdate() {
    const { scrollHeight, scrollTop, clientHeight } = this.chatList.current;
    return { scrollHeight, scrollTop, clientHeight };
  }
  componentDidUpdate(prevProps, prevState, coordsFromSnapshot) {
    const { scrollHeight, scrollTop, clientHeight } = coordsFromSnapshot;
    const chatNode = this.chatList.current;
    /**
     * if height of chat window increased and scroll is at the top of the chat window, retain scroll position
     */

    if (chatNode.scrollHeight > scrollHeight && scrollTop === 0) {
      chatNode.scrollTo(0, chatNode.scrollHeight - scrollHeight);
      return;
    }
    // if chat wasn't scrolled up, automatically scroll down on new messages
    if (scrollTop + clientHeight >= scrollHeight) {
      this.scrollDown();
    }
  }
  scrollDown = () => {
    const chatNode = this.chatList.current;
    chatNode.scrollTo(0, chatNode.scrollHeight);
  };
  fetchMessagesOnscroll = e => {
    if (e.target.scrollTop === 0) {
      // make new request only if first message is not the system one with provided text
      if (
        socketState.messages.length &&
        socketState.messages[0].message !== "No messages found..." &&
        !socketState.messages[0].system
      ) {
        socketState.getMesssagesFromServer();
      }
    }
  };
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
    e.target[0].value = "";
  };
  render() {
    console.log("return:", socketState.messages);
    return (
      <React.Fragment>
        <div className={chatStyles.currentRoom}>
          <span>{this.props.roomId}</span>
        </div>
        <div className={chatStyles.chatList} ref={this.chatList}>
          {socketState.messages.map((el, i) =>
            el.system ? (
              <div className={chatStyles.chatLineMessage} key={i}>
                <span className={chatStyles.systemMessage}>{el.message}</span>
              </div>
            ) : (
              <div
                className={chatStyles.chatLineMessage}
                key={el.text + el.user + el.timeStamp}
              >
                <span className={chatStyles.timeStamp}>{el.timeStamp}</span>
                <span
                  className={chatStyles.userName}
                  style={{ color: getUsernameColor(el.user) }}
                >
                  {el.user}
                </span>
                <span style={{ marginRight: 5 }}>:</span>
                <span className={chatStyles.message}>{el.text}</span>
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
