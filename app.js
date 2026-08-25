class WebAudioSynth {
  constructor() {
    this.ctx = null;
  }
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }
  playBladeSlash() {
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch(e) {}
  }
  playCritStrike() {
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch(e) {}
  }
  playSpellFizzle() {
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(70, this.ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch(e) {}
  }
  playLevelUpFanfare() {
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [261.63, 329.63, 392.00, 523.25];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + (idx * 0.08));
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime + (idx * 0.08));
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + (idx * 0.08) + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + (idx * 0.08));
        osc.stop(this.ctx.currentTime + (idx * 0.08) + 0.2);
      });
    } catch(e) {}
  }
  playGateClearedTriumph() {
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [392.00, 493.88, 587.33, 783.99];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + (idx * 0.1));
        gain.gain.setValueAtTime(0.35, this.ctx.currentTime + (idx * 0.1));
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + (idx * 0.1) + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + (idx * 0.1));
        osc.stop(this.ctx.currentTime + (idx * 0.1) + 0.3);
      });
    } catch(e) {}
  }
}

const audioSynth = new WebAudioSynth();

const defaultState = {
  lang: "en",
  level: 1,
  exp: 0,
  expToNext: 250, // Increased starting EXP required to level up
  gold: 0,
  extraAtk: 0,
  hp: 200,
  maxHp: 200,
  statPoints: 0, // Hunter starts with 0 unallocated stat points (must level up to earn them)
  stats: { str: 10, vit: 10, agi: 10, int: 10, sen: 10 },
  hunterClass: "Shadow Assassin",
  unlockedPassives: ["node_assassin_1"],
  shadowArmy: [],
  grimoireOfFlaws: [],
  worldRaidContribution: 0,
  currentFloor: 0,
  challengeIndex: 0,
  inventory: [],
  lastActive: Date.now()
};

let gameState = JSON.parse(localStorage.getItem("soloFluency_save")) || defaultState;
if (!gameState.hunterClass) gameState.hunterClass = "Shadow Assassin";
if (!gameState.unlockedPassives) gameState.unlockedPassives = ["node_assassin_1"];
if (!gameState.shadowArmy) gameState.shadowArmy = [];
if (!gameState.grimoireOfFlaws) gameState.grimoireOfFlaws = [];
if (gameState.worldRaidContribution === undefined) gameState.worldRaidContribution = 0;
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

function getShadowArmyBuffs() {
  let goldMult = 1.0;
  let critBonus = 0;
  let atkBonus = 0;
  let expMult = 1.0;

  if (gameState.shadowArmy && Array.isArray(gameState.shadowArmy)) {
    gameState.shadowArmy.forEach(s => {
      if (s.name.includes("Golem")) goldMult += 0.15;
      if (s.name.includes("Specter")) expMult += 0.15;
      if (s.name.includes("Knight") || s.name.includes("Igris")) {
        critBonus += 0.10;
        atkBonus += 25;
      }
      if (s.name.includes("Monarch") || s.name.includes("Antares") || s.name.includes("Sovereign")) {
        expMult += 0.30;
        atkBonus += 50;
      }
    });
  }
  return { goldMult, critBonus, atkBonus, expMult };
}

function recalculateDerivedStats() {
  let hpBonus = 0;
  if (gameState.unlockedPassives && gameState.unlockedPassives.includes("node_mage_3")) hpBonus += 60;
  if (gameState.unlockedPassives && gameState.unlockedPassives.includes("node_warlord_2")) hpBonus += 100;

  gameState.maxHp = 50 + (gameState.stats.vit * 15) + hpBonus;
  if (gameState.hp > gameState.maxHp) gameState.hp = gameState.maxHp;
}

function getDerivedTotalAtk() {
  let classAtkBonus = 0;
  if (gameState.unlockedPassives && gameState.unlockedPassives.includes("node_assassin_2")) classAtkBonus += 20;
  if (gameState.unlockedPassives && gameState.unlockedPassives.includes("node_warlord_1")) classAtkBonus += 35;

  const shadowBuffs = getShadowArmyBuffs();
  return (gameState.stats.str * 5) + gameState.extraAtk + classAtkBonus + shadowBuffs.atkBonus;
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

let activeFloorChallenges = [];

function shuffleArray(array) {
  if (!array || !Array.isArray(array)) return [];
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
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

  const rawList = floorData.challenges || [floorData.challenge];
  activeFloorChallenges = shuffleArray(rawList);

  if (typeof gameState.challengeIndex !== 'number' || isNaN(gameState.challengeIndex) || gameState.challengeIndex < 0) {
    gameState.challengeIndex = 0;
  }
  const safeIndex = Math.abs(parseInt(gameState.challengeIndex) || 0) % activeFloorChallenges.length;
  const currentQ = activeFloorChallenges[safeIndex] || activeFloorChallenges[0];
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

function triggerScreenShake() {
  const combatCard = document.getElementById("combat-card");
  if (combatCard) {
    combatCard.classList.remove("animate-shake");
    void combatCard.offsetWidth; // trigger reflow
    combatCard.classList.add("animate-shake");
    setTimeout(() => combatCard.classList.remove("animate-shake"), 500);
  }
}

function triggerDamageVignette() {
  const flash = document.createElement("div");
  flash.className = "damage-flash";
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 700);
}

function spawnFloatingDamage(amount) {
  const combatCard = document.getElementById("combat-card");
  if (combatCard) {
    const el = document.createElement("div");
    el.className = "floating-damage";
    el.textContent = `-${amount} HP!`;
    combatCard.appendChild(el);
    setTimeout(() => el.remove(), 950);
  }
}

function executeSpell(selectedIndex) {
  const t = translations[gameState.lang || "en"];
  const floor = dungeonFloors[gameState.currentFloor] || dungeonFloors[0];

  if (!activeFloorChallenges || activeFloorChallenges.length === 0) {
    activeFloorChallenges = shuffleArray(floor.challenges || [floor.challenge]);
  }

  if (gameState.challengeIndex === undefined || isNaN(gameState.challengeIndex) || gameState.challengeIndex < 0) {
    gameState.challengeIndex = 0;
  }
  const safeIdx = Math.abs(parseInt(gameState.challengeIndex) || 0) % activeFloorChallenges.length;
  const q = activeFloorChallenges[safeIdx] || activeFloorChallenges[0];
  
  const buttons = optionsGrid.querySelectorAll("button");
  buttons.forEach(b => b.disabled = true);

  // Turn Enrage Increment
  gameState.bossTurnsTaken = (gameState.bossTurnsTaken || 0) + 1;
  const enrageMult = 1.0 + (gameState.bossTurnsTaken * 0.10);

  const totalAtk = getDerivedTotalAtk();

  if (selectedIndex === q.correctIndex) {
    // Check Daily Directives progress
    if (!gameState.dailyDirectives) gameState.dailyDirectives = { streak: 1, toneDone: 0, voiceDone: 0, redgateDone: 0, lastDate: new Date().toISOString().split('T')[0] };
    if (q.lesson && q.lesson.includes("Tone")) gameState.dailyDirectives.toneDone += 1;

    // Check Grammar Barrier Phase at 50% HP
    const bossMaxHp = floor.boss.maxHp || 1000;
    if (currentBossHp <= bossMaxHp * 0.5 && !gameState.bossBarrierBroken) {
      if (!gameState.bossBarrierActive) {
        gameState.bossBarrierActive = true;
        gameState.bossBarrierHitsLeft = 2;
        alert(t.grammarBarrierActive);
      }
    }

    // Class & Shadow Army Passives: Crit Chance bonus
    const shadowBuffs = getShadowArmyBuffs();
    let extraCritChance = shadowBuffs.critBonus;
    if (gameState.unlockedPassives && gameState.unlockedPassives.includes("node_assassin_1")) extraCritChance += 0.10;
    if (gameState.unlockedPassives && gameState.unlockedPassives.includes("node_striker_1")) extraCritChance += 0.20;

    const critChance = Math.min(0.85, 0.35 + (gameState.stats.agi * 0.015) + extraCritChance);
    const isCrit = Math.random() < critChance;

    if (isCrit) {
      audioSynth.playCritStrike();
    } else {
      audioSynth.playBladeSlash();
    }

    let critMultiplier = 2.2;
    if (gameState.unlockedPassives && gameState.unlockedPassives.includes("node_striker_3")) critMultiplier += 0.60;

    // Boss Armor Mitigation
    const bossArmor = floor.boss.armor || 0.40;
    let damage = Math.floor(totalAtk * (isCrit ? critMultiplier : (1.2 * (1 - bossArmor))));

    if (gameState.bossBarrierActive) {
      gameState.bossBarrierHitsLeft -= 1;
      damage = 0; // Barrier absorbs hit
      if (gameState.bossBarrierHitsLeft <= 0) {
        gameState.bossBarrierActive = false;
        gameState.bossBarrierBroken = true;
        alert(t.grammarBarrierShattered);
      }
    }

    currentBossHp -= damage;
    gameState.currentBossHp = Math.max(0, currentBossHp);
    renderBossHp(bossMaxHp);

    bossSprite.classList.add("scale-75", "opacity-40");
    setTimeout(() => bossSprite.classList.remove("scale-75", "opacity-40"), 200);

    // Class Passives & Synergy: Healing on correct answer
    if (gameState.unlockedPassives && gameState.unlockedPassives.includes("node_striker_2")) {
      gameState.hp = Math.min(gameState.maxHp, gameState.hp + 12);
    }

    battleLog.className = "mt-4 p-3 rounded-xl text-sm border bg-blue-950/70 border-cyan-500 text-cyan-300 block";
    battleLog.innerHTML = `<strong>${isCrit ? t.critStrike : t.directHit}</strong> ${gameState.bossBarrierActive ? '🛡️ [BARRIER ABSORBED]' : `Dealt ${damage} damage (Boss Armor: ${Math.round(bossArmor * 100)}%)`}. <em>${q.explanation}</em>`;

    // EXP & Gold calculation
    let expMultiplier = (1 + (gameState.stats.int * 0.02)) * shadowBuffs.expMult;
    if (gameState.unlockedPassives && gameState.unlockedPassives.includes("node_mage_2")) expMultiplier += 0.30;
    const expEarned = Math.floor(15 * expMultiplier);

    let goldEarned = Math.floor((20 + (gameState.stats.sen * 3)) * shadowBuffs.goldMult);
    if (gameState.unlockedPassives && gameState.unlockedPassives.includes("node_warlord_3")) goldEarned = Math.floor(goldEarned * 1.5);
    if (isCrit && gameState.unlockedPassives && gameState.unlockedPassives.includes("node_assassin_3")) goldEarned = Math.floor(goldEarned * 1.5);

    gameState.exp += expEarned;
    gameState.gold += goldEarned;
    checkLevelUp();

    setTimeout(() => {
      if (currentBossHp <= 0) {
        handleBossDefeat();
      } else {
        gameState.challengeIndex = (safeIdx + 1) % activeFloorChallenges.length;
        loadChallenge(activeFloorChallenges[gameState.challengeIndex]);
      }
      updateUI();
      saveGame();
    }, 1200);

  } else {
    audioSynth.playSpellFizzle();
    triggerScreenShake();
    triggerDamageVignette();

    // Log missed question into Grimoire of Flaws
    if (!gameState.grimoireOfFlaws) gameState.grimoireOfFlaws = [];
    if (!gameState.grimoireOfFlaws.some(item => item.sentence === q.sentence)) {
      gameState.grimoireOfFlaws.push(q);
    }

    // High-Stakes Retaliation: 25%–35% of Hunter Max HP * Enrage Multiplier
    const basePct = 0.25 + (Math.random() * 0.10);
    let damageTaken = Math.floor((gameState.maxHp * basePct) * enrageMult);
    if (gameState.unlockedPassives && gameState.unlockedPassives.includes("node_mage_1")) {
      damageTaken = Math.floor(damageTaken * 0.7); // Diplomatic Shield -30%
    }
    
    gameState.hp = Math.max(0, gameState.hp - damageTaken);
    spawnFloatingDamage(damageTaken);

    // Hero avatar red damage flash animation
    heroAvatar.classList.add("text-rose-600", "scale-110");
    setTimeout(() => heroAvatar.classList.remove("text-rose-600", "scale-110"), 400);

    battleLog.className = "mt-4 p-3 rounded-xl text-sm border bg-rose-950/70 border-rose-700 text-rose-300 block";
    battleLog.innerHTML = `<strong>${t.spellFail}</strong> ${t.bossCounterAtk} <strong>${damageTaken} HP</strong> (Enrage: +${Math.round((enrageMult - 1) * 100)}%)! <em>${q.explanation}</em>`;

    updateUI();
    saveGame();

    if (gameState.hp <= 0) {
      setTimeout(() => {
        alert(t.gateCollapseAlert);
        gameState.hp = gameState.maxHp;
        gameState.bossTurnsTaken = 0;
        gameState.bossBarrierActive = false;
        gameState.bossBarrierBroken = false;
        gameState.gold = Math.floor(gameState.gold * 0.85); // Deduct 15% gold
        currentBossHp = floor.boss.maxHp;
        gameState.currentBossHp = currentBossHp;
        gameState.challengeIndex = 0;
        loadFloor(gameState.currentFloor);
        updateUI();
        saveGame();
      }, 600);
    } else {
      setTimeout(() => {
        gameState.challengeIndex = (safeIdx + 1) % activeFloorChallenges.length;
        loadChallenge(activeFloorChallenges[gameState.challengeIndex]);
        updateUI();
        saveGame();
      }, 1400);
    }
  }
}

function handleBossDefeat() {
  audioSynth.playDarkRumble();
  audioSynth.playGateClearedTriumph();
  const floor = dungeonFloors[gameState.currentFloor] || dungeonFloors[0];
  const boss = floor.boss;

  gameState.bossTurnsTaken = 0;
  gameState.bossBarrierActive = false;
  gameState.bossBarrierBroken = false;

  const ariseModal = document.getElementById("arise-modal");
  const ariseDesc = document.getElementById("arise-desc");
  const ariseBtn = document.getElementById("arise-action-btn");

  if (ariseModal && ariseDesc && ariseBtn) {
    ariseDesc.textContent = `Gate Monarch [${boss.name}] defeated! Extract soul into your active Shadow Army?`;
    ariseBtn.onclick = () => {
      if (!gameState.shadowArmy.some(s => s.name === boss.name)) {
        gameState.shadowArmy.push({ name: boss.name, rank: boss.rank, icon: boss.iconClass });
        alert(`⚡ [ARISE PROTOCOL SUCCESS] Extracted ${boss.name} into your Shadow Army!`);
      }
      ariseModal.classList.add("hidden");
      gameState.currentFloor = (gameState.currentFloor + 1) % dungeonFloors.length;
      gameState.challengeIndex = 0;
      gameState.savedFloorIdx = gameState.currentFloor;
      gameState.currentBossHp = dungeonFloors[gameState.currentFloor].boss.maxHp;
      loadFloor(gameState.currentFloor);
      updateUI();
      saveGame();
    };
    ariseModal.classList.remove("hidden");
  } else {
    gameState.currentFloor = (gameState.currentFloor + 1) % dungeonFloors.length;
    gameState.challengeIndex = 0;
    gameState.savedFloorIdx = gameState.currentFloor;
    gameState.currentBossHp = dungeonFloors[gameState.currentFloor].boss.maxHp;
    loadFloor(gameState.currentFloor);
    updateUI();
    saveGame();
  }
}

function checkLevelUp() {
  const t = translations[gameState.lang || "en"];
  let leveledUp = false;

  while (gameState.exp >= gameState.expToNext) {
    gameState.exp -= gameState.expToNext;
    gameState.level += 1;
    gameState.statPoints += 1; // Earn +1 Stat Point per level up (user rule)
    recalculateDerivedStats();
    gameState.expToNext = Math.floor(gameState.expToNext * 1.8); // 1.8x EXP scaling multiplier per level
    leveledUp = true;
  }

  if (leveledUp) {
    audioSynth.playLevelUpFanfare();
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
  hunterSubrank.textContent = `${t.rankStriker} (Lv.${gameState.level})`;
  heroAvatar.innerHTML = get3DHeroAvatarSVG(gameState.level);
  heroAvatar.className = `flex justify-center items-center my-1 transition-all`;

  // Localized Text Utility Helper
  const setTxt = (id, txt) => {
    const el = document.getElementById(id);
    if (el && txt) el.textContent = txt;
  };

  setTxt("system-header-label", t.systemHeader);
  setTxt("system-title-label", t.systemTitle);
  setTxt("install-btn-label", t.installBtn);
  setTxt("trials-btn-label", t.trialsBtn);
  setTxt("daily-btn-label", t.dailyBtn);
  setTxt("leaderboard-btn-label", t.leaderboardBtn);
  setTxt("class-btn-label", t.classBtn);
  setTxt("redgate-btn-label", t.redgateBtn);
  setTxt("raid-btn-label", t.raidBtn);
  setTxt("grimoire-btn-label", t.grimoireBtn);
  setTxt("army-btn-label", t.armyBtn);
  setTxt("status-btn-label", t.statusBtn);
  setTxt("shop-btn-label", t.shopBtn);
  setTxt("lang-btn-label", gameState.lang === "th" ? "TH" : "EN");

  setTxt("hunter-status-tag", t.hunterStatus);
  setTxt("hero-title", t.awakenedName);
  setTxt("hero-hp-title", t.hunterHpLabel);
  setTxt("status-card-btn-text", t.openStatusWindowBtn);
  setTxt("combat-active-label", t.combatSystemActive);
  setTxt("shadow-army-label", t.shadowArmy);
  setTxt("equipped-artifacts-label", t.equippedArtifacts);

  setTxt("gate-monarch-hp-label", t.gateMonarchHp);
  setTxt("rune-skill-label", t.runeSkill);
  setTxt("prompt-desc", t.resonancePrompt);
  setTxt("voice-spell-label", t.voiceSpellBtn);

  // Localized Modal Headers & Descriptions
  setTxt("shop-modal-title", t.vaultTitle);
  setTxt("shop-modal-desc", t.vaultDesc);
  setTxt("class-modal-title", t.classModalTitle);
  setTxt("select-class-label", t.selectClassLabel);
  setTxt("active-buff-tree-label", t.activeBuffTreeLabel);
  setTxt("redgate-modal-title", t.redgateModalTitle);
  setTxt("redgate-modal-desc", t.redgateDesc);
  setTxt("raid-modal-title", t.raidModalTitle);
  setTxt("raid-modal-desc", t.raidDesc);
  setTxt("arise-modal-title", t.ariseModalTitle);
  setTxt("arise-action-btn", t.ariseActionBtn);
  setTxt("army-modal-title", t.armyModalTitle);
  setTxt("grimoire-modal-title", t.grimoireModalTitle);
  setTxt("grimoire-modal-desc", t.grimoireDesc);

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
  renderClassModal();
  renderArmyModal();
  renderGrimoireModal();
  renderTrialsModal();
  renderDailyModal();
  renderLeaderboardModal("global");
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

// --- HUNTER CLASS SPECIALIZATIONS & PASSIVE TREES ---
const hunterClassesCatalog = {
  "Shadow Assassin": {
    name: "Shadow Assassin",
    focus: "Error Elimination & Grammatical Precision",
    icon: "fa-solid fa-user-ninja",
    color: "text-cyan-400",
    nodes: [
      { id: "node_assassin_1", name: "Shadow Precision", desc: "+10% Critical Hit Chance", reqLevel: 1 },
      { id: "node_assassin_2", name: "Dagger Strike", desc: "+20 Base Attack Power", reqLevel: 3 },
      { id: "node_assassin_3", name: "Monarch's Reaping", desc: "+50% Gold earned on Critical Hits", reqLevel: 5 }
    ]
  },
  "Diplomat Mage": {
    name: "Diplomat Mage",
    focus: "Tone Softening & Hedging Mastery",
    icon: "fa-solid fa-wand-magic-sparkles",
    color: "text-purple-400",
    nodes: [
      { id: "node_mage_1", name: "Diplomatic Shield", desc: "Reduces wrong-answer damage taken by 30%", reqLevel: 1 },
      { id: "node_mage_2", name: "Hedging Mastery", desc: "+30% EXP earned per question", reqLevel: 3 },
      { id: "node_mage_3", name: "Mage's Barrier", desc: "+60 Max HP Shielding", reqLevel: 5 }
    ]
  },
  "Executive Warlord": {
    name: "Executive Warlord",
    focus: "Business Writing & High-Register Command",
    icon: "fa-solid fa-crown",
    color: "text-amber-400",
    nodes: [
      { id: "node_warlord_1", name: "Commanding Aura", desc: "+35 Base Attack Power against Monarchs", reqLevel: 1 },
      { id: "node_warlord_2", name: "Titan Fortitude", desc: "+100 Max HP", reqLevel: 3 },
      { id: "node_warlord_3", name: "Sovereign Treasury", desc: "+50% Gold earned on every question", reqLevel: 5 }
    ]
  },
  "Phrasal Shadow Striker": {
    name: "Phrasal Shadow Striker",
    focus: "Phrasal Verbs & Natural Idioms",
    icon: "fa-solid fa-bolt-lightning",
    color: "text-emerald-400",
    nodes: [
      { id: "node_striker_1", name: "Rapid Strike", desc: "+20% Critical Hit Chance", reqLevel: 1 },
      { id: "node_striker_2", name: "Shadow Recovery", desc: "Heals +12 HP on every correct answer!", reqLevel: 3 },
      { id: "node_striker_3", name: "Fatal Extraction", desc: "+60% Critical Hit Damage Multiplier", reqLevel: 5 }
    ]
  }
};

function renderClassModal() {
  const t = translations[gameState.lang || "en"];
  const container = document.getElementById("class-cards-container");
  const treeContainer = document.getElementById("passive-tree-container");
  if (!container || !treeContainer) return;

  container.innerHTML = "";
  Object.keys(hunterClassesCatalog).forEach(classKey => {
    const cls = hunterClassesCatalog[classKey];
    const isSelected = gameState.hunterClass === classKey;
    const div = document.createElement("div");
    div.className = `p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${isSelected ? 'bg-purple-950/80 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'bg-slate-950 border-slate-800 hover:border-purple-800/60'}`;
    div.innerHTML = `
      <div class="flex items-center gap-2.5">
        <i class="${cls.icon} ${cls.color} text-lg"></i>
        <div>
          <h4 class="font-bold text-xs ${cls.color}">${cls.name}</h4>
          <p class="text-[10px] text-slate-400 font-sans">${cls.focus}</p>
        </div>
      </div>
      ${isSelected ? `<span class="text-[10px] bg-purple-600 text-white font-bold px-2 py-0.5 rounded">${t.btnActive}</span>` : `<button onclick="selectHunterClass('${classKey}')" class="text-[10px] bg-slate-800 hover:bg-purple-700 text-slate-200 px-2 py-0.5 rounded cursor-pointer">${t.btnSelect}</button>`}
    `;
    container.appendChild(div);
  });

  // Render active passive tree
  treeContainer.innerHTML = "";
  const activeClass = hunterClassesCatalog[gameState.hunterClass] || hunterClassesCatalog["Shadow Assassin"];
  activeClass.nodes.forEach(node => {
    const isUnlocked = gameState.unlockedPassives && gameState.unlockedPassives.includes(node.id);
    const canUnlock = gameState.level >= node.reqLevel;

    const div = document.createElement("div");
    div.className = `p-3 rounded-xl border flex items-center justify-between ${isUnlocked ? 'bg-cyan-950/60 border-cyan-500/80 text-cyan-200' : 'bg-slate-950 border-slate-800 text-slate-400'}`;
    div.innerHTML = `
      <div>
        <div class="flex items-center gap-2">
          <i class="${isUnlocked ? 'fa-solid fa-lock-open text-cyan-400' : 'fa-solid fa-lock text-slate-500'}"></i>
          <span class="font-bold text-xs">${node.name}</span>
          <span class="text-[10px] text-slate-400">(Lv. ${node.reqLevel})</span>
        </div>
        <p class="text-[11px] text-slate-400 mt-0.5">${node.desc}</p>
      </div>
      ${isUnlocked ? `<span class="text-[10px] text-cyan-400 font-bold bg-cyan-950 border border-cyan-700 px-2 py-1 rounded">${t.btnUnlocked}</span>` : 
        (canUnlock ? `<button onclick="unlockPassiveNode('${node.id}')" class="text-[10px] bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-2.5 py-1 rounded shadow-md cursor-pointer">${t.btnUnlockPassive}</button>` : `<span class="text-[10px] text-slate-500 font-bold">${t.btnLocked}</span>`)}
    `;
    treeContainer.appendChild(div);
  });
}

window.selectHunterClass = function(className) {
  if (!hunterClassesCatalog[className]) return;
  gameState.hunterClass = className;
  recalculateDerivedStats();
  updateUI();
  renderClassModal();
  saveGame();
};

window.unlockPassiveNode = function(nodeId) {
  if (!gameState.unlockedPassives) gameState.unlockedPassives = [];
  if (!gameState.unlockedPassives.includes(nodeId)) {
    gameState.unlockedPassives.push(nodeId);
    recalculateDerivedStats();
    updateUI();
    renderClassModal();
    saveGame();
    alert("⚡ [SYSTEM NOTIFICATION] Passive Skill Unlocked!");
  }
};

// --- DAILY RED GATE EVENT & WORLD RAID BOSS LOGIC ---
const dailyRedGateScenarios = [
  {
    title: "Emergency Audit Response to Board of Directors",
    prompt: "Select the most diplomatic, high-register response to address a budget variance query:",
    sentence: "While we acknowledge the overrun, ___ that operational milestones remain intact.",
    options: ["it should be emphasized", "we want to shout", "people think", "it was said by us"],
    correctIndex: 0,
    explanation: "'It should be emphasized that...' delivers formal institutional reassurance."
  },
  {
    title: "High-Stakes Contract Renegotiation",
    prompt: "Choose the proper formal conditional phrase to introduce a contingency clause:",
    sentence: "We are prepared to ratify the agreement, ___ the compliance terms are met.",
    options: ["provided that", "even though", "in spite of", "owing to"],
    correctIndex: 0,
    explanation: "'Provided that' establishes a formal legal condition in executive contracts."
  }
];

let redGateIndex = 0;

function openRedGateModal() {
  const modal = document.getElementById("redgate-modal");
  const content = document.getElementById("redgate-content");
  if (!modal || !content) return;

  const currentQ = dailyRedGateScenarios[redGateIndex % dailyRedGateScenarios.length];
  content.innerHTML = `
    <div class="bg-rose-950/40 p-3.5 rounded-xl border border-rose-800/50 space-y-2">
      <h4 class="font-bold text-sm text-rose-300">${currentQ.title}</h4>
      <p class="text-xs text-slate-300 font-medium">${currentQ.prompt}</p>
      <div class="p-3 bg-black/80 rounded-lg text-xs sm:text-sm font-serif border border-rose-900/60 text-white">
        ${currentQ.sentence}
      </div>
    </div>
    <div id="redgate-options" class="grid grid-cols-1 gap-2 my-2"></div>
    <div id="redgate-log" class="hidden p-3 rounded-xl text-xs border font-mono"></div>
  `;

  const grid = document.getElementById("redgate-options");
  currentQ.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.className = "p-3 rounded-xl bg-slate-950 border border-rose-900/40 hover:border-rose-500 text-left text-xs font-medium transition cursor-pointer";
    btn.textContent = `${String.fromCharCode(65 + idx)}. ${opt}`;
    btn.onclick = () => executeRedGateSpell(idx, currentQ);
    grid.appendChild(btn);
  });

  modal.classList.remove("hidden");
}

function executeRedGateSpell(selectedIndex, q) {
  const log = document.getElementById("redgate-log");
  if (selectedIndex === q.correctIndex) {
    log.className = "p-3 rounded-xl text-xs border bg-emerald-950/80 border-emerald-500 text-emerald-300 block";
    log.innerHTML = `<strong>⚡ RED GATE SLAYER!</strong> Emergency scenario cleared! +150 Gold & S-Rank Relic extracted!`;
    gameState.gold += 150;
    gameState.exp += 80;
    checkLevelUp();
    updateUI();
    saveGame();
    redGateIndex++;
  } else {
    log.className = "p-3 rounded-xl text-xs border bg-rose-950/80 border-rose-700 text-rose-300 block";
    log.innerHTML = `<strong>💥 SPELL COLLAPSED!</strong> Took 35 emergency mana damage! <em>${q.explanation}</em>`;
    gameState.hp = Math.max(0, gameState.hp - 35);
    updateUI();
    saveGame();
  }
}

// World Raid Boss Logic
let raidBossHp = 78450;
const raidMaxHp = 100000;
const raidChallenges = [
  {
    prompt: "Spot the sentence free of misplaced modifiers (CEFR B2 / IELTS 6.5+):",
    sentence: "Choose the grammatically accurate executive statement:",
    options: [
      "Having reviewed the preliminary telemetry, the committee approved the rollout.",
      "Having reviewed the preliminary telemetry, the rollout was approved.",
      "Reviewing the data, the conference ended.",
      "Submitting the report, the server crashed."
    ],
    correctIndex: 0,
    explanation: "The modifier 'Having reviewed...' must immediately precede the active subject who reviewed it ('the committee')."
  }
];

function openRaidModal() {
  const modal = document.getElementById("raid-modal");
  const content = document.getElementById("raid-content");
  if (!modal || !content) return;

  const pct = Math.max(0, (raidBossHp / raidMaxHp) * 100);
  const currentQ = raidChallenges[0];

  content.innerHTML = `
    <div class="space-y-2">
      <div class="flex justify-between text-xs font-bold text-indigo-300">
        <span>🐉 MONARCH OF DESTRUCTION: ANTARES</span>
        <span>${raidBossHp} / ${raidMaxHp} HP</span>
      </div>
      <div class="w-full bg-slate-950 rounded-full h-3 border border-indigo-900 overflow-hidden">
        <div class="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-300" style="width: ${pct}%"></div>
      </div>
      <div class="text-[11px] text-amber-400 font-bold">Your Total Raid Contribution: ${gameState.worldRaidContribution || 0} Damage</div>
    </div>
    <div class="bg-indigo-950/40 p-3 rounded-xl border border-indigo-800/50 space-y-1.5 my-2">
      <p class="text-xs text-indigo-200 font-medium">${currentQ.prompt}</p>
      <div class="p-2.5 bg-black/80 rounded-lg text-xs font-serif text-white">${currentQ.sentence}</div>
    </div>
    <div id="raid-options" class="grid grid-cols-1 gap-2 my-2"></div>
    <div id="raid-log" class="hidden p-3 rounded-xl text-xs border font-mono"></div>
  `;

  const grid = document.getElementById("raid-options");
  currentQ.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.className = "p-3 rounded-xl bg-slate-950 border border-indigo-900/40 hover:border-indigo-500 text-left text-xs font-medium transition cursor-pointer";
    btn.textContent = `${String.fromCharCode(65 + idx)}. ${opt}`;
    btn.onclick = () => attackRaidBoss(idx, currentQ);
    grid.appendChild(btn);
  });

  modal.classList.remove("hidden");
}

function attackRaidBoss(selectedIndex, q) {
  const log = document.getElementById("raid-log");
  if (selectedIndex === q.correctIndex) {
    const dmg = getDerivedTotalAtk() * 3;
    raidBossHp = Math.max(0, raidBossHp - dmg);
    gameState.worldRaidContribution += dmg;
    gameState.gold += 100;
    gameState.exp += 60;

    log.className = "p-3 rounded-xl text-xs border bg-indigo-950/80 border-indigo-500 text-indigo-300 block";
    log.innerHTML = `<strong>⚡ WORLD RAID CRITICAL STRIKE!</strong> Dealt ${dmg} co-op damage to Antares! Earned +100 Gold!`;
    checkLevelUp();
    updateUI();
    saveGame();
    setTimeout(() => openRaidModal(), 1200);
  } else {
    log.className = "p-3 rounded-xl text-xs border bg-rose-950/80 border-rose-700 text-rose-300 block";
    log.innerHTML = `<strong>💥 RAID ATTACK FAILED!</strong> Monarch countered! <em>${q.explanation}</em>`;
  }
}

// Modal Event Listeners
const openClassBtn = document.getElementById("open-class-btn");
const closeClassBtn = document.getElementById("close-class-btn");
const classModal = document.getElementById("class-modal");

if (openClassBtn) {
  openClassBtn.onclick = () => {
    renderClassModal();
    classModal.classList.remove("hidden");
  };
}
if (closeClassBtn) {
  closeClassBtn.onclick = () => classModal.classList.add("hidden");
}

const openRedGateBtn = document.getElementById("open-redgate-btn");
const closeRedGateBtn = document.getElementById("close-redgate-btn");
const redGateModal = document.getElementById("redgate-modal");

if (openRedGateBtn) {
  openRedGateBtn.onclick = () => openRedGateModal();
}
if (closeRedGateBtn) {
  closeRedGateBtn.onclick = () => redGateModal.classList.add("hidden");
}

const openRaidBtn = document.getElementById("open-raid-btn");
const closeRaidBtn = document.getElementById("close-raid-btn");
const raidModal = document.getElementById("raid-modal");

if (openRaidBtn) {
  openRaidBtn.onclick = () => openRaidModal();
}
if (closeRaidBtn) {
  closeRaidBtn.onclick = () => raidModal.classList.add("hidden");
}

// PWA Registration Logic
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const installBtn = document.getElementById("install-pwa-btn");
  if (installBtn) installBtn.classList.remove("hidden");
});

const installBtn = document.getElementById("install-pwa-btn");
if (installBtn) {
  installBtn.onclick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        installBtn.classList.add("hidden");
      }
      deferredPrompt = null;
    }
  };
}

// --- SHADOW ARMY MODAL & BUFFS ---
function renderArmyModal() {
  const t = translations[gameState.lang || "en"];
  const container = document.getElementById("army-list-container");
  if (!container) return;
  container.innerHTML = "";

  if (!gameState.shadowArmy || gameState.shadowArmy.length === 0) {
    container.innerHTML = `
      <div class="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center text-xs text-slate-400">
        ${t.armyEmpty}
      </div>
    `;
    return;
  }

  gameState.shadowArmy.forEach((s, idx) => {
    let buffText = "+15% Gold gains";
    if (s.name.includes("Knight") || s.name.includes("Igris")) buffText = "+10% Crit Chance & +25 Base ATK";
    if (s.name.includes("Specter")) buffText = "+15% EXP per question";
    if (s.name.includes("Monarch") || s.name.includes("Antares")) buffText = "+30% EXP & +50 Base ATK";

    const div = document.createElement("div");
    div.className = "p-3 bg-slate-950 border border-cyan-900/60 rounded-xl flex items-center justify-between";
    div.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
          <i class="fa-solid fa-ghost"></i>
        </div>
        <div>
          <h4 class="font-bold text-xs text-cyan-300">${s.name}</h4>
          <p class="text-[11px] text-slate-400">${buffText}</p>
        </div>
      </div>
      <span class="text-[10px] font-bold bg-cyan-950 border border-cyan-700 text-cyan-400 px-2 py-0.5 rounded uppercase">${t.activeShadowBadge}</span>
    `;
    container.appendChild(div);
  });
}

// --- GRIMOIRE OF FLAWS (MISTAKE VAULT & RETRAINING GROUND) ---
function renderGrimoireModal() {
  const t = translations[gameState.lang || "en"];
  const container = document.getElementById("grimoire-list-container");
  if (!container) return;
  container.innerHTML = "";

  if (!gameState.grimoireOfFlaws || gameState.grimoireOfFlaws.length === 0) {
    container.innerHTML = `
      <div class="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center text-xs text-emerald-400 font-mono">
        ${t.grimoireEmpty}
      </div>
    `;
    return;
  }

  gameState.grimoireOfFlaws.forEach((q, idx) => {
    const div = document.createElement("div");
    div.className = "p-3 bg-rose-950/30 border border-rose-900/50 rounded-xl space-y-2";
    div.innerHTML = `
      <div class="flex justify-between items-center text-xs">
        <span class="text-rose-400 font-bold">Flaw #${idx + 1} (${q.lesson || 'Grammar'})</span>
        <button onclick="retryGrimoireQuestion(${idx})" class="px-2.5 py-1 bg-rose-700 hover:bg-rose-600 text-white font-bold rounded text-[10px] cursor-pointer uppercase">
          ${t.btnRefight}
        </button>
      </div>
      <p class="text-xs text-slate-200 font-serif">${q.sentence}</p>
      <p class="text-[11px] text-slate-400 font-sans"><em>Explanation:</em> ${q.explanation}</p>
    `;
    container.appendChild(div);
  });
}

window.retryGrimoireQuestion = function(idx) {
  if (!gameState.grimoireOfFlaws || !gameState.grimoireOfFlaws[idx]) return;
  const q = gameState.grimoireOfFlaws[idx];
  const grimoireModal = document.getElementById("grimoire-modal");
  if (grimoireModal) grimoireModal.classList.add("hidden");
  loadChallenge(q);
};

// --- WEB SPEECH API VOICE-ACTIVATED SPELLS ---
function startVoiceSpellRecognition() {
  audioSynth.init();
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRec) {
    alert("Speech recognition is not supported in your browser. Please use Chrome or Edge!");
    return;
  }
  const rec = new SpeechRec();
  rec.lang = "en-US";
  rec.interimResults = false;

  const btn = document.getElementById("voice-spell-btn");
  if (btn) btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-rose-400"></i> LISTENING... SPEAK YOUR ANSWER OUT LOUD!`;

  rec.onresult = (e) => {
    const spokenText = e.results[0][0].transcript.toLowerCase();
    const q = activeFloorChallenges[gameState.challengeIndex % activeFloorChallenges.length] || activeFloorChallenges[0];

    let matchedIdx = -1;
    if (q && q.options) {
      q.options.forEach((opt, idx) => {
        if (spokenText.includes(opt.toLowerCase())) {
          matchedIdx = idx;
        }
      });
    }

    if (matchedIdx !== -1) {
      gameState.exp += 50;
      alert(`⚡ [AURA MASTERY PRONUNCIATION BONUS] Recognized: "${spokenText}"! +50 Bonus EXP!`);
      executeSpell(matchedIdx);
    } else {
      alert(`Speech Recognized: "${spokenText}". No matching spell option found. Try speaking clearly!`);
    }
    if (btn) btn.innerHTML = `<i class="fa-solid fa-microphone text-rose-400 animate-pulse"></i> <span>VOICE SPELL (Speak Option Out Loud for +50 Bonus Aura EXP)</span>`;
  };

  rec.onerror = () => {
    if (btn) btn.innerHTML = `<i class="fa-solid fa-microphone text-rose-400 animate-pulse"></i> <span>VOICE SPELL (Speak Option Out Loud for +50 Bonus Aura EXP)</span>`;
  };

  rec.start();
}

// --- AWAKENING MILESTONE TRIALS ---
const awakeningTrialsList = [
  { id: "trial_10", levelReq: 10, title: "Trial 1: Necromancer Awakening", desc: "Reach Level 10 to awaken the Shadow Necromancer title and purple mana aura.", goldReward: 300, atkBonus: 20 },
  { id: "trial_25", levelReq: 25, title: "Trial 2: Shadow Monarch Ascension", desc: "Reach Level 25 to claim the Shadow Monarch title and crimson sovereign aura.", goldReward: 1000, atkBonus: 50 },
  { id: "trial_50", levelReq: 50, title: "Trial 3: Sovereign of Absolute Oblivion", desc: "Reach Level 50 to ascend as the Sovereign of Oblivion with golden monarch aura.", goldReward: 5000, atkBonus: 100 }
];

function renderTrialsModal() {
  const container = document.getElementById("trials-list-container");
  if (!container) return;
  container.innerHTML = "";
  if (!gameState.trialsCompleted) gameState.trialsCompleted = [];

  awakeningTrialsList.forEach(t => {
    const isClaimed = gameState.trialsCompleted.includes(t.id);
    const canClaim = gameState.level >= t.levelReq;

    const div = document.createElement("div");
    div.className = `p-3 rounded-xl border flex items-center justify-between ${isClaimed ? 'bg-amber-950/60 border-amber-500/80 text-amber-200' : 'bg-slate-950 border-slate-800 text-slate-400'}`;
    div.innerHTML = `
      <div>
        <div class="flex items-center gap-2">
          <i class="fa-solid fa-trophy ${canClaim ? 'text-amber-400' : 'text-slate-600'}"></i>
          <span class="font-bold text-xs text-amber-300">${t.title}</span>
          <span class="text-[10px] text-slate-400">(Level ${t.levelReq})</span>
        </div>
        <p class="text-[11px] text-slate-300 mt-1">${t.desc}</p>
        <p class="text-[10px] text-amber-400 font-mono mt-0.5">+${t.goldReward} Gold, +${t.atkBonus} Base ATK</p>
      </div>
      ${isClaimed ? '<span class="text-[10px] font-bold bg-amber-950 border border-amber-700 text-amber-400 px-2.5 py-1 rounded">CLAIMED</span>' :
        (canClaim ? `<button onclick="claimTrial('${t.id}')" class="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg shadow-md cursor-pointer animate-pulse">CLAIM</button>` : `<span class="text-[10px] font-bold text-slate-500">LOCKED</span>`)}
    `;
    container.appendChild(div);
  });
}

window.claimTrial = function(trialId) {
  const trial = awakeningTrialsList.find(t => t.id === trialId);
  if (!trial || gameState.level < trial.levelReq) return;
  if (!gameState.trialsCompleted) gameState.trialsCompleted = [];
  if (!gameState.trialsCompleted.includes(trialId)) {
    gameState.trialsCompleted.push(trialId);
    gameState.gold += trial.goldReward;
    gameState.extraAtk += trial.atkBonus;
    audioSynth.playGateClearedTriumph();
    alert(`🏆 [AWAKENING TRIAL COMPLETE] Claimed ${trial.title}! Rewards: +${trial.goldReward} Gold & +${trial.atkBonus} Base ATK!`);
    updateUI();
    renderTrialsModal();
    saveGame();
  }
};

// --- DAILY DIRECTIVES & PUNISHMENT ZONE ---
function renderDailyModal() {
  const container = document.getElementById("daily-quests-container");
  const streakVal = document.getElementById("daily-streak-val");
  if (!container) return;
  container.innerHTML = "";

  if (!gameState.dailyDirectives) {
    gameState.dailyDirectives = { streak: 1, toneDone: 0, voiceDone: 0, redgateDone: 0, lastDate: new Date().toISOString().split('T')[0] };
  }

  if (streakVal) streakVal.textContent = `${gameState.dailyDirectives.streak || 1} Day(s)`;

  const quests = [
    { title: "Solve 5 Tone-Softening Scenarios", current: Math.min(5, gameState.dailyDirectives.toneDone || 0), max: 5 },
    { title: "Execute 3 Voice Spells Out Loud", current: Math.min(3, gameState.dailyDirectives.voiceDone || 0), max: 3 },
    { title: "Clear 1 Daily Red Gate Raid", current: Math.min(1, gameState.dailyDirectives.redgateDone || 0), max: 1 }
  ];

  quests.forEach((q) => {
    const isDone = q.current >= q.max;
    const div = document.createElement("div");
    div.className = "p-3 bg-slate-950 border border-emerald-900/60 rounded-xl flex items-center justify-between";
    div.innerHTML = `
      <div>
        <h4 class="font-bold text-xs text-emerald-300">${q.title}</h4>
        <p class="text-[11px] text-slate-400 mt-0.5">Progress: ${q.current} / ${q.max}</p>
      </div>
      <span class="text-[10px] font-bold px-2.5 py-1 rounded ${isDone ? 'bg-emerald-950 border border-emerald-600 text-emerald-400' : 'bg-slate-900 text-slate-500'}">
        ${isDone ? 'COMPLETED' : 'IN PROGRESS'}
      </span>
    `;
    container.appendChild(div);
  });
}

// --- GLOBAL LEADERBOARDS & GUILD RAIDS ---
function renderLeaderboardModal(tab = "global") {
  const container = document.getElementById("leaderboard-content-container");
  if (!container) return;
  container.innerHTML = "";

  if (tab === "global") {
    const ranks = [
      { rank: 1, name: "Sung Jin-Woo (Shadow Monarch)", level: 50, floor: 12, accuracy: "98.4%", guild: "Ahjin Guild" },
      { rank: 2, name: "Thomas Andre (Goliath)", level: 48, floor: 12, accuracy: "95.1%", guild: "Scavenger Guild" },
      { rank: 3, name: "Liu Zhigang (Dragon Slayer)", level: 46, floor: 11, accuracy: "93.8%", guild: "China Association" },
      { rank: 4, name: "Cha Hae-In (Sword Dancer)", level: 42, floor: 10, accuracy: "92.0%", guild: "Fame Guild" },
      { rank: 5, name: `You (${gameState.hunterClass})`, level: gameState.level, floor: gameState.currentFloor + 1, accuracy: "90.5%", guild: "Ahjin Guild" }
    ];

    ranks.forEach(r => {
      const isPlayer = r.rank === 5;
      const div = document.createElement("div");
      div.className = `p-3 rounded-xl border flex items-center justify-between ${isPlayer ? 'bg-blue-950/80 border-blue-500 shadow-md' : 'bg-slate-950 border-slate-800'}`;
      div.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="font-extrabold text-sm ${r.rank === 1 ? 'text-amber-400' : (r.rank === 2 ? 'text-slate-300' : (r.rank === 3 ? 'text-amber-600' : 'text-blue-400'))}">#${r.rank}</span>
          <div>
            <h4 class="font-bold text-xs ${isPlayer ? 'text-cyan-300' : 'text-slate-200'}">${r.name}</h4>
            <p class="text-[10px] text-slate-400 font-sans">${r.guild} • Cleared Floor ${r.floor}</p>
          </div>
        </div>
        <div class="text-right">
          <span class="text-xs font-bold text-amber-400 block">Lv.${r.level}</span>
          <span class="text-[10px] text-emerald-400">${r.accuracy} Acc</span>
        </div>
      `;
      container.appendChild(div);
    });
  } else {
    const guilds = [
      { name: "Ahjin Guild", totalDamage: "452,000 HP", members: 12, rank: "Rank 1 S-Guild" },
      { name: "Scavenger Guild", totalDamage: "389,500 HP", members: 24, rank: "Rank 2 S-Guild" },
      { name: "Fame Guild", totalDamage: "310,200 HP", members: 18, rank: "Rank 3 A-Guild" }
    ];

    guilds.forEach(g => {
      const div = document.createElement("div");
      div.className = "p-3 bg-slate-950 border border-blue-900/50 rounded-xl flex items-center justify-between";
      div.innerHTML = `
        <div>
          <h4 class="font-bold text-xs text-indigo-300">${g.name}</h4>
          <p class="text-[10px] text-slate-400 font-sans">${g.rank} • ${g.members} Hunters</p>
        </div>
        <div class="text-right">
          <span class="text-xs font-bold text-cyan-400 block">${g.totalDamage}</span>
          <span class="text-[10px] text-emerald-400">Pooled Damage</span>
        </div>
      `;
      container.appendChild(div);
    });
  }
}

// Modal Event Listeners
const openArmyBtn = document.getElementById("open-army-btn");
const closeArmyBtn = document.getElementById("close-army-btn");
const armyModal = document.getElementById("army-modal");

if (openArmyBtn) {
  openArmyBtn.onclick = () => {
    renderArmyModal();
    armyModal.classList.remove("hidden");
  };
}
if (closeArmyBtn) {
  closeArmyBtn.onclick = () => armyModal.classList.add("hidden");
}

const openGrimoireBtn = document.getElementById("open-grimoire-btn");
const closeGrimoireBtn = document.getElementById("close-grimoire-btn");
const grimoireModal = document.getElementById("grimoire-modal");

if (openGrimoireBtn) {
  openGrimoireBtn.onclick = () => {
    renderGrimoireModal();
    grimoireModal.classList.remove("hidden");
  };
}
if (closeGrimoireBtn) {
  closeGrimoireBtn.onclick = () => grimoireModal.classList.add("hidden");
}

// Trials Modal Handlers
const openTrialsBtn = document.getElementById("open-trials-btn");
const closeTrialsBtn = document.getElementById("close-trials-btn");
const trialsModal = document.getElementById("trials-modal");
if (openTrialsBtn) {
  openTrialsBtn.onclick = () => {
    renderTrialsModal();
    trialsModal.classList.remove("hidden");
  };
}
if (closeTrialsBtn) {
  closeTrialsBtn.onclick = () => trialsModal.classList.add("hidden");
}

// Daily Directives Modal Handlers
const openDailyBtn = document.getElementById("open-daily-btn");
const closeDailyBtn = document.getElementById("close-daily-btn");
const dailyModal = document.getElementById("daily-modal");
const punishmentBtn = document.getElementById("punishment-zone-btn");

if (openDailyBtn) {
  openDailyBtn.onclick = () => {
    renderDailyModal();
    dailyModal.classList.remove("hidden");
  };
}
if (closeDailyBtn) {
  closeDailyBtn.onclick = () => dailyModal.classList.add("hidden");
}
if (punishmentBtn) {
  punishmentBtn.onclick = () => {
    dailyModal.classList.add("hidden");
    openRedGateModal();
  };
}

// Leaderboard Modal Handlers
const openLeaderboardBtn = document.getElementById("open-leaderboard-btn");
const closeLeaderboardBtn = document.getElementById("close-leaderboard-btn");
const leaderboardModal = document.getElementById("leaderboard-modal");
const tabGlobalRank = document.getElementById("tab-global-rank");
const tabGuildRank = document.getElementById("tab-guild-rank");

if (openLeaderboardBtn) {
  openLeaderboardBtn.onclick = () => {
    renderLeaderboardModal("global");
    leaderboardModal.classList.remove("hidden");
  };
}
if (closeLeaderboardBtn) {
  closeLeaderboardBtn.onclick = () => leaderboardModal.classList.add("hidden");
}
if (tabGlobalRank && tabGuildRank) {
  tabGlobalRank.onclick = () => {
    tabGlobalRank.className = "px-3 py-1.5 bg-blue-600 text-white font-bold rounded-lg text-xs cursor-pointer";
    tabGuildRank.className = "px-3 py-1.5 bg-slate-800 text-slate-300 hover:bg-blue-900 font-bold rounded-lg text-xs cursor-pointer";
    renderLeaderboardModal("global");
  };
  tabGuildRank.onclick = () => {
    tabGuildRank.className = "px-3 py-1.5 bg-blue-600 text-white font-bold rounded-lg text-xs cursor-pointer";
    tabGlobalRank.className = "px-3 py-1.5 bg-slate-800 text-slate-300 hover:bg-blue-900 font-bold rounded-lg text-xs cursor-pointer";
    renderLeaderboardModal("guild");
  };
}

const voiceSpellBtn = document.getElementById("voice-spell-btn");
if (voiceSpellBtn) {
  voiceSpellBtn.onclick = () => startVoiceSpellRecognition();
}

window.addEventListener("beforeunload", () => {
  saveGame();
});

initGame();