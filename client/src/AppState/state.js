import { observable, action, computed, flow } from "mobx";
import { fetchStatus } from "./fetchStatus";
import { ENDPOINT } from "../../config";

class ApplicationState {
  constructor() {
    this.fetchPosts = this.fetchPosts.bind(this);
  }
  @observable
  posts = [];

  @action
  clearPosts = () => {
    this.posts = [];
  };
  @action
  fetchPosts = flow(function*() {
    this.clearPosts();
    fetchStatus.startFetching();
    const response = yield fetchStatus.fetchAndVerifyResponse(
      "https://jsonplaceholder.typicode.com/posts"
    );
    if (!response) return;
    const data = yield response.json();
    const formatted = fetchStatus.runWithTryCatch(this.convertPosts, [data]);
    if (!formatted) return;
    this.posts = formatted;
    fetchStatus.fetchStop();
  });
  @action
  loginUser = flow(function*(requestBody) {
    fetchStatus.startFetching();
    let request = new Request(`${ENDPOINT}/login`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });
    const response = yield fetchStatus.fetchAndVerifyResponse(request);
    if (!response) return;
    const data = yield response.text();
    fetchStatus.fetchStop();
  });
  @computed
  get postsFormatted() {
    return this.posts;
  }
  convertPosts = data =>
    data.map(el => `User: ${el.id} wrote this: ${el.title}`);
}

export const appState = new ApplicationState();
