var keys = {},
  held = {};
var NM = [
    "Alex",
    "Sam",
    "Robin",
    "Pat",
    "Lee",
    "Jo",
    "Max",
    "Kai",
    "Dee",
    "Ray",
    "Sky",
    "Bo",
  ],
  CL = [
    "#e67e22",
    "#9b59b6",
    "#1abc9c",
    "#e84393",
    "#f1c40f",
    "#16a085",
    "#d35400",
    "#8e44ad",
  ],
  SKN = ["#f1c27d", "#c68642", "#8d5524", "#ffdbac"],
  HR = ["#222", "#7a4a1a", "#a02020", "#d4b04a"];
var QS = [
  "Nice weather for a stick figure.",
  "I lost a sock somewhere around here.",
  "Have you tried the nachos?",
  "Careful out there. It is a rectangle jungle.",
];
var WORKS = [
    "Office",
    "Bank",
    "Hospital",
    "School",
    "Cafe",
    "Supermarket",
    "Clothing Boutique",
    "Police Station",
    "Burger Joint",
    "Motor Garage",
  ],
  FUNS = [
    "Cafe",
    "Bar",
    "Arcade",
    "Burger Joint",
    "Gym",
    "Night Club",
    "Casino",
    "Supermarket",
  ];
// Road points near a building, so visitors scatter instead of stacking.
function spotNear(b) {
  if (!b.near)
    b.near = RS.filter(function (q) {
      return Math.hypot(q.x - b.dx, q.y - b.dy) < 380;
    });
  var q = b.near.length
    ? b.near[Math.floor(Math.random() * b.near.length)]
    : { x: b.px, y: b.py };
  return {
    x: q.x + (Math.random() - 0.5) * 70,
    y: q.y + (Math.random() - 0.5) * 70,
  };
}
var NP = NM.map(function (nm, i) {
  var s0 = RS[Math.floor(Math.random() * RS.length)];
  return {
    name: nm,
    age: Math.max(18, S.age + Math.floor(Math.random() * 15) - 7),
    r: i < 3,
    role: ["", "", "", "beg", "job", "job", "shady"][i] || "",
    // Each resident has their own routine so they spread across town.
    home: RS[Math.floor(Math.random() * RS.length)],
    work:
      ["", "", "", "Corner Store", "Factory", "Factory", "Night Club"][
        i
      ] || WORKS[Math.floor(Math.random() * WORKS.length)],
    fun: FUNS[Math.floor(Math.random() * FUNS.length)],
    x: s0.x + (Math.random() - 0.5) * 60,
    y: s0.y + (Math.random() - 0.5) * 60,
    a: 0,
    t: 0,
    cool: 0,
    col: CL[i % 8],
    skin: SKN[i % 4],
    hair: HR[(i + 1) % 4],
    ph: 0,
  };
});
function onRoad(x, y) {
  return nearRoad(x, y, 125);
}
for (var c = 0; c < 3; c++)
  NP.push({
    name: "Officer",
    cop: 1,
    r: 0,
    role: "",
    x: RD[c][20].x + 40,
    y: RD[c][20].y,
    a: 0,
    t: 0,
    cool: 0,
    col: "#1a3fd0",
    skin: "#f1c27d",
    hair: "#111",
    ph: 0,
  });
for (var ai = 0; ai < 18; ai++) {
  var as0 = RS[Math.floor(Math.random() * RS.length)];
  NP.push({
    name: "",
    amb: 1,
    r: 0,
    role: "",
    x: as0.x + (Math.random() - 0.5) * 60,
    y: as0.y + (Math.random() - 0.5) * 60,
    a: 0,
    t: 0,
    cool: 0,
    col: CL[ai % 8],
    skin: SKN[ai % 4],
    hair: HR[(ai + 2) % 4],
    ph: Math.random() * 6,
    hat: ai % 3,
  });
}
for (var di = 0; di < 4; di++) {
  var ds0 = RS[Math.floor(Math.random() * RS.length)];
  NP.push({
    name: "",
    amb: 1,
    pet: 1,
    r: 0,
    role: "",
    x: ds0.x + (Math.random() - 0.5) * 60,
    y: ds0.y + (Math.random() - 0.5) * 60,
    a: 0,
    t: 0,
    cool: 0,
    col: ["#a0703c", "#e0c9a0", "#4a3a2a", "#c8c8c8"][di],
    ph: Math.random() * 6,
  });
}
var PS = B.filter(function (b) {
  return b.n === "Police Station";
})[0];
function arrest() {
  var f = Math.min(S.cash, 40 + Math.ceil(S.heat) * 30);
  S.cash -= f;
  S.heat = 0;
  S.en = Math.max(1, S.en - 3);
  S.x = PS.dx;
  S.y = PS.dy + 85;
  S.face = Math.PI / 2;
  shake = 16;
  flash = 24;
  sfx("siren");
  adv(5);
  say("Busted! The cops fined you $" + f + " and held you for hours.");
  save();
}
function npcStep() {
  carStep();
  S.heat = Math.max(0, S.heat - 0.0003);
  NP.forEach(function (n) {
    if (n.cool > 0) n.cool--;
    if (n.cop && S.heat >= 0.3) {
      var d = Math.hypot(S.x - n.x, S.y - n.y);
      if (d < 350) {
        var vx = ((S.x - n.x) / d) * 2.3,
          vy = ((S.y - n.y) / d) * 2.3;
        if (!hit(n.x + vx, n.y)) n.x += vx;
        if (!hit(n.x, n.y + vy)) n.y += vy;
        n.ph += 0.3;
        if (d < 34) arrest();
        return;
      }
    }
    if (n.name && !n.cop && !n.amb) {
      var hour = S.t,
        schedule =
          hour < 7 || hour >= 21
            ? "Home"
            : hour < 9 || hour >= 17
              ? n.fun
              : n.work;
      // Pick a fresh spot when the routine changes; move there while off-screen.
      if (n.currentPlace !== schedule || !n.dest) {
        var bd = B.filter(function (b) {
          return b.n === schedule;
        })[0];
        n.dest =
          schedule === "Home" || !bd
            ? {
                x: n.home.x + (Math.random() - 0.5) * 70,
                y: n.home.y + (Math.random() - 0.5) * 70,
              }
            : spotNear(bd);
        n.currentPlace = schedule;
        if (hit(n.dest.x, n.dest.y)) n.dest = null;
      }
      if (
        n.dest &&
        (tick + NP.indexOf(n) * 37) % 240 === 0 &&
        Math.hypot(n.x - n.dest.x, n.y - n.dest.y) > 250 &&
        Math.hypot(n.x - S.x, n.y - S.y) > 450 &&
        Math.hypot(n.dest.x - S.x, n.dest.y - S.y) > 450
      ) {
        n.x = n.dest.x;
        n.y = n.dest.y;
        n.ph += 1;
      }
    }
    if (--n.t <= 0) {
      n.t = 60 + Math.random() * 120;
      n.a = Math.random() < 0.25 ? null : Math.random() * 6.283;
    }
    if (n.a !== null) {
      var nx = n.x + Math.cos(n.a) * 1.2,
        ny = n.y + Math.sin(n.a) * 1.2;
      if (hit(nx, ny) || !onRoad(nx, ny)) {
        n.t = 0;
      } else {
        n.x = nx;
        n.y = ny;
        n.ph += 0.2;
      }
    }
  });
}
function drawNpc(n) {
  var s = Math.sin(n.ph) * 6,
    lb = n.name + (n.r ? " ♥" : "");
  if (n.pet) {
    drawPet(n);
    return;
  }
  g.fillStyle = "rgba(0,0,0,.18)";
  g.beginPath();
  g.ellipse(n.x + 3, n.y + 10, 18, 12, 0, 0, 7);
  g.fill();
  g.strokeStyle = "#000";
  g.lineWidth = 2.5;
  g.lineCap = "round";
  g.beginPath();
  g.moveTo(n.x - 14, n.y - 8 + s);
  g.lineTo(n.x - 22, n.y + s);
  g.moveTo(n.x + 14, n.y - 8 - s);
  g.lineTo(n.x + 22, n.y - s);
  g.stroke();
  g.fillStyle = n.col;
  g.beginPath();
  g.arc(n.x, n.y, 16, 0, 7);
  g.fill();
  g.stroke();
  if (n.hat === 1) {
    g.fillStyle = n.hair;
    g.beginPath();
    g.arc(n.x, n.y, 10, 0, 7);
    g.fill();
    g.stroke();
  } else if (n.hat === 2) {
    g.fillStyle = n.hair;
    g.beginPath();
    g.arc(n.x - 14, n.y + 2, 5, 0, 7);
    g.fill();
    g.stroke();
  }
  if (!n.amb && Math.hypot(n.x - S.x, n.y - S.y) < 150) {
    g.font = '18px "Patrick Hand","Comic Sans MS",cursive';
    g.textAlign = "center";
    g.lineWidth = 3;
    g.strokeStyle = "#000";
    g.fillStyle = "#fff";
    g.strokeText(lb, n.x, n.y - 26);
    g.fillText(lb, n.x, n.y - 26);
  }
}
function sq() {
  return QS[Math.floor(Math.random() * QS.length)];
}
// Counted once per conversation, when the player actually picks something.
function countTalk(n) {
  S.npcMemory[n.name] = S.npcMemory[n.name] || {};
  S.npcMemory[n.name].last = "Spoke on Day " + S.day;
  S.npcMemory[n.name].times = (S.npcMemory[n.name].times || 0) + 1;
  S.talksDone++;
  if (S.daily.day === S.day) S.daily.talk = (S.daily.talk || 0) + 1;
}
function talk(n) {
  n.cool = 600;
  var nm = n.name;
  var it = [
    {
      i: "💬",
      t: "Chat",
      tag: "(+1 CHA)",
      once: "chat",
      p: "30 min",
      h: 0.5,
      cha: 1,
      fn: function () {
        if (n.r) S.lv[nm] = lvl(nm) + 1;
        return (
          "“" +
          (S.npcMemory[nm] && S.npcMemory[nm].times > 2
            ? "Good to see you again! "
            : "") +
          sq() +
          "”"
        );
      },
    },
  ];
  it.push({
    i: "🤝",
    t: "Ask about their day",
    p: "30 min",
    h: 0.5,
    fn: function () {
      var state =
        S.t < 9
          ? "heading to work"
          : S.t < 17
            ? "at work"
            : S.t < 21
              ? "relaxing after work"
              : "getting ready for bed";
      var feel =
        lvl(nm) >= 10
          ? "You are one of my favorite neighbors!"
          : lvl(nm) >= 3
            ? "Nice to see you again."
            : "This city is full of surprises.";
      S.lv[nm] = lvl(nm) + 1;
      S.npcMemory[nm] = S.npcMemory[nm] || {};
      S.npcMemory[nm].last = "You asked about their day";
      return nm + " says: “I am " + state + ". " + feel + "”";
    },
  });
  if (n.r && S.age >= 18) {
    it.push({
      i: "😉",
      t: "Flirt",
      once: "flirt",
      p: "30 min",
      h: 0.5,
      req: function () {
        return S.cha >= 5;
      },
      lock: "needs CHA 5",
      fn: function () {
        if (Math.random() < 0.4 + S.cha * 0.02) {
          S.lv[nm] = lvl(nm) + 3;
          return nm + " blushes.";
        }
        S.lv[nm] = Math.max(0, lvl(nm) - 1);
        return nm + " rolls their eyes.";
      },
    });
    it.push({
      i: "🌹",
      t: "Give flowers",
      p: "uses 1",
      req: function () {
        return S.inv.flowers > 0;
      },
      lock: "no flowers",
      fn: function () {
        S.inv.flowers--;
        S.lv[nm] = lvl(nm) + 5;
        return nm + " loves them!";
      },
    });
    it.push({
      i: "💍",
      t: "Ask " + nm + " out",
      p: "15 affection",
      req: function () {
        return S.age >= 18 && lvl(nm) >= 15 && !S.partner;
      },
      lock: "needs 15 affection",
      fn: function () {
        S.partner = nm;
        return nm + " said yes! You are a couple now.";
      },
    });
  }
  if (n.role === "beg")
    it.push({
      i: "🪙",
      t: "Give $5",
      tag: "(+3 karma)",
      p: "$5",
      cost: 5,
      k: 3,
      m: "“Bless you, friend.”",
      once: "beg",
    });
  if (n.role === "job")
    it.push({
      i: "📦",
      t: "Take a delivery job",
      tag: "($60 + 3 karma)",
      p: "free",
      req: function () {
        return !S.quest;
      },
      lock: "already delivering",
      fn: function () {
        var c = B.filter(function (b) {
            return b.n !== "Home";
          }),
          t = c[Math.floor(Math.random() * c.length)];
        S.quest = { to: t.n };
        return (
          "Deliver this package to the " + t.n + ". Walk right in."
        );
      },
    });
  if (n.role === "shady")
    it.push({
      i: "🧳",
      t: "Buy a “found” medkit",
      tag: "(−2 karma)",
      p: "$8",
      cost: 8,
      k: -2,
      give: "medkit",
      m: "Do not ask where it came from.",
    });
  it.push({
    i: "🫳",
    t: "Pickpocket",
    once: "pick",
    tag: "(−5 karma)",
    p: "risky",
    k: -5,
    heat: 0.8,
    h: 0.25,
    fn: function () {
      if (Math.random() < 0.5) {
        var c = 10 + Math.floor(Math.random() * 30);
        S.cash += c;
        return "You lifted $" + c + " unnoticed.";
      }
      S.en = Math.max(1, S.en - 4);
      return "Caught! A slap to the face.";
    },
  });
  it.push({
    i: "👊",
    t: "Fight",
    once: "fight",
    tag: "(−8 karma, −6 HP)",
    p: "win cash",
    en: -6,
    k: -8,
    heat: 1,
    h: 0.25,
    fn: function () {
      if (Math.random() < 0.3 + Math.min(0.6, (S.str + wp()) * 0.03)) {
        var c = 10 + Math.floor(Math.random() * 30);
        S.cash += c;
        S.str++;
        return "You won and took $" + c + ". (+1 STR)";
      }
      var l = Math.min(S.cash, 10);
      S.cash -= l;
      S.en = Math.max(1, S.en - 4);
      return "You lost the fight and $" + l + ".";
    },
  });
  it.forEach(function (x) {
    if (!x.once) return;
    var key = nm + ":" + x.once,
      rq = x.req,
      lk = x.lock,
      fn = x.fn,
      mm = x.m;
    x.req = function () {
      return !doneToday(key) && (!rq || rq());
    };
    Object.defineProperty(x, "lock", {
      get: function () {
        return doneToday(key) ? "once a day" : lk;
      },
    });
    x.fn = function () {
      markDone(key);
      return fn ? fn() : mm;
    };
  });
  enter({
    n: nm,
    wall: "#d7ecff",
    floor: "#7a8a7a",
    skin: n.skin,
    hair: n.hair,
    sign: ["Street"],
    talk: n,
    dx: S.x,
    dy: S.y - 85,
    items: it,
    greet: function () {
      return (
        "“" +
        sq() +
        "”" +
        (n.r
          ? "  Affection: " +
            lvl(nm) +
            "/15" +
            (S.partner === nm ? " ♥ Partner" : "")
          : "")
      );
    },
  });
}
