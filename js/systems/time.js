function newDay() {
  S.day++;
  S.t = 6;
  S.bank = Math.floor(S.bank * 1.002);
  cityNewDay();
  priceTick();
  genDrops();
  if (S.day % 7 === 0) {
    sendEmail(
      "weekly-" + S.day,
      "Stick City Weekly",
      "Your week in Stick City",
      "Day " +
        S.day +
        " is here! Here is your latest snapshot:\n\nCash: $" +
        S.cash +
        "\nBank: $" +
        S.bank +
        "\nSkills: STR " +
        S.str +
        " · INT " +
        S.int +
        " · CHA " +
        S.cha +
        "\n\nKeep exploring, and check the local job boards as your skills improve.",
    );
  }
  if (S.day % 30 === 0) setTimeout(birthday, 0);
}
function adv(h) {
  S.t += h;
  if (S.t >= 24) {
    newDay();
    S.en = Math.min(S.en, 8);
    say(
      "You stayed out all night and passed out. Day " +
        S.day +
        " begins, groggy.",
    );
  }
}
var ev = [
  function () {
    S.cash += 10;
    return "You found $10 on the sidewalk.";
  },
  function () {
    var l = Math.min(S.cash, 8);
    S.cash -= l;
    return l
      ? "A seagull stole $" + l + "."
      : "A seagull eyed your empty pockets and left.";
  },
  function () {
    S.int++;
    return "You dreamed about math and woke up smarter.";
  },
  function () {
    return "Quiet night. Nothing happened.";
  },
];
function blocked(it) {
  return (
    (it.cost || 0) > S.cash ||
    (it.en < 0 && S.en < -it.en) ||
    (it.req && !it.req())
  );
}
function act(it) {
  if (it.sleep) {
    S.en = MAXE;
    hp(2);
    newDay();
    if (S.mansion) S.cha++;
    var m =
      "You slept well. Day " +
      S.day +
      " begins." +
      (S.mansion ? " (+1 CHA)" : "") +
      (overnightMsg ? " " + overnightMsg : "");
    if (Math.random() < 0.4)
      m += " " + ev[Math.floor(Math.random() * ev.length)]();
    say(m);
    save();
    render();
    return;
  }
  if (blocked(it)) {
    say(
      S.cash < (it.cost || 0)
        ? "Not enough cash."
        : it.req && !it.req()
          ? "Not yet: " + it.lock + "."
          : "You’re too worn out. Eat something or sleep.",
    );
    return;
  }
  if (S.in && S.in.talk && !S.in.counted) {
    S.in.counted = 1;
    countTalk(S.in.talk);
  }
  var b0 = {
    cash: S.cash,
    en: S.en,
    str: S.str,
    int: S.int,
    cha: S.cha,
    k: S.k,
  };
  S.cash -= it.cost || 0;
  S.en = Math.min(MAXE, S.en + (it.en || 0));
  S.str += it.str || 0;
  S.int += it.int || 0;
  S.cha += it.cha || 0;
  S.k += it.k || 0;
  hp((it.k > 0 ? 2 : 0) - (it.k < 0 ? 3 : 0));
  var seen = it.heat && Math.random() < 0.3 + it.heat * 0.25;
  if (seen) S.heat += it.heat;
  if (it.give) {
    S.inv[it.give] = (S.inv[it.give] || 0) + 1;
    if (ITEMS[it.give].w && !S.wpn) S.wpn = it.give;
  }
  var n = it.gain ? it.gain() : 0;
  if (n > 0 && S.career === "Entrepreneur") n = Math.round(n * 1.1);
  S.cash += n;
  if (n > 0) {
    S.lifetimeEarned += n;
    S.jobsDone++;
    if (S.daily.day === S.day) S.daily.work = (S.daily.work || 0) + 1;
  }
  S.lifetimeSpent += it.cost || 0;
  var m = it.fn ? it.fn() : typeof it.m === "function" ? it.m(n) : it.m;
  if (it.t === "Run for President" && !S.won) {
    S.won = 1;
    m =
      "You won the election! You are President of Stick City. You can keep playing.";
  }
  say(
    m + (seen ? " Someone saw you. The cops are looking for you!" : ""),
  );
  adv(it.h || 0);
  feedback(b0, !!seen);
  save();
  render();
}
function render() {
  var b = S.in;
  ov.innerHTML = "";
  var p = document.createElement("p");
  p.textContent = typeof b.greet === "function" ? b.greet() : b.greet;
  ov.appendChild(p);
  var d = document.createElement("div");
  d.className = "menu";
  b.items
    .concat([{ i: "➡️", t: "Leave", leave: 1 }])
    .forEach(function (it, idx) {
      var btn = document.createElement("button"),
        ic = document.createElement("span"),
        tx = document.createElement("span");
      btn.style.setProperty("--i", idx);
      ic.className = "ico";
      ic.textContent = it.i;
      tx.textContent = it.t + " ";
      var tg = document.createElement("span");
      tg.className = "tag";
      var locked = it.req && !it.req();
      tg.textContent = locked ? "(" + it.lock + ")" : it.tag || "";
      if (tg.textContent) tx.appendChild(tg);
      if (it.p) tx.appendChild(document.createTextNode(" – " + it.p));
      btn.appendChild(ic);
      btn.appendChild(tx);
      btn.disabled = !it.leave && blocked(it);
      if (it.leave) btn.className = "leave";
      btn.onclick = function () {
        // Screens opened from a building lead "Back" into that building.
        if (CITY_ITEMS.indexOf(it.t) >= 0) cityBackTo = b;
        if (it.t === "Browse shop") {
          leave();
          cityStore(b.n);
        } else if (
          it.t === "Property listings" ||
          it.t === "Select your home"
        ) {
          leave();
          cityHomes();
        } else if (it.t === "Buy, park or switch vehicles") {
          leave();
          cityGarage();
        } else if (it.t === "Move furniture and change wallpaper") {
          leave();
          cityLayout();
        } else if (it.t === "Invite a friend over") {
          leave();
          cityInvite();
        } else if (it.t === "Run for Mayor") {
          leave();
          cityElection();
        } else if (it.t === "Community festival") {
          leave();
          citySeasonalEvent();
        } else if (it.t === "Casino floor") {
          leave();
          casinoFloor();
        } else it.leave ? leave() : act(it);
      };
      d.appendChild(btn);
    });
  ov.appendChild(d);
}
var ovT,
  fadeEl = document.getElementById("fade");
function doorFx() {
  fadeEl.classList.remove("go");
  void fadeEl.offsetWidth;
  fadeEl.classList.add("go");
}
function enter(b) {
  sfx(b.px ? "door" : "click");
  S.in = b;
  keys = {};
  held = {};
  document.body.classList.add("in");
  doorFx();
  ov.classList.add("fresh");
  clearTimeout(ovT);
  ovT = setTimeout(function () {
    ov.classList.remove("fresh");
  }, 900);
  say("");
  if (S.quest && S.quest.to === b.n) {
    S.cash += 60;
    S.k += 3;
    S.quest = null;
    say("Package delivered! +$60 and +3 karma.");
  }
  if (!b.talk) {
    S.placesVisited[b.n] = 1;
    if (S.daily.day === S.day)
      S.daily.explore = (S.daily.explore || 0) + 1;
  }
  save();
  render();
  ov.hidden = false;
  var f = ov.querySelector("button:not(:disabled)");
  if (f) f.focus();
}
function leave() {
  var b = S.in;
  sfx(b.px ? "door" : "click");
  S.in = null;
  ov.hidden = true;
  document.body.classList.remove("in");
  doorFx();
  S.x = b.dx;
  S.y = b.dy + 85;
  S.face = Math.PI / 2;
  say("");
  save();
}
function nearby() {
  for (var i = 0; i < B.length; i++)
    if (Math.hypot(S.x - B[i].dx, S.y - B[i].dy) < 40) return B[i];
  return null;
}
function hit(x, y) {
  if (x < 30 || x > W - 30 || y < 30 || y > H - 30) return true;
  if (solidAt(x, y)) return true;
  for (var i = 0; i < B.length; i++) {
    var b = B[i];
    if (
      x > b.x - 22 &&
      x < b.x + b.w + 22 &&
      y > b.y - 22 &&
      y < b.y + b.h + 52
    )
      return true;
  }
  return false;
}
