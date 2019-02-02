import React, { Component, Suspense } from 'react'
import Body from '../components/Body';
import styles from '../styles/styles.module.sass';

function lazyWithPreload(factory) {
  const Component = React.lazy(factory);
  Component.preload = factory;
  return Component;
}
const LazyFooter = lazyWithPreload(() => import(/* webpackChunkName: "footer", webpackPrefetch: true */'../components/Footer'));

export default class App extends Component {
  state = {
    showFooter: false
  }
  componentDidUpdate(prevProps){
    console.log("app update", prevProps, this.props);
    
  }
  handleCLick = () => {
    setTimeout(() => this.setState({ showFooter: !this.state.showFooter }), 50)

  }
  handleHover = () => {
    LazyFooter.preload();
  }
  render() {
    console.log("app rerender", this.props);
    return (
      <React.Fragment>
        <Body click={this.handleCLick} hover={this.handleHover} />
        {this.state.showFooter
          ?
          <Suspense fallback={<div>Loading...</div>}>
            <LazyFooter />
          </Suspense>
          : null
        }


      </React.Fragment>
    )
  }
}
