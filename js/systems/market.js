var AS = [
    ["STK", "📈", "StickCorp", 0, 0.05, 50],
    ["BRG", "🍔", "Patty Palace Inc", 0, 0.07, 30],
    ["MTR", "🚗", "Stick Motors", 0, 0.06, 80],
    ["BNS", "☕", "Bean There Coffee", 0, 0.06, 25],
    ["LCK", "🎰", "Lucky Stick Casino", 0, 0.09, 60],
    ["PHM", "💊", "Stick Pharma", 0, 0.04, 120],
    ["NRG", "⚡", "Stick Energy", 0, 0.05, 45],
    ["SCN", "🪙", "StickCoin", 1, 0.2, 100],
    ["DGE", "🐶", "DogeStick", 1, 0.3, 5],
    ["ETH", "💎", "Stickereum", 1, 0.15, 300],
    ["MON", "🚀", "MoonRock", 1, 0.4, 2],
  ],
  phMsg = "";
AS.forEach(function (a) {
  if (!S.px[a[0]])
    S.px[a[0]] = Math.max(1, Math.round(a[5] * (0.6 + Math.random())));
});
function rand(lo, hi) {
  return lo + Math.random() * (hi - lo);
}
function setPx(k, multiplier) {
  S.px[k] = Math.max(1, Math.round(S.px[k] * multiplier));
}
function invested() {
  return AS.reduce(function (total, asset) {
    var k = asset[0];
    return total + (S.hold[k] || 0) * (S.px[k] || 0);
  }, 0);
}
function buy(k, q) {
  if (
    !AS.some(function (asset) {
      return asset[0] === k;
    })
  )
    return false;
  var px = S.px[k];
  if (
    !Number.isInteger(q) ||
    q < 1 ||
    !Number.isFinite(px) ||
    px < 1 ||
    S.cash < px * q
  )
    return false;
  S.cash -= px * q;
  S.hold[k] = (S.hold[k] || 0) + q;
  return true;
}
function sellAll(k) {
  if (
    !AS.some(function (asset) {
      return asset[0] === k;
    })
  )
    return { shares: 0, proceeds: 0 };
  var shares = S.hold[k] || 0,
    proceeds = shares * (S.px[k] || 0);
  S.cash += proceeds;
  S.hold[k] = 0;
  return { shares: shares, proceeds: proceeds };
}
function priceTick() {
  S.pp = {};
  AS.forEach(function (a) {
    var k = a[0],
      r =
        (Math.random() - 0.5) * 2 * a[4] * (0.4 + Math.random() * 1.6) +
        trend(k) +
        // Pull toward the base price, or random drift sinks everything to $1.
        0.06 * Math.log(a[5] / S.px[k]);
    S.pp[k] = S.px[k];
    if (a[3] && a[4] >= 0.2) {
      var q = Math.random();
      if (q < 0.03) r = -0.5;
      else if (q > 0.97 && a[4] >= 0.3) r = 0.8;
    }
    S.px[k] = Math.max(1, Math.round(S.px[k] * (1 + r)));
  });
  newsTick();
}
function trend(k) {
  S.tr[k] = (S.tr[k] || 0) * 0.7 + (Math.random() - 0.5) * 0.03;
  return S.tr[k];
}

var SECTOR = {
  STK: "tech",
  BRG: "food",
  MTR: "auto",
  BNS: "food",
  LCK: "casino",
  PHM: "pharma",
  NRG: "energy",
};

// ---------- generic stock news ----------
var NEWS_UP = [
  ["{n} posts record profits", 1.08, 0.15],
  ["{n} unveils a hit product", 1.1, 0.2],
  ["{n} beats earnings expectations", 1.07, 0.1],
  ["{n} announces a huge stock buyback", 1.06, 0.08],
  ["{n} lands a massive contract", 1.1, 0.15],
  ["{n} gets an analyst upgrade", 1.05, 0.08],
  ["{n} expands into new countries", 1.07, 0.1],
  ["{n} names a famous new CEO", 1.06, 0.12],
  ["{n} pays a surprise dividend", 1.04, 0.06],
];
var NEWS_DN = [
  ["{n} faces a lawsuit", 0.75, 0.15],
  ["{n} hit by a scandal", 0.65, 0.2],
  ["{n} recalls its products", 0.8, 0.12],
  ["{n} misses earnings badly", 0.82, 0.1],
  ["{n} CEO resigns suddenly", 0.8, 0.12],
  ["{n} accused of cooking the books", 0.6, 0.15],
  ["{n} workers go on strike", 0.85, 0.08],
  ["{n} data breach exposes customers", 0.82, 0.1],
  ["{n} gets a downgrade from analysts", 0.9, 0.06],
  ["{n} loses a key customer", 0.85, 0.08],
];

// ---------- sector news ----------
var NEWS_SECTOR_UP = {
  tech: [
    ["{n} launches a mind-blowing gadget", 1.15, 0.2],
    ["{n} wins a government AI contract", 1.12, 0.15],
  ],
  food: [
    ["{n} goes viral on social media", 1.15, 0.2],
    ["{n} aces its health inspection", 1.05, 0.06],
    ["{n} launches a surprise new menu hit", 1.1, 0.12],
  ],
  auto: [
    ["{n} reveals a self-driving breakthrough", 1.15, 0.2],
    ["{n} sales hit an all-time high", 1.1, 0.1],
  ],
  casino: [
    ["Tourism boom packs {n}", 1.12, 0.12],
    ["A high roller loses big at {n}", 1.1, 0.12],
  ],
  pharma: [
    ["{n} cure passes final trials", 1.25, 0.25],
    ["{n} gets fast-track approval", 1.15, 0.15],
  ],
  energy: [
    ["{n} strikes a huge new oil field", 1.15, 0.15],
    ["{n} wins a clean-energy grant", 1.1, 0.1],
  ],
};
var NEWS_SECTOR_DN = {
  tech: [
    ["{n} product launch flops", 0.8, 0.1],
    ["{n} bug bricks thousands of devices", 0.78, 0.12],
  ],
  food: [
    ["Food poisoning outbreak traced to {n}", 0.65, 0.15],
    ["Rats found in {n} kitchen", 0.7, 0.12],
  ],
  auto: [
    ["{n} cars catch fire, recall ordered", 0.7, 0.15],
    ["Chip shortage halts {n} factories", 0.82, 0.08],
  ],
  casino: [
    ["{n} fined for rigged slot machines", 0.7, 0.15],
    ["Gambling ban rumors hit {n}", 0.85, 0.08],
  ],
  pharma: [
    ["{n} drug fails final trials", 0.6, 0.15],
    ["{n} pill linked to side effects", 0.72, 0.12],
  ],
  energy: [
    ["{n} oil spill sparks outrage", 0.7, 0.15],
    ["Pipeline explosion hits {n}", 0.75, 0.12],
  ],
};

// ---------- crypto news ----------
var NEWS_CU = [
  ["Celebrity hypes {n}", 1.2, 0.4],
  ["{n} gets listed on a big exchange", 1.15, 0.25],
  ["Big company starts accepting {n}", 1.2, 0.3],
  ["{n} trends #1 on social media", 1.15, 0.35],
  ["A country adopts {n} as currency", 1.3, 0.4],
  ["Billionaire buys a mountain of {n}", 1.25, 0.35],
  ["{n} network upgrade goes smoothly", 1.1, 0.15],
  ["Meme about {n} explodes online", 1.2, 0.5],
];
var NEWS_CD = [
  ["{n} hacked, funds missing", 0.55, 0.2],
  ["Whales dump {n}", 0.7, 0.15],
  ["{n} founder vanishes", 0.5, 0.2],
  ["{n} network goes down for days", 0.78, 0.1],
  ["Celebrity admits they were paid to hype {n}", 0.7, 0.15],
  ["Government bans mining of {n}", 0.65, 0.15],
  ["{n} wallet bug wipes out balances", 0.6, 0.2],
  ["Influencers say {n} is dead", 0.75, 0.12],
];

// ---------- rare, dramatic events (about 5% of asset events) ----------
var RARE_UP = [
  ["{n} receives a surprise buyout offer!", 1.5, 0.5],
  ["{n} is the hottest thing on the planet", 1.6, 0.8],
  ["{n} discovered to be secretly sitting on a fortune", 1.4, 0.4],
];
var RARE_DN = [
  ["{n} files for bankruptcy protection", 0.3, 0.2],
  ["{n} exposed as a total scam", 0.2, 0.2],
  ["Investigators raid {n} headquarters", 0.4, 0.2],
];

// ---------- market-wide events: [headline, stockLo, stockHi, cryptoLo, cryptoHi] ----------
var NEWS_MARKET = [
  ["Market rally lifts all stocks", 1.03, 1.08, 1, 1],
  ["Interest rates cut, markets cheer", 1.04, 1.09, 1.05, 1.15],
  ["Stimulus checks hit bank accounts", 1.02, 1.06, 1.1, 1.3],
  ["Tech boom lifts everything", 1.04, 1.1, 1.05, 1.2],
  ["Government approves a crypto ETF", 1, 1.02, 1.2, 1.5],
  ["Crypto bull run sweeps the market", 1, 1, 1.2, 1.6],
  ["Recession fears shake the market", 0.88, 0.95, 0.8, 0.92],
  ["Interest rates hiked, investors panic", 0.92, 0.97, 0.85, 0.95],
  ["Regulators crack down on crypto", 1, 1, 0.7, 0.9],
  ["Crypto winter: investors flee", 0.98, 1, 0.6, 0.8],
  ["Major crypto exchange collapses", 0.98, 1, 0.5, 0.75],
  ["Flash crash rattles every market", 0.85, 0.93, 0.7, 0.85],
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function applyNews(a, e) {
  var m = e[1] + Math.random() * e[2];
  setPx(a[0], m);
  S.tr[a[0]] = (S.tr[a[0]] || 0) + (m - 1) * 0.15; // aftershock: momentum carries into next year
  S.news.push(e[0].replace("{n}", a[2]));
}

function newsTick() {
  var count = 1 + Math.floor(Math.random() * 3);
  S.news = [];
  for (var i = 0; i < count; i++) {
    var t = Math.random();

    if (t < 0.18) {
      // market-wide
      var ev = pick(NEWS_MARKET);
      AS.forEach(function (x) {
        var lo = x[3] ? ev[3] : ev[1],
          hi = x[3] ? ev[4] : ev[2];
        setPx(x[0], rand(lo, hi));
      });
      S.news.push(ev[0]);
    } else {
      var a = pick(AS),
        good = Math.random() < 0.5,
        e;
      if (Math.random() < 0.05) {
        e = pick(good ? RARE_UP : RARE_DN);
      } else if (a[3]) {
        e = pick(good ? NEWS_CU : NEWS_CD);
      } else {
        var sec = SECTOR[a[0]];
        var sectorPool = good ? NEWS_SECTOR_UP[sec] : NEWS_SECTOR_DN[sec];
        // 40% chance of a sector-specific story, otherwise generic
        e =
          sectorPool && Math.random() < 0.4
            ? pick(sectorPool)
            : pick(good ? NEWS_UP : NEWS_DN);
      }
      applyNews(a, e);
    }
  }
}
