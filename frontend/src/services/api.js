import axios from "axios";
import { serverUrl } from "../config.json";

async function getToken(role) {
  console.log("Fetching token from server");
  let res = {};
  try {
    res = await axios.post(`${serverUrl}/startBrowserCall?role=${role}`);

    // console.log("result", res);
    if (res.status === 200) {
      // return the important token elements
      const json = res.data;
      // console.log("Token result is...", json);
      return {
        sessionId: json.session_id,
        participantId: json.participant_id,
        token: json.token,
      };
    } else {
      console.log(res);
      alert("Failed to set you up as a participant: " + res.status);
    }
  } catch (error) {
    console.log(`failed to setup browser on fetch ${error}`);
  }
}

async function setRoomTopology(roomTopology, participant_id) {
  console.log(`about to change to '${roomTopology}' for ${participant_id}`);
  try {
    let roomTopologyUrl =
      "/roomTopology?participant=" + participant_id + "&state=" + roomTopology;
    // console.log("barge URL >>>", roomTopologyUrl);
    var res = await fetch(roomTopologyUrl);
    // console.log(`updating action link to '${roomTopology}'`);
    return true;
  } catch (error) {
    console.log(`failed to change room state ${error}`);
    return false;
  }
}

async function callPSTN(telNo, participantId) {
  // prevent double clicks

  if (!telNo.match(/^[2-9][0-9]{9}$/)) {
    document.getElementById("telno").value = "feed me a TN";
    alert("invalid TN: " + telNo);
    return false;
  }

  // console.log("About to make a call");

  let destUrl =
    "/startPSTNCall" +
    "?participant=" +
    participantId +
    "&destinationTn=" +
    telNo;
  // console.log("to: " + destUrl);

  let pstnRes = await axios.get(destUrl);

  // console.log("Make Call Result: ", pstnRes);

  if (pstnRes.status !== 200) {
    alert("Failed to set you up as a participant: " + pstnRes.status);
    return false;
  }
  return true;
}

export { getToken, setRoomTopology, callPSTN };
