import fs from "fs";

const file = "./mutelist.json";

if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify({}, null, 2));
}

// verificar si usuario está muteado en un grupo
export const isMuted = (jid, user) => {
    const data = JSON.parse(fs.readFileSync(file));
    return data[jid]?.includes(user);
};

// mutear usuario
export const muteUser = (jid, user) => {
    const data = JSON.parse(fs.readFileSync(file));
    if (!data[jid]) data[jid] = [];
    if (!data[jid].includes(user)) data[jid].push(user);
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

// desmutear usuario
export const unmuteUser = (jid, user) => {
    const data = JSON.parse(fs.readFileSync(file));
    if (!data[jid]) return;
    data[jid] = data[jid].filter(u => u !== user);
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};
