import React, { Component } from "react";
import { MdLock, MdPerson, MdEmail } from "react-icons/md";
import { BeatLoader } from "react-spinners";
import { observer } from "mobx-react";
import { Link } from "@reach/router";
import chatStyles from "../styles/Chat.module.sass";
import { LoginState } from "../AppState/loginState";
import { fetchStatus } from "../AppState/fetchStatus";

@observer
class SignupModule extends Component {
  loginState = new LoginState();
  render() {
    const loginState = this.loginState;
    const formErrors = Object.keys(loginState.signupForm.$)
      .map(el => loginState[el].error)
      .filter(Boolean);
    const showError = loginState.signupForm.error;
    return (
      <React.Fragment>
        <h2 />
        <div className={chatStyles.loginWrapper}>
          {fetchStatus.errorMessage ? (
            <div className={chatStyles.loginErrorWrapper}>
              {fetchStatus.errorMessage}
            </div>
          ) : null}
          <h4 className="">Signup</h4>
          <h5>Provide credentials and start chatting!</h5>
          <form
            action="POST"
            onSubmit={e => loginState.onSubmit(e, "signupForm")}
          >
            <div
              className={`${chatStyles.formField} ${
                loginState.username.error ? chatStyles.error : ""
              }`}
            >
              <span>
                <MdPerson />
              </span>
              <input
                type="text"
                value={loginState.username.value}
                onChange={e => loginState.username.onChange(e.target.value)}
                placeholder="username"
              />
            </div>
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
                loginState.signupPassword.error ? chatStyles.error : ""
              }`}
            >
              <span>
                <MdLock />
              </span>
              <input
                type="password"
                value={loginState.signupPassword.value}
                onChange={e =>
                  loginState.signupPassword.onChange(e.target.value)
                }
                placeholder="password"
              />
            </div>
            <button
              className={chatStyles.loginButton}
              style={{
                background: fetchStatus.isFetching ? "#380b7c" : undefined
              }}
            >
              {" "}
              {fetchStatus.isFetching ? (
                <BeatLoader
                  sizeUnit={"px"}
                  size={12}
                  color={"#faf9fa"}
                  loading={fetchStatus.isFetching}
                />
              ) : (
                "Sign up"
              )}
            </button>
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
        </div>
      </React.Fragment>
    );
  }
}
export default SignupModule;
