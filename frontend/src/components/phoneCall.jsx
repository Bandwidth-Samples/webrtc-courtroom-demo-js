import React, { useState } from "react";

const PhoneCall = ({ calledNumber, placeCall }) => {
  const [tnValue, setValue] = useState(null);
  const [tnInvalid, setTnInvalid] = useState(true);
  const [telephoneNumber, setTN] = useState(calledNumber);

  const updateTn = (element) => {
    setValue(null);
    const invalid = !element.target.value.match(/^[2-9][0-9]{9}$/);
    setTnInvalid(invalid);
    setTN(element.target.value);
  };

  const handleButton = (element) => {
    setValue({ value: "" });
    setTnInvalid(true);
    placeCall(telephoneNumber);
    setTN("");
  };

  return (
    <form>
      <div className="row g-3 align-items-center border">
        <div className="col-2">
          <label className="col-form-label">Invite Someone</label>
        </div>

        <button
          type="button"
          className="col-1 btn btn-outline-primary"
          onClick={handleButton}
          disabled={tnInvalid}
        >
          {tnInvalid ? ">>>>" : "Invite"}
        </button>
        <input
          type="text"
          className="col-3 form-control"
          id="phoneNumber"
          placeholder="enter a phone number"
          onChange={updateTn}
          {...tnValue}
        />

        <div className="col-6">
          <span id="phoneCallExplanation" className="form-text">
            Control an outbound Phone Call
          </span>
        </div>
      </div>
    </form>
  );
};

export default PhoneCall;
