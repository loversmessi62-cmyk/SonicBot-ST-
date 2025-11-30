import fs from "fs";

const file = "./cmd-state.json";

// Crear archivo si no existe
if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify({}, null, 2));
}

export const getState = (cmd) => {
    const data = JSON.parse(fs.readFileSync(file));
    return data[cmd] ?? false; // Por defecto OFF
};

export const setState = (cmd, value) => {
    const data = JSON.parse(fs.readFileSync(file));
    data[cmd] = value;
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};