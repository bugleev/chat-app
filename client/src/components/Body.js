import React, { Component } from 'react'
import { container } from "./body.module.sass"
import LeftModule from './LeftModule';
import RightModule from './RightModule';
import { observer } from "mobx-react";
import { fetchStatus } from "../AppState/fetchStatus";
@observer
export default class Body extends Component {
  componentDidUpdate(prevProps) {
    console.log("body update", prevProps, this.props);

  }
  render() {
    const { isFetching, showSuccessMessage, errorMessage } = fetchStatus;
    return (
      <div className={container}>
        <h1>{isFetching && "loading"}{showSuccessMessage}{errorMessage}</h1>
        <LeftModule />
        <RightModule />
      </div>
    )
  }
}
