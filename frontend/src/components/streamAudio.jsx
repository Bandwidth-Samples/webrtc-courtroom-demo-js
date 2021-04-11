import React, { useState, useEffect } from "react";

const StreamAudio = ({ mediaStream, streamId }) => {
  console.log("in StreamAudio: ", mediaStream, streamId);

  const [audio] = useState(mediaStream);

  const setTheSrcObject = (audioElement) => {
    console.log("audioElement: ", audioElement, audio);
    try {
      if (audioElement && audio && audioElement.srcObject !== audio) {
        console.log("setting srcObject");
        // Set the video element's source object to the WebRTC MediaStream
        audioElement.srcObject = audio;
      }
    } catch (ex) {
      console.log("failure to set HTML element", ex);
    }
  };

  return (
    <div>
      <audio
        autoPlay
        id={streamId}
        style={{ display: "none" }}
        ref={setTheSrcObject}
      ></audio>
    </div>
  );
};

export default StreamAudio;
