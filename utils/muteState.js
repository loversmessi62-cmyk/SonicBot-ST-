import fs from "fs";

const FILE = "./utils/mutestore.json";

const load = () => {
    if (!fs.existsSync(FILE)) return {};
    return JSON.parse(fs.readFileSync(FILE));
};

const save = (data) => {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
};

export const muteUser = (jid, user) => {
    const db = load();
    if (!db[jid]) db[jid] = [];
    if (!db[jid].includes(user)) db[jid].push(user);
    save(db);
};

export const unmuteUser = (jid, user) => {
    const db = load();
    if (!db[jid]) return;
    db[jid] = db[jid].filter(u => u !== user);
    save(db);
};

export const isMuted = (jid, user) => {
    const db = load();
    return db[jid]?.includes(user);
};
