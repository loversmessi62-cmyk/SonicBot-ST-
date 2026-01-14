import fs from "fs";

const FILE = "./utils/welcomeState.json";

// =====================
// LOAD / SAVE
// =====================
function load() {
  if (!fs.existsSync(FILE)) {
    const initial = {
      global: {
        welcome: false,
        bye: false
      },
      groups: {}
    };
    fs.writeFileSync(FILE, JSON.stringify(initial, null, 2));
    return initial;
  }

  return JSON.parse(fs.readFileSync(FILE, "utf-8"));
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// =====================
// WELCOME ENABLE
// =====================
export function isWelcomeEnabled(jid) {
  const db = load();

  // prioridad al grupo
  if (db.groups?.[jid]?.welcome !== undefined) {
    return db.groups[jid].welcome === true;
  }

  // fallback global
  return db.global?.welcome === true;
}

export function setWelcome(jid, value) {
  const db = load();

  if (!db.groups[jid]) db.groups[jid] = {};
  db.groups[jid].welcome = value;

  save(db);
}

// =====================
// WELCOME TEXT
// =====================
export function getWelcomeText(jid) {
  const db = load();

  return (
    db.groups?.[jid]?.welcomeText ||
    db.global?.welcomeText ||
    "👋 Bienvenido @user a *@group*\n👥 Miembros: @count"
  );
}

export function setWelcomeText(jid, text) {
  const db = load();

  if (!db.groups[jid]) db.groups[jid] = {};
  db.groups[jid].welcomeText = text;

  save(db);
}

// =====================
// BYE ENABLE
// =====================
export function isByeEnabled(jid) {
  const db = load();

  if (db.groups?.[jid]?.bye !== undefined) {
    return db.groups[jid].bye === true;
  }

  return db.global?.bye === true;
}

export function setBye(jid, value) {
  const db = load();

  if (!db.groups[jid]) db.groups[jid] = {};
  db.groups[jid].bye = value;

  save(db);
}

// =====================
// BYE TEXT
// =====================
export function getByeText(jid) {
  const db = load();

  return (
    db.groups?.[jid]?.byeText ||
    db.global?.byeText ||
    "👋 @user salió de *@group*\n👥 Quedan: @count"
  );
}

export function setByeText(jid, text) {
  const db = load();

  if (!db.groups[jid]) db.groups[jid] = {};
  db.groups[jid].byeText = text;

  save(db);
}
