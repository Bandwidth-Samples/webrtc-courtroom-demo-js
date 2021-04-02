import React from "react";

import "./App.css";
import Session from "./components/session";
import Microphone from "./components/microphone";
import BandwidthRtc, { RtcStream } from "@bandwidth/webrtc-browser";

// managing state is a real problem.
// I will try exposing the critical webRTC state at the top level when created as a result
// of actions deeper in the component tree.  This might suck.  It might also
// create two sets of state information - one at the app level and one at the
// component level - we will just have to see

const bandwidthRtc = new BandwidthRtc();

function App() {
  let sessionId, participantId, token;

  const updateSessionStateInfo = (sessionState) => {
    sessionId = sessionState.sessionId;
    participantId = sessionState.participantId;
    token = sessionState.token;
    console.log("high level data: ", sessionId, participantId, token);
  };

  return (
    <div className="container">
      <h1>Configurable Topology Session</h1>
      <br />
      <Session reflectSessionState={updateSessionStateInfo} />
      {<Microphone micStateOn={false} />}
    </div>
  );
}

export default App;
