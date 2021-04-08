import React, { useState, useEffect } from "react";
import ThreePartStream from "./threePartStream";
import StreamAudio from "./streamAudio";
import StreamMeter from "./streamMeter";

const Stream = (props) => {
  console.log("In Stream: ", props);
  if (!props) return;
  return (
    <div className="row g-3 align-items-center border">
      <div className="col-2">
        <label className="col-form-label">Stream</label>
      </div>
      <div className="col-4">
        <label id={props.remoteStream.endpointId}>
          {" "}
          {props.remoteStream.endpointId}
        </label>
        <StreamAudio mediaStream={props.remoteStream.mediaStream} />
        <StreamMeter width="300" mediaStream={props.remoteStream.mediaStream} />
      </div>
      <div className="col-6">
        <span className="form-text">This is audio from the other guy</span>
      </div>
    </div>
  );
};

export default Stream;
