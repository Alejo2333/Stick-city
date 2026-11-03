var BL = [
  [720, 720],
  [1920, 720],
  [720, 1920],
  [1920, 1920],
];
function pos(b, c, r) {
  return [BL[b][0] + 100 + c * 520, BL[b][1] + 100 + r * 560];
}
var D = [
  [
    0,
    0,
    0,
    "Home",
    "#8a1c1c",
    "#f3e6c4",
    "#7a5a3a",
    0,
    0,
    ["Home", "sweet", "home"],
    function () {
      return S.mansion
        ? "Mansion sweet mansion. The bed is calling, and it brought friends."
        : "Home sweet home. The bed is calling your name, and it is not being subtle about it.";
    },
    [
      {
        i: "🛏️",
        t: "Sleep until morning",
        tag: "(full HP)",
        p: "free",
        sleep: 1,
      },
      {
        i: "💤",
        t: "Take a nap",
        tag: "(+5 HP)",
        p: "2 hrs",
        en: 5,
        h: 2,
        m: "You napped for a couple of hours.",
      },
      {
        i: "🫂",
        t: "Cuddle with your partner",
        tag: "(+5 HP)",
        p: "1 hr",
        en: 5,
        h: 1,
        req: function () {
          return !!S.partner;
        },
        lock: "no partner yet",
        fn: function () {
          S.lv[S.partner] = lvl(S.partner) + 1;
          return (
            "You and " + S.partner + " spent a cozy hour together."
          );
        },
      },
    ],
  ],
  [
    0,
    1,
    0,
    "Gym",
    "#5b3a8a",
    "#e3ecff",
    "#555e6b",
    "#f1c27d",
    "#222",
    ["Lift,", "then", "rest"],
    "“Hey champ! The weights are dust-free today. Ready to get stronger?”",
    [
      {
        i: "🏋️",
        t: "Lift weights",
        tag: "(−5 HP, +1 STR)",
        p: "$5",
        cost: 5,
        en: -5,
        h: 2,
        str: 1,
        m: "You lift things. The things lift back.",
      },
      {
        i: "🥊",
        t: "Spar with the trainer",
        tag: "(−7 HP, +2 STR)",
        p: "$15",
        cost: 15,
        en: -7,
        h: 2,
        str: 2,
        m: "You got knocked down twice and got up three times.",
      },
      {
        i: "🥛",
        t: "Protein shake",
        tag: "(+4 HP)",
        p: "$3",
        cost: 3,
        en: 4,
        h: 0.5,
        m: "Chalky, but it works.",
      },
    ],
  ],
  [
    0,
    0,
    1,
    "School",
    "#2f6b3a",
    "#fff6cf",
    "#6b5a3a",
    "#c68642",
    "#7a4a1a",
    ["Quiet", "please"],
    "“Welcome to Maplewood Community School. Keep your voices down and your brains up.”",
    [
      {
        i: "📚",
        t: "Attend a lecture",
        tag: "(−4 HP, +1 INT)",
        p: "$5",
        cost: 5,
        en: -4,
        h: 3,
        int: 1,
        m: "You learned something real. Probably.",
      },
      {
        i: "🤓",
        t: "Study in the library",
        tag: "(−5 HP, +1 INT)",
        p: "free",
        en: -5,
        h: 4,
        int: 1,
        m: "Four quiet hours. Your head is full.",
      },
      {
        i: "🎤",
        t: "Public speaking class",
        tag: "(−3 HP, +1 CHA)",
        p: "$10",
        cost: 10,
        en: -3,
        h: 2,
        cha: 1,
        m: "You spoke to a room full of stick figures.",
      },
    ],
  ],
  [
    0,
    1,
    1,
    "Corner Store",
    "#1f6fb5",
    "#fff7c8",
    "#b8860b",
    "#8d5524",
    "#111",
    ["No", "loitering"],
    "“Welcome to the Corner Store! Snacks, drinks, and a jar for a good cause.”",
    [
      {
        i: "🥤",
        t: "Slush",
        tag: "(+1 HP)",
        p: "$1",
        cost: 1,
        en: 1,
        h: 0,
        m: "Brain freeze.",
      },
      {
        i: "🍫",
        t: "Candy bar",
        tag: "(+3 HP)",
        p: "$2",
        cost: 2,
        en: 3,
        h: 0,
        m: "Sweet.",
      },
      {
        i: "🧀",
        t: "Cheesy nachos",
        tag: "(+7 HP)",
        p: "$4",
        cost: 4,
        en: 7,
        h: 0.25,
        m: "Messy and worth it.",
      },
      {
        i: "🫙",
        t: "Donate to the jar",
        tag: "(+5 karma)",
        p: "$20",
        cost: 20,
        k: 5,
        m: "The clerk nods. You feel lighter.",
      },
      {
        i: "🌹",
        t: "Flowers",
        tag: "(a gift)",
        p: "$12",
        cost: 12,
        give: "flowers",
        m: "A lovely bunch. Someone might like these.",
      },
      {
        i: "🩹",
        t: "Medkit",
        tag: "(heals 12 HP later)",
        p: "$15",
        cost: 15,
        give: "medkit",
        m: "Stashed in your backpack.",
      },
    ],
  ],
  [
    1,
    0,
    0,
    "Bank",
    "#4a4a4a",
    "#e8eef2",
    "#3d4651",
    "#ffdbac",
    "#555",
    ["Member", "FDIC", "(ish)"],
    function () {
      return (
        "“Welcome to Stick Savings. Balance: $" +
        S.bank +
        ". We pay 2% a day, and we never close early.”"
      );
    },
    [
      {
        i: "💵",
        t: "Deposit $50",
        p: "",
        cost: 50,
        fn: function () {
          S.bank += 50;
          return "You deposited $50.";
        },
      },
      {
        i: "🏧",
        t: "Withdraw everything",
        p: "",
        req: function () {
          return S.bank > 0;
        },
        lock: "empty",
        fn: function () {
          var n = S.bank;
          S.cash += n;
          S.bank = 0;
          return "You withdrew $" + n + ".";
        },
      },
      {
        i: "🏰",
        t: "Buy a mansion",
        tag: "(+1 CHA per sleep)",
        p: "$3000",
        cost: 3000,
        req: function () {
          return !S.mansion;
        },
        lock: "owned",
        fn: function () {
          S.mansion = 1;
          return "You bought the mansion. Your bed is now enormous.";
        },
      },
      {
        i: "🔫",
        t: "Rob the place",
        tag: "(−15 karma)",
        p: "risky",
        k: -15,
        heat: 2,
        req: function () {
          return !doneToday("bankrob");
        },
        lock: "security is on alert today",
        fn: function () {
          markDone("bankrob");
          if (Math.random() < 0.35 + wp() * 0.05) {
            S.cash += 250;
            return "You grabbed $250 and ran!";
          }
          var f = Math.min(S.cash, 40);
          S.cash -= f;
          S.en = Math.max(1, S.en - 10);
          return (
            "Caught! You paid a $" + f + " fine and took a beating."
          );
        },
      },
    ],
  ],
  [
    1,
    1,
    0,
    "Casino",
    "#8a1c6a",
    "#2a1038",
    "#1e0b2b",
    "#e0ac69",
    "#000",
    ["Odds", "are odds"],
    "“Welcome to Lucky Stick. The house always wins. Mostly.”",
    [
      {
        i: "🎰",
        t: "Casino floor",
        tag: "(slots, roulette, rocket, mega wheel…)",
        fn: function () {
          casinoFloor();
          return "Good luck.";
        },
      },
      {
        i: "🪙",
        t: "Coin flip",
        tag: "(45% win)",
        p: "$10",
        cost: 10,
        h: 0.25,
        fn: function () {
          if (Math.random() < 0.45) {
            S.cash += 20;
            return "Heads! You won $10.";
          }
          return "Tails. You lost $10.";
        },
      },
      {
        i: "🎰",
        t: "High roller",
        tag: "(45% win)",
        p: "$50",
        cost: 50,
        h: 0.25,
        fn: function () {
          if (Math.random() < 0.45) {
            S.cash += 100;
            return "Jackpot! You won $50.";
          }
          return "Ouch. You lost $50.";
        },
      },
    ],
  ],
  [
    1,
    0,
    1,
    "Bar",
    "#5a3a1a",
    "#d9a96b",
    "#4a2e12",
    "#d2a679",
    "#3b2a1a",
    ["Happy", "hour", "always"],
    "“What’ll it be? And don’t break anything, again.”",
    [
      {
        i: "🍺",
        t: "Have a drink",
        tag: "(−2 HP, +1 CHA)",
        p: "$5",
        cost: 5,
        en: -2,
        h: 1,
        cha: 1,
        m: "You make a new friend. They are a bit damp.",
      },
      {
        i: "🥃",
        t: "Buy a round for everyone",
        tag: "(+3 CHA, +2 karma)",
        p: "$30",
        cost: 30,
        en: -2,
        h: 1,
        cha: 3,
        k: 2,
        m: "The whole bar cheers your name.",
      },
      {
        i: "👊",
        t: "Start a bar fight",
        tag: "(−8 HP, +2 STR, −2 karma)",
        p: "free",
        en: -8,
        h: 1,
        str: 2,
        k: -2,
        heat: 0.5,
        m: "You won, technically.",
      },
    ],
  ],
  [
    1,
    1,
    1,
    "Burger Joint",
    "#b5651d",
    "#ffe9b0",
    "#8a4b12",
    "#ffdbac",
    "#a02020",
    ["Please", "wait to", "be seated"],
    "“Welcome to Patty Palace! Grab a bite or an apron.”",
    [
      job("🧑‍🍳", "Work a shift", 6, 4, 12, 0, "You flipped burgers."),
      {
        i: "🍔",
        t: "Burger",
        tag: "(+7 HP)",
        p: "$4",
        cost: 4,
        en: 7,
        h: 0.5,
        m: "Juicy.",
      },
      {
        i: "🍟",
        t: "Fries",
        tag: "(+3 HP)",
        p: "$2",
        cost: 2,
        en: 3,
        h: 0.25,
        m: "Salty perfection.",
      },
    ],
  ],
  [
    2,
    0,
    0,
    "Factory",
    "#6b6b6b",
    "#cfd6dc",
    "#444b52",
    "#c68642",
    "#222",
    ["Hard hats", "required"],
    "“Job board’s on the wall. Better stats, better pay. Safety is a suggestion.”",
    [
      job("🧹", "Janitor", 5, 4, 14, 0, "You mopped the whole floor."),
      job(
        "⚙️",
        "Assembly line",
        7,
        5,
        26,
        need(5, 0, 0),
        "You assembled gadgets all shift.",
      ),
      job(
        "🏗️",
        "Heavy loader",
        9,
        5,
        42,
        need(15, 0, 0),
        "You hauled crates like a champ.",
      ),
    ],
  ],
  [
    2,
    1,
    0,
    "Office",
    "#2a4a7a",
    "#eef3fa",
    "#3a4a62",
    "#f1c27d",
    "#5a3a1a",
    ["Dress", "code", "enforced"],
    "“Take a number. Climb the ladder. The top job is President of Stick City.”",
    [
      job(
        "🗂️",
        "Clerk",
        4,
        5,
        32,
        need(0, 5, 3),
        "You filed things alphabetically.",
      ),
      job(
        "📊",
        "Manager",
        5,
        5,
        56,
        need(0, 15, 10),
        "You held a meeting about meetings.",
      ),
      job(
        "💼",
        "Executive",
        5,
        5,
        95,
        need(0, 30, 25, -20),
        "You signed expensive papers.",
      ),
      job(
        "🏛️",
        "Run for President",
        6,
        6,
        220,
        need(40, 40, 40, 10),
        "You governed Stick City.",
      ),
    ],
  ],
  [
    2,
    0,
    1,
    "Pawn Shop",
    "#555",
    "#d8d0c0",
    "#4a4036",
    "#e0b080",
    "#222",
    ["No", "refunds"],
    "“Everything here fell off a truck. A legal truck. Mostly.”",
    [
      shop("bat", "Baseball bat", 25),
      shop("knife", "Knife", 60),
      shop("pistol", "Pistol", 150),
    ],
  ],
  [
    2,
    1,
    1,
    "Cafe",
    "#a0522d",
    "#fff0dc",
    "#7b4b2a",
    "#ffdbac",
    "#2b1b0e",
    ["Fresh", "coffee"],
    "“Welcome to Bean There! Grab a cup, or bring someone special.”",
    [
      {
        i: "☕",
        t: "Coffee",
        tag: "(+2 HP)",
        p: "$3",
        cost: 3,
        en: 2,
        h: 0.25,
        m: "Hot and bitter, like your boss.",
      },
      {
        i: "🍰",
        t: "Cake slice",
        tag: "(+5 HP)",
        p: "$6",
        cost: 6,
        en: 5,
        h: 0.5,
        m: "Delicious.",
      },
      {
        i: "💞",
        t: "Take your partner on a date",
        tag: "(+3 CHA)",
        p: "$40",
        cost: 40,
        cha: 3,
        h: 2,
        req: function () {
          return !!S.partner;
        },
        lock: "no partner yet",
        fn: function () {
          S.lv[S.partner] = lvl(S.partner) + 3;
          return "You and " + S.partner + " had a lovely evening.";
        },
      },
    ],
  ],
  [
    3,
    0,
    0,
    "Police Station",
    "#1a3fd0",
    "#e6eefc",
    "#33415c",
    "#f1c27d",
    "#1a2b6b",
    ["Serve &", "protect"],
    "“Stay out of trouble, citizen. Or pay for it.”",
    [
      {
        i: "📝",
        t: "Clear your record",
        tag: "(takes 2 hrs)",
        h: 2,
        get p() {
          return "$" + this.cost;
        },
        get cost() {
          return 50 + 75 * Math.ceil(S.heat);
        },
        req: function () {
          return S.heat >= 0.3;
        },
        lock: "record is clean",
        fn: function () {
          S.heat = 0;
          return "Your record is wiped clean. Officially.";
        },
      },
      job(
        "🚔",
        "Work as a deputy",
        6,
        5,
        48,
        need(10, 0, 0, 10),
        "You wrote parking tickets all shift.",
      ),
    ],
  ],
  [
    3,
    1,
    0,
    "Hospital",
    "#2fa89c",
    "#f0fbfa",
    "#5d7a78",
    "#ffdbac",
    "#444",
    ["Quiet", "zone"],
    "“Welcome to Stick General. Please take a number and a deep breath.”",
    [
      {
        i: "🏥",
        t: "Full treatment",
        tag: "(full HP)",
        p: "$25",
        cost: 25,
        en: 25,
        h: 3,
        m: "Good as new.",
      },
      job(
        "🧽",
        "Orderly",
        5,
        5,
        36,
        need(0, 8, 0),
        "You wheeled patients around.",
      ),
      job(
        "🩺",
        "Doctor",
        5,
        5,
        95,
        need(0, 25, 15),
        "You saved a life, mostly.",
      ),
    ],
  ],
  [
    3,
    0,
    1,
    "Arcade",
    "#d12fa0",
    "#1e1b4b",
    "#16133a",
    "#8d5524",
    "#7a4a1a",
    ["Insert", "coin"],
    "“Quarters in, bragging rights out.”",
    [
      {
        i: "👾",
        t: "Play a game",
        tag: "(−1 HP)",
        p: "$3",
        cost: 3,
        en: -1,
        h: 1,
        fn: function () {
          if (Math.random() < 0.3) {
            S.cash += 15;
            return "High score! You won a $15 prize.";
          }
          return "Game over.";
        },
      },
      {
        i: "🧩",
        t: "Puzzle machine",
        tag: "(−2 HP, +1 INT)",
        p: "$5",
        cost: 5,
        en: -2,
        h: 1,
        int: 1,
        m: "You cracked level 12.",
      },
      job(
        "🕹️",
        "Fix cabinets",
        3,
        4,
        18,
        0,
        "You repaired sticky buttons.",
      ),
    ],
  ],
  [
    3,
    1,
    1,
    "Night Club",
    "#3b1fa8",
    "#150c33",
    "#0b0620",
    "#ffdbac",
    "#ff4fd8",
    ["Dress", "to impress"],
    "“Doors open at 6 PM. Everyone is VIP tonight. For a fee.”",
    [
      {
        i: "🪩",
        t: "Hit the dance floor",
        tag: "(−4 HP, +2 CHA)",
        p: "$15",
        cost: 15,
        en: -4,
        h: 2,
        cha: 2,
        req: night,
        lock: "opens at 6 PM",
        m: "You danced like nobody was watching. Everybody was.",
      },
      {
        i: "🥂",
        t: "VIP table",
        tag: "(−2 HP, +5 CHA)",
        p: "$60",
        cost: 60,
        en: -2,
        h: 2,
        cha: 5,
        req: night,
        lock: "opens at 6 PM",
        m: "You schmoozed with very important sticks.",
      },
      job(
        "🕶️",
        "Bouncer",
        6,
        5,
        60,
        need(20, 0, 10),
        "You checked a lot of IDs.",
      ),
    ],
  ],
];
// Additional real shops and a residential showroom, placed by the city generator.
[
  [
    "Clothing Boutique",
    "#bb4289",
    "#fff0fb",
    "#844b79",
    "👕",
    "Dress your way",
    "Style is a lifestyle.",
  ],
  [
    "Supermarket",
    "#43804d",
    "#ecffe8",
    "#53815b",
    "🛒",
    "Fresh daily",
    "Welcome! Stock up for the week.",
  ],
  [
    "Furniture Gallery",
    "#9b643c",
    "#fff0d8",
    "#80583a",
    "🛋️",
    "Make it home",
    "Try the new collections.",
  ],
  [
    "Real Estate Office",
    "#5372ad",
    "#e3eeff",
    "#6b7fa0",
    "🏘️",
    "Find your place",
    "A home for every chapter.",
  ],
  [
    "Motor Garage",
    "#c65f33",
    "#f7f1dc",
    "#775747",
    "🏍️",
    "Buy · Service",
    "Every road starts somewhere.",
  ],
].forEach(function (a) {
  D.push([
    0,
    0,
    0,
    a[0],
    a[1],
    a[2],
    a[3],
    "#e6b98b",
    "#333",
    [a[4], a[5]],
    a[6],
    [],
  ]);
});
