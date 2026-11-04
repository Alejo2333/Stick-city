function dayFinanceSnapshot() {
  var holdings = {};
  AS.forEach(function (asset) {
    var shares = S.hold[asset[0]] || 0;
    if (shares) holdings[asset[0]] = shares * (S.px[asset[0]] || 0);
  });
  return {
    cash: S.cash,
    bank: S.bank,
    hap: S.hap,
    en: S.en,
    str: S.str,
    int: S.int,
    cha: S.cha,
    looks: S.life && S.life.created ? S.life.looks : null,
    health: S.life && S.life.created ? S.life.health : null,
    portfolio: invested(),
    holdings: holdings,
  };
}
function daySummaryLines(report) {
  if (!report || !report.start || !report.end) return [];
  var start = report.start,
    end = report.end,
    lines = [],
    business = report.business || 0,
    rent = report.rent || 0,
    interest = end.bank - start.bank,
    marketDelta = end.portfolio - start.portfolio,
    keys = Object.keys(end.holdings || {});
  if (business)
    lines.push("Business revenue: +$" + business.toLocaleString() + ".");
  if (rent) lines.push("Rental income: +$" + rent.toLocaleString() + ".");
  if (interest)
    lines.push("Bank interest: +$" + interest.toLocaleString() + ".");
  if (report.news && report.news.length)
    lines.push("Market news: " + report.news.join(" · "));
  if (keys.length) {
    lines.push(
      "Investments: $" +
        Math.round(end.portfolio).toLocaleString() +
        " (" +
        (marketDelta >= 0 ? "+" : "−") +
        "$" +
        Math.abs(Math.round(marketDelta)).toLocaleString() +
        ").",
    );
    keys
      .map(function (key) {
        return {
          key: key,
          delta:
            (end.holdings[key] || 0) -
            (start.holdings[key] || 0),
        };
      })
      .filter(function (holding) {
        return holding.delta;
      })
      .sort(function (a, b) {
        return Math.abs(b.delta) - Math.abs(a.delta);
      })
      .slice(0, 4)
      .forEach(function (holding) {
        var asset = AS.filter(function (item) {
          return item[0] === holding.key;
        })[0];
        if (asset)
          lines.push(
            asset[2] +
              ": " +
              (holding.delta >= 0 ? "+" : "−") +
              "$" +
              Math.abs(Math.round(holding.delta)).toLocaleString() +
              ".",
          );
      });
  }
  var statChanges = [];
  [
    ["Happiness", "hap"],
    ["Energy", "en"],
    ["Strength", "str"],
    ["Smarts", "int"],
    ["Charisma", "cha"],
    ["Health", "health"],
    ["Looks", "looks"],
  ].forEach(function (stat) {
    if (
      start[stat[1]] === null ||
      end[stat[1]] === null ||
      start[stat[1]] === end[stat[1]]
    )
      return;
    var delta = end[stat[1]] - start[stat[1]];
    statChanges.push(stat[0] + " " + (delta > 0 ? "+" : "") + delta);
  });
  lines.push(
    "Cash $" +
      Math.round(end.cash).toLocaleString() +
      " · Bank $" +
      Math.round(end.bank).toLocaleString() +
      (statChanges.length ? " · " + statChanges.join(" · ") : "") +
      ".",
  );
  return lines;
}
var currentLifeDayReport = null;
function appendInvestmentPanels(container) {
  var holdings = AS.filter(function (asset) {
      return (S.hold[asset[0]] || 0) > 0;
    }),
    grid;
  if (!holdings.length) return;
  grid = document.createElement("section");
  grid.className = "investment-grid";
  grid.setAttribute("aria-label", "Your investment price charts");
  holdings.forEach(function (asset) {
    var key = asset[0],
      history = S.marketHistory && S.marketHistory[key],
      prices = Array.isArray(history)
        ? history.map(function (point) {
            return Number(point.price);
          }).filter(Number.isFinite)
        : [],
      panel = document.createElement("article"),
      title = document.createElement("b"),
      detail = document.createElement("span"),
      svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"),
      values = prices.length ? prices : [S.px[key]],
      min = Math.min.apply(Math, values),
      max = Math.max.apply(Math, values),
      spread = max - min || 1,
      points = values.map(function (price, index) {
        return (
          (values.length > 1 ? (index / (values.length - 1)) * 280 : 140) +
          "," +
          (58 - ((price - min) / spread) * 48)
        );
      });
    panel.className = "investment-panel";
    title.textContent = asset[1] + " " + asset[2] + " (" + key + ")";
    detail.textContent =
      (S.hold[key] || 0) +
      " units · $" +
      fmtPx(S.px[key]) +
      " each · value $" +
      fmtPx((S.hold[key] || 0) * S.px[key]);
    svg.setAttribute("viewBox", "0 0 280 64");
    svg.setAttribute("role", "img");
    svg.setAttribute(
      "aria-label",
      asset[2] + " price history over " + values.length + " days",
    );
    svg.setAttribute("preserveAspectRatio", "none");
    var line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    line.setAttribute("points", points.join(" "));
    line.setAttribute("fill", "none");
    line.setAttribute("stroke", "#65d6a5");
    line.setAttribute("stroke-width", "3");
    line.setAttribute("stroke-linecap", "round");
    line.setAttribute("stroke-linejoin", "round");
    svg.appendChild(line);
    if (points.length === 1) {
      var dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("cx", points[0].split(",")[0]);
      dot.setAttribute("cy", points[0].split(",")[1]);
      dot.setAttribute("r", "4");
      dot.setAttribute("fill", "#65d6a5");
      svg.appendChild(dot);
    }
    panel.appendChild(title);
    panel.appendChild(detail);
    panel.appendChild(svg);
    grid.appendChild(panel);
  });
  container.appendChild(grid);
}
function showDaySummary(report, after) {
  report.end = dayFinanceSnapshot();
  var lines = [
    "Day " +
      S.day +
      " · Turning age " +
      (S.age + 1) +
      " · " +
      S.weather +
      " · " +
      seasonName() +
      ".",
  ].concat(daySummaryLines(report));
  if (overnightMsg) lines.push(overnightMsg);
  if (lines.length === 1) lines.push("A quiet day in Stick City.");
  paused = true;
  onTitle = true;
  keys = {};
  held = {};
  bp.hidden = true;
  phn.hidden = true;
  mshow("📊 Daily city report", lines, function (d) {
    appendInvestmentPanels(d);
    mbtn(d, "▶", "Continue", function () {
      closeMenu();
      if (after) after();
    });
  });
}
function newDay(options) {
  options = options || {};
  var before = dayFinanceSnapshot();
  S.day++;
  S.t = 6;
  S.bank = Math.floor(S.bank * 1.002);
  var cityReport = cityNewDay();
  priceTick();
  genDrops();
  var report = {
    start: before,
    end: dayFinanceSnapshot(),
    business: cityReport ? cityReport.business : 0,
    rent: cityReport ? cityReport.rent : 0,
    days: 1,
    news: Array.isArray(S.news) ? S.news.slice() : [],
  };
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
  if (options.suppressEvents) return;
  hudDayT = HUD_DAY;
  setTimeout(function () {
    if (S.life && S.life.created && typeof lifeOnBirthday === "function") {
      currentLifeDayReport = report;
      birthday({ days: 1, report: report });
    } else {
      showDaySummary(report, function () {
        birthday({ days: 1 });
      });
    }
  }, 0);
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
  if (it.gain && S.age < 16) {
    say("Part-time work unlocks at age 16.");
    return;
  }
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
  var b = S.in,
    place = ov.hidden ? null : holdPlace(ov);
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
  if (place) place();
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
