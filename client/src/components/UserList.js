import React, { Component } from "react";
import chatStyles from "../styles/Chat.module.sass";

export default class UserList extends Component {
  render() {
    return (
      <div className={chatStyles.chatUsers}>
        <div className={chatStyles.chatUsersHeader}>Online:</div>
        <ul>
          <li>User 1</li>
        </ul>
      </div>
    );
  }
}
