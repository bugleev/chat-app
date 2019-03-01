import React, { Component } from "react";
import chatStyles from "../styles/Chat.module.sass";
import { observer } from "mobx-react";
import { socketState } from "../AppState";
@observer
class UserList extends Component {
  render() {
    return (
      <div className={chatStyles.chatUsers}>
        <div className={chatStyles.chatUsersHeader}>Online:</div>
        <ul>
          {socketState.userList.map(el => (
            <li
              key={el.name}
              className={`${el.typing ? chatStyles.typing : ""}`}
            >{`${el.name}${el.typing ? " is typing" : ""}`}</li>
          ))}
        </ul>
      </div>
    );
  }
}
export default UserList;
