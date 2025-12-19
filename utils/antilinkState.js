import fs from "fs";

const file = "./antilink.json";

// crear archivo si no existe
if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify({}, null, 2));
}

// obtener estado del antilink por grupo
export const isAntilinkEnabled = (jid) => {
    const data = JSON.parse(fs.readFileSync(file));
    return data[jid] === true;
};

// activar / desactivar antilink por grupo
export const setAntilink = (jid, value) => {
    const data = JSON.parse(fs.readFileSync(file));
    data[jid] = !!value;
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};
