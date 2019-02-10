import React, { Component } from 'react'
import chatStyles from "./Chat.module.sass";
import ChatBody from './ChatBody';
import RoomList from './RoomList';

export default class ChatMain extends Component {
  render() {
    return (
      <div className={chatStyles.container}>
        <h2 className={chatStyles.title}>Test</h2>
        <div className={chatStyles.chatWrapper}>
          <RoomList />
          <ChatBody />         
        </div>
      </div>
    )
  }
}
