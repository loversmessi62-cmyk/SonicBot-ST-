import fs from "fs";

const FILE = "./utils/welcomeState.json";

function load() {
  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, JSON.stringify({}, null, 2));
  }
  return JSON.parse(fs.readFileSync(FILE, "utf-8"));
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// ===== WELCOME =====
export function isWelcomeEnabled(jid) {
  const db = load();
  return db[jid]?.welcome === true;
}

export function setWelcome(jid, value) {
  const db = load();
  if (!db[jid]) db[jid] = {};
  db[jid].welcome = value;
  save(db);
}

export function getWelcomeText(jid) {
  const db = load();
  return (
    db[jid]?.welcomeText ||
    "👋 Bienvenido @user a *@group*\n👥 Miembros: @count"
  );
}

export function setWelcomeText(jid, text) {
  const db = load();
  if (!db[jid]) db[jid] = {};
  db[jid].welcomeText = text;
  save(db);
}

// ===== BYE =====
export function isByeEnabled(jid) {
  const db = load();
  return db[jid]?.bye === true;
}

export function setBye(jid, value) {
  const db = load();
  if (!db[jid]) db[jid] = {};
  db[jid].bye = value;
  save(db);
}

export function getByeText(jid) {
  const db = load();
  return (
    db[jid]?.byeText ||
    "👋 @user salió de *@group*\n👥 Quedan: @count"
  );
}

export function setByeText(jid, text) {
  const db = load();
  if (!db[jid]) db[jid] = {};
  db[jid].byeText = text;
  save(db);
}
