import fs from "fs";

const FILE = "./mutelist.json";

const read = () => {
    if (!fs.existsSync(FILE)) return {};
    return JSON.parse(fs.readFileSync(FILE));
};

const write = (data) => {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
};

export const isMuted = (group, user) => {
    const data = read();
    return data[group]?.includes(user);
};

export const addMute = (group, user) => {
    const data = read();
    if (!data[group]) data[group] = [];
    if (!data[group].includes(user)) data[group].push(user);
    write(data);
};

export const removeMute = (group, user) => {
    const data = read();
    if (!data[group]) return;
    data[group] = data[group].filter(u => u !== user);
    write(data);
};
