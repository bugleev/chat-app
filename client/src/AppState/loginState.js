import { FormState, FieldState } from "formstate";
import { appState } from "./state";

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

export class LoginState {
  // Create a field
  username = new FieldState("").validators(required("username"));
  email = new FieldState("").validators(required("email"), email);
  signupPassword = new FieldState("").validators(
    required("password"),
    lengthCheck,
    anyUppercase,
    anyDigit
  );
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

  clearForm = () => {
    //this.loginForm.reset();
  };
  onSubmit = async (e, form) => {
    e.preventDefault();
    //  Validate all fields
    const res = await this[form].validate();
    // If any errors you would know
    if (res.hasError) {
      console.log(this[form].error);
      return;
    }
    // Yay .. all good. Do what you want with it
    if (form === "signupForm") {
      appState.signupUser({
        name: this.username.$,
        email: this.email.$,
        password: this.signupPassword.$
      });
    } else {
      appState.loginUser({
        email: this.email.$,
        password: this.loginPassword.$
      });
    }
    this.clearForm(); // Validated value!
  };
}
