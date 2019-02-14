import React, { Component } from "react";
import ChatMain from "../components/ChatMain";

// function lazyWithPreload(factory) {
//   const Component = React.lazy(factory);
//   Component.preload = factory;
//   return Component;
// }

export default class App extends Component {
  render() {
    console.log("app rerender", this.props);
    return <ChatMain click={this.handleCLick} hover={this.handleHover} />;
  }
}
