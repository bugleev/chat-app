import { observable, action, computed, flow } from "mobx";
import { navigate } from "@reach/router";
import { socketState } from "./socketState";
import { fetchState } from "./fetchState";

class AuthorizationState {
  constructor() {
    // get data from local storage on startup
    this.readUserFromLocalStorage();
  }
  @observable
  isAuth = false;
  @observable
  token = null;
  @observable
  username = null;
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
    fetchState.fetchStop();
    if (data.success) {
      navigate(`/login`);
    }
  });

  @action
  readUserFromLocalStorage = () => {
    const token = localStorage.getItem("token");
    const expiryDate = localStorage.getItem("expiryDate");
    if (!token || !expiryDate) {
      return;
    }
    if (new Date(expiryDate) <= new Date()) {
      this.logoutHandler();
      return;
    }
    const username = localStorage.getItem("username");
    const remainingMilliseconds =
      new Date(expiryDate).getTime() - new Date().getTime();
    this.setLoginDetails({ token, username });
    this.setAutoLogout(remainingMilliseconds);
    socketState.connectSocket(this.token, this.username);
  };

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
    fetchState.fetchStop();
    if (data.success) {
      localStorage.setItem("token", data.body.token);
      localStorage.setItem("username", data.body.username);
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      const remainingMilliseconds =
        new Date(expiryDate).getTime() - new Date().getTime();
      localStorage.setItem("expiryDate", expiryDate.toISOString());
      this.setAutoLogout(remainingMilliseconds);
      this.setLoginDetails({
        token: data.body.token,
        username: data.body.username
      });
      navigate(`/`);
      socketState.connectSocket(this.token, this.username);
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
    localStorage.setItem("reset_id", data.body.id);
    yield navigate(`/reset`);
    yield fetchState.fetchStop();
  });

  @action
  resetPassword = flow(function*(requestBody) {
    fetchState.startFetching();
    const id = localStorage.getItem("reset_id");
    if (!id) {
      fetchState.fetchError("reset token expired!");
      yield navigate(`/login`);
      return;
    }
    requestBody.userId = id;
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
    yield localStorage.removeItem("reset_id");
    yield fetchState.fetchError(data.body.message);
    yield fetchState.fetchStop();
  });

  @action
  setLoginDetails = ({ token, username }) => {
    this.isAuth = true;
    this.token = token;
    this.username = username;
  };
  @action
  setAutoLogout = milliseconds => {
    setTimeout(() => {
      this.logoutHandler();
    }, milliseconds);
  };
  @action
  logoutHandler = () => {
    socketState.disconnectSocket();
    this.isAuth = false;
    this.token = null;
    localStorage.removeItem("token");
    localStorage.removeItem("expiryDate");
    localStorage.removeItem("username");
    navigate(`/login`);
  };
  @computed
  get postsFormatted() {
    return this.posts;
  }
}

export const authState = new AuthorizationState();
