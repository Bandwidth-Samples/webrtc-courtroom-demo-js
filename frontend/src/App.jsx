import React from "react";

import "./App.css";
import Session from "./components/session";

// managing state is a real problem.
// I will try exposing the critical webRTC state at the top level when created as a result
// of actions deeper in the component tree.  This might suck.  It might also
// create two sets of state information - one at the app level and one at the
// component level - we will just have to see

function App() {
  let sessionId, participantId, token;

  // const updateSessionStateInfo = (sessionState) => {
  //   sessionId = sessionState.sessionId;
  //   participantId = sessionState.participantId;
  //   token = sessionState.token;
  //   console.log("high level data: ", sessionId, participantId, token);
  // };

  return (
    <div className="container">
      <h1>Configurable Topology Session</h1>
      <br />
      <Session />
    </div>
  );
}

export default App;
