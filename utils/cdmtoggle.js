import fs from "fs";

const file = "./cmd-state.json";

// Crear archivo si no existe
if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify({}, null, 2));
}

export const getState = (cmd) => {
    const data = JSON.parse(fs.readFileSync(file));

    // SI LA CLAVE EXISTE → devolver su valor
    // SI NO EXISTE → devolver FALSE (desactivado)
    return data.hasOwnProperty(cmd) ? data[cmd] : false;
};

export const setState = (cmd, value) => {
    const data = JSON.parse(fs.readFileSync(file));
    data[cmd] = value;
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

export const toggleState = (cmd) => {
    const data = JSON.parse(fs.readFileSync(file));
    const newState = !data[cmd];
    data[cmd] = newState;
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    return newState;
};