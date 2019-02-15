import React, { Component } from "react";
import chatStyles from "./Chat.module.sass";
import { Link } from "@reach/router";

export default class RoomList extends Component {
  render() {
    return (
      <React.Fragment>
        <div className={chatStyles.roomList}>
          <div>
            <h4>Room list:</h4>
            <ul className={chatStyles.roomScroll}>
              <li>
                <Link to={`/room/${1}`}>Room 1</Link>
              </li>
              <li>Room 2</li>
              <li>Room 3</li>
            </ul>
          </div>
          <button className={chatStyles.addRoomButton}>
            <Link to="/rooms/add">Add room</Link>
          </button>
        </div>
      </React.Fragment>
    );
  }
}
