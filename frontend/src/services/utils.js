async function startStreaming(token, bandwidthRtc) {
  console.log("connecting to BAND WebRTC server");
  // Connect to Bandwidth WebRTC

  await bandwidthRtc.connect({ deviceToken: token });
  console.log("connected to bandwidth webrtc!");
  // Publish the browser's microphone
  let streamResp = await bandwidthRtc.publish({
    audio: true,
    video: false,
  });
  console.log("streamResp: ", streamResp);
  let my_audio_stream = streamResp.mediaStream;
  my_audio_stream.getAudioTracks()[0].enabled = false;
  console.log("browser mic is streaming with stream:");
  console.log(my_audio_stream);
  return my_audio_stream;
}

function muteFlip({ audioStream, micState }) {
  console.log("in muteflip", micState);
  console.log(audioStream);
  if (audioStream && audioStream.getAudioTracks)
    audioStream.getAudioTracks()[0].enabled = micState;
}

export { muteFlip, startStreaming };
