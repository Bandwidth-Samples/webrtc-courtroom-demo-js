import React, { useState, useEffect } from "react";
import AudioIndicators from "./audioIndicators";
import { muteFlip, startStreaming } from "../services/utils";

const Microphone = (props) => {
  console.log("in Microphone:", props);
  const [MicOn, setMicOn] = useState(props.micStateOn);
  console.log("the mic: ", MicOn);

  const switchMute = () => {
    console.log("Flipping Mute: ", props.audioStream);
    if (props.audioStream) {
      muteFlip(props.audioStream);
    } else {
      console.log("Turning the mic off 'cause there's no Audio");
      setMicOn(false);
    }
  };

  return (
    <div className="row justify-content-center" onClick={switchMute}>
      {MicOn ? AudioIndicators.MicOn() : AudioIndicators.MicOff()}
    </div>
  );
};

export default Microphone;
