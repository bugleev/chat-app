import React, { Component } from "react";
import { MdLock, MdEmail } from "react-icons/md";
import { observer } from "mobx-react";
import { Link } from "@reach/router";
import chatStyles from "../styles/Chat.module.sass";
import { LoginState } from "../AppState/loginState";

@observer
class LoginModule extends Component {
  loginState = new LoginState();
  render() {
    const loginState = this.loginState;
    const formErrors = Object.keys(loginState.loginForm.$)
      .map(el => loginState[el].error)
      .filter(Boolean);
    const showError = loginState.loginForm.error;
    return (
      <React.Fragment>
        <h2 />
        <div className={chatStyles.loginWrapper}>
          <h4 className="">Login</h4>
          <h5>
            Application is currently for registered users only, please login
          </h5>
          <form
            action="POST"
            onSubmit={e => loginState.onSubmit(e, "loginForm")}
          >
            <div
              className={`${chatStyles.formField} ${
                loginState.email.error ? chatStyles.error : ""
              }`}
            >
              <span>
                <MdEmail />
              </span>
              <input
                type="email"
                value={loginState.email.value}
                onChange={e => loginState.email.onChange(e.target.value)}
                placeholder="email"
              />
            </div>
            <div
              className={`${chatStyles.formField} ${
                loginState.loginPassword.error ? chatStyles.error : ""
              }`}
            >
              <span>
                <MdLock />
              </span>
              <input
                type="text"
                value={loginState.loginPassword.value}
                onChange={e =>
                  loginState.loginPassword.onChange(e.target.value)
                }
                placeholder="password"
              />
            </div>
            <button className={chatStyles.loginButton}>Log in</button>
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
          <div className={chatStyles.sighupMessage}>
            Don&apos;t have an account? <Link to="/signup">Sign Up</Link>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
export default LoginModule;
