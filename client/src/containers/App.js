import React, { Component } from "react";
import { Router, Redirect, Location, navigate } from "@reach/router";
import { observer } from "mobx-react";

import chatStyles from "../styles/Chat.module.sass";
import ChatBody from "../components/ChatBody";
import MenuModule from "../components/MenuModule";
import LoginModule from "../components/LoginModule";
import AddRoomForm from "../components/AddRoomForm";
import SignupModule from "../components/SignupModule";
import { authState } from "../AppState";
import ResetPasswordModule from "../components/ResetPasswordModule";

const UnmatchedRoute = () => <Redirect to="/" noThrow />;
const ChatModule = () => (
  <React.Fragment>
    {authState.isAuth ? (
      <React.Fragment>
        <h2 className={chatStyles.title} />
        <div className={chatStyles.chatWrapper}>
          <Location>{props => <MenuModule router={props} />}</Location>
          <Router>
            <ChatBody path="/" />
            <AddRoomForm path="rooms/add" />
            <UnmatchedRoute default />
          </Router>
        </div>
      </React.Fragment>
    ) : (
      <Redirect to="/login" noThrow />
    )}
  </React.Fragment>
);
// eslint-disable-next-line
const DefaultPage = () => (
  <div>
    Default Page
  </div>
);
@observer
class App extends Component {
  componentDidMount() {
    // handle all open instances of the app on logout
    window.addEventListener(
      "storage",
      function() {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          authState.logoutHandler();
        }
      },
      false
    );
  }
  componentDidUpdate() {}
  render() {
    return (
      <div className={chatStyles.container}>
        <Router>
          <ChatModule path="/*" />
          <LoginModule path="/login" />
          <SignupModule path="/signup" />
          <ResetPasswordModule path="/reset/*" />
          <UnmatchedRoute default />
        </Router>
      </div>
    );
  }
}

export default App;
