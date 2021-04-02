import React from "react";
import Selections from "./selections";

const ThreePartSelector = ({
  label,
  id,
  value,
  explanation,
  disable,
  selections,
  ids,
  onChange,
}) => {
  const explanationId = label + "Explainer";
  console.log(
    label,
    ":",
    id,
    ":",
    explanation,
    ":",
    value,
    ":",
    selections,
    " : ",
    ids
  );
  const selectionNamesArray = selections.split(",");
  const selectionIdArray = ids.split(",");
  const selectionsArray = [];
  for (let selection in selectionIdArray) {
    selectionsArray[selection] = {
      id: selectionIdArray[selection],
      label: selectionNamesArray[selection],
    };
  }
  console.log("Selections Array", selectionsArray);
  return (
    <div className="row g-3 align-items-center">
      <div className="col-2">
        <label className="col-form-label">{label}</label>
      </div>
      <div className="col-4">
        {Selections({
          id,
          value,
          disableSelection: disable === "true",
          onChange,
          items: selectionsArray,
        })}
      </div>
      <div className="col-6">
        <span id={explanationId} className="form-text">
          {explanation}
        </span>
      </div>
    </div>
  );
};

export default ThreePartSelector;
