import React, { Component } from 'react'
import chatStyles from "./Chat.module.sass";

export default class ChatMain extends Component {
  render() {
    return (
      <div className={chatStyles.container}>
        <h2 className={chatStyles.title}>Chat App</h2>
        <div className={chatStyles.chatWrapper}>
          <div className={chatStyles.mainContent}>
            <div className={chatStyles.messageLine}>
              <span>time</span>
              <span>Message</span>
            </div>
          </div>
          <div className={chatStyles.chatInput}>
            <textarea name="chat" id="" cols="30" rows="10"></textarea>
          </div>
        </div>
      </div>
    )
  }
}
