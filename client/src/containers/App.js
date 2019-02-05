import React, { Component } from 'react'
import Body from '../components/Body';


function lazyWithPreload(factory) {
  const Component = React.lazy(factory);
  Component.preload = factory;
  return Component;
}

export default class App extends Component {
  render() {
    console.log("app rerender", this.props);
    return (
      <Body click={this.handleCLick} hover={this.handleHover} />
    )
  }
}
