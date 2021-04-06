import React, { Component } from "react";
import SessionInfo from "./sessionInfo";
import Stream from "./stream";
import { getToken } from "../services/api";
import { muteFlip, startStreaming } from "../services/utils";
import Role from "./role";
import Microphone from "./microphone";
import BandwidthRtc, { RtcStream } from "@bandwidth/webrtc-browser";

const bandwidthRtc = new BandwidthRtc();

class Session extends Component {
  state = {
    status: "",
    session: "",
    participant: "",
    role: "",
    token: "",
    myAudioStream: "",
    remoteStream: "",
    micOn: false,
  };

  async componentDidMount() {
    console.log("setting the role in componentDidMount");
    this.setState({ role: "pick" });

    // This event will fire any time a new stream is sent to us
    bandwidthRtc.onStreamAvailable((rtcStream) => {
      console.log("now receiving far end audio");
      console.log(rtcStream);
      this.setRemoteStream(rtcStream);
    });

    // This event will fire any time a stream is no longer being sent to us
    bandwidthRtc.onStreamUnavailable((endpointId) => {
      console.log("stream discontinued from");
      console.log(endpointId);
      this.setRemoteStream(undefined);
    });
  }

  setRemoteStream = (stream) => {
    console.log("setting the remote stream: ", stream);
    this.setState({ remoteStream: stream });
  };

  updateRole = async (role) => {
    let myAudioStream;
    let newRole = role.target.value;
    console.log("role is:", newRole);
    const sessionStateInfo = await getToken(role.target.value);
    console.log("just before setState: ", sessionStateInfo);
    // this.props.reflectSessionState(sessionStateInfo);
    myAudioStream = await startStreaming(sessionStateInfo.token, bandwidthRtc);
    muteFlip({ audioStream: myAudioStream, micState: false });
    this.setState({
      role: newRole,
      session: sessionStateInfo.sessionId,
      participant: sessionStateInfo.participantId,
      token: sessionStateInfo.token,
      micOn: false,
      myAudioStream: myAudioStream,
    });
    console.log("this.state:", this.state);
  };

  renderStream = (state, props) => {
    if (this.state.remoteStream) {
      console.log("Rendering the Stream - state and props");
      console.log("state", state);
      console.log("props", props);
      return <Stream remoteStream={state.remoteStream} />;
    }
    return null;
  };

  render() {
    console.log("in render", this.state);
    return (
      <React.Fragment>
        <Role currentRole={this.state.role} updateRole={this.updateRole} />
        <SessionInfo
          participantId={this.state.participant}
          sessionId={this.state.session}
        />
        <Microphone
          initialMicState={false}
          audioStream={this.state.myAudioStream}
        />
        {this.renderStream(this.state, this.props)}
      </React.Fragment>
    );
  }
}

export default Session;
