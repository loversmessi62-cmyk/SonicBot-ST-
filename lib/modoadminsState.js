import fs from "fs";

const FILE = "./modoadmins.json";

let state = {};

// cargar
if (fs.existsSync(FILE)) {
  state = JSON.parse(fs.readFileSync(FILE));
}

// 🔍 consultar por grupo
export const isModoAdminsEnabled = (jid) => {
  return state[jid] === true;
};

// 🔧 setear por grupo
export const setModoAdmins = (jid, value) => {
  state[jid] = value;
  fs.writeFileSync(FILE, JSON.stringify(state, null, 2));
};