import React from "react";

const Selections = ({ id, value, disableSelection, onChange, items }) => {
  // console.log("Selections", { id, value, disableSelection, onChange, items });
  return (
    <select
      className="form-select"
      id={id}
      value={value}
      disabled={disableSelection}
      onChange={onChange}
    >
      {items.map((e) => {
        return (
          <option value={e.id} key={e.id}>
            {e.label}
          </option>
        );
      })}
    </select>
  );
};

export default Selections;
