import React, { Component } from "react";
import { Link } from "@reach/router";
import chatStyles from "../styles/Chat.module.sass";
import RoomList from "./RoomList";
import { observer } from "mobx-react";
import { appState } from "../AppState/state";

@observer
class MenuModule extends Component {
  render() {
    const path = this.props.router.location.pathname;
    let pathNames = path.split("/").filter(el => el.length);
    const linkBack = (
      <Link to="/">
        <span>Back to chat</span>
      </Link>
    );
    return (
      <div className={chatStyles.menuWrapper}>
        <div className={chatStyles.accountInfo}>
          <div className={chatStyles.userCircle} />
          <div className={chatStyles.accountText}>
            <span>{appState.userId}</span>
            <button
              onClick={appState.logoutHandler}
              className={chatStyles.logOut}
            >
              Sign out
            </button>
          </div>
        </div>
        <RoomList />
      </div>
    );
  }
}

export default MenuModule;
