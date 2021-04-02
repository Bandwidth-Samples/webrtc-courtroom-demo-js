import React, { Component } from "react";

class ThreePartInput extends Component {
  render() {
    return (
      <div className="row g-3 align-items-center">
        <div className="col-2">
          <label className="col-form-label">{label}</label>
        </div>
        <div className="col-4">
          <input
            id={id}
            readOnly={readOnly}
            className="form-control-plaintext"
            value={value}
            disable={true}
          />
        </div>
        <div className="col-6">
          <span id={explanationId} className="form-text">
            {explanation}
          </span>
        </div>
      </div>
    );
  }
}

export default ThreePartInput;
