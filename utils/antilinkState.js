import fs from "fs";

const FILE = "./antilink.json";

let antilink = {};

// Cargar estado
if (fs.existsSync(FILE)) {
  try {
    antilink = JSON.parse(fs.readFileSync(FILE));
  } catch {
    antilink = {};
  }
}

// Guardar estado
const save = () => {
  fs.writeFileSync(FILE, JSON.stringify(antilink, null, 2));
};

// 🔥 Obtener estado
export const isAntilinkEnabled = (jid) => {
  return antilink[jid] === true;
};

// 🔥 Activar
export const enableAntilink = (jid) => {
  antilink[jid] = true;
  save();
};

// 🔥 Desactivar
export const disableAntilink = (jid) => {
  delete antilink[jid];
  save();
};
