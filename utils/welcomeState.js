import fs from "fs";

const file = "./welcome.json";

if (!fs.existsSync(file)) {
  fs.writeFileSync(file, JSON.stringify({}, null, 2));
}

let cache = {};

try {
  cache = JSON.parse(fs.readFileSync(file, "utf8"));
} catch {
  cache = {};
}

let saveTimer = null;

const save = () => {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      fs.writeFileSync(file, JSON.stringify(cache, null, 2));
    } catch (e) {
      console.error("❌ Error guardando welcome.json:", e);
    }
  }, 1000);
};

export const enableWelcome = jid => {
  if (!cache[jid]) cache[jid] = {};
  cache[jid].welcome = true;
  save();
};

export const disableWelcome = jid => {
  if (!cache[jid]) cache[jid] = {};
  cache[jid].welcome = false;
  save();
};

export const isWelcomeEnabled = jid => {
  return cache[jid]?.welcome === true;
};

export const enableBye = jid => {
  if (!cache[jid]) cache[jid] = {};
  cache[jid].bye = true;
  save();
};

export const disableBye = jid => {
  if (!cache[jid]) cache[jid] = {};
  cache[jid].bye = false;
  save();
};

export const isByeEnabled = jid => {
  return cache[jid]?.bye === true;
};