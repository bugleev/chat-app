import React, { Component } from "react";
import { observer } from "mobx-react";
import { socketState, authState } from "../appState";
import chatStyles from "../styles/Chat.module.sass";
import UserList from "./UserList";
import { getUsernameColor } from "../utils/getUsernameColor";

@observer
class Room extends Component {
  chatList = React.createRef();
  componentDidMount() {
    const chatNode = this.chatList.current;
    chatNode.addEventListener("scroll", this.fetchMessagesOnscroll);
    const textInput = document.getElementById("chat-input");
    textInput.addEventListener("keypress", this.submitOnEnter);
    textInput.addEventListener("keyup", this.loadLastMessage);
  }
  componentWillUnMount() {
    const chatNode = this.chatList.current;
    chatNode.removeEventListener("scroll", this.fetchMessagesOnscroll);
    document
      .getElementById("chat-input")
      .removeEventListener("keypress", this.submitOnEnter)
      .removeEventListener("keyup", this.loadLastMessage);
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
        socketState.roomMessages.length &&
        socketState.roomMessages[0].message !== "No messages found..." &&
        !socketState.roomMessages[0].system
      ) {
        socketState.getMesssagesFromServer();
      }
    }
  };
  submitOnEnter = e => {
    socketState.updateTypingEvent();
    if (e.which === 13 && !e.target.value.trim()) {
      e.preventDefault();
      return;
    }
    if (e.which === 13 && !e.shiftKey) {
      e.preventDefault();
      e.target.form.dispatchEvent(new Event("submit", { cancelable: true }));
      e.target.value = "";
    }
  };
  loadLastMessage = e => {
    if (e.which === 38 && !e.shiftKey) {
      e.preventDefault();
      const reversed = socketState.roomMessages.reverse();
      const lastMessage = reversed.find(el => el.user === authState.username)
        .text;
      e.target.value = lastMessage;
    }
  };
  selectUserToMessage = name => {
    const textarea = document.getElementById("chat-input");
    textarea.value = `@${name}, `;
    textarea.focus();
  };
  submitForm = e => {
    e.preventDefault();
    if (!e.target[0].value.trim()) return;
    socketState.createMessage(e.target[0].value);
    e.target[0].value = "";
  };
  render() {
    return (
      <React.Fragment>
        <div className={chatStyles.currentRoom}>
          <span>{socketState.currentRoom}</span>
        </div>
        <div className={chatStyles.chatList} ref={this.chatList}>
          {socketState.roomMessages.map((el, i) =>
            el.system ? (
              <div className={chatStyles.chatLineMessage} key={i}>
                <span className={chatStyles.systemMessage}>{el.message}</span>
              </div>
            ) : (
              <div
                className={chatStyles.chatLineMessage}
                key={`${el.user}_${i}`}
              >
                <span className={chatStyles.timeStamp}>{el.timeStamp}</span>
                <button
                  className={chatStyles.userName}
                  style={{ color: getUsernameColor(el.user) }}
                  onClick={() => this.selectUserToMessage(el.user)}
                >
                  {el.user}
                </button>
                <span style={{ marginRight: 5 }}>:</span>
                {!el.isFile ? (
                  <span className={chatStyles.message}>{el.text}</span>
                ) : (
                  <button
                    className={chatStyles.fileMessage}
                    onClick={() =>
                      socketState.receiveFile(el.fileLink, el.text)
                    }
                  >
                    {el.text}
                  </button>
                )}
              </div>
            )
          )}
        </div>
        <UserList selectUser={this.selectUserToMessage} />
        <div className={chatStyles.chatInputBox}>
          <form action="POST" onSubmit={this.submitForm}>
            <div>
              <textarea
                name="chat-input"
                placeholder={`Send a message #${this.props.roomId}`}
                maxLength="250"
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
        <div className={chatStyles.fileInput}>
          <label htmlFor="upload-file" className={chatStyles.fileLabel}>
            {socketState.fileUploading ? "test!" : "Upload file"}
          </label>
          <input
            type="file"
            name="file"
            id="upload-file"
            onChange={socketState.handleFileUpload}
          />
        </div>
      </React.Fragment>
    );
  }
}

export default Room;
