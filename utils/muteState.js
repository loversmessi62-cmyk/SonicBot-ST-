import fs from "fs";

const FILE = "./mutelist.json";
let data = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE)) : {};

const save = () => fs.writeFileSync(FILE, JSON.stringify(data, null, 2));

export const muteUser = (group, user) => {
    if (!data[group]) data[group] = [];
    if (!data[group].includes(user)) {
        data[group].push(user);
        save();
    }
};

export const unmuteUser = (group, user) => {
    if (!data[group]) return;
    data[group] = data[group].filter(u => u !== user);
    save();
};

export const isMuted = (group, user) => {
    return data[group]?.includes(user);
};
