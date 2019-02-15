import React, { Component } from "react";
import { Link } from "@reach/router";
import chatStyles from "./Chat.module.sass";

export default class AddRoomForm extends Component {
  render() {
    const showError = false;
    return (
      <div className={chatStyles.addRoomWrapper}>
        <h5>Create your own room</h5>
        <form action="">
          <div
            className={`${chatStyles.formField} ${
              showError ? chatStyles.error : ""
            }`}
          >
            <span />
            <input type="text" name="roomname" placeholder="enter a name" />
          </div>
          <div className={chatStyles.addRoomControls}>
            <button className={chatStyles.cancelButton}>
              <Link to="/">Cancel</Link>
            </button>
            <button className={chatStyles.loginButton}>Create</button>
          </div>
          {showError ? (
            <div className={chatStyles.formErrorWrapper}>
              <ul>
                <li>Please enter room name</li>
              </ul>
            </div>
          ) : null}
        </form>
      </div>
    );
  }
}
