import fs from "fs";

const file = "./mutelist.json";

// Crear archivo si no existe
if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify({}, null, 2));
}

// 🔇 Mutear usuario en un grupo
export const muteUser = (jid, user) => {
    const data = JSON.parse(fs.readFileSync(file, "utf8"));

    if (!data[jid]) data[jid] = [];
    if (!data[jid].includes(user)) data[jid].push(user);

    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

// 🔊 Desmutear usuario
export const unmuteUser = (jid, user) => {
    const data = JSON.parse(fs.readFileSync(file, "utf8"));

    if (!data[jid]) return;
    data[jid] = data[jid].filter(u => u !== user);

    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

// 🔍 Ver si un usuario está muteado
export const isMuted = (jid, user) => {
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    return data[jid]?.includes(user);
};
