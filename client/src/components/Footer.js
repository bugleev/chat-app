import React, { Component } from 'react'
import { wrapper } from "./footer.module.sass"
export default class Footer extends Component {
  render() {
    return (
      <div className={wrapper}>
        <span>I'm a footer</span>
      </div>
    )
  }
}
