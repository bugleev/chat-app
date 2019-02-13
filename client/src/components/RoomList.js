import React, { Component } from "react";
import { Link } from "@reach/router";
import chatStyles from "./Chat.module.sass";

export default class RoomList extends Component {
  render() {
    return (
      <div className={chatStyles.menuWrapper}>
        <Link to="/login">
          <span>Login</span>
        </Link>
        <Link to="/signup">
          <span>SignUp</span>
        </Link>
        <a href="/">
          <span>Change Room</span>
        </a>
        <a href="/">
          <span>Logout</span>
        </a>
      </div>
    );
  }
}
