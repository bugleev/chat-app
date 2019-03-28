import React, { Component } from "react";
import { MdLock, MdPerson, MdEmail } from "react-icons/md";
import BeatLoader from "react-spinners/BeatLoader";
import { observer } from "mobx-react";
import chatStyles from "../styles/Chat.module.sass";
import { formState, fetchState } from "../appState";

@observer
class SignupModule extends Component {
  formState = new formState();
  render() {
    const formState = this.formState;
    const formErrors = Object.keys(formState.signupForm.$)
      .map(el => formState[el].error)
      .filter(Boolean);
    const showError = formState.signupForm.error;
    return (
      <React.Fragment>
        <h2>srv chat</h2>
        <div className={chatStyles.loginWrapper}>
          {fetchState.errorMessage ? (
            <div className={chatStyles.loginErrorWrapper}>
              {fetchState.errorMessage}
            </div>
          ) : null}
          <h4 className="">Signup</h4>
          <h5>Provide credentials and start chatting!</h5>
          <form
            action="POST"
            onSubmit={e => formState.onSubmit(e, "signupForm")}
          >
            <div
              className={`${chatStyles.formField} ${
                formState.username.error ? chatStyles.error : ""
              }`}
            >
              <span>
                <MdPerson />
              </span>
              <input
                type="text"
                value={formState.username.value}
                onChange={e => formState.username.onChange(e.target.value)}
                placeholder="username"
              />
            </div>
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
                formState.signupPassword.error ? chatStyles.error : ""
              }`}
            >
              <span>
                <MdLock />
              </span>
              <input
                type="password"
                value={formState.signupPassword.value}
                onChange={e =>
                  formState.signupPassword.onChange(e.target.value)
                }
                placeholder="password"
              />
            </div>
            <button
              className={chatStyles.loginButton}
              style={{
                background: fetchState.isFetching ? "#380b7c" : undefined
              }}
            >
              {" "}
              {fetchState.isFetching ? (
                <BeatLoader
                  sizeUnit={"px"}
                  size={12}
                  color={"#faf9fa"}
                  loading={fetchState.isFetching}
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
