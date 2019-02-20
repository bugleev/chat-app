import { observable, action, computed, flow } from "mobx";
import { navigate } from "@reach/router";
import { fetchState } from "./fetchState";

class AuthorizationState {
  constructor() {
    // get data from local storage on startup
    const token = localStorage.getItem("token");
    const expiryDate = localStorage.getItem("expiryDate");
    if (!token || !expiryDate) {
      return;
    }
    if (new Date(expiryDate) <= new Date()) {
      this.logoutHandler();
      return;
    }
    const userId = localStorage.getItem("userId");
    const remainingMilliseconds =
      new Date(expiryDate).getTime() - new Date().getTime();
    this.setLoginDetails({ token, id: userId });
    this.setAutoLogout(remainingMilliseconds);
  }
  @observable
  isAuth = false;
  @observable
  token = null;
  @observable
  userId = null;
  @observable
  resetAllowed = false;

  @action
  signupUser = flow(function*(requestBody) {
    fetchState.startFetching();
    let request = new Request(`/api/signup`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });
    const response = yield fetchState.fetchAndVerifyResponse(request);
    if (!response) return;
    const data = yield response.json();
    console.log("data:", data);
    fetchState.fetchStop();
    if (data.success) {
      navigate(`/login`);
    }
  });

  // @action
  // getTest = flow(
  //   function*() {
  //     fetchState.startFetching();
  //     let request = new Request(`/api/test`, {
  //       method: "GET",
  //       headers: {
  //         Accept: "application/json",
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${this.token || ""}`
  //       }
  //     });
  //     const response = yield fetchState.fetchAndVerifyResponse(request);
  //     if (!response) return;
  //     const data = yield response.json();
  //     console.log("data:", data);
  //     fetchState.fetchStop();
  //     if (data.success) {
  //       navigate(`/login`);
  //     }
  //   }.bind(this)
  // );
  @action
  loginUser = flow(function*(requestBody) {
    fetchState.startFetching();
    let request = new Request(`/api/login`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });
    const response = yield fetchState.fetchAndVerifyResponse(request);
    if (!response) return;
    const data = yield response.json();
    console.log("data:", data.body);
    fetchState.fetchStop();
    if (data.success) {
      localStorage.setItem("token", data.body.token);
      localStorage.setItem("userId", data.body.id);
      const remainingMilliseconds = 60 * 60 * 1000;
      const expiryDate = new Date(new Date().getTime() + remainingMilliseconds);
      localStorage.setItem("expiryDate", expiryDate.toISOString());
      this.setAutoLogout(remainingMilliseconds);
      this.setLoginDetails({ token: data.body.token, id: data.body.id });
      navigate(`/`);
    }
  });
  @action
  requestPasswordReset = flow(function*(requestBody) {
    fetchState.startFetching();
    let request = new Request(`/api/forgot-password`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });
    const response = yield fetchState.fetchAndVerifyResponse(request);
    if (!response) return;
    const data = yield response.json();
    console.log("data:", data.body);
    yield fetchState.fetchError("Reset token was sent to your email");
    yield fetchState.fetchStop();
  });
  @action
  verifyResetToken = flow(function*(requestBody) {
    fetchState.startFetching();
    let request = new Request(`/api/reset-password/token`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });
    const response = yield fetchState.fetchAndVerifyResponse(request);
    if (!response) {
      this.resetAllowed = false;
      yield navigate(`/reset`);
      return;
    }
    const data = yield response.json();
    this.resetAllowed = true;
    this.userId = data.body.id;
    yield navigate(`/reset`);
    yield fetchState.fetchStop();
  });

  @action
  resetPassword = flow(function*(requestBody) {
    fetchState.startFetching();
    requestBody.userId = this.userId;
    let request = new Request(`/api/reset-password`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });
    const response = yield fetchState.fetchAndVerifyResponse(request);
    if (!response) return;
    const data = yield response.json();
    this.resetAllowed = false;
    yield navigate(`/login`);
    yield fetchState.fetchError(data.body.message);
    yield fetchState.fetchStop();
  });

  @action
  setLoginDetails = ({ token, id }) => {
    this.isAuth = true;
    this.token = token;
    this.userId = id;
  };
  @action
  setAutoLogout = milliseconds => {
    setTimeout(() => {
      this.logoutHandler();
    }, milliseconds);
  };
  @action
  logoutHandler = () => {
    this.isAuth = false;
    this.token = null;
    this.userId = null;
    localStorage.removeItem("token");
    localStorage.removeItem("expiryDate");
    localStorage.removeItem("userId");
    navigate(`/login`);
  };
  @computed
  get postsFormatted() {
    return this.posts;
  }
}

export const authState = new AuthorizationState();
