import React, { Component } from "react";
import { Link } from "@reach/router";
import chatStyles from "../styles/Chat.module.sass";
import RoomList from "./RoomList";

export default class MenuModule extends Component {
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
            <span>Username</span>
            <Link to="/">
              <span>Sign out</span>
            </Link>
          </div>
        </div>
        <RoomList />
      </div>
    );
  }
}
