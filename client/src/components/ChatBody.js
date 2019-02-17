import React, { Component } from "react";
import chatStyles from "../styles/Chat.module.sass";
import UserList from "./UserList";

export default class ChatBody extends Component {
  render() {
    return (
      <React.Fragment>
        <main className={chatStyles.chatContent}>
          <div className={chatStyles.currentRoom}>
            <span>Test Room</span>
          </div>
          <div className={chatStyles.chatList}>
            <div className={chatStyles.chatLineMessage}>
              <span className={chatStyles.timeStamp}>23:05:14</span>
              <span className={chatStyles.userName}>User</span>
              <span style={{ marginRight: 5 }}>:</span>
              <span className={chatStyles.message}>Lorem ipsum,</span>
            </div>
          </div>
          <UserList />
          <div className={chatStyles.chatInputBox}>
            <div>
              <textarea name="chat" placeholder="Send a message" />
            </div>
            <div className={chatStyles.inputButtons}>
              <button className={chatStyles.chatButton}>Chat</button>
            </div>
          </div>
        </main>
      </React.Fragment>
    );
  }
}
