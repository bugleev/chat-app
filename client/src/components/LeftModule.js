import React, { Component } from 'react'
import { left } from "./body.module.sass"
import { observable } from "mobx";
import { observer } from "mobx-react";
import { appState } from "../AppState/state";
@observer
export default class LeftModule extends Component {
  @observable textField = ""
  componentDidMount() {
    appState.fetchPosts();
  }
  handleInput = (e) => {
    this.textField = e.target.value;
  }
  render() {
    return (
      <div className={left}>
        <button onClick={appState.clearPosts}>Clear</button>
        <div><input type="text" value={this.textField} onChange={this.handleInput} /></div>
        {appState.postsFormatted.map(el => (<div key={el}><p>{el}</p></div>))}
      </div>
    )
  }
}
