import React, { Component } from "react";
import SessionInfo from "./sessionInfo";
import Stream from "./stream";
import { callPSTN, getToken, setRoomTopology } from "../services/api";
import { muteFlip, startStreaming } from "../services/utils";
import Role from "./role";
import Room from "./room";
import PhoneCall from "./phoneCall";
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
    roomState: "",
    calledNumber: "", // TODO - really needed ?
  };

  async componentDidMount() {
    // initialization on initial page load
    this.setState({ role: "pick", remoteStreams: [] });

    // This event will fire any time a new stream is sent to us
    bandwidthRtc.onStreamAvailable((rtcStream) => {
      console.log("now receiving far end audio");
      // console.log("New stream established:", rtcStream);
      this.addRemoteStream(rtcStream);
    });

    // This event will fire any time a stream is no longer being sent to us
    bandwidthRtc.onStreamUnavailable((endpointId) => {
      // console.log("stream discontinued from ",endpointId);
      this.removeRemoteStream(endpointId);
    });
  }

  addRemoteStream = (stream) => {
    console.log("adding a remote stream: ", stream);
    const newStreams = [...this.state.remoteStreams, stream];
    // console.log("the new streams are...", newStreams);
    this.setState({ remoteStreams: newStreams });
  };

  removeRemoteStream = (endpointId) => {
    console.log("removing a remote stream: ", endpointId);
    const oldStreams = [...this.state.remoteStreams];
    const newStreams = oldStreams.filter((item) => {
      return item.endpointId != endpointId;
    });
    this.setState({ remoteStreams: newStreams });
  };

  doRoomUpdate = async (room) => {
    if (this.state.roomState !== room.target.value) {
      console.log("updating the room configuration to...", room);
      if (await setRoomTopology(room.target.value, this.state.participant)) {
        this.setState({ roomState: room.target.value });
      } else {
        console.log("failed to change the room state");
      }
    }
  };

  updateRole = async (role) => {
    // changing the role to something from nothing kicks everything off.

    let newRole = role.target.value;
    // console.log("role is:", newRole);
    const sessionStateInfo = await getToken(role.target.value);
    // console.log("just before setState: ", sessionStateInfo);
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
    // console.log("this.state:", this.state);
  };

  makeCall = async (telephoneNumber) => {
    console.log(`Adding ${telephoneNumber} to the session`);
    const callInProgress = await callPSTN(
      telephoneNumber,
      this.state.participant
    );
    if (callInProgress) {
      alert(`A ${this.state.role} has been invited to the room`);
      // this.setState({ calledNumber: "" });  // TODO - validate that this can be removed
    } else {
      alert(`Attempt to invite a ${this.state.role} has failed`);
    }
  };

  render() {
    // console.log("in render", this.state);
    return (
      <React.Fragment>
        <Role currentRole={this.state.role} updateRole={this.updateRole} />
        <SessionInfo
          participantId={this.state.participant}
          sessionId={this.state.session}
        />
        {this.state.role === "judge" ? (
          <Room currentRole="inPrep" updateRoom={this.doRoomUpdate} />
        ) : null}
        <Microphone
          initialMicState={false}
          audioStream={this.state.myAudioStream}
        />
        {this.state.session !== "" ? (
          <PhoneCall
            calledNumber={this.state.calledNumber}
            placeCall={this.makeCall}
          />
        ) : null}
        {this.state.remoteStreams.map((item) => {
          // console.log("displaying stream: ", item);
          return <Stream remoteStream={item} />;
        })}
      </React.Fragment>
    );
  }
}

export default Session;
