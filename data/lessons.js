// ADD AT TOP OF data/lessons.js
const translations = {
    en: {
        systemTitle: "Shadow Monarch",
        hunterStatus: "[HUNTER STATUS]",
        awakenedName: "Sung Jin-Woo (Awakened)",
        passiveExtract: "Passive Extraction:",
        shadowArmy: "Shadow Army Count:",
        equippedArtifacts: "Equipped Artifacts:",
        gateMonarchHp: "GATE MONARCH HP",
        unleashSkill: "Unleash Rune Skill",
        resonancePrompt: "Formulate the correct grammatical resonance:",
        shadowsExtracting: "Shadows extracting ambient mana offline:",
        ariseBtn: "ARISE (Extract EXP)",
        shopBtn: "Shop",
        resetBtn: "Reset",
        vaultTitle: "SYSTEM ARTIFACT VAULT",
        vaultDesc: "Purchase weapons, rings, and mana elixirs using Gold extracted from Gate Bosses.",
        equipped: "Equipped",
        critStrike: "⚡ SHADOW CRITICAL HIT!",
        directHit: "DIRECT HIT!",
        spellFail: "SPELL COLLAPSED! Grammatical divergence detected. Try again.",
        gateClearAlert: "🏆 GATE CLEARED! Shadow Extracted: ",
        levelUpAlert: "⚡ [SYSTEM NOTIFICATION: LEVEL UP] You reached Level ",
        baseAtkInc: "! Base ATK increased to ",
        buySuccess: "⚡ Purchased & Equipped: ",
        noGold: "❌ Insufficient Gold! Clear more Gate Bosses.",
        resetConfirm: "⚠️ System Reset: Re-awaken as Level 1 Hunter and reset all artifacts?"
    },
    th: {
        systemTitle: "จักรพรรดิแห่งเงา",
        hunterStatus: "[สถานะฮันเตอร์]",
        awakenedName: "ซองจินอู (ผู้ตื่นรู้)",
        passiveExtract: "อัตราสกัดพลังงานออฟไลน์:",
        shadowArmy: "จำนวนกองทัพเงา:",
        equippedArtifacts: "อาร์ติแฟกต์ที่สวมใส่:",
        gateMonarchHp: "พลังชีวิตมอนสเตอร์เกท",
        unleashSkill: "ปลดปล่อยทักษะรูน",
        resonancePrompt: "เลือกโครงสร้างไวยากรณ์ที่ถูกต้องเพื่อสร้างการโจมตี:",
        shadowsExtracting: "กองทัพเงากำลังสกัดมานาขณะออฟไลน์:",
        ariseBtn: "จงตื่น (สกัด EXP)",
        shopBtn: "ร้านค้า",
        resetBtn: "รีเซ็ต",
        vaultTitle: "คลังแสงอาร์ติแฟกต์ระบบ",
        vaultDesc: "ซื้ออาวุธ แหวน และน้ำยามานาโดยใช้ทองที่ได้จากการเคลียร์บอสเกท",
        equipped: "สวมใส่อยู่",
        critStrike: "⚡ คริติคอลฮิตจากเงา!",
        directHit: "โจมตีสำเร็จ!",
        spellFail: "เวทมนตร์ล้มเหลว! ตรวจพบโครงสร้างไวยากรณ์ผิดพลาด ลองใหม่อีกครั้ง",
        gateClearAlert: "🏆 เคลียร์เกทสำเร็จ! สกัดเงาได้: ",
        levelUpAlert: "⚡ [การแจ้งเตือนจากระบบ: เลเวลอัป] คุณเลื่อนขั้นเป็นเลเวล ",
        baseAtkInc: "! พลังโจมตีพื้นฐานเพิ่มเป็น ",
        buySuccess: "⚡ ซื้อและสวมใส่สำเร็จ: ",
        noGold: "❌ ทองไม่เพียงพอ! จงไปกำจัดบอสเกทเพิ่มเติม",
        resetConfirm: "⚠️ รีเซ็ตระบบ: คุณต้องการตื่นรู้ใหม่ในฐานะฮันเตอร์แรงก์ E และล้างไอเทมทั้งหมดหรือไม่?"
    }
};
const itemShopCatalog = [
    {
        id: "dagger_e",
        name: "Kasaka's Venom Fang",
        type: "Weapon",
        price: 60,
        atkBonus: 20,
        desc: "+20 Attack Power. Inflicts lethal linguistic bleed.",
        icon: "fa-solid fa-khanda"
    },
    {
        id: "ring_monarch",
        name: "Ring of the Monarch",
        type: "Artifact",
        price: 150,
        atkBonus: 50,
        desc: "+50 Attack Power. Aura of the Shadow Monarch.",
        icon: "fa-solid fa-ring"
    },
    {
        id: "elixir_vitality",
        name: "Purified Mana Elixir",
        type: "Consumable",
        price: 80,
        expBonus: 250,
        desc: "Instantly absorbs +250 EXP from the System.",
        icon: "fa-solid fa-flask"
    },
    {
        id: "orb_shadows",
        name: "Orb of Avarice",
        type: "Artifact",
        price: 300,
        afkBonus: 10,
        desc: "Doubles shadow extraction rate (+10 AFK EXP/min).",
        icon: "fa-solid fa-meteor"
    }
];

const dungeonFloors = [
    // Module 1
    {
        floor: 1,
        title: "E-Rank Gate: The Whispering Ruins",
        module: "Module 1: Structural Control & Narrative Precision",
        boss: { name: "Syntactic Golem", maxHp: 120, iconClass: "fa-solid fa-cube", rank: "E-Rank" },
        challenge: {
            lesson: "Lesson 1: Complex Sentence Mastery",
            prompt: "Subordinate the delay clause without conversational clunkiness:",
            sentence: "___ the regulatory approval was delayed, the rollout succeeded on target.",
            options: ["Even though", "Consequently", "In addition to", "Furthermore"],
            correctIndex: 0,
            explanation: "'Even though' forms a subordinate concession clause with proper contrast."
        }
    },
    {
        floor: 2,
        title: "E-Rank Gate: The Timeless Crypt",
        module: "Module 1: Structural Control & Narrative Precision",
        boss: { name: "Chronos Specter", maxHp: 180, iconClass: "fa-solid fa-ghost", rank: "E-Rank" },
        challenge: {
            lesson: "Lesson 2: Narrative Tenses & Sequence",
            prompt: "Identify the action completed prior to the past reference point:",
            sentence: "By the time the keynote began, the delegation ___ the bilateral pact.",
            options: ["had already signed", "has already signed", "was signing", "signed"],
            correctIndex: 0,
            explanation: "Past Perfect ('had signed') establishes priority before another past event."
        }
    },
    {
        floor: 3,
        title: "D-Rank Gate: The Inverted Spire",
        module: "Module 1: Structural Control & Narrative Precision",
        boss: { name: "Arch-Lich of Inversion", maxHp: 260, iconClass: "fa-solid fa-skull-crossbones", rank: "D-Rank" },
        challenge: {
            lesson: "Lesson 3: Conditionals & Inversion",
            prompt: "Select the inverted first conditional appropriate for formal diplomatic memos:",
            sentence: "___ further clarification, do not hesitate to contact our secretariat.",
            options: ["Should you require", "Had you required", "Were you requiring", "Unless you require"],
            correctIndex: 0,
            explanation: "'Should you require' replaces 'If you require' in high-register formal English."
        }
    },

    // Module 2
    {
        floor: 4,
        title: "D-Rank Gate: Hall of Deductions",
        module: "Module 2: Nuance, Modality, & Register",
        boss: { name: "Dread Knight of Deduction", maxHp: 350, iconClass: "fa-solid fa-shield-cat", rank: "D-Rank" },
        challenge: {
            lesson: "Lesson 4: Modal Verbs for Nuance",
            prompt: "Convey logical certainty regarding a completed past action:",
            sentence: "The director missed the briefing; she ___ delayed at customs.",
            options: ["must have been", "should be", "can have been", "ought to be"],
            correctIndex: 0,
            explanation: "'Must have been' indicates near-certain deduction about past facts."
        }
    },
    {
        floor: 5,
        title: "C-Rank Gate: Impersonal Bastion",
        module: "Module 2: Nuance, Modality, & Register",
        boss: { name: "Iron Golem of Protocol", maxHp: 460, iconClass: "fa-solid fa-robot", rank: "C-Rank" },
        challenge: {
            lesson: "Lesson 5: Passive Voice & Reporting Verbs",
            prompt: "Frame the assertion using formal objective reporting:",
            sentence: "___ that multilateral trade frameworks will stabilize regional output.",
            options: ["It is widely projected", "They project broadly", "People are projecting", "We think projected"],
            correctIndex: 0,
            explanation: "'It is widely projected that' eliminates personal bias in official documentation."
        }
    },
    {
        floor: 6,
        title: "C-Rank Gate: Diplomatic Sanctuary",
        module: "Module 2: Nuance, Modality, & Register",
        boss: { name: "High Chancellor Malakor", maxHp: 580, iconClass: "fa-solid fa-hand-fist", rank: "C-Rank" },
        challenge: {
            lesson: "Lesson 6: Tone, Softening, & Hedging",
            prompt: "Soften this critical remark into constructive diplomatic feedback:",
            sentence: "The budget estimate is wrong -> 'The calculation ___ minor revisions.'",
            options: ["might benefit from", "completely lacks", "must definitely undergo", "has no choice but"],
            correctIndex: 0,
            explanation: "'Might benefit from' softens direct criticism into actionable diplomacy."
        }
    },

    // Module 3
    {
        floor: 7,
        title: "B-Rank Gate: Cavern of Shifting Verbs",
        module: "Module 3: Natural Phrasing & Vocabulary Expansion",
        boss: { name: "Hydra of Phrasal Roots", maxHp: 720, iconClass: "fa-solid fa-spaghetti-monster-flying", rank: "B-Rank" },
        challenge: {
            lesson: "Lesson 7: Phrasal Verbs in Context",
            prompt: "Select the separable phrasal verb meaning 'postpone':",
            sentence: "Due to scheduling constraints, the steering committee decided to ___ until next month.",
            options: ["put the summit off", "call the summit off", "break the summit down", "bring the summit up"],
            correctIndex: 0,
            explanation: "'Put off' means postpone, and allows the noun phrase to be placed between verb and particle."
        }
    },
    {
        floor: 8,
        title: "B-Rank Gate: Discourse Nexus",
        module: "Module 3: Natural Phrasing & Vocabulary Expansion",
        boss: { name: "Colossus of Transitions", maxHp: 890, iconClass: "fa-solid fa-monument", rank: "B-Rank" },
        challenge: {
            lesson: "Lesson 8: Collocations & Discourse Markers",
            prompt: "Pick the discourse marker that indicates a counter-argument transition:",
            sentence: "Domestic revenue increased. ___, external trade deficits expanded rapidly.",
            options: ["Conversely", "In identical fashion", "To summarize", "Namely"],
            correctIndex: 0,
            explanation: "'Conversely' introduces an opposite or contrasting balance point."
        }
    },
    {
        floor: 9,
        title: "A-Rank Gate: Idiomatic Abyss",
        module: "Module 3: Natural Phrasing & Vocabulary Expansion",
        boss: { name: "Behemoth of Connotations", maxHp: 1100, iconClass: "fa-solid fa-dragon", rank: "A-Rank" },
        challenge: {
            lesson: "Lesson 9: Idioms & Connotations",
            prompt: "Select the natural idiom for handling a difficult situation directly and courageously:",
            sentence: "Rather than evade the ministerial query, the representative decided to ___.",
            options: ["take the bull by the horns", "beat around the bush", "spill the beans", "bite off more than chewed"],
            correctIndex: 0,
            explanation: "'Take the bull by the horns' conveys direct, assertive confrontation of a problem."
        }
    },

    // Module 4
    {
        floor: 10,
        title: "A-Rank Gate: The Executive Citadel",
        module: "Module 4: Practical Application & Polish",
        boss: { name: "Shadow Warlord Igris", maxHp: 1400, iconClass: "fa-solid fa-chess-knight", rank: "A-Rank" },
        challenge: {
            lesson: "Lesson 10: Persuasive Executive Writing",
            prompt: "Choose the most concise, professional opening for an executive summary:",
            sentence: "___ to outline key resolutions passed during the 17th Framework Committee.",
            options: ["This brief serves", "I am writing this document right now", "It is with excitement that we", "This here memo is"],
            correctIndex: 0,
            explanation: "'This brief serves to...' provides concise, action-oriented executive framing."
        }
    },
    {
        floor: 11,
        title: "S-Rank Red Gate: The Chamber of Flow",
        module: "Module 4: Practical Application & Polish",
        boss: { name: "Monarch of Fluency: Antares", maxHp: 1800, iconClass: "fa-solid fa-fire-burner", rank: "S-Rank" },
        challenge: {
            lesson: "Lesson 11: Spoken Fluency & Conversational Repair",
            prompt: "Select the optimal conversational filler to diplomatically buy time during a high-stakes query:",
            sentence: "'That is an intriguing dimension; ___ examine our preliminary telemetry.'",
            options: ["allow me a moment to", "wait for me while I", "I am thinking so you stop and", "hold your words as I"],
            correctIndex: 0,
            explanation: "'Allow me a moment to...' sustains conversational control smoothly."
        }
    },
    {
        floor: 12,
        title: "S-Rank Sovereign Gate: The World Monarch",
        module: "Module 4: Practical Application & Polish",
        boss: { name: "Sovereign of Absolute Precision", maxHp: 2500, iconClass: "fa-solid fa-crown", rank: "S-Rank Monarch" },
        challenge: {
            lesson: "Lesson 12: Capstone Error Elimination Workshop",
            prompt: "Spot the flawless phrasing free of intermediate transfer interference:",
            sentence: "Choose the correct sentence:",
            options: [
                "We discussed the policy revisions thoroughly.",
                "We discussed about the policy revisions thoroughly.",
                "We discussed on the policy revisions thoroughly.",
                "We made a discussion regarding to policy revisions."
            ],
            correctIndex: 0,
            explanation: "'Discuss' is transitive and directly takes an object without 'about' or 'on'."
        }
    }
];