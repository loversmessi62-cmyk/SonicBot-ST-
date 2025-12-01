import fs from "fs";

const file = "./cmd-state.json";

// Crear archivo si no existe
if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify({}, null, 2));
}

export const getState = (cmd) => {
    try {
        const data = JSON.parse(fs.readFileSync(file, "utf8"));
        // Por defecto TRUE (habilitado)
        return typeof data[cmd] === "boolean" ? data[cmd] : true;
    } catch (e) {
        console.error("Error leyendo cmd-state.json:", e);
        return true;
    }
};

export const setState = (cmd, value) => {
    try {
        const data = JSON.parse(fs.readFileSync(file, "utf8"));
        data[cmd] = !!value;
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Error escribiendo cmd-state.json:", e);
    }
};
