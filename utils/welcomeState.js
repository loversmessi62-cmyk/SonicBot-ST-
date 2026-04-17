import fs from "fs";

const FILE = "./utils/welcomeState.json";

// =====================
// 👋 BIENVENIDAS
// =====================
const WELCOMES = [
"Bienvenido pendejo espero que te pongas a las pilas antes de que te saquen",
"Llegó otro pendejo al grupo, a ver si no estorbas",
"Bienvenido idiota, no la cagues desde el inicio",
"Otro inútil más, bienvenido",
"Bienvenido pendejo, no hagas pura mamada",
"Llegaste, a ver si sirves para algo",
"Otro más que viene a valer madre",
"Bienvenido, no estorbes mucho",
"Ya llegó el pendejo nuevo",
"Esperemos no seas otro estorbo"
];

// =====================
// 🚪 DESPEDIDAS
// =====================
const BYES = [
"Se fue el pendejo, por fin",
"Adiós inútil, no hacías nada",
"Un estorbo menos en el grupo",
"Se fue y nadie lo va a extrañar",
"Por fin se largó ese pendejo",
"Ni falta vas a hacer",
"Adiós, no servías",
"Se fue el inútil, todo mejora",
"Qué descanso que ya se fue",
"Uno menos estorbando"
];

// =====================
// LOAD / SAVE
// =====================
function load() {
  const defaults = {
    global: {
      welcome: true,
      bye: true
    },
    groups: {}
  };

  let data = {};

  if (fs.existsSync(FILE)) {
    try {
      data = JSON.parse(fs.readFileSync(FILE, "utf-8"));
    } catch {
      data = {};
    }
  }

  data.global = { ...defaults.global, ...data.global };
  data.groups = data.groups || {};

  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
  return data;
}

// =====================
// FUNCIONES
// =====================
function isWelcomeEnabled(jid) {
  const db = load();
  return db.groups?.[jid]?.welcome ?? db.global.welcome;
}

function isByeEnabled(jid) {
  const db = load();
  return db.groups?.[jid]?.bye ?? db.global.bye;
}

function getWelcome() {
  return WELCOMES[Math.floor(Math.random() * WELCOMES.length)];
}

function getBye() {
  return BYES[Math.floor(Math.random() * BYES.length)];
}

// =====================
// HANDLER
// =====================
export default async function (sock, update) {
  try {
    const { id, participants, action } = update;

    if (!["add", "remove"].includes(action)) return;

    const metadata = await sock.groupMetadata(id);

    // 🖼️ FOTO GRUPO
    let groupPP;
    try {
      groupPP = await sock.profilePictureUrl(id, "image");
    } catch {
      groupPP = "https://telegra.ph/file/6e0c6d1b6d5c2e9c1b2f.jpg";
    }

    for (let user of participants) {

      // 🖼️ FOTO USUARIO O GRUPO
      let pp;
      try {
        pp = await sock.profilePictureUrl(user, "image");
      } catch {
        pp = groupPP;
      }

      // 👋 BIENVENIDA
      if (action === "add" && isWelcomeEnabled(id)) {
        const frase = getWelcome();

        await sock.sendMessage(id, {
          image: { url: pp },
          caption: `${frase}`,
          mentions: [user]
        });
      }

      // 🚪 DESPEDIDA
      if (action === "remove" && isByeEnabled(id)) {
        const frase = getBye();

        await sock.sendMessage(id, {
          image: { url: pp },
          caption: `${frase}`,
          mentions: [user]
        });
      }
    }

  } catch (e) {
    console.error("❌ ERROR WELCOME/BYE:", e);
  }
}

// =====================
load();