function cr(c, n) {
  var o = [];
  for (var i = 0; i < c.length - 1; i++) {
    var p0 = c[Math.max(0, i - 1)],
      p1 = c[i],
      p2 = c[i + 1],
      p3 = c[Math.min(c.length - 1, i + 2)];
    for (var k = 0; k < n; k++) {
      var t = k / n,
        t2 = t * t,
        t3 = t2 * t;
      o.push({
        x:
          0.5 *
          (2 * p1[0] +
            (-p0[0] + p2[0]) * t +
            (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
            (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        y:
          0.5 *
          (2 * p1[1] +
            (-p0[1] + p2[1]) * t +
            (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
            (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      });
    }
  }
  var l = c[c.length - 1];
  o.push({ x: l[0], y: l[1] });
  return o;
}
var RD = [
    cr(
      [
        [0, 900],
        [600, 760],
        [1300, 1000],
        [1900, 1450],
        [2600, 1500],
        [3200, 1250],
        [3600, 1400],
      ],
      14,
    ),
    cr(
      [
        [800, 0],
        [950, 600],
        [1300, 1000],
        [1250, 1700],
        [1000, 2300],
        [1200, 3000],
        [1100, 3600],
      ],
      14,
    ),
    cr(
      [
        [1900, 1450],
        [2000, 2100],
        [2400, 2600],
        [2300, 3200],
        [2500, 3600],
      ],
      14,
    ),
    cr(
      [
        [2600, 1500],
        [2750, 900],
        [2500, 300],
        [2700, 0],
      ],
      14,
    ),
    cr(
      [
        [1000, 2300],
        [1700, 2450],
        [2400, 2600],
        [3100, 2800],
        [3600, 2700],
      ],
      14,
    ),
    cr(
      [
        [0, 2200],
        [500, 2300],
        [1000, 2300],
      ],
      14,
    ),
    cr(
      [
        [3200, 1250],
        [3300, 700],
        [3600, 600],
      ],
      14,
    ),
  ],
  RS = [];
RD.forEach(function (pts) {
  pts.forEach(function (q) {
    RS.push(q);
  });
});
function nearRoad(x, y, r) {
  var r2 = r * r;
  for (var i = 0; i < RS.length; i++) {
    var dx = RS[i].x - x,
      dy = RS[i].y - y;
    if (dx * dx + dy * dy < r2) return true;
  }
  return false;
}
function clear(x, y) {
  for (var u = 0; u <= 240; u += 40)
    for (var v = 0; v <= 230; v += 40)
      if (nearRoad(x + u, y + v, 155)) return false;
  return nearRoad(x + 120, y + 100, 420);
}
var seed = 12345;
function rnd() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}
var B = [];
D.forEach(function (d) {
  var pl = null;
  for (var t = 0; t < 4000 && !pl; t++) {
    var pts = RD[Math.floor(rnd() * RD.length)],
      j = Math.floor(rnd() * (pts.length - 1)),
      a = pts[j],
      c = pts[j + 1],
      tx = c.x - a.x,
      ty = c.y - a.y,
      l = Math.hypot(tx, ty) || 1,
      sd = rnd() < 0.5 ? -1 : 1,
      off = 190 + rnd() * 110;
    var x = Math.round(a.x - (ty / l) * sd * off - 120),
      y = Math.round(a.y + (tx / l) * sd * off - 100);
    if (x < 120 || y < 120 || x > W - 360 || y > H - 420) continue;
    if (
      B.some(function (q) {
        return Math.hypot(x - q.x, y - q.y) < 430;
      })
    )
      continue;
    if (clear(x, y)) pl = { x: x, y: y };
  }
  if (!pl)
    pl = {
      x: 300 + Math.round(rnd() * 2800),
      y: 300 + Math.round(rnd() * 2800),
    };
  var b = {
    x: pl.x,
    y: pl.y,
    w: 240,
    h: 200,
    n: d[3],
    c: d[4],
    wall: d[5],
    floor: d[6],
    skin: d[7],
    hair: d[8],
    sign: d[9],
    greet: d[10],
    items: d[11],
  };
  b.dx = b.x + 120;
  b.dy = b.y + 230;
  var np = RS.reduce(function (m, q) {
    return Math.hypot(q.x - b.dx, q.y - b.dy) <
      Math.hypot(m.x - b.dx, m.y - b.dy)
      ? q
      : m;
  }, RS[0]);
  b.px = np.x;
  b.py = np.y;
  B.push(b);
});
B.forEach(function (b) {
  if (
    ["Clothing Boutique", "Supermarket", "Furniture Gallery"].indexOf(
      b.n,
    ) >= 0
  )
    b.items.push({
      i: "🛍️",
      t: "Browse shop",
      fn: function () {
        cityStore(b.n);
        return "Welcome to " + b.n + ".";
      },
    });
  if (b.n === "Real Estate Office")
    b.items.push({
      i: "🏘️",
      t: "Property listings",
      fn: function () {
        cityHomes();
        return "Let's find your next home.";
      },
    });
  if (b.n === "Motor Garage")
    b.items.push({
      i: "🏎️",
      t: "Buy, park or switch vehicles",
      fn: function () {
        cityGarage();
        return "Welcome to the garage.";
      },
    });
  if (b.n === "Home") {
    b.items.push({
      i: "🪴",
      t: "Move furniture and change wallpaper",
      fn: function () {
        cityLayout();
        return "Home decorating.";
      },
    });
    b.items.push({
      i: "💌",
      t: "Invite a friend over",
      fn: function () {
        cityInvite();
        return "Who should come over?";
      },
    });
    b.items.push({
      i: "🏡",
      t: "Select your home",
      fn: function () {
        cityHomes();
        return "Choose your residence.";
      },
    });
  }
  if (b.n === "Office")
    b.items.push({
      i: "🗳️",
      t: "Run for Mayor",
      fn: function () {
        cityElection();
        return "Welcome to City Hall.";
      },
    });
  if (b.n === "Cafe")
    b.items.push({
      i: "🎪",
      t: "Community festival",
      fn: function () {
        citySeasonalEvent();
        return "The festival committee welcomes you.";
      },
    });
});
if (!sv) {
  S.x = RD[0][40].x;
  S.y = RD[0][40].y;
}
var TR = [],
  BU = [],
  GR = [],
  PT = [],
  LP = [],
  BN = [],
  SOL = [],
  CARS = [],
  BIRDS = [],
  CLD = [],
  tick = 0;
function segD(px, py, ax, ay, bx, by) {
  var dx = bx - ax,
    dy = by - ay,
    l = dx * dx + dy * dy || 1,
    t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}
function nearBld(x, y, m) {
  for (var i = 0; i < B.length; i++) {
    var b = B[i];
    if (
      x > b.x - m &&
      x < b.x + b.w + m &&
      y > b.y - m &&
      y < b.y + b.h + 30 + m
    )
      return true;
    if (segD(x, y, b.dx, b.dy, b.px, b.py) < m * 0.5 + 30) return true;
    if (Math.hypot(x - b.dx, y - (b.dy + 85)) < 70) return true;
  }
  return false;
}
(function gen() {
  var i, k, x, y, tries, ok;
  for (tries = 0; TR.length < 170 && tries < 9000; tries++) {
    x = 60 + rnd() * (W - 120);
    y = 60 + rnd() * (H - 120);
    if (nearRoad(x, y, 190) || nearBld(x, y, 80)) continue;
    ok = true;
    for (k = 0; k < TR.length; k++)
      if (Math.hypot(TR[k].x - x, TR[k].y - y) < 75) {
        ok = false;
        break;
      }
    if (!ok) continue;
    TR.push({
      x: x,
      y: y,
      r: 24 + rnd() * 20,
      c: ["#1f8f2e", "#26a638", "#2fb83f", "#1c7d2a"][
        Math.floor(rnd() * 4)
      ],
      ph: rnd() * 6.28,
    });
  }
  B.forEach(function (b) {
    BU.push({ x: b.x - 8, y: b.y + b.h + 26, r: 15 });
    BU.push({ x: b.x + b.w + 8, y: b.y + b.h + 26, r: 15 });
  });
  for (tries = 0; BU.length < 160 && tries < 6000; tries++) {
    x = 60 + rnd() * (W - 120);
    y = 60 + rnd() * (H - 120);
    if (nearRoad(x, y, 150) || nearBld(x, y, 40)) continue;
    BU.push({ x: x, y: y, r: 11 + rnd() * 8 });
  }
  for (i = 0; i < 80; i++)
    PT.push({
      x: rnd() * W,
      y: rnd() * H,
      rx: 110 + rnd() * 160,
      ry: 80 + rnd() * 120,
    });
  for (tries = 0; GR.length < 2200 && tries < 9000; tries++) {
    x = 40 + rnd() * (W - 80);
    y = 40 + rnd() * (H - 80);
    if (nearRoad(x, y, 140) || nearBld(x, y, 20)) continue;
    var r = rnd();
    if (r < 0.15) {
      var col = ["#ff6b9d", "#ffffff", "#ffd93d", "#c77dff", "#ff9f43"][
        Math.floor(rnd() * 5)
      ];
      for (k = 0; k < 5; k++)
        GR.push({
          x: x + (rnd() - 0.5) * 50,
          y: y + (rnd() - 0.5) * 40,
          t: 1,
          c: col,
        });
    } else if (r < 0.2) GR.push({ x: x, y: y, t: 2 });
    else GR.push({ x: x, y: y, t: 0 });
  }
  RD.forEach(function (pts) {
    var acc = 0,
      side = 1,
      nb = 0;
    for (var j = 1; j < pts.length - 1; j++) {
      acc += Math.hypot(
        pts[j].x - pts[j - 1].x,
        pts[j].y - pts[j - 1].y,
      );
      if (acc < 240) continue;
      acc = 0;
      var dx = pts[j + 1].x - pts[j - 1].x,
        dy = pts[j + 1].y - pts[j - 1].y,
        l = Math.hypot(dx, dy) || 1,
        nx = -dy / l,
        ny = dx / l,
        lx = pts[j].x + nx * side * 103,
        ly = pts[j].y + ny * side * 103,
        bs = -side;
      side = -side;
      if (lx < 30 || ly < 30 || lx > W - 30 || ly > H - 30) continue;
      if (nearBld(lx, ly, 22)) continue;
      if (
        LP.some(function (q) {
          return Math.hypot(q.x - lx, q.y - ly) < 120;
        })
      )
        continue;
      LP.push({ x: lx, y: ly });
      if (++nb % 3 === 0) {
        var bx = pts[j].x + nx * bs * 100 + (dx / l) * 70,
          by = pts[j].y + ny * bs * 100 + (dy / l) * 70;
        if (!nearBld(bx, by, 25))
          BN.push({ x: bx, y: by, a: Math.atan2(dy, dx) });
      }
    }
  });
  TR.forEach(function (t) {
    SOL.push({ x: t.x, y: t.y + 6, r: 12 });
  });
  LP.forEach(function (l) {
    SOL.push({ x: l.x, y: l.y, r: 8 });
  });
  BN.forEach(function (q) {
    SOL.push({ x: q.x, y: q.y, r: 24 });
  });
  var CC = [
    "#d63031",
    "#0984e3",
    "#fdcb6e",
    "#00b894",
    "#6c5ce7",
    "#e17055",
    "#ecf0f1",
    "#2d3436",
  ];
  for (i = 0; i < 11; i++) {
    var rr = Math.floor(rnd() * RD.length),
      pts2 = RD[rr],
      dir = rnd() < 0.5 ? 1 : -1,
      idx = Math.floor(rnd() * (pts2.length - 3)) + 1,
      nx2 = pts2[idx + dir];
    CARS.push({
      r: rr,
      i: idx,
      dir: dir,
      x: pts2[idx].x,
      y: pts2[idx].y,
      a: Math.atan2(nx2.y - pts2[idx].y, nx2.x - pts2[idx].x),
      v: 0,
      vmax: 1.3 + rnd() * 0.9,
      col: i === 10 ? "#f5c518" : CC[i % 8],
      bus: i === 10,
      cool: 0,
    });
  }
  for (i = 0; i < 7; i++)
    BIRDS.push({
      x: rnd() * W,
      y: rnd() * H,
      a: rnd() * 6.28,
      s: 1 + rnd() * 0.8,
      ph: rnd() * 9,
    });
  for (i = 0; i < 6; i++)
    CLD.push({
      x: rnd() * W,
      y: rnd() * H,
      rx: 160 + rnd() * 140,
      ry: 70 + rnd() * 60,
      s: 0.2 + rnd() * 0.3,
    });
})();
function solidAt(x, y) {
  for (var i = 0; i < SOL.length; i++) {
    var o = SOL[i],
      dx = x - o.x,
      dy = y - o.y,
      rr = o.r + 14;
    if (dx * dx + dy * dy < rr * rr) return true;
  }
  return false;
}
if (sv && solidAt(S.x, S.y)) {
  var rp = RS.reduce(function (m, q) {
    return Math.hypot(q.x - S.x, q.y - S.y) <
      Math.hypot(m.x - S.x, m.y - S.y)
      ? q
      : m;
  }, RS[0]);
  S.x = rp.x;
  S.y = rp.y;
}
function vis(x, y, m) {
  return (
    x > camX - m &&
    x < camX + vw + m &&
    y > camY - m &&
    y < camY + vh + m
  );
}
function drawGround() {
  g.fillStyle = "rgba(0,70,0,0.08)";
  PT.forEach(function (q) {
    if (!vis(q.x, q.y, q.rx)) return;
    g.beginPath();
    g.ellipse(q.x, q.y, q.rx, q.ry, 0, 0, 7);
    g.fill();
  });
  GR.forEach(function (q) {
    if (!vis(q.x, q.y, 20)) return;
    if (q.t === 0) {
      g.strokeStyle = "#1f9a00";
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(q.x - 5, q.y);
      g.lineTo(q.x - 7, q.y - 9);
      g.moveTo(q.x, q.y);
      g.lineTo(q.x, q.y - 12);
      g.moveTo(q.x + 5, q.y);
      g.lineTo(q.x + 8, q.y - 8);
      g.stroke();
    } else if (q.t === 1) {
      g.fillStyle = q.c;
      g.beginPath();
      g.arc(q.x, q.y, 4.5, 0, 7);
      g.fill();
      g.fillStyle = "#ffe14a";
      g.beginPath();
      g.arc(q.x, q.y, 1.8, 0, 7);
      g.fill();
    } else {
      g.fillStyle = "#8d9aa3";
      g.beginPath();
      g.ellipse(q.x, q.y, 8, 5.5, 0, 0, 7);
      g.fill();
      g.fillStyle = "rgba(255,255,255,.35)";
      g.beginPath();
      g.ellipse(q.x - 2, q.y - 2, 3, 2, 0, 0, 7);
      g.fill();
    }
  });
}
