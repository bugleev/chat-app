import React, { Component } from "react";
import { Router, Redirect, Location, navigate } from "@reach/router";
import chatStyles from "../styles/Chat.module.sass";
import ChatBody from "../components/ChatBody";
import MenuModule from "../components/MenuModule";
import LoginModule from "../components/LoginModule";
import AddRoomForm from "../components/AddRoomForm";
import SignupModule from "../components/SignupModule";
import { appState } from "../AppState/state";
import { observer } from "mobx-react";

const UnmatchedRoute = () => <Redirect to="/" noThrow />;
const ChatModule = () => (
  <React.Fragment>
    {appState.isAuth ? (
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
    const token = localStorage.getItem("token");
    const expiryDate = localStorage.getItem("expiryDate");
    if (!token || !expiryDate) {
      return;
    }
    if (new Date(expiryDate) <= new Date()) {
      appState.logoutHandler();
      return;
    }
    const userId = localStorage.getItem("userId");
    const remainingMilliseconds =
      new Date(expiryDate).getTime() - new Date().getTime();
    appState.setLoginDetails({ token, id: userId });
    appState.setAutoLogout(remainingMilliseconds);
  }
  componentDidUpdate() {}
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

export default App;
