const defaultState = {
  lang: "en",
  level: 1,
  exp: 0,
  expToNext: 80,
  gold: 0,
  extraAtk: 0,
  hp: 200,
  maxHp: 200,
  statPoints: 5,
  stats: {
    str: 10,
    vit: 10,
    agi: 10,
    int: 10,
    sen: 10
  },
  afkRateBonus: 0,
  currentFloor: 0,
  challengeIndex: 0,
  inventory: [],
  lastActive: Date.now()
};

let gameState = JSON.parse(localStorage.getItem("soloFluency_save")) || defaultState;
if (gameState.challengeIndex === undefined) gameState.challengeIndex = 0;
if (gameState.statPoints === undefined) gameState.statPoints = 0;
if (!gameState.stats) {
  gameState.stats = { str: 10, vit: 10, agi: 10, int: 10, sen: 10 };
}
if (gameState.maxHp === undefined) gameState.maxHp = 50 + (gameState.stats.vit * 15);
if (gameState.hp === undefined) gameState.hp = gameState.maxHp;

// DOM Elements
const heroLvl = document.getElementById("hero-lvl");
const heroAtk = document.getElementById("atk-val");
const goldVal = document.getElementById("gold-val");
const expBar = document.getElementById("exp-bar");
const headerHpVal = document.getElementById("header-hp-val");
const headerMaxHpVal = document.getElementById("header-maxhp-val");
const heroHpLabel = document.getElementById("hero-hp-label");
const heroHpBar = document.getElementById("hero-hp-bar");

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

const statusModal = document.getElementById("status-modal");
const openStatusBtn = document.getElementById("open-status-btn");
const openStatusCardBtn = document.getElementById("open-status-card-btn");
const closeStatusBtn = document.getElementById("close-status-btn");
const unallocatedBadge = document.getElementById("unallocated-badge");
const statPointsVal = document.getElementById("stat-points-val");

let currentBossHp = 0;

function initGame() {
  recalculateDerivedStats();
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

function recalculateDerivedStats() {
  gameState.maxHp = 50 + (gameState.stats.vit * 15);
  if (gameState.hp > gameState.maxHp) gameState.hp = gameState.maxHp;
}

function getDerivedTotalAtk() {
  return (gameState.stats.str * 5) + gameState.extraAtk;
}

function getDerivedAfkRate() {
  return (5 * gameState.level) + (gameState.stats.int * 1) + gameState.afkRateBonus;
}

function calculateAfkGains() {
  const now = Date.now();
  const elapsedMinutes = Math.floor((now - gameState.lastActive) / 60000);
  if (elapsedMinutes > 0) {
    const rate = getDerivedAfkRate();
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
    btn.className = "p-3.5 sm:p-4 rounded-xl bg-slate-950/90 hover:bg-blue-950/60 active:bg-blue-900/80 border border-blue-900/40 hover:border-blue-500 font-medium text-left transition-all text-xs sm:text-sm active:scale-[0.98] shadow-md flex items-center gap-2";
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

  const totalAtk = getDerivedTotalAtk();

  if (selectedIndex === q.correctIndex) {
    // Agility (AGI) increases crit chance
    const critChance = Math.min(0.85, 0.35 + (gameState.stats.agi * 0.015));
    const isCrit = Math.random() < critChance;
    const damage = Math.floor(totalAtk * (isCrit ? 2.2 : 1.2));
    currentBossHp -= damage;
    renderBossHp(floor.boss.maxHp);

    bossSprite.classList.add("scale-75", "opacity-40");
    setTimeout(() => bossSprite.classList.remove("scale-75", "opacity-40"), 200);

    battleLog.className = "mt-4 p-3 rounded-xl text-sm border bg-blue-950/70 border-cyan-500 text-cyan-300 block";
    battleLog.innerHTML = `<strong>${isCrit ? t.critStrike : t.directHit}</strong> Dealt ${damage} damage. <em>${q.explanation}</em>`;

    // Sense (SEN) increases gold gains
    const goldEarned = 20 + (gameState.stats.sen * 3);
    gameState.exp += 35;
    gameState.gold += goldEarned;
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
    // Player takes damage on wrong answer
    const damageTaken = Math.floor(15 + (gameState.currentFloor + 1) * 5);
    gameState.hp = Math.max(0, gameState.hp - damageTaken);

    // Hero avatar red damage flash animation
    heroAvatar.classList.add("text-rose-600", "scale-110");
    setTimeout(() => heroAvatar.classList.remove("text-rose-600", "scale-110"), 400);

    battleLog.className = "mt-4 p-3 rounded-xl text-sm border bg-rose-950/70 border-rose-700 text-rose-300 block";
    battleLog.innerHTML = `<strong>${t.spellFail}</strong> ${t.bossCounterAtk} <strong>${damageTaken}</strong> ${t.damageText}`;

    updateUI();
    saveGame();

    if (gameState.hp <= 0) {
      setTimeout(() => {
        alert(t.hunterDefeatedAlert);
        gameState.hp = gameState.maxHp;
        loadFloor(gameState.currentFloor);
        updateUI();
        saveGame();
        buttons.forEach(b => b.disabled = false);
      }, 600);
    } else {
      setTimeout(() => buttons.forEach(b => b.disabled = false), 1000);
    }
  }
}

function handleBossDefeat() {
  const t = translations[gameState.lang || "en"];
  alert(`${t.gateClearAlert}${dungeonFloors[gameState.currentFloor].boss.name}!`);
  gameState.currentFloor = (gameState.currentFloor + 1) % dungeonFloors.length;
  gameState.challengeIndex = 0;
  gameState.hp = gameState.maxHp; // Full heal on clearing gate
  loadFloor(gameState.currentFloor);
}

function checkLevelUp() {
  const t = translations[gameState.lang || "en"];
  let leveledUp = false;

  while (gameState.exp >= gameState.expToNext) {
    gameState.exp -= gameState.expToNext;
    gameState.level += 1;
    gameState.statPoints += 5; // Earn +5 Stat Points on Level Up
    recalculateDerivedStats();
    gameState.hp = gameState.maxHp; // Heal to full on level up
    gameState.expToNext = Math.floor(gameState.expToNext * 1.4);
    leveledUp = true;
  }

  if (leveledUp) {
    updateUI();
    renderStatusModal();
    statusModal.classList.remove("hidden");
    alert(`${t.levelUpAlert}${gameState.level}!\n${t.levelUpPointsAlert}`);
  }
}

function allocateStat(statKey) {
  if (gameState.statPoints <= 0) return;
  if (!gameState.stats[statKey]) gameState.stats[statKey] = 10;

  gameState.statPoints -= 1;
  gameState.stats[statKey] += 1;

  if (statKey === "vit") {
    recalculateDerivedStats();
    gameState.hp = Math.min(gameState.maxHp, gameState.hp + 15);
  }

  updateUI();
  renderStatusModal();
  saveGame();
}
window.allocateStat = allocateStat;

function renderStatusModal() {
  const t = translations[gameState.lang || "en"];

  // Labels
  document.getElementById("status-modal-title").textContent = t.statusTitle;
  document.getElementById("unallocated-label").textContent = t.unallocatedPoints;
  statPointsVal.textContent = gameState.statPoints;

  document.getElementById("label-str").textContent = t.strLabel;
  document.getElementById("desc-str").textContent = t.strDesc;
  document.getElementById("val-str").textContent = gameState.stats.str;

  document.getElementById("label-vit").textContent = t.vitLabel;
  document.getElementById("desc-vit").textContent = t.vitDesc;
  document.getElementById("val-vit").textContent = gameState.stats.vit;

  document.getElementById("label-agi").textContent = t.agiLabel;
  document.getElementById("desc-agi").textContent = t.agiDesc;
  document.getElementById("val-agi").textContent = gameState.stats.agi;

  document.getElementById("label-int").textContent = t.intLabel;
  document.getElementById("desc-int").textContent = t.intDesc;
  document.getElementById("val-int").textContent = gameState.stats.int;

  document.getElementById("label-sen").textContent = t.senLabel;
  document.getElementById("desc-sen").textContent = t.senDesc;
  document.getElementById("val-sen").textContent = gameState.stats.sen;

  // Toggle plus button disabled state
  ["str", "vit", "agi", "int", "sen"].forEach(key => {
    const btn = document.getElementById(`btn-allocate-${key}`);
    if (btn) btn.disabled = gameState.statPoints <= 0;
  });
}

function updateUI() {
  const t = translations[gameState.lang || "en"];
  recalculateDerivedStats();
  const totalAtk = getDerivedTotalAtk();
  
  heroLvl.textContent = gameState.level;
  heroAtk.textContent = totalAtk;
  goldVal.textContent = gameState.gold;

  // Stat point badge
  if (unallocatedBadge) {
    unallocatedBadge.textContent = gameState.statPoints;
    if (gameState.statPoints > 0) {
      unallocatedBadge.classList.remove("hidden");
    } else {
      unallocatedBadge.classList.add("hidden");
    }
  }

  // HP Bar & text updates
  if (headerHpVal) headerHpVal.textContent = gameState.hp;
  if (headerMaxHpVal) headerMaxHpVal.textContent = gameState.maxHp;
  if (heroHpLabel) heroHpLabel.textContent = `${Math.max(0, gameState.hp)} / ${gameState.maxHp}`;
  if (heroHpBar) {
    const hpPct = Math.max(0, Math.min(100, (gameState.hp / gameState.maxHp) * 100));
    heroHpBar.style.width = `${hpPct}%`;
  }
  
  const rankInfo = getHunterRank(gameState.level);
  hunterRankBadge.textContent = rankInfo.rank;
  hunterSubrank.textContent = `Rank: ${rankInfo.rank}`;
  heroAvatar.innerHTML = `<i class="${rankInfo.icon}"></i>`;
  heroAvatar.className = `text-5xl sm:text-7xl my-2 sm:my-3 ${rankInfo.color} drop-shadow-[0_0_15px_rgba(59,130,246,0.8)] transition-transform`;

  // Localized UI Text
  document.getElementById("hero-title").textContent = t.awakenedName;
  document.getElementById("prompt-desc").textContent = t.resonancePrompt;
  document.getElementById("claim-afk-btn").textContent = t.ariseBtn;
  document.getElementById("open-shop-btn").innerHTML = `<i class="fa-solid fa-store"></i> <span class="hidden sm:inline">${t.shopBtn}</span>`;
  document.getElementById("status-btn-label").textContent = t.statusBtn;
  document.getElementById("status-card-btn-text").textContent = t.statusTitle;
  document.getElementById("reset-system-btn").innerHTML = `<i class="fa-solid fa-rotate-left"></i>`;
  document.getElementById("lang-btn-label").textContent = gameState.lang === "th" ? "TH" : "EN";

  document.getElementById("afk-rate").textContent = getDerivedAfkRate();
  shadowCount.textContent = gameState.currentFloor;
  equippedCount.textContent = gameState.inventory.length;

  const expPct = Math.min(100, (gameState.exp / gameState.expToNext) * 100);
  expBar.style.width = `${expPct}%`;
}

function renderShop() {
  const t = translations[gameState.lang || "en"];
  shopItemsList.innerHTML = "";
  itemShopCatalog.forEach(item => {
    const isOwned = item.type !== "Consumable" && gameState.inventory.includes(item.id);
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
  if (!item) return;
  if (item.type !== "Consumable" && gameState.inventory.includes(itemId)) return;

  if (gameState.gold >= item.price) {
    gameState.gold -= item.price;
    if (item.type !== "Consumable") {
      gameState.inventory.push(item.id);
    }
    if (item.atkBonus) gameState.extraAtk += item.atkBonus;
    if (item.expBonus) {
      gameState.exp += item.expBonus;
      checkLevelUp();
    }
    if (item.afkBonus) gameState.afkRateBonus += item.afkBonus;
    if (item.hpRestore) {
      gameState.hp = Math.min(gameState.maxHp, gameState.hp + item.hpRestore);
    }

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

if (openStatusBtn) {
  openStatusBtn.onclick = () => {
    renderStatusModal();
    statusModal.classList.remove("hidden");
  };
}

if (openStatusCardBtn) {
  openStatusCardBtn.onclick = () => {
    renderStatusModal();
    statusModal.classList.remove("hidden");
  };
}

if (closeStatusBtn) {
  closeStatusBtn.onclick = () => statusModal.classList.add("hidden");
}

claimAfkBtn.onclick = () => {
  afkPendingExp.textContent = "0";
  updateUI();
  saveGame();
};

document.getElementById("lang-toggle-btn").onclick = () => {
  gameState.lang = gameState.lang === "en" ? "th" : "en";
  updateUI();
  renderShop();
  renderStatusModal();
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
    renderStatusModal();
    saveGame();
  }
};

// Mobile Status Toggles
const toggleStatusMdBtn = document.getElementById("toggle-status-md-btn");
const hunterStatusCard = document.getElementById("hunter-status-card");
const toggleCardDetailsBtn = document.getElementById("toggle-card-details-btn");
const hunterDetailsPanel = document.getElementById("hunter-details-panel");
const cardChevron = document.getElementById("card-chevron");

if (toggleStatusMdBtn && hunterStatusCard) {
  toggleStatusMdBtn.onclick = () => {
    hunterStatusCard.scrollIntoView({ behavior: 'smooth' });
  };
}

if (toggleCardDetailsBtn && hunterDetailsPanel) {
  toggleCardDetailsBtn.onclick = () => {
    hunterDetailsPanel.classList.toggle("hidden");
    if (cardChevron) {
      cardChevron.classList.toggle("fa-chevron-down");
      cardChevron.classList.toggle("fa-chevron-up");
    }
  };
}

initGame();