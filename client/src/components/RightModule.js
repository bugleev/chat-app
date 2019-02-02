import React, { Component } from 'react'
import { right } from "./body.module.sass"
import { observer } from "mobx-react";
import { appState } from "../AppState/state";

@observer
export default class RightModule extends Component {
  render() {
    return (
      <div className={right}>
        <button onClick={appState.fetchPosts}>Refetch Posts</button>
      </div>
    )
  }
}
