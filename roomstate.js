const roles = ["judge", "LEP", "translator"];
const roomStates = ["inPrep", "inSession", "inTervention"];

const roomStateRoleListenTo = {
  inPrep: { judge: [], LEP: [], translator: [] },
  inSession: { judge: [], LEP: [], translator: [] },
  inTervention: { judge: [], LEP: [], translator: [] },
};

roomStateRoleListenTo.inPrep.judge = ["translator", "LEP"];
roomStateRoleListenTo.inPrep.LEP = [];
roomStateRoleListenTo.inPrep.translator = ["judge"];

roomStateRoleListenTo.inSession.judge = ["translator", "LEP"];
roomStateRoleListenTo.inSession.LEP = ["translator", "judge"];
roomStateRoleListenTo.inSession.translator = ["LEP", "judge"];

roomStateRoleListenTo.inTervention.judge = [];
roomStateRoleListenTo.inTervention.LEP = [];
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

console.log("\nRoom State Map of who can listen to whom... ");
for (let roomState of roomStates) {
  for (let role of roles) {
    console.log(
      "state",
      roomState,
      "role",
      role,
      " can listen to: ",
      roomStateRoleListenTo[roomState][role]
    );
  }
  console.log("\n");
}
console.log("\n");

module.exports.roles = roles;
module.exports.roomStates = roomStates;
module.exports.getRolesToListenTo = getRolesToListenTo;
