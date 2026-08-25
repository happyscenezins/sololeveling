const defaultState = {
  lang: "en",
  level: 1,
  exp: 0,
  expToNext: 80,
  gold: 0,
  baseAtk: 40,
  extraAtk: 0,
  afkRateBonus: 0,
  currentFloor: 0,
  challengeIndex: 0,
  inventory: [],
  lastActive: Date.now()
};

let gameState = JSON.parse(localStorage.getItem("soloFluency_save")) || defaultState;
if (gameState.challengeIndex === undefined) gameState.challengeIndex = 0;

// DOM Elements
const heroLvl = document.getElementById("hero-lvl");
const heroAtk = document.getElementById("atk-val");
const goldVal = document.getElementById("gold-val");
const expBar = document.getElementById("exp-bar");
const hunterRankBadge = document.getElementById("hunter-rank-badge");
const hunterSubrank = document.getElementById("hunter-subrank");
const shadowCount = document.getElementById("shadow-count");
const equippedCount = document.getElementById("equipped-count");
const heroAvatar = document.getElementById("hero-avatar");

const gateRankBadge = document.getElementById("gate-rank-badge");
const gateTitle = document.getElementById("gate-title");
const moduleLabel = document.getElementById("module-label");
const bossSprite = document.getElementById("boss-sprite");
const bossName = document.getElementById("boss-name");
const bossHpBar = document.getElementById("boss-hp-bar");
const bossHpLabel = document.getElementById("boss-hp-label");

const lessonTag = document.getElementById("lesson-tag");
const sentencePrompt = document.getElementById("sentence-prompt");
const optionsGrid = document.getElementById("options-grid");
const battleLog = document.getElementById("battle-log");
const afkPendingExp = document.getElementById("afk-pending-exp");
const claimAfkBtn = document.getElementById("claim-afk-btn");

const shopModal = document.getElementById("shop-modal");
const openShopBtn = document.getElementById("open-shop-btn");
const closeShopBtn = document.getElementById("close-shop-btn");
const shopItemsList = document.getElementById("shop-items-list");
const resetSystemBtn = document.getElementById("reset-system-btn");

let currentBossHp = 0;

function initGame() {
  calculateAfkGains();
  loadFloor(gameState.currentFloor);
  updateUI();
  renderShop();

  // AFK Autosave loop
  setInterval(() => {
    gameState.lastActive = Date.now();
    saveGame();
  }, 5000);
}

function calculateAfkGains() {
  const now = Date.now();
  const elapsedMinutes = Math.floor((now - gameState.lastActive) / 60000);
  if (elapsedMinutes > 0) {
    const rate = (5 * gameState.level) + gameState.afkRateBonus;
    const gainedExp = Math.min(elapsedMinutes * rate, 10000);
    afkPendingExp.textContent = gainedExp;
    gameState.exp += gainedExp;
    checkLevelUp();
  }
}

function getHunterRank(level) {
  if (level >= 30) return { rank: "National Rank", icon: "fa-solid fa-crown", color: "text-amber-400" };
  if (level >= 20) return { rank: "S-Rank Monarch", icon: "fa-solid fa-skull", color: "text-purple-400" };
  if (level >= 15) return { rank: "A-Rank Elite", icon: "fa-solid fa-shield-halved", color: "text-rose-400" };
  if (level >= 10) return { rank: "B-Rank Striker", icon: "fa-solid fa-meteor", color: "text-cyan-400" };
  if (level >= 5) return { rank: "C-Rank Mage", icon: "fa-solid fa-wand-magic-sparkles", color: "text-blue-400" };
  if (level >= 3) return { rank: "D-Rank Hunter", icon: "fa-solid fa-user-shield", color: "text-slate-300" };
  return { rank: "E-Rank Aspirant", icon: "fa-solid fa-user-ninja", color: "text-slate-400" };
}

function loadFloor(floorIdx) {
  const floorData = dungeonFloors[floorIdx] || dungeonFloors[0];
  currentBossHp = floorData.boss.maxHp;
  bossName.textContent = floorData.boss.name;
  bossSprite.innerHTML = `<i class="${floorData.boss.iconClass}"></i>`;
  gateTitle.textContent = floorData.title;
  gateRankBadge.textContent = floorData.boss.rank;
  moduleLabel.textContent = floorData.module;

  renderBossHp(floorData.boss.maxHp);

  const challengeList = floorData.challenges || [floorData.challenge];
  const currentQ = challengeList[gameState.challengeIndex % challengeList.length];
  loadChallenge(currentQ);
}

function renderBossHp(maxHp) {
  const pct = Math.max(0, (currentBossHp / maxHp) * 100);
  bossHpBar.style.width = `${pct}%`;
  bossHpLabel.textContent = `${Math.max(0, currentBossHp)} / ${maxHp}`;
}

function loadChallenge(q) {
  if (!q) return;
  lessonTag.textContent = q.lesson;
  sentencePrompt.textContent = q.sentence;
  battleLog.classList.add("hidden");
  optionsGrid.innerHTML = "";

  q.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.className = "p-4 rounded-xl bg-slate-950/80 hover:bg-blue-950/50 border border-blue-900/40 hover:border-blue-500 font-medium text-left transition-all text-sm";
    btn.textContent = `${String.fromCharCode(65 + idx)}. ${opt}`;
    btn.onclick = () => executeSpell(idx);
    optionsGrid.appendChild(btn);
  });
}

function executeSpell(selectedIndex) {
  const t = translations[gameState.lang || "en"];
  const floor = dungeonFloors[gameState.currentFloor];
  const challengeList = floor.challenges || [floor.challenge];
  const q = challengeList[gameState.challengeIndex % challengeList.length];
  const buttons = optionsGrid.querySelectorAll("button");
  buttons.forEach(b => b.disabled = true);

  const totalAtk = gameState.baseAtk + gameState.extraAtk;

  if (selectedIndex === q.correctIndex) {
    const isCrit = Math.random() > 0.4;
    const damage = Math.floor(totalAtk * (isCrit ? 2.2 : 1.2));
    currentBossHp -= damage;
    renderBossHp(floor.boss.maxHp);

    bossSprite.classList.add("scale-75", "opacity-40");
    setTimeout(() => bossSprite.classList.remove("scale-75", "opacity-40"), 200);

    battleLog.className = "mt-4 p-3 rounded-xl text-sm border bg-blue-950/70 border-cyan-500 text-cyan-300 block";
    battleLog.innerHTML = `<strong>${isCrit ? t.critStrike : t.directHit}</strong> Dealt ${damage} damage. <em>${q.explanation}</em>`;

    gameState.exp += 35;
    gameState.gold += 20;
    checkLevelUp();

    setTimeout(() => {
      if (currentBossHp <= 0) {
        handleBossDefeat();
      } else {
        gameState.challengeIndex = (gameState.challengeIndex + 1) % challengeList.length;
        loadChallenge(challengeList[gameState.challengeIndex]);
      }
      updateUI();
      saveGame();
    }, 1200);

  } else {
    battleLog.className = "mt-4 p-3 rounded-xl text-sm border bg-rose-950/70 border-rose-700 text-rose-300 block";
    battleLog.innerHTML = `<strong>${t.spellFail}</strong>`;
    setTimeout(() => buttons.forEach(b => b.disabled = false), 1000);
  }
}

function handleBossDefeat() {
  const t = translations[gameState.lang || "en"];
  alert(`${t.gateClearAlert}${dungeonFloors[gameState.currentFloor].boss.name}!`);
  gameState.currentFloor = (gameState.currentFloor + 1) % dungeonFloors.length;
  gameState.challengeIndex = 0;
  loadFloor(gameState.currentFloor);
}

function checkLevelUp() {
  const t = translations[gameState.lang || "en"];
  while (gameState.exp >= gameState.expToNext) {
    gameState.exp -= gameState.expToNext;
    gameState.level += 1;
    gameState.baseAtk += 20;
    gameState.expToNext = Math.floor(gameState.expToNext * 1.4);
    alert(`${t.levelUpAlert}${gameState.level}${t.baseAtkInc}${gameState.baseAtk}.`);
  }
}

function updateUI() {
  const t = translations[gameState.lang || "en"];
  const totalAtk = gameState.baseAtk + gameState.extraAtk;
  
  heroLvl.textContent = gameState.level;
  heroAtk.textContent = totalAtk;
  goldVal.textContent = gameState.gold;
  
  const rankInfo = getHunterRank(gameState.level);
  hunterRankBadge.textContent = rankInfo.rank;
  hunterSubrank.textContent = `Rank: ${rankInfo.rank}`;
  heroAvatar.innerHTML = `<i class="${rankInfo.icon}"></i>`;
  heroAvatar.className = `text-7xl my-4 ${rankInfo.color} drop-shadow-[0_0_15px_rgba(59,130,246,0.8)] transition-transform`;

  // Localized UI Text
  document.getElementById("hero-title").textContent = t.awakenedName;
  document.getElementById("prompt-desc").textContent = t.resonancePrompt;
  document.getElementById("claim-afk-btn").textContent = t.ariseBtn;
  document.getElementById("open-shop-btn").innerHTML = `<i class="fa-solid fa-store"></i> ${t.shopBtn}`;
  document.getElementById("reset-system-btn").innerHTML = `<i class="fa-solid fa-rotate-left"></i> ${t.resetBtn}`;
  document.getElementById("lang-btn-label").textContent = gameState.lang === "th" ? "TH" : "EN";

  document.getElementById("afk-rate").textContent = (5 * gameState.level) + gameState.afkRateBonus;
  shadowCount.textContent = gameState.currentFloor;
  equippedCount.textContent = gameState.inventory.length;

  const expPct = Math.min(100, (gameState.exp / gameState.expToNext) * 100);
  expBar.style.width = `${expPct}%`;
}

function renderShop() {
  const t = translations[gameState.lang || "en"];
  shopItemsList.innerHTML = "";
  itemShopCatalog.forEach(item => {
    const isOwned = gameState.inventory.includes(item.id);
    const div = document.createElement("div");
    div.className = "flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800";
    div.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-lg">
          <i class="${item.icon}"></i>
        </div>
        <div>
          <h4 class="font-bold text-sm text-slate-100">${item.name}</h4>
          <p class="text-xs text-slate-400">${item.desc}</p>
        </div>
      </div>
      <button onclick="buyItem('${item.id}')" ${isOwned ? "disabled" : ""} class="px-3 py-1.5 rounded-lg text-xs font-bold transition ${isOwned ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed" : "bg-amber-600 hover:bg-amber-500 text-white shadow-md"}">
        ${isOwned ? t.equipped : `${item.price} G`}
      </button>
    `;
    shopItemsList.appendChild(div);
  });
}

window.buyItem = function(itemId) {
  const t = translations[gameState.lang || "en"];
  const item = itemShopCatalog.find(i => i.id === itemId);
  if (!item || gameState.inventory.includes(itemId)) return;

  if (gameState.gold >= item.price) {
    gameState.gold -= item.price;
    gameState.inventory.push(item.id);
    if (item.atkBonus) gameState.extraAtk += item.atkBonus;
    if (item.expBonus) {
      gameState.exp += item.expBonus;
      checkLevelUp();
    }
    if (item.afkBonus) gameState.afkRateBonus += item.afkBonus;

    updateUI();
    renderShop();
    saveGame();
    alert(`${t.buySuccess}${item.name}!`);
  } else {
    alert(t.noGold);
  }
};

function saveGame() {
  gameState.lastActive = Date.now();
  localStorage.setItem("soloFluency_save", JSON.stringify(gameState));
}

// Event Listeners
openShopBtn.onclick = () => shopModal.classList.remove("hidden");
closeShopBtn.onclick = () => shopModal.classList.add("hidden");

claimAfkBtn.onclick = () => {
  afkPendingExp.textContent = "0";
  updateUI();
  saveGame();
};

document.getElementById("lang-toggle-btn").onclick = () => {
  gameState.lang = gameState.lang === "en" ? "th" : "en";
  updateUI();
  renderShop();
  saveGame();
};

resetSystemBtn.onclick = () => {
  const t = translations[gameState.lang || "en"];
  if (confirm(t.resetConfirm)) {
    localStorage.removeItem("soloFluency_save");
    gameState = JSON.parse(JSON.stringify(defaultState));
    gameState.lastActive = Date.now();
    loadFloor(0);
    updateUI();
    renderShop();
    saveGame();
  }
};

initGame();