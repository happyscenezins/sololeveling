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

function get3DHeroAvatarSVG(level) {
  return `
    <div class="relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center animate-hero-3d my-1">
      <div class="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-900 blur-xl opacity-60 animate-pulse"></div>
      <svg viewBox="0 0 200 200" class="w-full h-full relative z-10 drop-shadow-[0_10px_20px_rgba(6,182,212,0.8)]">
        <defs>
          <linearGradient id="heroAura" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#0284c7" stop-opacity="0.9"/>
            <stop offset="50%" stop-color="#3b82f6" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#6366f1" stop-opacity="0.6"/>
          </linearGradient>
          <linearGradient id="eyeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#22d3ee"/>
            <stop offset="100%" stop-color="#60a5fa"/>
          </linearGradient>
          <filter id="neonGlow" x1="-20%" y1="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>

        <path d="M 30,170 Q 50,110 100,100 Q 150,110 170,170 Q 100,195 30,170 Z" fill="url(#heroAura)" opacity="0.8" />
        <path d="M 45,150 Q 80,80 100,70 Q 120,80 155,150 Z" fill="#0f172a" stroke="#1e3a8a" stroke-width="2"/>
        <path d="M 60,180 L 100,115 L 140,180 Z" fill="#0284c7" opacity="0.3"/>
        <path d="M 75,130 L 100,95 L 125,130 L 100,165 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
        <path d="M 80,60 L 100,45 L 120,60 L 115,90 L 100,105 L 85,90 Z" fill="#090d16" stroke="#1e293b" stroke-width="2"/>
        <path d="M 75,55 C 65,40 85,30 95,20 C 100,35 110,25 125,35 C 120,50 130,55 125,65 L 115,50 Z" fill="#020617" stroke="#3b82f6" stroke-width="1.5"/>
        
        <ellipse cx="91" cy="68" rx="4" ry="2.5" fill="url(#eyeGlow)" filter="url(#neonGlow)" />
        <ellipse cx="109" cy="68" rx="4" ry="2.5" fill="url(#eyeGlow)" filter="url(#neonGlow)" />
        <line x1="84" y1="68" x2="96" y2="68" stroke="#22d3ee" stroke-width="2" filter="url(#neonGlow)"/>
        <line x1="104" y1="68" x2="116" y2="68" stroke="#22d3ee" stroke-width="2" filter="url(#neonGlow)"/>
        
        <path d="M 40,130 L 70,100 L 75,105 L 45,135 Z" fill="#0284c7" filter="url(#neonGlow)"/>
        <path d="M 160,130 L 130,100 L 125,105 L 155,135 Z" fill="#0284c7" filter="url(#neonGlow)"/>
      </svg>
    </div>
  `;
}

function get3DBossSpriteSVG(bossName) {
  let innerSVG = "";

  if (bossName.includes("Golem")) {
    innerSVG = `
      <svg viewBox="0 0 200 200" class="w-32 h-32 sm:w-44 sm:h-44 relative z-10 drop-shadow-[0_10px_25px_rgba(244,63,94,0.9)]">
        <defs>
          <linearGradient id="golemRock" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1e1b4b"/>
            <stop offset="50%" stop-color="#0f172a"/>
            <stop offset="100%" stop-color="#020617"/>
          </linearGradient>
          <linearGradient id="magmaCore" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#ef4444"/>
            <stop offset="100%" stop-color="#f97316"/>
          </linearGradient>
        </defs>
        <polygon points="30,60 60,30 80,70 40,90" fill="url(#golemRock)" stroke="#f43f5e" stroke-width="2"/>
        <polygon points="170,60 140,30 120,70 160,90" fill="url(#golemRock)" stroke="#f43f5e" stroke-width="2"/>
        <polygon points="60,60 140,60 160,140 100,180 40,140" fill="url(#golemRock)" stroke="#e11d48" stroke-width="3"/>
        <polygon points="85,90 115,90 125,130 100,145 75,130" fill="url(#magmaCore)"/>
        <polygon points="80,25 120,25 130,55 100,70 70,55" fill="#020617" stroke="#f43f5e" stroke-width="2.5"/>
        <line x1="85" y1="40" x2="115" y2="40" stroke="#f59e0b" stroke-width="4"/>
      </svg>
    `;
  } else if (bossName.includes("Specter") || bossName.includes("Lich")) {
    innerSVG = `
      <svg viewBox="0 0 200 200" class="w-32 h-32 sm:w-44 sm:h-44 relative z-10 drop-shadow-[0_10px_25px_rgba(168,85,247,0.9)]">
        <defs>
          <linearGradient id="purpleFire" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#581c87"/>
            <stop offset="50%" stop-color="#9333ea"/>
            <stop offset="100%" stop-color="#c084fc"/>
          </linearGradient>
        </defs>
        <path d="M 20,160 Q 40,80 100,40 Q 160,80 180,160 Q 100,190 20,160 Z" fill="url(#purpleFire)" opacity="0.85"/>
        <path d="M 75,60 Q 100,30 125,60 L 120,100 L 100,120 L 80,100 Z" fill="#090514" stroke="#c084fc" stroke-width="2.5"/>
        <circle cx="88" cy="72" r="5" fill="#a855f7"/>
        <circle cx="112" cy="72" r="5" fill="#a855f7"/>
        <path d="M 140,30 Q 190,50 170,110 L 160,105 Q 175,60 135,40 Z" fill="#c084fc"/>
      </svg>
    `;
  } else if (bossName.includes("Knight") || bossName.includes("Igris") || bossName.includes("Warlord")) {
    innerSVG = `
      <svg viewBox="0 0 200 200" class="w-32 h-32 sm:w-44 sm:h-44 relative z-10 drop-shadow-[0_10px_25px_rgba(225,29,72,0.95)]">
        <defs>
          <linearGradient id="igrisPlume" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#be123c"/>
            <stop offset="100%" stop-color="#fda4af"/>
          </linearGradient>
        </defs>
        <path d="M 100,15 C 60,10 50,45 80,50 L 100,30 Z" fill="url(#igrisPlume)"/>
        <path d="M 70,50 L 130,50 L 140,100 L 100,130 L 60,100 Z" fill="#0f172a" stroke="#e11d48" stroke-width="3"/>
        <polygon points="75,70 125,70 120,80 80,80" fill="#ff1744"/>
        <path d="M 40,100 L 70,85 L 85,120 L 45,150 Z" fill="#1e1b4b" stroke="#e11d48" stroke-width="2"/>
        <path d="M 160,100 L 130,85 L 115,120 L 155,150 Z" fill="#1e1b4b" stroke="#e11d48" stroke-width="2"/>
        <path d="M 100,100 L 100,190 L 95,190 L 95,100 Z" fill="#fda4af"/>
      </svg>
    `;
  } else {
    innerSVG = `
      <svg viewBox="0 0 200 200" class="w-32 h-32 sm:w-44 sm:h-44 relative z-10 drop-shadow-[0_10px_30px_rgba(239,68,68,1)]">
        <defs>
          <linearGradient id="dragonFlame" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#7f1d1d"/>
            <stop offset="50%" stop-color="#dc2626"/>
            <stop offset="100%" stop-color="#fbbf24"/>
          </linearGradient>
        </defs>
        <path d="M 100,90 Q 20,20 10,100 Q 60,110 100,120 Z" fill="url(#dragonFlame)"/>
        <path d="M 100,90 Q 180,20 190,100 Q 140,110 100,120 Z" fill="url(#dragonFlame)"/>
        <path d="M 70,40 L 90,65 L 100,30 L 110,65 L 130,40 L 120,80 L 100,110 L 80,80 Z" fill="#090d16" stroke="#ef4444" stroke-width="3"/>
        <circle cx="88" cy="72" r="4" fill="#fbbf24"/>
        <circle cx="112" cy="72" r="4" fill="#fbbf24"/>
      </svg>
    `;
  }

  return `
    <div class="relative flex items-center justify-center animate-boss-3d">
      <div class="absolute inset-0 rounded-full bg-rose-600/20 blur-2xl animate-pulse"></div>
      ${innerSVG}
    </div>
  `;
}

function loadFloor(floorIdx) {
  const floorData = dungeonFloors[floorIdx] || dungeonFloors[0];
  currentBossHp = floorData.boss.maxHp;
  bossName.textContent = floorData.boss.name;
  bossSprite.innerHTML = get3DBossSpriteSVG(floorData.boss.name);
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
  heroAvatar.innerHTML = get3DHeroAvatarSVG(gameState.level);
  heroAvatar.className = `flex justify-center items-center my-1 transition-all`;

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