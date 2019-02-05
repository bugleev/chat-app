import React from "react";
import { render } from "react-dom";
import App from "./containers/App";
import { LeftSideProvider } from "./contexts/ContextStore";


function Root() {
  return (
    <LeftSideProvider >
      <App />
    </LeftSideProvider >

  )

}
render(<Root />, document.getElementById("root"));
