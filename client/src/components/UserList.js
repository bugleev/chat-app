import React, { Component } from "react";
import chatStyles from "../styles/Chat.module.sass";
import { observer } from "mobx-react";
import { GoHubot } from "react-icons/go";
import { socketState } from "../appState";
@observer
class UserList extends Component {
  render() {
    return (
      <div className={chatStyles.chatUsers}>
        <div className={chatStyles.chatUsersHeader}>Online:</div>
        <ul>
          {socketState.userList.map(el => (
            // eslint-disable-next-line
            <li
              key={el.name}
              className={`${el.typing ? chatStyles.typing : ""}`}
              onClick={() => this.props.selectUser(el.name)}
            >
              {`${el.name}${el.typing ? " is typing" : ""}`}
              {el.role === "bot" ? <GoHubot /> : null}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
export default UserList;
