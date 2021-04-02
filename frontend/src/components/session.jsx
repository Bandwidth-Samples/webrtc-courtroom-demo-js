import React, { Component } from "react";
import SessionInfo from "./sessionInfo";
import { getToken } from "../services/api";
import Role from "./role";

class Session extends Component {
  state = {
    status: "",
    session: "",
    participant: "",
    role: "",
    token: "",
    micOn: false,
  };

  async componentDidMount() {
    this.setState({ data: "pick" });
  }

  updateRole = async (role) => {
    console.log("role is:", role.target.value);
    this.setState({ role: role.target.value });
    // const {
    //   sessionId: session,
    //   participantId: participant,
    //   token: token,
    // } = await getToken(role.target.value);
    const sessionStateInfo = await getToken(role.target.value);
    console.log("just before setState: ", sessionStateInfo);
    this.setState({
      session: sessionStateInfo.sessionId,
      participant: sessionStateInfo.participantId,
      token: sessionStateInfo.token,
    });
    console.log("just before reflectSessionState: ", sessionStateInfo);
    this.props.reflectSessionState(sessionStateInfo);
  };

  render() {
    return (
      <React.Fragment>
        <SessionInfo
          participantId={this.state.participant}
          sessionId={this.state.session}
        />
        <Role currentRole={this.state.role} updateRole={this.updateRole} />
      </React.Fragment>
    );
  }
}

export default Session;
