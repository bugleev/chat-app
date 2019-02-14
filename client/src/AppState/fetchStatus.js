import { observable, action, computed, flow } from "mobx";

class FetchStatus {
  constructor() {
    this.fetchAndVerifyResponse = this.fetchAndVerifyResponse.bind(this);
  }
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
  @action
  fetchAndVerifyResponse = flow(function*(request) {
    try {
      const response = yield fetch(request);
      if (!response.ok) {
        const error = yield response.json();
        process.env.NODE_ENV === "development" && console.log(error);
        this.fetchStop();
        this.fetchError(`Status: ${error.status}. Message: ${error.message}`);
        return false;
      } else {
        return response;
      }
    } catch (error) {
      this.fetchError(
        `Ошибка сети! Нет соединения с сервером. Message: ${error.message}`
      );
    }
  });
  @action
  fetchError = text => {
    this.isFetching = false;
    this.fetchSuccess = false;
    this.errorMessage = text;
  };

  @computed
  get showSuccessMessage() {
    return this.fetchSuccess ? "Успешно" : null;
  }
  @action
  runWithTryCatch = (
    func,
    argsArr,
    message = "Ошибка конвертации данных с сервера"
  ) => {
    try {
      return func(...argsArr);
    } catch (error) {
      this.fetchError(`${message}. \n Текст ошибки: ${error}`);
    }
    return null;
  };
}

export const fetchStatus = new FetchStatus();
