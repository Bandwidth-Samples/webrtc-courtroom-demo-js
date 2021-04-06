const roles = ["judge", "LEP", "translator"];
const roomStates = ["inPrep", "inSession", "inTervention"];

const roomStateRoleListenTo = {
  inPrep: { judge: [], LEP: [], translator: [] },
  inSession: { judge: [], LEP: [], translator: [] },
  inTervention: { judge: [], LEP: [], translator: [] },
};

// roomStateRoleListenTo.inPrep.judge = [];
// roomStateRoleListenTo.inSession.judge = ["translator"];
// roomStateRoleListenTo.inTervention.judge = ["translator", "LEP"];

// roomStateRoleListenTo.inPrep.LEP = ["translator"];
// roomStateRoleListenTo.inSession.LEP = [];
// roomStateRoleListenTo.inTervention.LEP = ["translator", "judge"];

// roomStateRoleListenTo.inPrep.translator = ["LEP", "judge"];
// roomStateRoleListenTo.inSession.translator = ["LEP", "judge"];
// roomStateRoleListenTo.inTervention.translator = ["LEP", "judge"];

roomStateRoleListenTo.inPrep.judge = ["translator", "LEP"];
roomStateRoleListenTo.inSession.judge = ["translator", "LEP"];
roomStateRoleListenTo.inTervention.judge = [];

roomStateRoleListenTo.inPrep.LEP = ["translator", "judge"];
roomStateRoleListenTo.inSession.LEP = [];
roomStateRoleListenTo.inTervention.LEP = [];

roomStateRoleListenTo.inPrep.translator = ["judge", "LEP"];
roomStateRoleListenTo.inSession.translator = ["LEP", "judge"];
roomStateRoleListenTo.inTervention.translator = [];

// try Array.map across the rows and columns ????

function displayIt(state, role) {
  console.log(
    "state",
    state,
    "role",
    role,
    "who to listen to...",
    roomStateRoleListenTo[state][role]
  );
}

function getRolesToListenTo(roomstate, role) {
  // return an array of roles to listen to.
  return roomStateRoleListenTo[roomstate][role];
}

// function applyRoomStateChange(newState = "inPrep", doWork) {
//   for (let role of roles) {
//     doWork(newState, role);
//   }
// }

for (let roomState of roomStates) {
  console.log(" ");
  for (let role of roles) {
    console.log(
      "state",
      roomState,
      "role",
      role,
      roomStateRoleListenTo[roomState][role]
    );
  }
}

// console.log("------------------");

// for (let roomState of roomStates) {
//   console.log(" ");
//   applyRoomStateChange(roomState, displayIt);
// }

module.exports.roles = roles;
module.exports.roomStates = roomStates;
module.exports.getRolesToListenTo = getRolesToListenTo;
