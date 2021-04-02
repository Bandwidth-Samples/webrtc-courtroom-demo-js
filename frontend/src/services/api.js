import axios from "axios";
import { serverUrl } from "../config.json";

async function getToken(role) {
  console.log("Fetching token from server");
  let res = {};
  try {
    res = await axios.post(`${serverUrl}/startBrowserCall?role=${role}`);
    // var res = await fetch(
    //   "/startBrowserCall?role=" + document.getElementById("role").value,
    //   {
    //     method: "POST",
    //   }
    // );
    console.log("result", res);
    if (res.status === 200) {
      // return the important token elements
      const json = res.data;
      console.log("Token result is...", json);
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

  // basic error handling
  //   if (res.status !== 200) {
  //     console.log(res);
  //     alert("Failed to set you up as a participant: " + res.status);
  //   } else {
  // const json = await res.json();
  // console.log(json);
  // // set some data to make debugging and understanding
  // sessionEl = document.getElementById("session_id");
  // sessionEl.innerText = json.session_id;
  // participant_id = json.participant_id;
  // partEl = document.getElementById("participant_id");
  // partEl.innerText = participant_id;
  // // set the barge link
  // if (document.getElementById("role").value == "judge") {
  //   // manageBargeLink("barge");
  //   addResetRoomStateElements("inSession");
  // }
  // startStreaming(json.token);
  // // add a mute button
  // enableMuteButton();
}

export { getToken };
