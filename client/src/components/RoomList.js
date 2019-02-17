import React, { Component } from "react";
import chatStyles from "../styles/Chat.module.sass";
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
              <li>
                {" "}
                <Link to={`/login`}>Login</Link>
              </li>
              <li>
                {" "}
                <Link to={`/signup`}>Signup</Link>
              </li>
            </ul>
          </div>

          <Link to="/rooms/add">
            {" "}
            <button className={chatStyles.addRoomButton}>Add room </button>
          </Link>
        </div>
      </React.Fragment>
    );
  }
}
