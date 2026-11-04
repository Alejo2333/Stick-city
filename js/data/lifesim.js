// === STICK CITY: EXPANDED LIFE SIM ===
// LIFE SIM 2.2: persistent story campaigns, distinct achievements and shops.
var STORY = [
  [
    "newstart",
    "Chapter 1 · A fresh start",
    "Earn your first paycheck, visit 3 places, and meet 2 residents",
    120,
    function () {
      return (
        S.jobsDone >= 1 &&
        Object.keys(S.placesVisited).length >= 3 &&
        S.talksDone >= 2
      );
    },
  ],
  [
    "newhome",
    "Chapter 2 · Home sweet home",
    "Buy two decorations and invite a resident over",
    220,
    function () {
      return Object.keys(S.furniture).length >= 2 && S.invites >= 1;
    },
  ],
  [
    "roadtrip",
    "Chapter 3 · Wheels of fortune",
    "Own a vehicle and travel 1,500 distance units",
    300,
    function () {
      return (
        Object.keys(S.garage).length >= 1 && S.driveDistance >= 1500
      );
    },
  ],
  [
    "hustler",
    "Chapter 4 · Your own boss",
    "Own a business and collect $100 of business revenue",
    500,
    function () {
      return (
        Object.keys(S.businesses).length >= 1 &&
        S.lifetimeBusiness >= 100
      );
    },
  ],
  [
    "socialite",
    "Chapter 5 · Heart of the city",
    "Make a close friend (10 affection) and attend a festival",
    600,
    function () {
      return (
        Object.keys(S.lv).some(function (n) {
          return S.lv[n] >= 10;
        }) && S.festivalVisits >= 1
      );
    },
  ],
  [
    "estate",
    "Chapter 6 · Real estate empire",
    "Own an apartment, townhouse, and mansion",
    1400,
    function () {
      return !!S.owns.apartment && !!S.owns.townhouse && !!S.mansion;
    },
  ],
  [
    "mayor",
    "Chapter 7 · Become Mayor",
    "Reach 20 karma, 25 charisma, and campaign at the Office (City Hall)",
    2000,
    function () {
      return !!S.mayor;
    },
  ],
  [
    "billionaire",
    "Finale · From broke to billionaire",
    "Reach $1,000,000,000 total cash and bank",
    100000,
    function () {
      return S.cash + S.bank >= 1000000000;
    },
  ],
];
var ACHIEVEMENTS = [
  [
    "highroller",
    "High roller",
    "Win $10,000 on a single casino bet",
    500,
    function () {
      return (S.casino.best || 0) >= 10000;
    },
  ],
  [
    "neighbor",
    "Friendly face",
    "Chat with 10 locals",
    50,
    function () {
      return S.talksDone >= 10;
    },
  ],
  [
    "collector",
    "Collector",
    "Own 6 pieces of furniture",
    90,
    function () {
      return Object.keys(S.furniture).length >= 6;
    },
  ],
  [
    "style",
    "Fashion icon",
    "Buy three outfits",
    60,
    function () {
      return Object.keys(S.outfitsOwned || {}).length >= 3;
    },
  ],
  [
    "motorhead",
    "Motorhead",
    "Collect three vehicles",
    130,
    function () {
      return Object.keys(S.garage).length >= 3;
    },
  ],
  [
    "boss",
    "Tycoon",
    "Own five businesses",
    250,
    function () {
      return Object.keys(S.businesses).length >= 5;
    },
  ],
  [
    "tourist",
    "Tourist",
    "Visit 15 locations",
    100,
    function () {
      return Object.keys(S.placesVisited).length >= 15;
    },
  ],
  [
    "wealthy",
    "Six figures",
    "Accumulate $100,000",
    250,
    function () {
      return S.moneyPeak >= 100000;
    },
  ],
  [
    "friendship",
    "Best friends",
    "Reach affection 20 with a resident",
    100,
    function () {
      return Object.keys(S.lv).some(function (n) {
        return S.lv[n] >= 20;
      });
    },
  ],
  [
    "properties",
    "Own every home",
    "Own an apartment, townhouse and mansion",
    500,
    function () {
      return !!S.owns.apartment && !!S.owns.townhouse && !!S.mansion;
    },
  ],
  [
    "renter",
    "Landlord",
    "Collect $500 rent",
    110,
    function () {
      return S.lifetimeRent >= 500;
    },
  ],
  [
    "seasoned",
    "Four seasons",
    "Experience all four seasons",
    175,
    function () {
      return Object.keys(S.seasonsSeen).length >= 4;
    },
  ],
  [
    "leader",
    "Mayor",
    "Win the city's mayoral election",
    200,
    function () {
      return !!S.mayor;
    },
  ],
  [
    "legend",
    "Living legend",
    "Finish all story chapters",
    2500,
    function () {
      return STORY.every(function (q) {
        return !!S.storyClaims[q[0]];
      });
    },
  ],
];
var LIFE_EVENTS = [
  {
    id: "first-steps",
    title: "A first big step",
    stage: "baby",
    once: true,
    choices: [
      {
        label: "Explore the room with a trusted grown-up",
        effect: { happiness: 8, flag: "exploredWithFamily" },
      },
      {
        label: "Take a quiet nap",
        effect: { health: 6, happiness: 3 },
      },
    ],
  },
  {
    id: "first-words",
    title: "A first word",
    stage: "baby",
    once: true,
    choices: [
      {
        label: "Call for someone you love",
        effect: { happiness: 7, relationship: 2, flag: "firstWord" },
      },
      {
        label: "Try a funny new sound",
        effect: { charisma: 1, happiness: 5 },
      },
    ],
  },
  {
    id: "school-fair",
    title: "The school fair",
    stage: "child",
    choices: [
      {
        label: "Enter the science display",
        effect: { smarts: 2, happiness: 4, flag: "scienceFair" },
      },
      {
        label: "Help run the games",
        effect: { charisma: 1, happiness: 6 },
      },
    ],
  },
  {
    id: "lost-library-book",
    title: "A library book is overdue",
    stage: "child",
    choices: [
      {
        label: "Return it and apologize",
        effect: { karma: 2, smarts: 1, cash: -5 },
      },
      {
        label: "Ask a family member for help",
        effect: { relationship: 2, happiness: 3 },
      },
    ],
  },
  {
    id: "club-invitation",
    title: "A new club is looking for members",
    stage: "teen",
    choices: [
      {
        label: "Join the art club",
        effect: { looks: 1, charisma: 1, happiness: 5, flag: "creativeClub" },
      },
      {
        label: "Join the robotics club",
        effect: {
          smarts: 2,
          happiness: 3,
          flag: "roboticsClub",
        },
      },
    ],
  },
  {
    id: "first-paycheck",
    title: "Your first paycheck",
    stage: "teen",
    ok: function () {
      return S.age >= 16;
    },
    choices: [
      {
        label: "Save most of it",
        effect: { cash: 80, smarts: 1, flag: "savedFirstPaycheck" },
      },
      {
        label: "Treat your family",
        effect: { cash: 40, relationship: 3, happiness: 5 },
      },
    ],
  },
  {
    id: "career-pivot",
    title: "A surprising opportunity",
    stage: "adult",
    once: true,
    choices: [
      {
        label: "Take a course",
        effect: { smarts: 2, cash: -40, flag: "careerCourse" },
      },
      {
        label: "Ask a mentor for advice",
        effect: { charisma: 1, relationship: 2 },
      },
    ],
  },
  {
    id: "community-award",
    title: "The neighborhood recognizes your help",
    stage: "adult",
    ok: function () {
      return S.k >= 10;
    },
    choices: [
      {
        label: "Accept and thank everyone",
        effect: { happiness: 8, charisma: 1, karma: 2 },
      },
      {
        label: "Give the prize to the community fund",
        effect: { karma: 5, happiness: 4, cash: 50 },
      },
    ],
  },
  {
    id: "quiet-retirement",
    title: "A new chapter opens",
    stage: "senior",
    choices: [
      {
        label: "Share your experience with a young neighbor",
        effect: { smarts: 1, relationship: 3, happiness: 5 },
      },
      {
        label: "Start a new hobby",
        effect: { looks: 1, happiness: 7 },
      },
    ],
  },
  {
    id: "family-reunion",
    title: "A family reunion is coming up",
    stage: "any",
    ok: function () {
      return S.age >= 3;
    },
    followup: "family-reunion",
    choices: [
      {
        label: "Bring a favorite dish",
        effect: { cash: -15, relationship: 3, happiness: 6 },
      },
      {
        label: "Collect stories from everyone",
        effect: { smarts: 1, relationship: 2, flag: "familyStories" },
      },
    ],
  },
  {
    id: "followup-stories",
    title: "Years later, those stories still matter",
    stage: "any",
    ok: function () {
      return !!(S.life.flags && S.life.flags.familyStories);
    },
    followup: "family-stories",
    choices: [
      {
        label: "Write them down for the family",
        effect: { smarts: 2, happiness: 5, flag: "familyArchive" },
      },
      {
        label: "Tell the stories at a gathering",
        effect: { charisma: 2, relationship: 3 },
      },
    ],
  },
  {
    id: "class-project",
    title: "A class project needs a leader",
    stage: "child",
    choices: [
      {
        label: "Make a plan with the group",
        effect: { smarts: 2, charisma: 1, flag: "classProject" },
      },
      {
        label: "Make sure everyone gets a turn",
        effect: { happiness: 4, relationship: 2 },
      },
    ],
  },
  {
    id: "teen-volunteer",
    title: "The neighborhood center needs volunteers",
    stage: "teen",
    choices: [
      {
        label: "Help organize a book drive",
        effect: { karma: 3, smarts: 1, happiness: 4 },
      },
      {
        label: "Help younger students with homework",
        effect: { smarts: 2, relationship: 2 },
      },
    ],
  },
  {
    id: "first-apartment",
    title: "A chance to move into your own place",
    stage: "adult",
    ok: function () {
      return S.age >= 18 && !S.owns.apartment && S.cash >= 200;
    },
    choices: [
      {
        label: "Save toward an apartment",
        effect: { smarts: 1, cash: 20, flag: "savingForHome" },
      },
      {
        label: "Stay flexible and explore the city",
        effect: { happiness: 5, charisma: 1 },
      },
    ],
  },
  {
    id: "community-garden",
    title: "A community garden is taking shape",
    stage: "any",
    ok: function () {
      return S.age >= 3;
    },
    choices: [
      {
        label: "Grow vegetables with neighbors",
        effect: { karma: 2, health: 2, relationship: 2 },
      },
      {
        label: "Design a welcoming sign",
        effect: { looks: 1, charisma: 1, happiness: 3 },
      },
    ],
  },
  {
    id: "health-check",
    title: "A routine check-in",
    stage: "adult",
    ok: function () {
      return S.age >= 18 && S.life.health < 55;
    },
    choices: [
      {
        label: "Make a gentle wellness plan",
        effect: { health: 12, happiness: 2, cash: -20 },
      },
      {
        label: "Ask a trusted person to support you",
        effect: { relationship: 3, happiness: 4 },
      },
    ],
  },
  {
    id: "senior-garden",
    title: "A place for the next generation",
    stage: "senior",
    choices: [
      {
        label: "Plant a tree with your family",
        effect: { happiness: 7, relationship: 3, flag: "familyTreePlanting" },
      },
      {
        label: "Write down a lesson you learned",
        effect: { smarts: 1, charisma: 1, flag: "lifeLesson" },
      },
    ],
  },
];
var LIFE_CAREERS = [
  { id: "artist", title: "Community artist", building: "Clothing Boutique", wage: 45, smarts: 5, charisma: 4 },
  { id: "teacher", title: "School tutor", building: "School", wage: 65, smarts: 12, charisma: 6, recordRestricted: true },
  { id: "nurse", title: "Clinic assistant", building: "Hospital", wage: 70, smarts: 10, charisma: 5, recordRestricted: true },
  { id: "engineer", title: "Junior engineer", building: "Office", wage: 105, smarts: 18, charisma: 7, recordRestricted: true },
  { id: "chef", title: "Cafe chef", building: "Cafe", wage: 60, smarts: 6, charisma: 4 },
  { id: "athlete", title: "City athlete", building: "Gym", wage: 75, strength: 10, charisma: 4, special: "sports" },
  { id: "organizer", title: "Community organizer", building: "Office", wage: 80, karma: 8, charisma: 8, special: "politics" },
  { id: "creator", title: "Independent creator", building: "Office", wage: 55, charisma: 7, special: "fame" },
  { id: "business", title: "Small business owner", building: "Office", wage: 90, charisma: 7, special: "business" },
];
var LIFE_CRIMES = [
  { title: "Pocket a novelty souvenir", difficulty: 4, prize: 25, heat: 0.25 },
  { title: "Sneak out with a giant foam trophy", difficulty: 9, prize: 80, heat: 0.5 },
  { title: "Try a cartoonish midnight getaway", difficulty: 15, prize: 180, heat: 0.9 },
];
var VEHICLES = [
  ["bicycle", "Bicycle", 120, 5.3, "🚲"],
  ["scooter", "Scooter", 480, 7, "🛵"],
  ["motorcycle", "Motorcycle", 850, 8.5, "🏍️"],
  ["car", "City car", 1600, 10, "🚙"],
  ["sportscar", "Sports car", 6000, 13, "🏎️"],
];
var SHOP_ITEMS = {
  "Clothing Boutique": [
    ["Blue jacket", 90, "Blue"],
    ["Red jacket", 110, "Red"],
    ["Green outfit", 95, "Green"],
    ["Purple outfit", 120, "Purple"],
    ["Golden outfit", 180, "Gold"],
    ["Black suit", 250, "Black"],
    ["Pink outfit", 100, "Pink"],
  ],
  Supermarket: [
    ["Fresh fruit", 8, "fruit"],
    ["Meal box", 16, "meal"],
    ["Groceries for a week", 45, "groceries"],
  ],
  "Furniture Gallery": [
    ["Comfy sofa", 90, "sofa"],
    ["Study desk", 110, "desk"],
    ["Houseplants", 35, "plants"],
    ["Large TV", 250, "tv"],
    ["Bookshelf", 75, "bookshelf"],
    ["Piano", 650, "piano"],
    ["Dining table", 180, "table"],
    ["Floor lamp", 45, "lamp"],
    ["Cozy rug", 60, "rug"],
    ["Painting", 120, "painting"],
  ],
};
var FURN = [
  ["sofa", "🛋️"],
  ["desk", "🖥️"],
  ["plants", "🪴"],
  ["tv", "📺"],
  ["bookshelf", "📚"],
  ["piano", "🎹"],
  ["table", "🪑"],
  ["lamp", "💡"],
  ["rug", "🟠"],
  ["painting", "🖼️"],
];
// Each item sits in its own spot (0-9) unless the player moved it.
function furnSlot(k) {
  var s = S.decorSlots[k];
  if (s === undefined)
    s = FURN.map(function (f) {
      return f[0];
    }).indexOf(k);
  return ((s % 10) + 10) % 10;
}
function seasonName() {
  return ["Spring", "Summer", "Autumn", "Winter"][
    Math.floor((S.day - 1) / 15) % 4
  ];
}
function netWorth() {
  var homes =
      Math.round(
        (S.owns.apartment ? 700 : 0) *
          (1 - (typeof lifeHomeWear === "function" ? lifeHomeWear("apartment") : 0)),
      ) +
      Math.round(
        (S.owns.townhouse ? 1700 : 0) *
          (1 - (typeof lifeHomeWear === "function" ? lifeHomeWear("townhouse") : 0)),
      ) +
      Math.round(
        (S.mansion ? 3000 : 0) *
          (1 - (typeof lifeHomeWear === "function" ? lifeHomeWear("mansion") : 0)),
      ),
    vehicles = VEHICLES.reduce(function (total, vehicle) {
      return S.garage && S.garage[vehicle[0]]
        ? total +
            Math.round(
              vehicle[2] *
                (1 -
                  (typeof lifeVehicleWear === "function"
                    ? lifeVehicleWear(vehicle[0])
                    : 0)),
            )
        : total;
    }, 0),
    investments = typeof invested === "function" ? invested() : 0,
    businessValues = { cafe: 600, delivery: 850, arcade: 1100, store: 1350, factory: 2200 },
    businesses = Object.keys(S.businesses || {}).reduce(function (total, key) {
      return total + (businessValues[key] || 500);
    }, 0),
    furniture = Object.keys(S.furniture || {}).reduce(function (total, key) {
      var item = Object.keys(SHOP_ITEMS).reduce(function (found, shop) {
        return found || SHOP_ITEMS[shop].filter(function (entry) {
          return entry[2] === key;
        })[0];
      }, null);
      return total + (item ? item[1] : 25);
    }, 0),
    jewelry = (S.life && S.life.assets && S.life.assets.jewelry) || 0,
    debt = (S.life && S.life.debt) || 0;
  return S.cash + S.bank + homes + vehicles + investments + businesses + furniture + jewelry - debt;
}
function claimAchievement(m) {
  if (S.achievementClaims[m[0]] || !m[4]()) return;
  S.achievementClaims[m[0]] = 1;
  S.cash += m[3];
  S.lifetimeEarned += m[3];
  cityNotice("🏆 Achievement: " + m[1] + "! +" + fmtCash(m[3]));
  cityAchievements();
}
