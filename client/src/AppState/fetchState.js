import { observable, action, computed, flow } from "mobx";

class fetchStatus {
  @observable
  isFetching = false;
  @observable
  fetchSuccess = false;
  @observable
  errorMessage = "";
  @action
  startFetching = () => {
    this.isFetching = true;
    this.fetchSuccess = false;
    this.errorMessage = "";
  };
  @action
  fetchStop = () => {
    this.isFetching = false;
    this.fetchSuccess = true;
  };
  @action.bound
  fetchAndVerifyResponse = flow(function*(request) {
    try {
      const response = yield fetch(request);
      if (!response.ok) {
        const error = yield response.json();
        process.env.NODE_ENV === "development" && console.log(error);
        this.fetchStop();
        this.fetchError(`${error.message}`);
        return false;
      } else {
        return response;
      }
    } catch (error) {
      this.fetchError(
        `Network error! No server connection. Message: ${error.message}`
      );
    }
  });
  @action
  fetchError = text => {
    console.log("text:", text);
    this.disposer();
    this.isFetching = false;
    this.fetchSuccess = false;
    this.errorMessage = text;
  };
  @action
  clearError = () => {
    this.isFetching = false;
    this.fetchSuccess = false;
    this.errorMessage = "";
  };
  // clear error
  disposer = () => {
    setTimeout(this.clearError, 3000);
  };

  @computed
  get showSuccessMessage() {
    return this.fetchSuccess ? "Success" : null;
  }
  @action
  runWithTryCatch = (
    func,
    argsArr,
    message = "Failed to convert data from the server"
  ) => {
    try {
      return func(...argsArr);
    } catch (error) {
      this.fetchError(`${message}. \n Error text: ${error}`);
    }
    return null;
  };
}

export const fetchState = new fetchStatus();
