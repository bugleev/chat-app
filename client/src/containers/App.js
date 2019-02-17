import React, { Component } from "react";
import { Router, Redirect, Location } from "@reach/router";
import chatStyles from "../styles/Chat.module.sass";
import ChatBody from "../components/ChatBody";
import MenuModule from "../components/MenuModule";
import LoginModule from "../components/LoginModule";
import AddRoomForm from "../components/AddRoomForm";
import SignupModule from "../components/SignupModule";

const UnmatchedRoute = () => <Redirect to="/" noThrow />;
const ChatModule = () => (
  <React.Fragment>
    <h2 className={chatStyles.title}>Chat App</h2>
    <div className={chatStyles.chatWrapper}>
      <Location>{props => <MenuModule router={props} />}</Location>
      <Router>
        <ChatBody path="/" />
        <AddRoomForm path="rooms/add" />
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
export default class App extends Component {
  render() {
    return (
      <div className={chatStyles.container}>
        <Router>
          <ChatModule path="/*" />
          <LoginModule path="/login" />
          <SignupModule path="/signup" />
          <UnmatchedRoute default />
        </Router>
      </div>
    );
  }
}
