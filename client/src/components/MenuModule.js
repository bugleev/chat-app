import React, { Component } from "react";
import { Link } from "@reach/router";
import chatStyles from "./Chat.module.sass";

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
      <nav className={chatStyles.menuWrapper}>
        <Link to="/login">
          <span>Login</span>
        </Link>
        <Link to="/signup">
          <span>SignUp</span>
        </Link>
        {pathNames.length && pathNames[0] === "rooms" ? (
          linkBack
        ) : (
          <Link to="/rooms">
            <span>Change Room</span>
          </Link>
        )}
        <a href="/">
          <span>Logout</span>
        </a>
      </nav>
    );
  }
}
