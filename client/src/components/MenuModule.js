import React, { Component } from "react";
import chatStyles from "../styles/Chat.module.sass";
import RoomList from "./RoomList";
import { observer } from "mobx-react";
import { authState } from "../appState";
import { getUsernameColor } from "../utils/getUsernameColor";

@observer
class MenuModule extends Component {
  render() {
    return (
      <div className={chatStyles.menuWrapper}>
        <div className={chatStyles.accountInfo}>
          <div
            className={chatStyles.userCircle}
            style={{ backgroundColor: getUsernameColor(authState.username) }}
          />
          <div className={chatStyles.accountText}>
            <span>{authState.username}</span>
            <button
              onClick={authState.logoutHandler}
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
