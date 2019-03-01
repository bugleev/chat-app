import { observable, action, computed, flow } from "mobx";
import { navigate } from "@reach/router";
import { socketState } from "./socketState";
import { fetchState } from "./fetchState";

const COLORS = [
  "#e21400",
  "#91580f",
  "#f8a700",
  "#f78b00",
  "#58dc00",
  "#287b00",
  "#a8f07a",
  "#4ae8c4",
  "#3b88eb",
  "#3824aa",
  "#a700ff",
  "#d300e7"
];

// Gets the color of a username through hash function
const getUsernameColor = username => {
  // Compute hash code
  let hash = 7;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + (hash << 5) - hash;
  }
  // Calculate color
  const index = Math.abs(hash % COLORS.length);
  return COLORS[index];
};

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
    const username = localStorage.getItem("username");
    const color = localStorage.getItem("color");
    const remainingMilliseconds =
      new Date(expiryDate).getTime() - new Date().getTime();
    this.setLoginDetails({ token, id: userId, username, color });
    this.setAutoLogout(remainingMilliseconds);
    socketState.connectSocket();
    socketState.joinRoom(null, this.username);
  }
  @observable
  isAuth = false;
  @observable
  token = null;
  @observable
  userId = null;
  @observable
  username = null;
  @observable
  color = "#23074d";
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

  //     let request = new Request(`/api/test`, {
  //       method: "GET",
  //       headers: {
  //         Accept: "application/json",
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${this.token || ""}`
  //       }
  //     });

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
      localStorage.setItem("userId", data.body.id);
      localStorage.setItem("username", data.body.username);
      const remainingMilliseconds = 60 * 60 * 1000;
      const expiryDate = new Date();
      const color = getUsernameColor(data.body.username);
      localStorage.setItem("color", color);
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      localStorage.setItem("expiryDate", expiryDate.toISOString());
      this.setAutoLogout(remainingMilliseconds);
      this.setLoginDetails({
        token: data.body.token,
        id: data.body.id,
        username: data.body.username,
        color
      });
      navigate(`/`);
      socketState.connectSocket();
      socketState.joinRoom(null, this.username);
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
  setLoginDetails = ({ token, id, username, color }) => {
    this.isAuth = true;
    this.token = token;
    this.userId = id;
    this.username = username;
    this.color = color || "#23074d";
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
    this.userId = null;
    localStorage.removeItem("token");
    localStorage.removeItem("expiryDate");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("color");
    navigate(`/login`);
  };
  @computed
  get postsFormatted() {
    return this.posts;
  }
}

export const authState = new AuthorizationState();
