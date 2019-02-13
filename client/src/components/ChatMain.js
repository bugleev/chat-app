import React, { Component } from 'react'
import { Router, Redirect } from "@reach/router";
import chatStyles from "./Chat.module.sass";
import ChatBody from './ChatBody';
import RoomList from './RoomList';
import LoginModule from './LoginModule';

const UnmatchedRoute = () => <Redirect to="/" noThrow />;
const ChatModule = () => (
  <React.Fragment>
    <h2 className={chatStyles.title}>ADAFaafA</h2>
    <div className={chatStyles.chatWrapper}>
      <RoomList />
      <ChatBody />
    </div>
  </React.Fragment>
);
// eslint-disable-next-line
const DefaultPage = () => (
  <div>
    Default Page
  </div>
);
export default class ChatMain extends Component {
  render() {
    return (
      <div className={chatStyles.container}>
        <Router>
          <ChatModule path="/" />
          <LoginModule path="/login" />
          <Redirect from="/" to="/" noThrow />
          <UnmatchedRoute default />
        </Router>
      </div>
    )
  }
}
