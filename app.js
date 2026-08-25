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
if (typeof gameState.currentFloor !== 'number' || isNaN(gameState.currentFloor) || gameState.currentFloor < 0 || gameState.currentFloor >= dungeonFloors.length) {
  gameState.currentFloor = 0;
}
if (typeof gameState.challengeIndex !== 'number' || isNaN(gameState.challengeIndex) || gameState.challengeIndex < 0) {
  gameState.challengeIndex = 0;
}
if (typeof gameState.statPoints !== 'number' || isNaN(gameState.statPoints)) {
  gameState.statPoints = 0;
}
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
  if (gameState.currentFloor === undefined || isNaN(gameState.currentFloor) || gameState.currentFloor < 0 || gameState.currentFloor >= dungeonFloors.length) {
    gameState.currentFloor = 0;
  }
  if (gameState.challengeIndex === undefined || isNaN(gameState.challengeIndex) || gameState.challengeIndex < 0) {
    gameState.challengeIndex = 0;
  }
  recalculateDerivedStats();
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

function getHunterRank(level) {
  if (level >= 30) return { rank: "National Rank", icon: "fa-solid fa-crown", color: "text-amber-400" };
  if (level >= 20) return { rank: "S-Rank Monarch", icon: "fa-solid fa-skull", color: "text-purple-400" };
  if (level >= 15) return { rank: "A-Rank Elite", icon: "fa-solid fa-shield-halved", color: "text-rose-400" };
  if (level >= 10) return { rank: "B-Rank Striker", icon: "fa-solid fa-meteor", color: "text-cyan-400" };
  if (level >= 5) return { rank: "C-Rank Mage", icon: "fa-solid fa-wand-magic-sparkles", color: "text-blue-400" };
  if (level >= 3) return { rank: "D-Rank Hunter", icon: "fa-solid fa-user-shield", color: "text-slate-300" };
  return { rank: "E-Rank Aspirant", icon: "fa-solid fa-user-ninja", color: "text-slate-400" };
}

let isUpdatingDropdown = false;

function selectLesson(floorIdx) {
  if (isUpdatingDropdown) return;
  const idx = parseInt(floorIdx);
  if (isNaN(idx) || idx < 0 || idx >= dungeonFloors.length) return;
  gameState.currentFloor = idx;
  gameState.challengeIndex = 0;
  gameState.savedFloorIdx = idx;
  if (dungeonFloors[idx] && dungeonFloors[idx].boss) {
    gameState.currentBossHp = dungeonFloors[idx].boss.maxHp;
  }
  loadFloor(idx);
  updateUI();
  saveGame();
}
window.selectLesson = selectLesson;

function renderLessonSelectDropdown() {
  const lessonSelect = document.getElementById("lesson-select");
  if (!lessonSelect) return;
  isUpdatingDropdown = true;
  lessonSelect.innerHTML = "";
  dungeonFloors.forEach((floorData, idx) => {
    const opt = document.createElement("option");
    opt.value = idx;
    opt.textContent = `Lesson ${idx + 1}: ${floorData.boss.name} (${floorData.boss.rank})`;
    if (idx === gameState.currentFloor) opt.selected = true;
    lessonSelect.appendChild(opt);
  });
  lessonSelect.value = gameState.currentFloor;
  isUpdatingDropdown = false;
}

function get3DHeroAvatarSVG(level) {
  return `
    <div class="relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center animate-hero-3d my-1">
      <!-- Outer Shadow Monarch Mana Aura -->
      <div class="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-900 blur-xl opacity-70 animate-pulse"></div>
      
      <svg viewBox="0 0 200 200" class="w-full h-full relative z-10 drop-shadow-[0_12px_24px_rgba(6,182,212,0.9)]">
        <defs>
          <linearGradient id="heroAuraGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#0284c7" stop-opacity="0.9"/>
            <stop offset="50%" stop-color="#2563eb" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#7c3aed" stop-opacity="0.7"/>
          </linearGradient>
          <linearGradient id="humanSkin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffedd5"/>
            <stop offset="50%" stop-color="#fed7aa"/>
            <stop offset="100%" stop-color="#fdba74"/>
          </linearGradient>
          <linearGradient id="eyeNeon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#22d3ee"/>
            <stop offset="100%" stop-color="#38bdf8"/>
          </linearGradient>
          <filter id="eyeGlowFilter" x1="-30%" y1="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>

        <!-- Shadow Mana Flames background -->
        <path d="M 25,175 Q 45,95 100,80 Q 155,95 175,175 Q 100,200 25,175 Z" fill="url(#heroAuraGradient)" opacity="0.85" />

        <!-- High-Detail Leather Jacket & Metallic Shoulders -->
        <path d="M 50,155 Q 75,115 100,105 Q 125,115 150,155 L 140,195 L 60,195 Z" fill="#0f172a" stroke="#1e293b" stroke-width="2"/>
        <path d="M 62,135 L 85,115 L 100,145 L 70,175 Z" fill="#1e293b" stroke="#0284c7" stroke-width="1.5" />
        <path d="M 138,135 L 115,115 L 100,145 L 130,175 Z" fill="#1e293b" stroke="#0284c7" stroke-width="1.5" />

        <!-- Human Neck & Jawline -->
        <path d="M 90,95 L 110,95 L 112,118 L 88,118 Z" fill="url(#humanSkin)"/>
        <path d="M 78,55 L 100,40 L 122,55 L 118,85 L 100,102 L 82,85 Z" fill="url(#humanSkin)" stroke="#fb923c" stroke-width="1"/>

        <!-- Realistic Anime Hair (Sung Jin-Woo Black Bangs) -->
        <path d="M 74,52 C 60,35 80,20 96,15 C 105,28 115,18 128,32 C 122,48 132,52 124,68 L 116,50 C 110,65 100,45 92,62 Z" fill="#020617" stroke="#0284c7" stroke-width="1.5"/>

        <!-- Piercing Neon-Electric Blue Eyes -->
        <ellipse cx="90" cy="65" rx="4.5" ry="2.8" fill="url(#eyeNeon)" filter="url(#eyeGlowFilter)"/>
        <ellipse cx="110" cy="65" rx="4.5" ry="2.8" fill="url(#eyeNeon)" filter="url(#eyeGlowFilter)"/>
        <line x1="82" y1="65" x2="96" y2="65" stroke="#22d3ee" stroke-width="2" filter="url(#eyeGlowFilter)"/>
        <line x1="104" y1="65" x2="118" y2="65" stroke="#22d3ee" stroke-width="2" filter="url(#eyeGlowFilter)"/>

        <!-- Dual Shadow Daggers with Electric Mana Sparks -->
        <path d="M 35,145 L 68,110 L 73,115 L 40,150 Z" fill="#0284c7" filter="url(#eyeGlowFilter)"/>
        <path d="M 165,145 L 132,110 L 127,115 L 160,150 Z" fill="#0284c7" filter="url(#eyeGlowFilter)"/>
      </svg>
    </div>
  `;
}

function get3DBossSpriteSVG(bossName) {
  let innerSVG = "";

  if (bossName.includes("Golem")) {
    // Real Granite & Obsidian Rock Titan Monster
    innerSVG = `
      <svg viewBox="0 0 200 200" class="w-32 h-32 sm:w-44 sm:h-44 relative z-10 drop-shadow-[0_12px_28px_rgba(244,63,94,0.95)]">
        <defs>
          <linearGradient id="graniteRock" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#312e81"/>
            <stop offset="50%" stop-color="#1e1b4b"/>
            <stop offset="100%" stop-color="#020617"/>
          </linearGradient>
          <linearGradient id="lavaVeins" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#dc2626"/>
            <stop offset="50%" stop-color="#ef4444"/>
            <stop offset="100%" stop-color="#f97316"/>
          </linearGradient>
        </defs>
        <polygon points="25,50 65,25 85,75 35,95" fill="url(#graniteRock)" stroke="#f43f5e" stroke-width="2.5"/>
        <polygon points="175,50 135,25 115,75 165,95" fill="url(#graniteRock)" stroke="#f43f5e" stroke-width="2.5"/>
        <polygon points="55,55 145,55 165,145 100,185 35,145" fill="url(#graniteRock)" stroke="#e11d48" stroke-width="3"/>
        <polygon points="80,85 120,85 130,135 100,155 70,135" fill="url(#lavaVeins)"/>
        <polygon points="75,20 125,20 135,55 100,72 65,55" fill="#020617" stroke="#f43f5e" stroke-width="3"/>
        <line x1="80" y1="38" x2="120" y2="38" stroke="#fbbf24" stroke-width="5"/>
      </svg>
    `;
  } else if (bossName.includes("Specter") || bossName.includes("Lich")) {
    // Real Terrifying Spirit Reaper Monster with Bone Skull
    innerSVG = `
      <svg viewBox="0 0 200 200" class="w-32 h-32 sm:w-44 sm:h-44 relative z-10 drop-shadow-[0_12px_28px_rgba(168,85,247,0.95)]">
        <defs>
          <linearGradient id="reaperFire" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#3b0764"/>
            <stop offset="50%" stop-color="#7e22ce"/>
            <stop offset="100%" stop-color="#d8b4fe"/>
          </linearGradient>
        </defs>
        <path d="M 15,165 Q 35,75 100,35 Q 165,75 185,165 Q 100,195 15,165 Z" fill="url(#reaperFire)" opacity="0.9"/>
        <path d="M 70,55 Q 100,25 130,55 L 125,105 L 100,125 L 75,105 Z" fill="#090514" stroke="#c084fc" stroke-width="3"/>
        <circle cx="86" cy="68" r="6" fill="#a855f7"/>
        <circle cx="114" cy="68" r="6" fill="#a855f7"/>
        <path d="M 135,25 Q 195,45 175,115 L 162,108 Q 180,60 130,35 Z" fill="#e9d5ff" stroke="#a855f7" stroke-width="1.5"/>
      </svg>
    `;
  } else if (bossName.includes("Knight") || bossName.includes("Igris") || bossName.includes("Warlord")) {
    // Real Shadow Knight Igris Armor Monster
    innerSVG = `
      <svg viewBox="0 0 200 200" class="w-32 h-32 sm:w-44 sm:h-44 relative z-10 drop-shadow-[0_12px_30px_rgba(225,29,72,1)]">
        <defs>
          <linearGradient id="igrisPlumeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#9f1239"/>
            <stop offset="50%" stop-color="#e11d48"/>
            <stop offset="100%" stop-color="#fecdd3"/>
          </linearGradient>
        </defs>
        <path d="M 100,10 C 50,5 40,40 75,45 L 100,25 Z" fill="url(#igrisPlumeGrad)"/>
        <path d="M 65,45 L 135,45 L 145,100 L 100,135 L 55,100 Z" fill="#0b0f19" stroke="#e11d48" stroke-width="3.5"/>
        <polygon points="70,68 130,68 124,80 76,80" fill="#ff1744"/>
        <path d="M 35,95 L 68,80 L 82,120 L 40,155 Z" fill="#1e1b4b" stroke="#e11d48" stroke-width="2.5"/>
        <path d="M 165,95 L 132,80 L 118,120 L 160,155 Z" fill="#1e1b4b" stroke="#e11d48" stroke-width="2.5"/>
        <path d="M 100,95 L 100,195 L 94,195 L 94,95 Z" fill="#fecdd3"/>
      </svg>
    `;
  } else {
    // Real Terrifying Shadow Dragon Beast Monster
    innerSVG = `
      <svg viewBox="0 0 200 200" class="w-32 h-32 sm:w-44 sm:h-44 relative z-10 drop-shadow-[0_12px_32px_rgba(239,68,68,1)]">
        <defs>
          <linearGradient id="dragonInferno" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#450a0a"/>
            <stop offset="40%" stop-color="#b91c1c"/>
            <stop offset="100%" stop-color="#fde047"/>
          </linearGradient>
        </defs>
        <path d="M 100,85 Q 15,10 5,95 Q 55,105 100,115 Z" fill="url(#dragonInferno)"/>
        <path d="M 100,85 Q 185,10 195,95 Q 145,105 100,115 Z" fill="url(#dragonInferno)"/>
        <path d="M 65,35 L 88,60 L 100,25 L 112,60 L 135,35 L 122,78 L 100,112 L 78,78 Z" fill="#030712" stroke="#ef4444" stroke-width="3.5"/>
        <circle cx="86" cy="68" r="4.5" fill="#fde047"/>
        <circle cx="114" cy="68" r="4.5" fill="#fde047"/>
      </svg>
    `;
  }

  return `
    <div class="relative flex items-center justify-center animate-boss-3d">
      <div class="absolute inset-0 rounded-full bg-rose-600/25 blur-2xl animate-pulse"></div>
      ${innerSVG}
    </div>
  `;
}

function loadFloor(floorIdx) {
  const safeFloorIdx = (typeof floorIdx === 'number' && !isNaN(floorIdx) && floorIdx >= 0 && floorIdx < dungeonFloors.length) ? floorIdx : 0;
  gameState.currentFloor = safeFloorIdx;

  const floorData = dungeonFloors[safeFloorIdx] || dungeonFloors[0];

  if (gameState.savedFloorIdx === safeFloorIdx && typeof gameState.currentBossHp === 'number' && !isNaN(gameState.currentBossHp) && gameState.currentBossHp > 0) {
    currentBossHp = gameState.currentBossHp;
  } else {
    currentBossHp = floorData.boss.maxHp;
    gameState.savedFloorIdx = safeFloorIdx;
    gameState.currentBossHp = currentBossHp;
  }

  if (bossName) bossName.textContent = floorData.boss.name;
  if (bossSprite) bossSprite.innerHTML = get3DBossSpriteSVG(floorData.boss.name);
  if (gateTitle) gateTitle.textContent = floorData.title;
  if (gateRankBadge) gateRankBadge.textContent = floorData.boss.rank;
  if (moduleLabel) moduleLabel.textContent = floorData.module;

  renderBossHp(floorData.boss.maxHp);
  renderLessonSelectDropdown();

  const challengeList = floorData.challenges || [floorData.challenge];
  if (typeof gameState.challengeIndex !== 'number' || isNaN(gameState.challengeIndex) || gameState.challengeIndex < 0) {
    gameState.challengeIndex = 0;
  }
  const safeIndex = Math.abs(parseInt(gameState.challengeIndex) || 0) % challengeList.length;
  const currentQ = challengeList[safeIndex] || challengeList[0];
  loadChallenge(currentQ);
}

function renderBossHp(maxHp) {
  const pct = Math.max(0, (currentBossHp / maxHp) * 100);
  bossHpBar.style.width = `${pct}%`;
  bossHpLabel.textContent = `${Math.max(0, currentBossHp)} / ${maxHp}`;
}

function loadChallenge(q) {
  if (!q) return;
  lessonTag.textContent = q.lesson || "Lesson";
  sentencePrompt.textContent = q.sentence || "";
  battleLog.classList.add("hidden");
  optionsGrid.innerHTML = "";

  if (q.options && Array.isArray(q.options)) {
    q.options.forEach((opt, idx) => {
      const btn = document.createElement("button");
      btn.className = "p-3.5 sm:p-4 rounded-xl bg-slate-950/90 hover:bg-blue-950/60 active:bg-blue-900/80 border border-blue-900/40 hover:border-blue-500 font-medium text-left transition-all text-xs sm:text-sm active:scale-[0.98] shadow-md flex items-center gap-2 cursor-pointer";
      btn.textContent = `${String.fromCharCode(65 + idx)}. ${opt}`;
      btn.onclick = () => executeSpell(idx);
      optionsGrid.appendChild(btn);
    });
  }
}

function executeSpell(selectedIndex) {
  const t = translations[gameState.lang || "en"];
  const floor = dungeonFloors[gameState.currentFloor] || dungeonFloors[0];
  const challengeList = floor.challenges || [floor.challenge];

  if (gameState.challengeIndex === undefined || isNaN(gameState.challengeIndex) || gameState.challengeIndex < 0) {
    gameState.challengeIndex = 0;
  }
  const safeIdx = Math.abs(parseInt(gameState.challengeIndex) || 0) % challengeList.length;
  const q = challengeList[safeIdx] || challengeList[0];
  
  const buttons = optionsGrid.querySelectorAll("button");
  buttons.forEach(b => b.disabled = true);

  const totalAtk = getDerivedTotalAtk();

  if (selectedIndex === q.correctIndex) {
    // Agility (AGI) increases crit chance
    const critChance = Math.min(0.85, 0.35 + (gameState.stats.agi * 0.015));
    const isCrit = Math.random() < critChance;
    const damage = Math.floor(totalAtk * (isCrit ? 2.2 : 1.2));
    currentBossHp -= damage;
    gameState.currentBossHp = Math.max(0, currentBossHp);
    renderBossHp(floor.boss.maxHp);

    bossSprite.classList.add("scale-75", "opacity-40");
    setTimeout(() => bossSprite.classList.remove("scale-75", "opacity-40"), 200);

    battleLog.className = "mt-4 p-3 rounded-xl text-sm border bg-blue-950/70 border-cyan-500 text-cyan-300 block";
    battleLog.innerHTML = `<strong>${isCrit ? t.critStrike : t.directHit}</strong> Dealt ${damage} damage. <em>${q.explanation}</em>`;

    // Intelligence (INT) increases EXP earned per question
    const expBonus = 1 + (gameState.stats.int * 0.02);
    const expEarned = Math.floor(35 * expBonus);

    // Sense (SEN) increases gold gains
    const goldEarned = 20 + (gameState.stats.sen * 3);
    gameState.exp += expEarned;
    gameState.gold += goldEarned;
    checkLevelUp();

    setTimeout(() => {
      if (currentBossHp <= 0) {
        handleBossDefeat();
      } else {
        gameState.challengeIndex = (safeIdx + 1) % challengeList.length;
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
    battleLog.innerHTML = `<strong>${t.spellFail}</strong> ${t.bossCounterAtk} <strong>${damageTaken}</strong> ${t.damageText} <em>${q.explanation}</em>`;

    updateUI();
    saveGame();

    if (gameState.hp <= 0) {
      setTimeout(() => {
        alert(t.hunterDefeatedAlert);
        gameState.hp = gameState.maxHp;
        gameState.currentBossHp = dungeonFloors[gameState.currentFloor].boss.maxHp;
        gameState.challengeIndex = 0;
        loadFloor(gameState.currentFloor);
        updateUI();
        saveGame();
      }, 600);
    } else {
      setTimeout(() => {
        gameState.challengeIndex = (safeIdx + 1) % challengeList.length;
        loadChallenge(challengeList[gameState.challengeIndex]);
        updateUI();
        saveGame();
      }, 1400);
    }
  }
}

function handleBossDefeat() {
  const t = translations[gameState.lang || "en"];
  alert(`${t.gateClearAlert}${dungeonFloors[gameState.currentFloor].boss.name}!`);
  gameState.currentFloor = (gameState.currentFloor + 1) % dungeonFloors.length;
  gameState.challengeIndex = 0;
  gameState.savedFloorIdx = gameState.currentFloor;
  gameState.currentBossHp = dungeonFloors[gameState.currentFloor].boss.maxHp;
  gameState.hp = gameState.maxHp; // Full heal on clearing gate
  loadFloor(gameState.currentFloor);
  saveGame();
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
  document.getElementById("open-shop-btn").innerHTML = `<i class="fa-solid fa-store"></i> <span class="hidden sm:inline">${t.shopBtn}</span>`;
  document.getElementById("status-btn-label").textContent = t.statusBtn;
  document.getElementById("status-card-btn-text").textContent = t.statusTitle;
  document.getElementById("reset-system-btn").innerHTML = `<i class="fa-solid fa-rotate-left"></i>`;
  document.getElementById("lang-btn-label").textContent = gameState.lang === "th" ? "TH" : "EN";

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

window.addEventListener("beforeunload", () => {
  saveGame();
});

initGame();