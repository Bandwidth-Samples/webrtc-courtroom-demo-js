import React, { useState } from "react";

const PhoneCall = ({ calledNumber, placeCall }) => {
  console.log("PhoneCall");

  console.log("1 - incall, tnInvalid", tnValue, tnInvalid, telephoneNumber);
  const [tnValue, setValue] = useState(null);
  const [tnInvalid, setTnInvalid] = useState(true);
  const [telephoneNumber, setTN] = useState(calledNumber);
  console.log("2 - incall, tnInvalid", tnValue, tnInvalid, telephoneNumber);

  const updateTn = (element) => {
    console.log("changed Telephone Number:", element.target.value, element);
    setValue(null);
    let invalid = !element.target.value.match(/^[2-9][0-9]{9}$/);
    setTnInvalid(invalid);
    setTN(element.target.value);
    console.log("disableCallButton", tnValue, invalid, telephoneNumber);
  };

  const handleButton = (element) => {
    console.log("pressed button:", telephoneNumber, element);
    setValue({ value: "" });
    setTnInvalid(true);
    setTN("");
    placeCall(telephoneNumber);
    console.log("after button:", tnValue, telephoneNumber, tnInvalid);
  };

  console.log("3 - incall, tnInvalid", tnValue, tnInvalid, telephoneNumber);

  return (
    <form className="border">
      <div className="row g-3 align-items-center">
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
