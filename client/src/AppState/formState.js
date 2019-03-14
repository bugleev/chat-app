import { FormState, FieldState } from "formstate";
import { authState, socketState } from "./";

const required = fieldName => value => {
  const error = `${fieldName} required!`;
  if (value == null || !value.trim()) {
    return error;
  }
  return null;
};
const email = value => {
  value = value.trim();
  // Src : http://emailregex.com/
  if (
    !/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g.exec(
      value
    )
  ) {
    return "Not a valid email address";
  }
  return null;
};
const lengthCheck = val =>
  val.length < 6 && "password must be at least 6 characters long!";
const anyUppercase = val =>
  !val.match(/[A-Z]/) &&
  "password must contain at least one uppercase character!";
const anyDigit = val =>
  !val.match(/\d/) && "password must contain at least one digit!";

export class formState {
  // Create a field
  username = new FieldState("").validators(required("username"));
  roomname = new FieldState("").validators(required("roomname"));
  email = new FieldState("").validators(required("email"), email);
  signupPassword = new FieldState("").validators(
    required("password"),
    lengthCheck,
    anyUppercase,
    anyDigit
  );
  resetPassword = new FieldState("").validators(
    required("password"),
    lengthCheck,
    anyUppercase,
    anyDigit
  );
  confirmResetPassword = new FieldState("").validators(required("password"));
  loginPassword = new FieldState("").validators(required("password"));

  // Compose fields into a form
  loginForm = new FormState({
    email: this.email,
    loginPassword: this.loginPassword
  });
  signupForm = new FormState({
    username: this.username,
    email: this.email,
    signupPassword: this.signupPassword
  });
  forgotPassForm = new FormState({
    email: this.email
  });
  resetPassForm = new FormState({
    resetPassword: this.resetPassword,
    confirmResetPassword: this.confirmResetPassword
  });
  createRoomForm = new FormState({
    roomname: this.roomname
  });

  clearForm = () => {
    this.loginForm.reset();
  };
  onSubmit = async (e, form) => {
    e.preventDefault();
    const res = await this[form].validate();
    if (res.hasError) {
      return;
    }
    switch (form) {
      case "signupForm":
        authState.signupUser({
          name: this.username.$,
          email: this.email.$,
          password: this.signupPassword.$
        });
        break;
      case "loginForm":
        authState.loginUser({
          email: this.email.$,
          password: this.loginPassword.$
        });
        break;
      case "forgotPassForm":
        authState.requestPasswordReset({
          email: this.email.$
        });
        break;
      case "resetPassForm":
        authState.resetPassword({
          password: this.resetPassword.$,
          confirmPassword: this.confirmResetPassword.$
        });
        break;
      case "createRoomForm":
        socketState.createRoom({
          room: this.roomname.$
        });
        break;

      default:
        this.clearForm();
        break;
    }
    this.clearForm();
  };
}
