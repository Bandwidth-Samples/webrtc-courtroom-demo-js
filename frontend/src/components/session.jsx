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
    remoteStreams: [],
    micOn: false,
  };

  async componentDidMount() {
    console.log("setting the role in componentDidMount");
    this.setState({ role: "pick", remoteStreams: [] });

    // This event will fire any time a new stream is sent to us
    bandwidthRtc.onStreamAvailable((rtcStream) => {
      console.log("now receiving far end audio");
      console.log(rtcStream);
      this.addRemoteStream(rtcStream);
    });

    // This event will fire any time a stream is no longer being sent to us
    bandwidthRtc.onStreamUnavailable((endpointId) => {
      console.log("stream discontinued from");
      console.log(endpointId);
      this.removeRemoteStream(endpointId);
    });
  }

  addRemoteStream = (stream) => {
    console.log("adding a remote stream: ", stream);
    const newStreams = [...this.state.remoteStreams, stream];
    console.log("the new streams are...".newStreams);
    this.setState({ remoteStreams: newStreams });
  };

  removeRemoteStream = (endpointId) => {
    console.log("removing a remote stream: ", endpointId);
    const oldStreams = [...this.state.remoteStreams];
    console.log("the old streams are...".oldStreams);
    const newStreams = oldStreams.filter((item) => {
      return item.endpointId != endpointId;
    });
    console.log("the new streams are...".newStreams);
    this.setState({ remoteStreams: newStreams });
  };

  updateRole = async (role) => {
    // changing the role to something from nothing kicks everything off.

    let newRole = role.target.value;
    console.log("role is:", newRole);
    const sessionStateInfo = await getToken(role.target.value);
    console.log("just before setState: ", sessionStateInfo);
    let myAudioStream = await startStreaming(
      sessionStateInfo.token,
      bandwidthRtc
    );
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
        {this.state.remoteStreams.map((item) => {
          console.log("displaying stream: ", item);
          return <Stream remoteStream={item} />;
        })}
      </React.Fragment>
    );
  }
}

export default Session;
