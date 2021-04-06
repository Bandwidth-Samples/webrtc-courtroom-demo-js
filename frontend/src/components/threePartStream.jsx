import React from "react";
import StreamAudio from "./streamAudio";
import StreamMeter from "./streamMeter";

const threePartLabel = ({ id, explanation, remoteStream }) => {
  // TODO this has to change when we have multiples of them ???
  console.log("three part label:", id, explanation, remoteStream);
  const explanationId = "StreamExplainer";
  return (
    <div className="row g-3 align-items-center">
      <div className="col-2">
        <label className="col-form-label">Stream</label>
      </div>
      <div className="col-4">
        <label id={id}> {remoteStream.endpointId}</label>
        <StreamAudio mediaStream={remoteStream.mediaStream} />
        <StreamMeter width="300" mediaStream={remoteStream.mediaStream} />
      </div>
      <div className="col-6">
        <span id={explanationId} className="form-text">
          {explanation}
        </span>
      </div>
    </div>
  );
};

export default threePartLabel;
