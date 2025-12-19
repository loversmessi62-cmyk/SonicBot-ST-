import fs from "fs";

const file = "./antilink.json";

// Crear archivo si no existe
if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify({}, null, 2));
}

// 🔍 Ver si el antilink está activo en un grupo
export const isAntilinkEnabled = (jid) => {
    try {
        const data = JSON.parse(fs.readFileSync(file, "utf8"));
        return data[jid] === true;
    } catch {
        return false;
    }
};

// 🔧 Activar / desactivar antilink por grupo
export const setAntilink = (jid, value) => {
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    data[jid] = value;
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};
