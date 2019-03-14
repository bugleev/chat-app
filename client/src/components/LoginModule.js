import React, { Component } from "react";
import { MdLock, MdEmail } from "react-icons/md";
import BeatLoader from "react-spinners/BeatLoader";
import { observer } from "mobx-react";
import { Link } from "@reach/router";
import chatStyles from "../styles/Chat.module.sass";
import { formState, fetchState } from "../AppState";

@observer
class LoginModule extends Component {
  formState = new formState();
  render() {
    const formState = this.formState;
    const formErrors = Object.keys(formState.loginForm.$)
      .map(el => formState[el].error)
      .filter(Boolean);
    const showError = formState.loginForm.error;
    return (
      <React.Fragment>
        <h2>Chat app</h2>
        <div className={chatStyles.loginWrapper}>
          {fetchState.errorMessage ? (
            <div className={chatStyles.loginErrorWrapper}>
              {fetchState.errorMessage}
            </div>
          ) : null}
          <h4 className="">Login</h4>
          <h5>
            Application is currently for registered users only, please login
          </h5>
          <form
            action="POST"
            onSubmit={e => formState.onSubmit(e, "loginForm")}
          >
            <div
              className={`${chatStyles.formField} ${
                formState.email.error ? chatStyles.error : ""
              }`}
            >
              <span>
                <MdEmail />
              </span>
              <input
                type="email"
                value={formState.email.value}
                onChange={e => formState.email.onChange(e.target.value)}
                placeholder="email"
              />
            </div>
            <div
              className={`${chatStyles.formField} ${
                formState.loginPassword.error ? chatStyles.error : ""
              }`}
            >
              <span>
                <MdLock />
              </span>
              <input
                type="password"
                value={formState.loginPassword.value}
                onChange={e => formState.loginPassword.onChange(e.target.value)}
                placeholder="password"
              />
              <span className={chatStyles.forgotPassword}>
                {" "}
                <Link to="/reset">Forgot password?</Link>
              </span>
            </div>
            <button
              className={chatStyles.loginButton}
              style={{
                background: fetchState.isFetching ? "#380b7c" : undefined
              }}
            >
              {fetchState.isFetching ? (
                <BeatLoader
                  sizeUnit={"px"}
                  size={12}
                  color={"#faf9fa"}
                  loading={fetchState.isFetching}
                />
              ) : (
                "Log in"
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
          <div className={chatStyles.sighupMessage}>
            Don&apos;t have an account? <Link to="/signup">Sign Up</Link>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
export default LoginModule;
