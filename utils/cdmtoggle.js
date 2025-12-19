import fs from "fs";

const file = "./cmd-state.json";

// Crear archivo si no existe
if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify({
        commands: {},
        antilink: {}
    }, null, 2));
}

// ===============================
// ESTADO DE COMANDOS
// ===============================
export const getState = (cmd) => {
    try {
        const data = JSON.parse(fs.readFileSync(file, "utf8"));
        return typeof data.commands?.[cmd] === "boolean"
            ? data.commands[cmd]
            : true; // por defecto ON
    } catch {
        return true;
    }
};

export const setState = (cmd, value) => {
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!data.commands) data.commands = {};
    data.commands[cmd] = !!value;
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

// ===============================
// ESTADO ANTILINK POR GRUPO
// ===============================
export const isAntilinkEnabled = (jid) => {
    try {
        const data = JSON.parse(fs.readFileSync(file, "utf8"));
        return data.antilink?.[jid] === true;
    } catch {
        return false;
    }
};

export const setAntilink = (jid, value) => {
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!data.antilink) data.antilink = {};
    data.antilink[jid] = !!value;
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};
