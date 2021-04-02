import React from "react";
import ThreePartLabel from "./threePartLabel";

const SessionInfo = (props) => {
  console.log("in sessionInfo:", props);
  return (
    <form>
      <ThreePartLabel
        label="Session"
        id="sessionId"
        explanation="The session that all participants are in."
        value={props.sessionId}
      />
      <ThreePartLabel
        label="Participant"
        id="participantId"
        explanation="This is you."
        value={props.participantId}
      />
    </form>
  );
};

export default SessionInfo;
