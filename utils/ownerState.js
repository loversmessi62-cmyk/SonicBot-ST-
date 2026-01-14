import fs from "fs";

const FILE = "./utils/owners.json";

function load() {
  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, JSON.stringify({ owners: [] }, null, 2));
  }

  try {
    return JSON.parse(fs.readFileSync(FILE, "utf-8"));
  } catch {
    return { owners: [] };
  }
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

export function isOwner(jid) {
  const db = load();
  return db.owners.includes(jid);
}

export function addOwner(jid) {
  const db = load();
  if (!db.owners.includes(jid)) {
    db.owners.push(jid);
    save(db);
    return true;
  }
  return false;
}

export function removeOwner(jid) {
  const db = load();
  const before = db.owners.length;
  db.owners = db.owners.filter(o => o !== jid);
  save(db);
  return db.owners.length !== before;
}
