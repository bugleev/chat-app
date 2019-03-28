import React, { Component } from "react";
import { MdLock, MdEmail } from "react-icons/md";
import BeatLoader from "react-spinners/BeatLoader";
import { observer, Provider, inject } from "mobx-react";
import chatStyles from "../styles/Chat.module.sass";
import { formState, fetchState, authState } from "../appState";

const SendEmailForm = inject("formState")(
  observer(({ formState }) => {
    const formErrors = Object.keys(formState.forgotPassForm.$)
      .map(el => formState[el].error)
      .filter(Boolean);
    const showError = formState.forgotPassForm.error;
    return (
      <form
        action="POST"
        onSubmit={e => formState.onSubmit(e, "forgotPassForm")}
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
            "Reset password"
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
    );
  })
);

const ResetPasswordForm = inject("formState")(
  observer(({ formState }) => {
    const formErrors = Object.keys(formState.resetPassForm.$)
      .map(el => formState[el].error)
      .filter(Boolean);
    const showError = formState.resetPassForm.error;
    return (
      <form
        action="POST"
        onSubmit={e => formState.onSubmit(e, "resetPassForm")}
      >
        <div
          className={`${chatStyles.formField} ${
            formState.resetPassword.error ? chatStyles.error : ""
          }`}
        >
          <span>
            <MdLock />
          </span>
          <input
            type="password"
            value={formState.resetPassword.value}
            onChange={e => formState.resetPassword.onChange(e.target.value)}
            placeholder="password"
          />
        </div>
        <div
          className={`${chatStyles.formField} ${
            formState.confirmResetPassword.error ? chatStyles.error : ""
          }`}
        >
          <span>
            <MdLock />
          </span>
          <input
            type="password"
            value={formState.confirmResetPassword.value}
            onChange={e =>
              formState.confirmResetPassword.onChange(e.target.value)
            }
            placeholder="confirm password"
          />
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
            "Reset password"
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
    );
  })
);

@observer
class ResetPasswordModule extends Component {
  formState = new formState();
  componentDidMount() {
    // check the * property of the route (it refers to params in 'route/:params')
    if (this.props["*"]) {
      authState.verifyResetToken({ token: this.props["*"] });
    }
  }
  render() {
    return (
      <React.Fragment>
        <h2>srv chat</h2>
        <div className={chatStyles.loginWrapper}>
          {fetchState.errorMessage ? (
            <div className={chatStyles.loginErrorWrapper}>
              {fetchState.errorMessage}
            </div>
          ) : null}
          <h4 className="">Password reset</h4>
          <h5>
            {authState.resetAllowed
              ? "Enter new password"
              : "Provide an email you registered with"}
          </h5>
          <Provider formState={this.formState}>
            {authState.resetAllowed ? (
              <ResetPasswordForm formState={this.formState} />
            ) : (
              <SendEmailForm formState={this.formState} />
            )}
          </Provider>
        </div>
      </React.Fragment>
    );
  }
}
export default ResetPasswordModule;
