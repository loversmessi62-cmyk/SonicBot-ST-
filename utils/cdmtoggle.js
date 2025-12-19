import fs from "fs";

const file = "./cmd-state.json";

if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify({}, null, 2));
}

export const getState = (cmd) => {
    try {
        const data = JSON.parse(fs.readFileSync(file, "utf8"));
        return typeof data[cmd] === "boolean" ? data[cmd] : true;
    } catch {
        return true;
    }
};

export const setState = (cmd, value) => {
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    data[cmd] = !!value;
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

// ✅ ANTILINK USA EL MISMO SISTEMA
export const isAntilinkEnabled = (jid) => {
    return getState(`antilink_${jid}`);
};

export const setAntilinkEnabled = (jid, value) => {
    setState(`antilink_${jid}`, value);
};
