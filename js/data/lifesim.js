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
  return (
    S.cash +
    S.bank +
    (S.owns.apartment ? 700 : 0) +
    (S.owns.townhouse ? 1700 : 0) +
    (S.mansion ? 3000 : 0)
  );
}
function claimAchievement(m) {
  if (S.achievementClaims[m[0]] || !m[4]()) return;
  S.achievementClaims[m[0]] = 1;
  S.cash += m[3];
  S.lifetimeEarned += m[3];
  cityNotice("🏆 Achievement: " + m[1] + "! +" + fmtCash(m[3]));
  cityAchievements();
}
