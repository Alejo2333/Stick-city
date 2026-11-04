var VW = 800,
  VH = 520,
  W = 3600,
  H = 3600,
  MAXE = 25,
  R = [600, 1800, 3000],
  DEV_MODE = window.STICK_CITY_DEV === true,
  KEY = DEV_MODE ? "stickCityDevSave2" : "stickTownSave2";
var cv = document.getElementById("c"),
  g = cv.getContext("2d"),
  ov = document.getElementById("ov");
var S = {
  day: 1,
  cash: 100,
  bank: 0,
  str: 1,
  int: 1,
  cha: 1,
  k: 0,
  en: MAXE,
  t: 6,
  x: 600,
  y: 600,
  mansion: 0,
  won: 0,
  inv: {},
  wpn: "",
  lv: {},
  partner: "",
  quest: null,
  heat: 0,
  done: {},
  age: 18,
  hap: 60,
  log: [],
  fol: 0,
  px: {},
  tr: {},
  news: [],
  marketHistory: {},
  pp: {},
  hold: {},
  th: {},
  mail: [],
  career: "Explorer",
  achievements: {},
  milestones: {},
  daily: {},
  owns: {},
  furniture: {},
  outfit: "Blue",
  vehicle: "",
  driving: false,
  businesses: {},
  businessLast: 1,
  weather: "Sunny",
  forecast: "Sunny",
  festivals: {},
  lifetimeEarned: 0,
  lifetimeSpent: 0,
  jobsDone: 0,
  talksDone: 0,
  placesVisited: {},
  missionClaimed: {},
  storyClaims: {},
  achievementClaims: {},
  garage: {},
  vehicle: "",
  driveDistance: 0,
  activeHome: "starter",
  decorSlots: {},
  houseStyle: "Classic",
  invites: 0,
  npcMemory: {},
  storePurchases: {},
  festivalVisits: 0,
  weatherEvents: 0,
  personalQuest: "",
  weatherLastEvent: 0,
  moneyPeak: 100,
  outfitsOwned: { Blue: 1 },
  mayor: 0,
  invitedGuest: "",
  guestDay: 0,
  lifetimeRent: 0,
  lifetimeBusiness: 0,
  visitedDistricts: {},
  seasonsSeen: {},
  businessUpgrades: {},
  casino: { plays: 0, won: 0, lost: 0, best: 0 },
  cr: {},
  life: {},
};
var SK = Object.keys(S);
S.ph = 0;
S.face = Math.PI / 2;
S.in = null;
try {
  var sv = JSON.parse(localStorage.getItem(KEY) || "null");
  if (sv)
    SK.forEach(function (k) {
      if (sv[k] !== undefined) S[k] = sv[k];
    });
} catch (e) {}
if (S.vehicle) S.garage[S.vehicle] = 1;
S.seasonsSeen[
  ["Spring", "Summer", "Autumn", "Winter"][
    Math.floor((S.day - 1) / 15) % 4
  ]
] = 1;
var saveWarned = false;
function save() {
  S.moneyPeak = Math.max(S.moneyPeak || 0, S.cash + S.bank);
  try {
    var o = {};
    SK.forEach(function (k) {
      o[k] = S[k];
    });
    localStorage.setItem(KEY, JSON.stringify(o));
    saveWarned = false;
  } catch (e) {
    console.error("Could not save the game:", e);
    if (!saveWarned) say("Your progress could not be saved in this browser.");
    saveWarned = true;
  }
}
function need(s, i, c, k) {
  var f = function () {
    return (
      S.str >= s &&
      S.int >= i &&
      S.cha >= c &&
      S.k >= (k === undefined ? -999 : k)
    );
  };
  var l = [];
  if (s) l.push("STR " + s);
  if (i) l.push("INT " + i);
  if (c) l.push("CHA " + c);
  if (k !== undefined) l.push("karma " + k);
  return { req: f, lock: "needs " + l.join(", ") };
}
function job(i, t, hp, h, pay, rq, m) {
  var o = {
    i: i,
    t: t,
    tag: "(−" + hp + " HP)",
    p: "pays $" + pay + "+",
    en: -hp,
    h: h,
    gain: function () {
      return pay + Math.floor((S.str + S.int + S.cha) / 10);
    },
    m: function (n) {
      return m + " You earned $" + n + ".";
    },
  };
  if (rq) {
    o.req = rq.req;
    o.lock = rq.lock;
  }
  return o;
}
var ITEMS = {
  flowers: { i: "🌹", n: "Flowers" },
  medkit: { i: "🩹", n: "Medkit", heal: 12 },
  bat: { i: "🏏", n: "Baseball bat", w: 2 },
  knife: { i: "🔪", n: "Knife", w: 4 },
  pistol: { i: "🔫", n: "Pistol", w: 8 },
};
function wp() {
  return S.wpn && S.inv[S.wpn] ? ITEMS[S.wpn].w : 0;
}
function lvl(n) {
  return S.lv[n] || 0;
}
// Gambling and weapons wait until 18.
function isAdult() {
  return S.age >= 18;
}
function doneToday(k) {
  return S.done[k] === S.day;
}
function markDone(k) {
  S.done[k] = S.day;
}
function shop(id, t, pr) {
  return {
    i: ITEMS[id].i,
    t: t,
    tag: "(+" + ITEMS[id].w + " fight power)",
    p: "$" + pr,
    cost: pr,
    give: id,
    req: function () {
      return isAdult() && !S.inv[id];
    },
    get lock() {
      return isAdult() ? "owned" : "18+";
    },
    m:
      "You bought a " +
      ITEMS[id].n.toLowerCase() +
      ". Equip it in your backpack.",
  };
}
function night() {
  return S.t >= 18;
}
