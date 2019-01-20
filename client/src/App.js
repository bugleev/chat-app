import React from "react";
import ReactDOM from "react-dom";
import "./styles.css";

class App extends React.Component {
  fetchTest = async ()=>{
    const res = await fetch("/api/test");
  }
  render() {
    return (
      <div>
        <h1>This is testytree App</h1>
        <button onClick={this.fetchTest}>Click</button>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
