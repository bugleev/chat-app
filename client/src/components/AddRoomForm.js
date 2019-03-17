import React, { Component } from "react";
import { Link } from "@reach/router";
import { observer } from "mobx-react";

import chatStyles from "../styles/Chat.module.sass";
import { formState, socketState } from "../appState";

@observer
class AddRoomForm extends Component {
  formState = new formState();

  render() {
    const formState = this.formState;
    const formErrors = Object.keys(formState.createRoomForm.$)
      .map(el => formState[el].error)
      .filter(Boolean);
    const showError = formState.createRoomForm.error;
    return (
      <div className={chatStyles.addRoomWrapper}>
        <h5>Create your own room</h5>
        <form
          action="POST"
          onSubmit={e => formState.onSubmit(e, "createRoomForm")}
        >
          <div
            className={`${chatStyles.formField} ${
              showError ? chatStyles.error : ""
            }`}
          >
            <span />
            <input
              type="text"
              value={formState.roomname.value}
              onChange={e => formState.roomname.onChange(e.target.value)}
              placeholder="enter a name"
            />
          </div>

          <div className={chatStyles.addRoomControls}>
            <button className={chatStyles.cancelButton}>
              <Link to={`/room/${socketState.currentRoom}`}>Cancel</Link>
            </button>
            <button className={chatStyles.loginButton}>Create</button>
          </div>
          {showError ? (
            <div className={chatStyles.formErrorWrapper}>
              <ul>
                {formErrors.map((el, i) => (
                  <li key={i}>{el}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </form>
      </div>
    );
  }
}

export default AddRoomForm;
