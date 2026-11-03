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
function priceTick() {
  S.pp = {};
  AS.forEach(function (a) {
    var k = a[0],
      r =
        (Math.random() - 0.5) * 2 * a[4] * (0.4 + Math.random() * 1.6) +
        trend(k);
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
function newsTick() {
  var up = [
      ["{n} posts record profits", 1.08, 0.15],
      ["{n} unveils a hit product", 1.1, 0.2],
    ],
    dn = [
      ["{n} faces a lawsuit", 0.75, 0.15],
      ["{n} hit by a scandal", 0.65, 0.2],
      ["{n} recalls its products", 0.8, 0.12],
    ],
    cu = [
      ["Celebrity hypes {n}", 1.2, 0.4],
      ["{n} gets listed on a big exchange", 1.15, 0.25],
    ],
    cd = [
      ["{n} hacked, funds missing", 0.55, 0.2],
      ["Whales dump {n}", 0.7, 0.15],
    ],
    n = 1 + Math.floor(Math.random() * 3);
  S.news = [];
  for (var i = 0; i < n; i++) {
    var t = Math.random(),
      a = AS[Math.floor(Math.random() * AS.length)];
    if (t < 0.12) {
      S.news.push("Market rally lifts all stocks");
      AS.forEach(function (x) {
        if (!x[3])
          S.px[x[0]] = Math.max(
            1,
            Math.round(S.px[x[0]] * (1.03 + Math.random() * 0.05)),
          );
      });
    } else if (t < 0.24) {
      S.news.push("Regulators crack down on crypto");
      AS.forEach(function (x) {
        if (x[3])
          S.px[x[0]] = Math.max(
            1,
            Math.round(S.px[x[0]] * (0.7 + Math.random() * 0.2)),
          );
      });
    } else {
      var pool =
          Math.random() < 0.5 ? (a[3] ? cu : up) : a[3] ? cd : dn,
        e = pool[Math.floor(Math.random() * pool.length)],
        m = e[1] + Math.random() * e[2];
      S.px[a[0]] = Math.max(1, Math.round(S.px[a[0]] * m));
      S.news.push(e[0].replace("{n}", a[2]));
    }
  }
}
function invested() {
  var v = 0;
  AS.forEach(function (a) {
    v += (S.hold[a[0]] || 0) * S.px[a[0]];
  });
  return v;
}
