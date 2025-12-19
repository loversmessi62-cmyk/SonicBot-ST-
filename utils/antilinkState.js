import fs from "fs";

const FILE = "./antilink.json";
let data = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE)) : {};

const save = () => fs.writeFileSync(FILE, JSON.stringify(data, null, 2));

export const enableAntilink = jid => {
    data[jid] = true;
    save();
};

export const disableAntilink = jid => {
    data[jid] = false;
    save();
};

export const isAntilinkEnabled = jid => data[jid] === true;
