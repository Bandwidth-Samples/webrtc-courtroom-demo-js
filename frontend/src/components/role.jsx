import React, { Component } from "react";
import ThreePartSelector from "./threePartSelector";

class Role extends Component {
  render() {
    console.log("role in the component", this.props.currentRole);
    const disable = this.props.currentRole !== "pick" ? "true" : "false";
    return (
      <form className="border">
        <ThreePartSelector
          label="Role"
          id="roleId"
          disable={disable}
          value={this.props.currentRole}
          explanation="The role that you play"
          selections="Pick one,Judge,Translator,LEP"
          ids="pick,judge,translator,LEP"
          onChange={this.props.updateRole}
        />
      </form>
    );
  }
}

export default Role;
