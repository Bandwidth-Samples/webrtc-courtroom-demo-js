import React, { useState, useEffect } from "react";

const StreamAudio = (mediaStream) => {
  console.log("in StreamAudio: ", mediaStream);

  const [audio] = useState(mediaStream);

  const setTheSrcObject = (audioElement) => {
    console.log("audioElement: ", audioElement, audio.mediaStream);
    try {
      if (
        audioElement &&
        audio &&
        audioElement.srcObject !== audio.mediaStream
      ) {
        console.log("setting srcObject");
        // Set the video element's source object to the WebRTC MediaStream
        audioElement.srcObject = audio.mediaStream;
      }
    } catch (ex) {
      console.log("failure to set HTML element", ex);
    }
  };

  return (
    <div>
      <audio autoPlay style={{ display: "none" }} ref={setTheSrcObject}></audio>
    </div>
  );
};

export default StreamAudio;
