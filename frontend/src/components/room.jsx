import React, { Component } from "react";
import ThreePartSelector from "./threePartSelector";

class Room extends Component {
  render() {
    // console.log("room in the component", this.props.currentRoom);
    return (
      <form>
        <ThreePartSelector
          label="Room"
          id="roomId"
          disable={false}
          value={this.props.currentRoom}
          explanation="The configuration of the virtual room"
          selections="Preparation, In Session, InTervention"
          ids="inPrep,inSession,inTervention"
          onChange={this.props.updateRoom}
        />
      </form>
    );
  }
}

export default Room;
