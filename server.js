import express from "express";
import path from "path"
import bodyParser from "body-parser";
import BandwidthWebRTC from "@bandwidth/webrtc";
import BandwidthVoice from "@bandwidth/voice";
import { v1 as uuidv1 } from "uuid";
import dotenv from "dotenv";
import { roles, roomStates, getRolesToListenTo } from "./roomstate.js";

// TODO - clean up all resources on browser close and on SIGINT
// TODO - clean up the debug logging a bit

dotenv.config();

const app = express();
app.use(bodyParser.json());

// config
const DEBUG = true;
const port = 5000;
const accountId = process.env.ACCOUNT_ID;
const username = process.env.BAND_USERNAME;
const password = process.env.BAND_PASSWORD;

// Check to make sure required environment variables are set
if (!accountId || !username || !password) {
  console.error(
      "ERROR! Please set the ACCOUNT_ID, BAND_PASSWORD, and BW_PASSWORD environment variables before running this app"
  );
  process.exit(1);
}

/*
 * To use a non-production environment, update the following with custom URLs and values:
 * - The creation of the WebRTCClient below
 * - Any use of webRTCController.generateTransferBxml(), supply a custom sipUri value
 * - The websocketUrl supplied to BandwidthRtc.connect() (in frontend/src/services/utils.js)
 */

// Global variables
const httpServerUrl = process.env.WEBRTC_HTTP_SERVER_URL;

const {Client: WebRTCClient, ApiController: WebRTCController, Environment: Environment} = BandwidthWebRTC;
const webrtcClient = new WebRTCClient({
  basicAuthUserName: username,
  basicAuthPassword: password,
  // Uncomment to use a custom URL
  // environment: Environment.Custom,
  // baseUrl: httpServerUrl
});
const webRTCController = new WebRTCController(webrtcClient);

const {Client: VoiceClient, ApiController: VoiceController} = BandwidthVoice;
const voiceClient = new VoiceClient({
  basicAuthUserName: username,
  basicAuthPassword: password
});
const voiceController = new VoiceController(voiceClient);

// create a map of PSTN calls that will persist
const calls = new Map();

// create an Map of users
//  participant_id -> { role: role, participant_id: participant_id }
const users = new Map();

// track our session ID and phone call Id
//  - if not a demo, these would be stored in persistent storage
let sessionId = false;
let callId = false;    // TODO - get rid of this global 

const roleMap = { judge: [], translator: [], LEP: [] };
let currentRoomState = roomStates[0];

// let validRoles = ["employee", "manager", "guest"];
let validRoles = [...roles];

if (DEBUG) {
  console.log("\nroles and initial room state: ", validRoles, currentRoomState);
}

process.on("SIGINT", async function () {
  if (sessionId) {
    await webRTCController.deleteSession(
      accountId,
      sessionId,
      (error, response, context) => {
        if (error && error != 204) {
          console.log("failed to delete the session: ", sessionId);
          console.log(error, response, context);
        } else {
          console.log("deleted the session: ", sessionId);
        }
      }
    );
  }
  process.exit();
});

/**
 * Setup the call and pass info to the browser so they can join
 */
app.post("/startBrowserCall", async (req, res) => {
  console.log(`\n\n\nsetup browser client for role of: ${req.query.role}`);
  if (!validRoles.includes(req.query.role)) {
    console.log(`Bad role passed in :${req.query.role}`);
    res.status(400).send({ message: `${req.query.role} is not a valid role` });
    return;
  }

  try {
    // get/create the session
    let session_id = await getSessionId(accountId, "session-test");

    let [participant, token] = await createParticipant(accountId, uuidv1());

    await updateSubscriptions(
      accountId,
      participant.id,
      req.query.role,
      session_id,
      true
    );
    // now that we have added them to the session, we can send back the token they need to join
    res.send({
      message: "created particpant and setup session",
      token: token,
      session_id: session_id,
      participant_id: participant.id,
      role: req.query.role,
    });
  } catch (error) {
    console.log("Failed to start the browser call:", error);
    res.status(500).send({ message: "failed to set up participant" });
  }
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Demote a manager to an employee so they can speak to everyone
 */
app.get("/roomTopology", async (req, res) => {
  console.log(
    `\n\nparticipant # ${req.query.participant} set the new room state of: ${req.query.state}`
  );

  currentRoomState = req.query.state;

  let session_id = await getSessionId(accountId, "session-test");
  try {
    // in this model only the judge controls the session topology, and
    // as a result we can cheat on the role.
    await updateSubscriptions(
      accountId,
      req.query.participant,
      "judge",
      session_id,
      false
    );
  } catch (error) {
    console.log("Failed to get the room reassigned:", error);
    res.status(500).send({
      message: `failed to go to change state`,
    });
    return;
  }
  res.status(200).send();
});

/**
 * Start the Phone Call
 */
app.get("/startPSTNCall", async (req, res) => {
  console.log(
    `call from ${req.query.participant} to ${req.query.destinationTn}`
  );
  let { participant: initiatingParticipant, destinationTn } = req.query;
  // TODO - fix the hack by properly URLencoding the querystring.
  destinationTn = "+1" + destinationTn;

  try {
    await getSessionId();
    if (!initiatingParticipant || !destinationTn) throw "incomplete parameters";

    let [participant, token] = await createParticipant(
      accountId,
      destinationTn
    );

    console.log("start the PSTN call to", process.env.destinationTn);
    const callResponse = await initiateCallToPSTN(
      accountId,
      process.env.FROM_NUMBER,
      destinationTn
    );

    // store the token with the participant for later use
    participant.token = token;
    callId = callResponse.callId;

    console.log("stashing the phone call", callResponse.callId, participant);

    calls.set(callResponse.callId, {
      participant: participant,
      sponsorRole: users.get(initiatingParticipant).role,
    });

    console.log("Calls: ", calls);

    res.send({ status: "ringing" });
  } catch (error) {
    console.log("Failed to start PSTN call:", error);
    res.status(500).send({ message: "failed to set up PSTN call" });
  }
});

/**
 * Bandwidth's Voice API will hit this endpoint when an outgoing call is answered
 */
app.post("/callAnswered", async (req, res) => {
  console.log(
    `received answered callback for call ${callId} to ${req.body.to}`
  );
  console.log("call answered body", req.body);
  await getSessionId();

  const { participant, sponsorRole } = calls.get(callId);
  console.log(
    "updating the subscriptions for the phone call",
    callId,
    participant,
    sponsorRole
  );

  if (!participant) {
    console.log(`no participant found for ${callId}!`);
    res.status(200).send(); // have to return 200 to the BAND server
    return;
  }

  // update the list of users, and role map
  //  we are always adding a caller as a guest for now
  await updateSubscriptions(
    accountId,
    participant.id,
    sponsorRole,
    session_id,
    true
  );

  // This is the response payload that we will send back to the Voice API to transfer the call into the WebRTC session
  // Use the SDK to generate this BXML
  // ToDo: get the sessionId use out of here, maybe by placing it with "calls"
  console.log(`transferring call ${callId} to session ${sessionId}`);
  const bxml = webRTCController.generateTransferBxml(participant.token, callId);

  console.log("BXML", bxml);

  // Send the payload back to the Voice API
  res.contentType("application/xml").send(bxml);
  console.log("transferred");
});

/**
 * End the Phone Call
 */
app.get("/endPSTNCall", async (req, res) => {
  console.log("Hanging up PSTN call");
  try {
    await getSessionId();

    await endCallToPSTN(accountId, callId);
    res.send({ status: "hungup" });
  } catch (error) {
    console.log(
      `error hanging up ${process.env.OUTBOUND_PHONE_NUMBER}:`,
      error
    );
    res.status(500).send({ status: "call hangup failed" });
  }
});

/**
 * start our server
 */

if (DEBUG) console.log("dirname", path.resolve("frontend", "build"));
app.use(express.static(path.resolve("frontend", "build")));

app.get("/*", (req, res) => {
  res.sendFile(path.resolve("frontend", "build", "index.html"));
});

app.listen(port, () => {
  console.log(`Example app listening on port  http://localhost:${port}`);
});

// ------------------------------------------------------------------------------------------
// All the functions for interacting with Bandwidth WebRTC services below here
//
/**
 * @param session_id
 */
function saveSessionId(session_id) {
  // saved globally for simplicity of demo
  sessionId = session_id;
}
/**
 * Return the session id
 * This will either create one via the API, or return the one already created for this session
 * @param account_id
 * @param tag
 * @return a Session id
 */
async function getSessionId(account_id, tag) {
  // check if we've already created a session for this call
  //  - this is a simplification we're doing for this demo
  if (sessionId) {
    return sessionId;
  }

  console.log("No session found, creating one");
  // otherwise, create the session
  // tags are useful to audit or manage billing records
  const sessionBody = { tag: tag };

  console.log("sessionBody", accountId, sessionBody);

  try {
    let sessionResponse = await webRTCController.createSession(
      account_id,
      sessionBody
    );
    // saves it for future use, this would normally be stored with meeting/call/appt details
    saveSessionId(sessionResponse.result.id);
    console.log(`session id created: ${sessionResponse.result.id}`);
    return sessionResponse.result.id;
  } catch (error) {
    console.log("Failed to create session:", error);
    throw new Error(
      "Error in createSession, error from BAND:" + error.errorMessage
    );
  }
}

/**
 *  Create a new participant
 * @param account_id
 * @param tag to tag the participant with, no PII should be placed here
 * @return list: (a Participant json object, the participant token)
 */
async function createParticipant(account_id, tag) {
  // create a participant for this browser user
  const participantBody = {
    tag: tag,
    publishPermissions: ["AUDIO"],
  };

  try {
    let createResponse = await webRTCController.createParticipant(
      accountId,
      participantBody
    );

    return [createResponse.result.participant, createResponse.result.token];
  } catch (error) {
    console.log("failed to create Participant", error);
    throw new Error(
      "Failed to createParticipant, error from BAND:" + error.errorMessage
    );
  }
}

/**
 * Update the subscriptions for the session, when a new person is added we need to update all
 * subscriptions based on the role of the new person and the roles of those already in session
 * @param account_id The id for this account
 * @param participant_id the Participant who is subscribing
 * @param role the role of this participant, which dictates to whom they will be subscribed
 * @param session_id the session these participants are in
 * @param participant_is_new true if the participant in question is new
 */
async function updateSubscriptions(
  account_id,
  participant_id,
  role,
  session_id,
  participant_is_new
) {
  // update the list of users, and role map
  if (participant_is_new) addUserToList(participant_id, role);
  // console.log(`After push, userIdList is ${JSON.stringify(roleMap)}`);
  // console.log(`Also users is ${JSON.stringify(users)}`);

  // iterate through all users and update their subscriptions
  console.log("\nUpdating the Subscriptions");
  users.forEach(async function (user, p_id, u_map) {
    const jsonSubs = determineSubscriptions(user, session_id);
    if (DEBUG) {
      console.log("\nSubscriber Update request for ", user, "\nis\n", jsonSubs);
    }
    let body = jsonSubs;

    if (DEBUG) {
      // console.log("body is (1)", body);
    }

    // if the user (new or otherwise) has no participants,
    // don't subscribe them to the session, because it appears that
    // default subscription without a participant list means 'everybody'

    // TODO - resolve the semantics of the non-participant session
    // if (jsonSubs.participants.length === 0) return;
    if (jsonSubs.participants.length === 0) {
      // remove the participants list
      // body.participants = null;
      body = {};
    }

    if (DEBUG) {
      console.log(
        `\nUpdating subscriptions for user ${user.role} ${user.participant_id} to \n${JSON.stringify(body)}`
      );
      // console.log("body is (2)", body);
    }

    try {
      // first time we have to add, afterwards we update,
      //  so check if this iteration is for the user passed in
      if (user.new) {
        if (DEBUG) console.log("\nnew user to be added to session\n", user);
        users.set(user.participant_id, {
          participant_id: user.participant_id,
          role: user.role,
          new: false,
        });
        if (DEBUG) console.log("updated users list", users);
        // TODO - look at adding a null participant !!!!
        if (DEBUG) console.log("attempting to add participant to a session for the first time", account_id,
        session_id, user.participant_id, body);
        await webRTCController.addParticipantToSession(
          account_id,
          session_id,
          user.participant_id,
          body
        );
      } else {
        if (DEBUG) console.log("attempting to update subscription", account_id,
        session_id, user.participant_id, body);
        await webRTCController.updateParticipantSubscriptions(
          account_id,
          session_id,
          user.participant_id,
          body
        );
      }
    } catch (error) {
      console.log("Error on add/UpdateParticipant to Session:", error);
      throw new Error(
        "Failed to updateSubscriptions, error from BAND:" + error.errorMessage
      );
    }
  });
}

/**
 * Update our users Map and role Map
 * @param {*} participant_id The participant we are adding to the call
 * @param {*} role the role of the participant we are adding to the call
 */
function addUserToList(participant_id, role) {
  // is this user new?

  if (!users.has(participant_id)) {
    console.log(`setting up new ${role} user`);
    roleMap[role].push(participant_id);

    users.set(participant_id, {
      role: role,
      participant_id: participant_id,
      new: true,
    });
  } else {
    console.log("Updating an existing user (barge/whisper change)");
    // we need to update their role, if it has changed
    if (!roleMap[role].includes(participant_id)) {
      // clear it from any list
      validRoles.forEach(function (r) {
        // we don't know their old role
        const index = roleMap[r].indexOf(participant_id);
        if (index > -1) {
          roleMap[r].splice(index, 1);
        }
      });

      // and add them to the right list
      roleMap[role].push(participant_id);
    } else {
      // they didn't change.. odd
      console.log(
        `Not sure why we got a barge/whisper request without a role change` +
          `participant: ${participant_id}, role: ${role}`
      );
    }
  }
  if (DEBUG) {
    console.log("addUserToList\nusers are...", users);
    console.log("RoleMap is...", roleMap, "\n");
  }
}

/**
 * Take a look at the users in the call to determine the subscription structure
 * @param user - a json object with: participant_id, role; from the global users list
 * @param session_id - we need this at the top level of the subscriptions
 * @return a json object with their list of subscriptions
 */
function determineSubscriptions(user, session_id) {
  if (DEBUG) {
    console.log(`subs for ${JSON.stringify(user)}`);
  }
  let subscriptions = [];
  let rolesToListenTo = getRolesToListenTo(currentRoomState, user.role);

  for (let role of rolesToListenTo) {
    subscriptions = subscriptions.concat(roleMap[role]);
  }

  console.log(
    "subscriptions for the ",
    user.role,
    " are ",
    subscriptions,
    " from ",
    rolesToListenTo
  );
  // managers and employees can hear everyone
  // if (user.role == "manager" || user.role == "employee") {
  //   subscriptions = subscriptions.concat(
  //     roleMap["judge"],
  //     roleMap["translator"],
  //     roleMap["LEP"]
  //   );

  //   // guests can hear each other and employees
  // } else if (user.role == "guest") {
  //   subscriptions = subscriptions.concat(roleMap["employee"], roleMap["guest"]);
  // } else {
  //   console.log(`Bad role found: ${user.role}`);
  // }

  // Remove this user from their own list of subs
  const index = subscriptions.indexOf(user.participant_id);
  if (index > -1) {
    subscriptions.splice(index, 1);
  }

  // setup the updated subscribe for this user
  const jsonBody = { sessionId: session_id, participants: [] };
  subscriptions.forEach(function (p_id) {
    jsonBody["participants"].push({ participantId: p_id });
  });

  return jsonBody;
}

/**
 * Start a call out to the PSTN
 * @param account_id The id for this account
 * @param from_number the FROM on the call
 * @param to_number the number to call
 */
async function initiateCallToPSTN(account_id, from_number, to_number) {
  // call body, see here for more details: https://dev.bandwidth.com/voice/methods/calls/postCalls.html
  const body = {
    from: from_number,
    to: to_number,
    applicationId: process.env.VOICE_APPLICATION_ID,
    answerUrl: process.env.BASE_CALLBACK_URL + "callAnswered",
    answerMethod: "POST",
    callTimeout: "30",
  };

  return await voiceController.createCall(accountId, body);
}

/**
 * End the PSTN call
 * @param account_id The id for this account
 * @param call_id The id of the call
 */
async function endCallToPSTN(account_id, call_id) {
  // call body, see here for more details: https://dev.bandwidth.com/voice/methods/calls/postCallsCallId.html
  const body = {
    state: "completed",
    redirectUrl: "foo"
  }
  try {
    await voiceController.modifyCall(accountId, call_id, body);
  } catch (error) {
    console.log("Failed to hangup the call", error);
    throw error;
  }
}
