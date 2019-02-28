import React, { Component } from "react";
import chatStyles from "../styles/Chat.module.sass";

export default class UserList extends Component {
  render() {
    return (
      <div className={chatStyles.chatUsers}>
        <div className={chatStyles.chatUsersHeader}>Online:</div>
        <ul>
          {this.props.users.map(el => (
            <li key={el}>{el}</li>
          ))}
        </ul>
      </div>
    );
  }
}
