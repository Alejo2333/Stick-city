// Daily report screen and the price charts it shares with the phone.
function rpMoney(n) {
  n = Math.round(n);
  return (n < 0 ? "−$" : "$") + Math.abs(n).toLocaleString("en-US");
}
function rpShort(n) {
  var a = Math.abs(n),
    sign = n < 0 ? "−$" : "$";
  if (a >= 1e6) return sign + (a / 1e6).toFixed(1) + "M";
  if (a >= 1e5) return sign + Math.round(a / 1e3) + "K";
  return rpMoney(n);
}
function rpEl(tag, cls, text) {
  var el = document.createElement(tag);
  if (cls) el.className = cls;
  if (text !== undefined) el.textContent = text;
  return el;
}
function rpDelta(n, text) {
  return rpEl(
    "span",
    "rp-delta " + (n >= 0 ? "up" : "dn"),
    (n >= 0 ? "▲ " : "▼ ") + text,
  );
}
function rpCard(parent, title) {
  var card = rpEl("section", "rp-card");
  card.appendChild(rpEl("h2", "", title));
  parent.appendChild(card);
  return card;
}
function rpList(card, items) {
  var ul = rpEl("ul");
  items.forEach(function (text) {
    ul.appendChild(rpEl("li", "", text));
  });
  card.appendChild(ul);
}
function rpHero(node, start, end) {
  var hero = rpEl("div", "rp-hero"),
    value = rpEl("b", "", rpMoney(end.worth)),
    change = start ? Math.round(end.worth - start.worth) : 0;
  hero.appendChild(rpEl("span", "rp-label", "Net worth"));
  hero.appendChild(value);
  if (change)
    hero.appendChild(rpDelta(change, rpMoney(Math.abs(change)) + " overnight"));
  node.appendChild(hero);
  if (!change || !motionOk) return;
  var from = performance.now();
  (function tick(now) {
    var p = Math.min(1, (now - from) / 600),
      eased = 1 - Math.pow(1 - p, 3);
    value.textContent = rpMoney(start.worth + (end.worth - start.worth) * eased);
    if (p < 1) requestAnimationFrame(tick);
  })(from);
}
function rpTiles(node, start, end) {
  var row = rpEl("div", "rp-tiles");
  [
    ["💵 Cash", "cash"],
    ["🏦 Bank", "bank"],
    ["📈 Invested", "portfolio"],
  ].forEach(function (t) {
    var tile = rpEl("div", "rp-tile"),
      change = start ? Math.round(end[t[1]] - start[t[1]]) : 0;
    tile.appendChild(rpEl("span", "rp-label", t[0]));
    tile.appendChild(rpEl("b", "", rpShort(end[t[1]])));
    if (change)
      tile.appendChild(rpDelta(change, rpShort(Math.abs(change))));
    row.appendChild(tile);
  });
  node.appendChild(row);
}
function rpMoneyCard(parent, report, start, end) {
  var cashChange = end.cash - start.cash,
    business = report.business || 0,
    rent = report.rent || 0,
    bank = end.bank - start.bank,
    rows = [
      ["🏢 Business", business],
      ["🏠 Rent", rent],
      [bank >= 0 ? "🏦 Interest" : "🏦 Bank", bank],
      ["📈 Investments", end.portfolio - start.portfolio],
      ["🧾 Bills & other", cashChange - business - rent],
    ].filter(function (row) {
      return Math.round(row[1]);
    });
  if (!rows.length) return;
  var ul = rpEl("ul", "rp-money");
  rows.forEach(function (row) {
    var li = rpEl("li");
    li.appendChild(rpEl("span", "", row[0]));
    li.appendChild(rpDelta(row[1], rpMoney(Math.abs(row[1]))));
    ul.appendChild(li);
  });
  rpCard(parent, "Overnight money").appendChild(ul);
}
function rpStatsCard(parent, start, end, life) {
  var meters = life
      ? [
          ["😊 Happiness", "hap", 100, "#f59e0b"],
          ["❤️ Health", "health", 100, "#e34f4f"],
          ["🧠 Smarts", "int", 100, "#477de8"],
          ["✨ Looks", "looks", 100, "#d34f9a"],
        ]
      : [
          ["😊 Happiness", "hap", 100, "#f59e0b"],
          ["⚡ Energy", "en", MAXE, "#39a66d"],
        ],
    others = [
      ["Energy", "en"],
      ["Strength", "str"],
      ["Smarts", "int"],
      ["Charisma", "cha"],
    ].filter(function (o) {
      return !meters.some(function (m) {
        return m[1] === o[1];
      });
    }),
    card = rpCard(parent, "How you're doing");
  function change(key) {
    return start && start[key] !== null
      ? Math.round(end[key]) - Math.round(start[key])
      : 0;
  }
  meters.forEach(function (m) {
    var row = rpEl("div", "rp-stat"),
      head = rpEl("div", "rp-stat-head"),
      value = rpEl("span", "rp-stat-value"),
      meter = rpEl("div", "rp-meter"),
      fill = rpEl("i"),
      now = Math.round(end[m[1]]),
      moved = change(m[1]);
    value.appendChild(rpEl("b", "", now));
    if (moved) value.appendChild(rpDelta(moved, Math.abs(moved)));
    head.appendChild(rpEl("span", "", m[0]));
    head.appendChild(value);
    fill.style.width = Math.max(0, Math.min(100, (now / m[2]) * 100)) + "%";
    fill.style.background = m[3];
    meter.appendChild(fill);
    row.appendChild(head);
    row.appendChild(meter);
    card.appendChild(row);
  });
  var chips = rpEl("div", "rp-chips");
  others.forEach(function (o) {
    var moved = change(o[1]);
    if (!moved) return;
    var chip = rpEl("span", "rp-chip", o[0] + " ");
    chip.appendChild(rpDelta(moved, Math.abs(moved)));
    chips.appendChild(chip);
  });
  if (chips.children.length) card.appendChild(chips);
}
function rpHoldings(node, start) {
  var held = AS.filter(function (asset) {
    return (S.hold[asset[0]] || 0) > 0;
  });
  if (!held.length) return;
  function moved(asset) {
    var key = asset[0];
    return start && start.holdings[key] !== undefined
      ? S.hold[key] * S.px[key] - start.holdings[key]
      : 0;
  }
  held.sort(function (a, b) {
    return Math.abs(moved(b)) - Math.abs(moved(a));
  });
  var card = rpCard(node, "Your investments"),
    grid = rpEl("div", "rp-holdings");
  card.classList.add("rp-wide");
  held.forEach(function (asset) {
    var key = asset[0],
      units = S.hold[key],
      change = moved(asset),
      pct = pxChange(key),
      item = rpEl("article", "rp-holding"),
      head = rpEl("div", "rp-holding-head"),
      sub = rpEl("div", "rp-holding-sub"),
      chart = rpEl("div");
    head.appendChild(rpEl("b", "", asset[1] + " " + asset[2]));
    head.appendChild(rpEl("b", "", rpMoney(units * S.px[key])));
    sub.appendChild(
      rpEl(
        "span",
        "",
        units.toLocaleString("en-US") + " × $" + pcPrice(S.px[key]),
      ),
    );
    if (pct || Math.round(change))
      sub.appendChild(
        rpDelta(
          pct || change,
          (Math.round(change) ? rpMoney(Math.abs(change)) + " · " : "") +
            Math.abs(pct) +
            "%",
        ),
      );
    chart.innerHTML = priceChart(key);
    item.appendChild(head);
    item.appendChild(sub);
    item.appendChild(chart);
    grid.appendChild(item);
  });
  card.appendChild(grid);
}
// opts: tags, facts, highlights, life, ended, chartsOnly
function reportNode(report, opts) {
  var node = rpEl("div", "rp"),
    start = report && report.start,
    end = dayFinanceSnapshot();
  if (opts.tags) {
    var tags = rpEl("div", "rp-tags");
    opts.tags.forEach(function (tag) {
      tags.appendChild(rpEl("span", "rp-chip", tag));
    });
    node.appendChild(tags);
  }
  if (!opts.chartsOnly) {
    if (!opts.ended) rpHero(node, start, end);
    rpTiles(node, start, end);
    var cols = rpEl("div", "rp-cols");
    if (start) rpMoneyCard(cols, report, start, end);
    if (!opts.ended) rpStatsCard(cols, start, end, opts.life);
    node.appendChild(cols);
    var notices = (report && report.notices) || [];
    if (notices.length) rpList(rpCard(node, "Around the city"), notices);
    if (report && report.news && report.news.length)
      rpList(rpCard(node, "📰 Market news"), report.news);
    if (opts.highlights && opts.highlights.length)
      rpList(rpCard(node, "This year"), opts.highlights);
    if (opts.facts && opts.facts.length) {
      var facts = rpEl("dl", "rp-facts");
      opts.facts.forEach(function (f) {
        facts.appendChild(rpEl("dt", "", f[0]));
        facts.appendChild(rpEl("dd", "", f[1]));
      });
      rpCard(node, "Your life").appendChild(facts);
    }
  }
  rpHoldings(node, start);
  return node;
}
function pcPrice(n) {
  return n >= 1000 ? Math.round(n).toLocaleString("en-US") : fmtPx(n);
}
function pcPoints(key) {
  var pts = (S.marketHistory[key] || []).map(function (p) {
      return { day: Number(p.day), price: Number(p.price) };
    }),
    last = pts[pts.length - 1];
  // Events can move a price after the morning's history point was saved.
  if (last && last.day === S.day) last.price = S.px[key];
  else pts.push({ day: S.day, price: S.px[key] });
  return pts;
}
function pcScale(pts) {
  var prices = pts.map(function (p) {
      return p.price;
    }),
    min = Math.min.apply(Math, prices),
    max = Math.max.apply(Math, prices);
  return {
    min: min,
    max: max,
    x: function (i) {
      return pts.length > 1 ? (i / (pts.length - 1)) * 100 : 100;
    },
    y: function (price) {
      return max > min ? 90 - ((price - min) / (max - min)) * 80 : 50;
    },
  };
}
// Returns HTML so the phone's string templates can use it too. The stretched
// SVG only holds the line; dots and labels are HTML so they never distort.
function priceChart(key) {
  var pts = pcPoints(key),
    sc = pcScale(pts),
    last = pts[pts.length - 1],
    first = pts[0],
    name = AS.filter(function (a) {
      return a[0] === key;
    })[0][2];
  if (pts.length < 2)
    return (
      '<div class="pc pc-empty">The price chart starts filling in tomorrow morning.</div>'
    );
  var pct = Math.round((last.price / first.price - 1) * 100),
    up = last.price >= first.price,
    line = pts
      .map(function (p, i) {
        return sc.x(i).toFixed(2) + "," + sc.y(p.price).toFixed(2);
      })
      .join(" "),
    labels =
      sc.max > sc.min
        ? '<span class="pc-y-label" style="top:10%">$' +
          pcPrice(sc.max) +
          '</span><span class="pc-y-label" style="top:90%">$' +
          pcPrice(sc.min) +
          "</span>"
        : '<span class="pc-y-label" style="top:50%">$' +
          pcPrice(sc.max) +
          "</span>";
  return (
    '<div class="pc ' +
    (up ? "up" : "dn") +
    '"><div class="pc-body"><div class="pc-plot" tabindex="0" role="img" aria-label="' +
    name +
    " price, day " +
    first.day +
    " to day " +
    last.day +
    ": low $" +
    pcPrice(sc.min) +
    ", high $" +
    pcPrice(sc.max) +
    ", now $" +
    pcPrice(last.price) +
    '" data-pts="' +
    pts
      .map(function (p) {
        return p.day + ":" + p.price;
      })
      .join(",") +
    '">' +
    (sc.max > sc.min
      ? '<i class="pc-grid" style="top:10%"></i><i class="pc-grid" style="top:90%"></i>'
      : '<i class="pc-grid" style="top:50%"></i>') +
    '<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polygon points="0,100 ' +
    line +
    ' 100,100"/><polyline points="' +
    line +
    '"/></svg><i class="pc-dot" style="left:100%;top:' +
    sc.y(last.price).toFixed(2) +
    '%"></i></div><div class="pc-y">' +
    labels +
    '</div></div><div class="pc-x"><span>Day ' +
    first.day +
    "</span><b>" +
    (up ? "▲ " : "▼ ") +
    Math.abs(pct).toLocaleString("en-US") +
    "% · " +
    pts.length +
    " days</b><span>Today</span></div></div>"
  );
}
var pcActive = null,
  pcIndex = 0;
function pcParse(plot) {
  return plot.dataset.pts.split(",").map(function (p) {
    var part = p.split(":");
    return { day: Number(part[0]), price: Number(part[1]) };
  });
}
function pcHide() {
  if (!pcActive) return;
  pcActive.classList.remove("pc-on");
  pcActive = null;
}
function pcShow(plot, i) {
  var pts = pcParse(plot),
    sc = pcScale(pts),
    tip = plot.querySelector(".pc-tip");
  if (pcActive && pcActive !== plot) pcHide();
  if (!tip) {
    plot.insertAdjacentHTML(
      "beforeend",
      '<i class="pc-cross"></i><i class="pc-mark"></i><div class="pc-tip"></div>',
    );
    tip = plot.querySelector(".pc-tip");
  }
  pcActive = plot;
  pcIndex = Math.max(0, Math.min(pts.length - 1, i));
  var p = pts[pcIndex],
    x = sc.x(pcIndex);
  plot.classList.add("pc-on");
  plot.querySelector(".pc-cross").style.left = x + "%";
  plot.querySelector(".pc-mark").style.left = x + "%";
  plot.querySelector(".pc-mark").style.top = sc.y(p.price) + "%";
  tip.style.left = Math.max(18, Math.min(82, x)) + "%";
  tip.innerHTML = "<b>$" + pcPrice(p.price) + "</b><span>Day " + p.day + "</span>";
}
function pcPointer(e) {
  var plot = e.target.closest && e.target.closest(".pc-plot");
  if (!plot) return pcHide();
  var box = plot.getBoundingClientRect(),
    n = pcParse(plot).length;
  pcShow(plot, Math.round(((e.clientX - box.left) / box.width) * (n - 1)));
}
document.addEventListener("pointermove", pcPointer);
document.addEventListener("pointerdown", pcPointer);
document.addEventListener("focusin", function (e) {
  if (e.target.matches(".pc-plot:focus-visible"))
    pcShow(e.target, pcParse(e.target).length - 1);
});
document.addEventListener("focusout", function (e) {
  if (e.target === pcActive) pcHide();
});
document.addEventListener("keydown", function (e) {
  if (e.target !== pcActive) return;
  if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
  e.preventDefault();
  pcShow(pcActive, pcIndex + (e.key === "ArrowLeft" ? -1 : 1));
});
