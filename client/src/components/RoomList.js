import React, { Component } from "react";
import chatStyles from "../styles/Chat.module.sass";
import { Link } from "@reach/router";
import { authState, socketState } from "../appState";
import { observer } from "mobx-react";

@observer
class RoomList extends Component {
  render() {
    return (
      <React.Fragment>
        <div className={chatStyles.roomList}>
          <div>
            <h4>Room list:</h4>
            <ul className={chatStyles.roomScroll}>
              {socketState.roomList.map(el => (
                <button
                  key={el.name}
                  onClick={() =>
                    socketState.joinRoom(el.name, authState.username)
                  }
                >
                  {el.name}
                  {el.name === socketState.currentRoom ? (
                    <span className={chatStyles.activeRoom}>active</span>
                  ) : null}
                </button>
              ))}
            </ul>
          </div>

          <Link to="/rooms/add">
            <button className={chatStyles.addRoomButton}>Add room </button>
          </Link>
        </div>
      </React.Fragment>
    );
  }
}

export default RoomList;
