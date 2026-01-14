import fs from "fs";

const FILE = "./utils/welcomeState.json";

function load() {
  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(
      FILE,
      JSON.stringify({ global: { welcome: true, bye: true }, groups: {} }, null, 2)
    );
  }
  return JSON.parse(fs.readFileSync(FILE, "utf-8"));
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// ===== WELCOME =====
export function isWelcomeEnabled(jid) {
  const db = load();
  if (db.groups?.[jid]?.welcome !== undefined) {
    return db.groups[jid].welcome === true;
  }
  return db.global?.welcome === true;
}

export function getWelcomeText(jid) {
  const db = load();
  return (
    db.groups?.[jid]?.welcomeText ||
    db.global?.welcomeText ||
    "👋 Bienvenido @user a *@group*\n👥 Miembros: @count"
  );
}

// ===== BYE =====
export function isByeEnabled(jid) {
  const db = load();
  if (db.groups?.[jid]?.bye !== undefined) {
    return db.groups[jid].bye === true;
  }
  return db.global?.bye === true;
}

export function getByeText(jid) {
  const db = load();
  return (
    db.groups?.[jid]?.byeText ||
    db.global?.byeText ||
    "👋 @user salió de *@group*\n👥 Quedan: @count"
  );
}
