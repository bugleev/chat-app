import React, { Component } from "react";
import { MdLock, MdPerson } from "react-icons/md";
import { Link } from "@reach/router";
import chatStyles from "./Chat.module.sass";

export default class LoginModule extends Component {
  render() {
    const showError = false;
    const { signup } = this.props;
    return (
      <React.Fragment>
        <h2 className={chatStyles.hidden}>ADAFaafA</h2>
        <div className={chatStyles.loginWrapper}>
          <h3 className="">Chat App</h3>
          {signup ? (
            <h4>Provide credentials and start chatting!</h4>
          ) : (
            <h4>
              Application is currently for registered users only, please login
            </h4>
          )}

          <form action="">
            <div
              className={`${chatStyles.formField} ${
                showError ? chatStyles.error : ""
              }`}
            >
              <span>
                <MdPerson />
              </span>
              <input type="text" name="username" placeholder="username" />
            </div>
            <div className={chatStyles.formField}>
              <span>
                <MdLock />
              </span>

              <input type="text" name="password" placeholder="password" />
            </div>
            <button className={chatStyles.loginButton}>
              {signup ? "Sign up" : "Log in"}
            </button>
            {showError ? (
              <div className={chatStyles.formErrorWrapper}>
                <ul>
                  <li>Please enter your username</li>
                  <li>Please enter your password</li>
                  <li>Your password must be at least 6 characters</li>
                </ul>
              </div>
            ) : null}
          </form>
          {!signup ? (
            <div className={chatStyles.sighupMessage}>
              Don&apos;t have an account? <Link to="/signup">Sign Up</Link>
            </div>
          ) : null}
        </div>
      </React.Fragment>
    );
  }
}
