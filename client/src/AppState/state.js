import { observable, action, computed, flow } from "mobx";
import { navigate } from "@reach/router";
import { fetchStatus } from "./fetchStatus";

class ApplicationState {
  @observable
  isAuth = false;
  @observable
  token = null;
  @observable
  userId = null;

  @action
  signupUser = flow(function*(requestBody) {
    fetchStatus.startFetching();
    let request = new Request(`/api/signup`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });
    const response = yield fetchStatus.fetchAndVerifyResponse(request);
    if (!response) return;
    const data = yield response.json();
    console.log("data:", data);
    fetchStatus.fetchStop();
    if (data.success) {
      navigate(`/login`);
    }
  });

  // @action
  // getTest = flow(
  //   function*() {
  //     fetchStatus.startFetching();
  //     let request = new Request(`/api/test`, {
  //       method: "GET",
  //       headers: {
  //         Accept: "application/json",
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${this.token || ""}`
  //       }
  //     });
  //     const response = yield fetchStatus.fetchAndVerifyResponse(request);
  //     if (!response) return;
  //     const data = yield response.json();
  //     console.log("data:", data);
  //     fetchStatus.fetchStop();
  //     if (data.success) {
  //       navigate(`/login`);
  //     }
  //   }.bind(this)
  // );
  @action
  loginUser = flow(function*(requestBody) {
    fetchStatus.startFetching();
    let token = "test";
    let request = new Request(`/api/login`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });
    const response = yield fetchStatus.fetchAndVerifyResponse(request);
    if (!response) return;
    const data = yield response.json();
    console.log("data:", data.body);
    fetchStatus.fetchStop();
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
  };
  @computed
  get postsFormatted() {
    return this.posts;
  }
  convertPosts = data =>
    data.map(el => `User: ${el.id} wrote this: ${el.title}`);
}

export const appState = new ApplicationState();
