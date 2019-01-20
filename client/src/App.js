import React from "react";
import ReactDOM from "react-dom";
import 'semantic-ui-css/semantic.min.css'
import MainPage from "./containers/MainPage";

class App extends React.Component {
  fetchTest = async ()=>{
    const res = await fetch("/api/test");
  }
  render() {
    return (
     <MainPage />
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
