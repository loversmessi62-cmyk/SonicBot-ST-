import fs from "fs";

const FILE = "./modoadmins.json";

let state = {
  enabled: false
};

if (fs.existsSync(FILE)) {
  state = JSON.parse(fs.readFileSync(FILE));
}

export const isModoAdminsEnabled = () => state.enabled;

export const setModoAdmins = (value) => {
  state.enabled = value;
  fs.writeFileSync(FILE, JSON.stringify(state, null, 2));
};