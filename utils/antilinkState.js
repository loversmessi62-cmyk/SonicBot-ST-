const antilinkGroups = new Set();

export function enableAntilink(jid) {
  antilinkGroups.add(jid);
}

export function disableAntilink(jid) {
  antilinkGroups.delete(jid);
}

export function isAntilinkEnabled(jid) {
  return antilinkGroups.has(jid);
} 