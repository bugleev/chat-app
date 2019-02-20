import React, { Component } from "react";
import { Link } from "@reach/router";
import chatStyles from "../styles/Chat.module.sass";
import RoomList from "./RoomList";
import { observer } from "mobx-react";
import { authState } from "../AppState";

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
            <span>{authState.userId}</span>
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
