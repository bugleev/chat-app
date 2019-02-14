import React, { Component } from "react";
import { Router, Redirect, Location } from "@reach/router";
import chatStyles from "./Chat.module.sass";
import ChatBody from "./ChatBody";
import MenuModule from "./MenuModule";
import LoginModule from "./LoginModule";
import RoomList from "./RoomList";

const UnmatchedRoute = () => <Redirect to="/" noThrow />;
const ChatModule = () => (
  <React.Fragment>
    <h2 className={chatStyles.title}>Chat App</h2>
    <div className={chatStyles.chatWrapper}>
      <Location>{props => <MenuModule router={props} />}</Location>
      <Router>
        <ChatBody path="/" />
        <RoomList path="rooms" />
        <UnmatchedRoute default />
      </Router>
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
          <ChatModule path="/*" />
          <LoginModule path="/login" signup={false} />
          <LoginModule path="/signup" signup={true} />
          <UnmatchedRoute default />
        </Router>
      </div>
    );
  }
}
