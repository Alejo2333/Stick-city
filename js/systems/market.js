var AS = [
    ["STK", "📈", "StickCorp", 0, 0.05, 50],
    ["BRG", "🍔", "Patty Palace Inc", 0, 0.07, 30],
    ["MTR", "🚗", "Stick Motors", 0, 0.06, 80],
    ["BNS", "☕", "Bean There Coffee", 0, 0.06, 25],
    ["LCK", "🎰", "Lucky Stick Casino", 0, 0.09, 60],
    ["PHM", "💊", "Stick Pharma", 0, 0.04, 120],
    ["NRG", "⚡", "Stick Energy", 0, 0.05, 45],
    // new stocks
    ["BNK", "🏦", "Stick Bank & Trust", 0, 0.04, 70],
    ["AIR", "✈️", "SkyStick Airlines", 0, 0.08, 35],
    ["SHP", "🛒", "Stick Mart", 0, 0.05, 55],
    ["SPC", "🛰️", "Stick Space", 0, 0.1, 150],
    ["GAM", "🎮", "Pixel Stick Games", 0, 0.08, 65],
    // coins
    ["SCN", "🪙", "StickCoin", 1, 0.09, 100],
    ["DGE", "🐶", "DogeStick", 1, 0.12, 5],
    ["ETH", "💎", "Stickereum", 1, 0.07, 300],
    ["MON", "🚀", "MoonRock", 1, 0.15, 2],
    // new coins
    ["SOL", "☀️", "SolarStick", 1, 0.09, 120],
    ["LNK", "🔗", "StickLink", 1, 0.1, 25],
    ["ORB", "🔮", "OrbCoin", 1, 0.11, 15],
    ["CAT", "🐱", "CatStick", 1, 0.13, 8],
    ["PEP", "🐸", "PepeStick", 1, 0.16, 3],
  ],
  phMsg = "";

var MIN_PRICE = 0.25;

function r2(x) {
  return Math.round(x * 100) / 100;
}
function fmtPx(x) {
  return r2(x).toFixed(2);
}

AS.forEach(function (a) {
  if (!S.px[a[0]]) S.px[a[0]] = r2(Math.max(1, a[5] * (0.6 + Math.random())));
  // Saves from before cost tracking count profit from today's price.
  if (S.hold[a[0]] && !S.cost[a[0]]) S.cost[a[0]] = r2(S.hold[a[0]] * S.px[a[0]]);
});
if (!S.marketHistory || typeof S.marketHistory !== "object")
  S.marketHistory = {};
AS.forEach(function (asset) {
  var history = S.marketHistory[asset[0]];
  if (!Array.isArray(history)) S.marketHistory[asset[0]] = [];
  else
    S.marketHistory[asset[0]] = history
      .filter(function (point) {
        return (
          point &&
          Number.isFinite(Number(point.day)) &&
          Number.isFinite(Number(point.price)) &&
          Number(point.price) > 0
        );
      })
      .slice(-30);
});
function recordMarketHistory() {
  AS.forEach(function (asset) {
    var key = asset[0],
      history = S.marketHistory[key],
      point = { day: S.day, price: S.px[key] };
    if (history.length && history[history.length - 1].day === S.day)
      history[history.length - 1] = point;
    else history.push(point);
    if (history.length > 30) history.shift();
  });
}
function rand(lo, hi) {
  return lo + Math.random() * (hi - lo);
}

function pxChange(k) {
  var prev = S.pp && S.pp[k];
  return prev ? Math.round((S.px[k] / prev - 1) * 1000) / 10 : 0;
}
function setPx(k, multiplier) {
  S.px[k] = r2(Math.max(MIN_PRICE, S.px[k] * multiplier));
}
function invested() {
  return r2(
    AS.reduce(function (total, asset) {
      var k = asset[0];
      return total + (S.hold[k] || 0) * (S.px[k] || 0);
    }, 0),
  );
}
function buy(k, q) {
  if (
    !AS.some(function (asset) {
      return asset[0] === k;
    })
  )
    return false;
  var px = S.px[k],
    cost = r2(px * q);
  if (
    !Number.isInteger(q) ||
    q < 1 ||
    !Number.isFinite(px) ||
    px <= 0 ||
    S.cash < cost
  )
    return false;
  S.cash = r2(S.cash - cost);
  S.hold[k] = (S.hold[k] || 0) + q;
  S.cost[k] = r2((S.cost[k] || 0) + cost);
  return true;
}
function sell(k, q) {
  if (
    !AS.some(function (asset) {
      return asset[0] === k;
    })
  )
    return { shares: 0, proceeds: 0, gain: 0 };
  var held = S.hold[k] || 0,
    shares = Math.min(held, q),
    proceeds = r2(shares * (S.px[k] || 0)),
    paid = held ? r2(((S.cost[k] || 0) * shares) / held) : 0;
  S.cash = r2(S.cash + proceeds);
  S.hold[k] = held - shares;
  S.cost[k] = S.hold[k] ? r2((S.cost[k] || 0) - paid) : 0;
  return { shares: shares, proceeds: proceeds, gain: r2(proceeds - paid) };
}
function sellAll(k) {
  return sell(k, S.hold[k] || 0);
}
// Each phase gets its own fixed stream, so a price changed by a life event can
// nudge ordinary moves but never changes which news or spikes are coming.
function priceTick() {
  S.pp = {};
  S.marketTick = (S.marketTick || 0) + 1;
  var tick = "market:" + S.marketTick + ":";
  withFate(tick + "moves", priceMoves);
  withFate(tick + "news", newsTick);
  withFate(tick + "moon", moonTick);
  withFate(tick + "settle", priceSettle);
  recordMarketHistory();
}
function priceMoves() {
  AS.forEach(function (a) {
    var k = a[0],
      old = S.px[k],
      r =
        (Math.random() - 0.5) * 2 * a[4] * (0.4 + Math.random() * 1.6) +
        trend(k) +
        (a[3] ? 0.13 : 0.06) * Math.log(a[5] / old);

    if (a[3] && a[4] >= 0.09) {
      var q = Math.random();
      if (q < 0.03) r = -0.5;
      else if (q > 0.97 && a[4] >= 0.12) r = 0.8;
    }

    if (Math.abs(r) < 0.004) r = (r < 0 ? -1 : 1) * rand(0.004, 0.012);

    S.pp[k] = old;
    var next = r2(Math.max(MIN_PRICE, old * (1 + r)));

    if (next === old)
      next = r2(old + (old <= MIN_PRICE || r > 0 ? 0.01 : -0.01));
    S.px[k] = next;
  });
}
function priceSettle() {
  AS.forEach(function (a) {
    var k = a[0];
    if (S.px[k] === S.pp[k])
      S.px[k] = r2(
        S.px[k] + (S.px[k] <= MIN_PRICE || Math.random() < 0.5 ? 0.01 : -0.01),
      );
  });
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
  BNK: "bank",
  AIR: "travel",
  SHP: "retail",
  SPC: "space",
  GAM: "tech",
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
  bank: [
    ["{n} passes the stress test with flying colors", 1.08, 0.1],
    ["Savers flock to {n} after a rate hike", 1.1, 0.1],
  ],
  travel: [
    ["Record holiday bookings lift {n}", 1.12, 0.12],
    ["{n} cuts fuel costs with new planes", 1.1, 0.1],
  ],
  retail: [
    ["Black Friday crowds break records at {n}", 1.12, 0.12],
    ["{n} launches a hit loyalty program", 1.08, 0.08],
  ],
  space: [
    ["{n} lands a rocket on its first try", 1.2, 0.2],
    ["{n} wins a moon base contract", 1.18, 0.18],
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
  bank: [
    ["Bank run scare hits {n}", 0.7, 0.15],
    ["{n} hit with a huge regulatory fine", 0.8, 0.1],
  ],
  travel: [
    ["Pilot strike grounds {n} flights", 0.78, 0.12],
    ["{n} plane makes an emergency landing", 0.82, 0.1],
  ],
  retail: [
    ["Shoppers abandon {n} after a price hike", 0.82, 0.1],
    ["{n} warehouse hit by a supply chain jam", 0.85, 0.08],
  ],
  space: [
    ["{n} rocket explodes on the launch pad", 0.65, 0.15],
    ["{n} loses contact with its satellite", 0.78, 0.12],
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
        e =
          sectorPool && Math.random() < 0.4
            ? pick(sectorPool)
            : pick(good ? NEWS_UP : NEWS_DN);
      }
      applyNews(a, e);
    }
  }
}

// Overnight jumps of +300% to +500% over yesterday's close, whatever else moved
// the price today. The pull toward base price in priceTick bleeds them back off,
// so holders get a few days to sell. Each asset rolls on its own, so several can
// spike on the same day.
var MOON_ODDS = {
  stock: 0.01,
  SCN: 0.04,
  DGE: 0.05,
  ETH: 0.03,
  MON: 0.06,
  SOL: 0.03,
  LNK: 0.035,
  ORB: 0.04,
  CAT: 0.05,
  PEP: 0.06,
};
var MOON_NEWS = [
  "{n} skyrockets overnight",
  "Buying frenzy sends {n} to the moon",
  "Short squeeze rockets {n}",
  "Nobody can explain the {n} surge",
];
function moonTick() {
  AS.forEach(function (a) {
    if (Math.random() >= (MOON_ODDS[a[0]] || MOON_ODDS.stock)) return;
    var before = S.pp[a[0]];
    S.px[a[0]] = r2(Math.max(MIN_PRICE, before * rand(4, 6)));
    S.news.push(
      "🚀 " +
        pick(MOON_NEWS).replace("{n}", a[2]) +
        " (+" +
        Math.round((S.px[a[0]] / before - 1) * 100) +
        "%)",
    );
  });
}

if (typeof PA !== "undefined") {
  PA.buy = function (v) {
    var p = v.split(":"),
      k = p[0],
      px = S.px[k],
      q = p[1] === "max" ? Math.floor(S.cash / px) : +p[1];
    if (q < 1 || !buy(k, q)) {
      pmsg = "Not enough cash.";
      return;
    }
    pmsg = "Bought " + q + ".";
  };
  PA.sell = function (k) {
    var r = sellAll(k);
    pmsg = "Sold for $" + fmtPx(r.proceeds) + ".";
  };
}
