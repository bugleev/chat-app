import React, { Component } from "react";
import { Router, Redirect } from "@reach/router";

import chatStyles from "../styles/Chat.module.sass";
import Room from "./Room";

const UnmatchedRoute = () => <Redirect to="/" noThrow />;
export default class ChatBody extends Component {
  render() {
    return (
      <React.Fragment>
        <main className={chatStyles.chatContent}>
          <Router>
            <Room path="room/:roomId" />
            <UnmatchedRoute default />
          </Router>
        </main>
      </React.Fragment>
    );
  }
}
