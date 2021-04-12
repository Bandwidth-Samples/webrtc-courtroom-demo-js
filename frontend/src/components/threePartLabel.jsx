import React from "react";

const threePartLabel = ({ label, id, explanation, readOnly, value }) => {
  const explanationId = label + "Explainer";
  return (
    <div className="row g-3 align-items-center border">
      <div className="col-2">
        <label className="col-form-label">{label}</label>
      </div>
      <div className="col-4">
        <label id={id}> {value} </label>
      </div>
      <div className="col-6">
        <span id={explanationId} className="form-text">
          {explanation}
        </span>
      </div>
    </div>
  );
};

export default threePartLabel;
