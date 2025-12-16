import fs from "fs";

const FILE = "./antilinkState.json";

let data = {
    global: true,
    groups: {}
};

if (fs.existsSync(FILE)) {
    data = JSON.parse(fs.readFileSync(FILE));
}

const save = () =>
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));

export const isAntilinkEnabled = (jid) => {
    if (data.groups[jid] === undefined) {
        return data.global;
    }
    return data.groups[jid];
};

export const setAntilinkGroup = (jid, state) => {
    data.groups[jid] = state;
    save();
};

export const setAntilinkGlobal = (state) => {
    data.global = state;
    save();
};
