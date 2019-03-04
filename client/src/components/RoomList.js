import React, { Component } from "react";
import chatStyles from "../styles/Chat.module.sass";
import { Link } from "@reach/router";
import { authState, socketState } from "../AppState";

export default class RoomList extends Component {
  render() {
    return (
      <React.Fragment>
        <div className={chatStyles.roomList}>
          <div>
            <h4>Room list:</h4>
            <ul className={chatStyles.roomScroll}>
              <li>
                <button
                  onClick={() =>
                    socketState.joinRoom("Room", authState.username)
                  }
                >
                  Room
                </button>
              </li>
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
