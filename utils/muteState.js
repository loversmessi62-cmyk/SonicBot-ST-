import fs from "fs";

const file = "./mutelist.json";

if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify({}, null, 2));
}

const read = () => JSON.parse(fs.readFileSync(file));
const save = (data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

export const muteUser = (jid, user) => {
    const data = read();
    if (!data[jid]) data[jid] = [];
    if (!data[jid].includes(user)) data[jid].push(user);
    save(data);
};

export const unmuteUser = (jid, user) => {
    const data = read();
    if (!data[jid]) return;
    data[jid] = data[jid].filter(u => u !== user);
    save(data);
};

export const isMuted = (jid, user) => {
    const data = read();
    return data[jid]?.includes(user);
};
