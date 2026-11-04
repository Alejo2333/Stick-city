var hudE = 0,
  hudT = 0,
  hudC = 0,
  hudSeen = null,
  hudFx = {},
  hudDayT = 0,
  HUD_DAY = 150,
  HUD_PULSE = 40,
  HUD_FONT = '"Impact","Arial Black",sans-serif',
  WEATHER_ICON = {
    Sunny: "☀️",
    Cloudy: "☁️",
    Rain: "🌧️",
    Fog: "🌫️",
    Storm: "⛈️",
  };
function rrect(x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}
function hudTx(s, x, y, c, sz) {
  g.font = sz + "px " + HUD_FONT;
  g.fillStyle = c;
  g.strokeText(s, x, y);
  g.fillText(s, x, y);
}
// Compares against the last frame, so a change from anywhere (phone, events,
// casino, life) pulses when the HUD is next on screen.
function hudWatch() {
  var now = {
    cash: S.cash,
    en: Math.round(S.en),
    age: S.age,
    hap: S.hap,
    str: S.str,
    int: S.int,
    cha: S.cha,
    k: S.k,
  };
  Object.keys(now).forEach(function (k) {
    if (hudSeen && now[k] !== hudSeen[k])
      hudFx[k] = { t: HUD_PULSE, up: now[k] > hudSeen[k] };
    else if (hudFx[k] && --hudFx[k].t <= 0) delete hudFx[k];
  });
  hudSeen = now;
}
function hudAmt(k) {
  return hudFx[k] ? hudFx[k].t / HUD_PULSE : 0;
}
function hudTone(k) {
  return hudFx[k] && hudFx[k].up ? "#7dff7d" : "#ff7676";
}
function questB() {
  if (!S.quest) return null;
  for (var i = 0; i < B.length; i++)
    if (B[i].n === S.quest.to) return B[i];
  return null;
}
function hudLowHp() {
  var a = motionOk ? 0.32 + 0.12 * Math.sin(tick * 0.1) : 0.36,
    gr = g.createRadialGradient(
      VW / 2,
      VH / 2,
      Math.min(VW, VH) * 0.42,
      VW / 2,
      VH / 2,
      Math.hypot(VW, VH) * 0.62,
    );
  gr.addColorStop(0, "rgba(200,0,20,0)");
  gr.addColorStop(1, "rgba(200,0,20," + a + ")");
  g.fillStyle = gr;
  g.fillRect(0, 0, VW, VH);
}
// Points at the delivery door when it's off-screen.
function hudQuestArrow() {
  var b = questB();
  if (!b) return;
  var px = (b.dx - camX) * zoom,
    py = (b.dy - camY) * zoom;
  if (px > 0 && px < VW && py > 0 && py < VH) return;
  var ax = Math.max(44, Math.min(VW - (SA.r + 66) * pu - 24, px)),
    ay = Math.max(130, Math.min(VH - 44, py)),
    s = motionOk ? 1 + Math.sin(tick * 0.15) * 0.12 : 1;
  g.save();
  g.translate(ax, ay);
  g.rotate(Math.atan2(py - ay, px - ax));
  g.scale(s, s);
  g.beginPath();
  g.moveTo(18, 0);
  g.lineTo(-12, -13);
  g.lineTo(-6, 0);
  g.lineTo(-12, 13);
  g.closePath();
  g.fillStyle = "#ffe14a";
  g.strokeStyle = "#000";
  g.lineWidth = 2;
  g.fill();
  g.stroke();
  g.restore();
}
function hudDayBanner() {
  hudDayT--;
  var p = 1 - hudDayT / HUD_DAY,
    s = "DAY " + S.day,
    sz = 34,
    x = VW / 2 - SA.l * pu,
    y = VH * 0.22 - (motionOk ? (1 - Math.min(1, p * 6)) * 18 : 0);
  g.save();
  g.globalAlpha = Math.min(1, p * 6, (1 - p) * 5);
  g.font = sz + "px " + HUD_FONT;
  var w = g.measureText(s).width + 44;
  rrect(x - w / 2, y - sz - 6, w, sz + 18, 16);
  g.fillStyle = "rgba(8,14,36,.72)";
  g.fill();
  g.textAlign = "center";
  hudTx(s, x, y, "#5fb0ff", sz);
  g.restore();
}
function hud() {
  hudWatch();
  // Narrow screens (phones held upright) get smaller type and wrapped stats.
  var nr = VW < 760,
    bw = nr ? 130 : 170,
    low = S.en / MAXE < 0.25;
  if (!S.in) {
    if (low) hudLowHp();
    hudQuestArrow();
  }
  g.save();
  g.translate(SA.l * pu, SA.t * pu);
  var f = HUD_FONT;
  g.textAlign = "left";
  g.strokeStyle = "#000";
  g.lineWidth = 2;
  // Eased values: HP slides, a pale "damage trail" lags behind, cash counts up.
  hudE += (S.en - hudE) * 0.2;
  hudT =
    S.en < hudT ? hudT - Math.max(0.12, (hudT - S.en) * 0.04) : S.en;
  hudC =
    Math.abs(S.cash - hudC) < 1
      ? S.cash
      : hudC + (S.cash - hudC) * 0.15;
  var cashX = 44 + bw + 16;
  g.font = (nr ? 28 : 34) + "px " + f;
  var cx = Math.max(
      nr ? 330 : 420,
      cashX + g.measureText(fmtCash(S.cash)).width + 34,
    ),
    cy = 30,
    r = nr ? 17 : 20;
  g.font = (nr ? 24 : 30) + "px " + f;
  var dayW = g.measureText("DAY " + S.day).width;
  rrect(4, 4, cx + r + 14 + dayW + 12, 50, 16);
  g.fillStyle = "rgba(8,14,36,.58)";
  g.fill();
  g.strokeStyle = "rgba(255,255,255,.22)";
  g.lineWidth = 1.5;
  g.stroke();
  g.strokeStyle = "#000";
  g.lineWidth = 2;
  g.save();
  var hs =
    low && motionOk ? 1 + Math.max(0, Math.sin(tick * 0.25)) * 0.18 : 1;
  g.translate(24, 31);
  g.scale(hs, hs);
  hudTx("♥", -14, 11, "#ff2a3a", nr ? 28 : 34);
  g.restore();
  rrect(44, 16, bw, 24, 8);
  g.fillStyle = "#3a0710";
  g.fill();
  g.save();
  g.clip();
  g.fillStyle = "rgba(255,230,230,.85)";
  g.fillRect(
    44,
    16,
    (bw * Math.max(0, Math.min(MAXE, hudT))) / MAXE,
    24,
  );
  var hg = g.createLinearGradient(0, 16, 0, 40);
  hg.addColorStop(0, low ? "#ff8a3a" : "#ff6a6a");
  hg.addColorStop(1, low ? "#c02a00" : "#c4001a");
  g.fillStyle = hg;
  g.fillRect(
    44,
    16,
    (bw * Math.max(0, Math.min(MAXE, hudE))) / MAXE,
    24,
  );
  g.fillStyle = "rgba(255,255,255,.28)";
  g.fillRect(44, 18, bw, 8);
  if (hudFx.en && hudFx.en.up) {
    g.fillStyle = "rgba(255,255,255," + hudAmt("en") * 0.6 + ")";
    g.fillRect(44, 16, bw, 24);
  }
  g.restore();
  rrect(44, 16, bw, 24, 8);
  g.strokeStyle = "rgba(255,255,255,.75)";
  g.lineWidth = 2;
  g.stroke();
  g.strokeStyle = "#000";
  g.textAlign = "center";
  hudTx(Math.round(S.en) + " / " + MAXE, 44 + bw / 2, 35, "#fff", 18);
  g.textAlign = "left";
  var cashS = fmtCash(Math.round(hudC)),
    cashSz = nr ? 28 : 34,
    cp = hudAmt("cash"),
    cs = motionOk ? 1 + cp * 0.1 : 1;
  g.save();
  g.translate(cashX, 30);
  g.scale(cs, cs);
  hudTx(cashS, 0, 12, "#ffc21a", cashSz);
  if (cp) {
    g.globalAlpha = cp;
    g.fillStyle = hudTone("cash");
    g.fillText(cashS, 0, 12);
  }
  g.restore();
  g.fillStyle = "#e9eef7";
  g.beginPath();
  g.arc(cx, cy, r, 0, 7);
  g.fill();
  g.stroke();
  var isNight = night();
  g.fillStyle = isNight ? "#3a3f9a" : "#2a8cff";
  g.beginPath();
  g.moveTo(cx, cy);
  g.arc(
    cx,
    cy,
    r,
    -Math.PI / 2,
    -Math.PI / 2 + (S.t / 24) * Math.PI * 2,
  );
  g.closePath();
  g.fill();
  g.font = Math.round(r * 0.95) + "px sans-serif";
  g.textAlign = "center";
  g.fillText(isNight ? "🌙" : "☀️", cx, cy + r * 0.35);
  g.textAlign = "left";
  hudTx("DAY " + S.day, cx + r + 14, 42, "#5fb0ff", nr ? 24 : 30);
  var segs = [
      ["AGE " + S.age, "age"],
      ["HAPPY " + S.hap, "hap"],
      ["STR " + S.str, "str"],
      ["INT " + S.int, "int"],
      ["CHA " + S.cha, "cha"],
      ["KARMA " + S.k, "k"],
    ],
    sz = nr ? 17 : 20,
    gap = sz * 0.7,
    // Stop short of the button column on the right.
    maxW = VW - (SA.l + SA.r + 66) * pu - 24,
    lines = [[]],
    lw = 0,
    y = 74;
  if (S.partner)
    segs.push([
      "♥ " +
        (S.partner.length > 12
          ? S.partner.slice(0, 11) + "…"
          : S.partner),
      "",
    ]);
  if (S.won) segs.push(["★ PRESIDENT", ""]);
  g.font = sz + "px " + f;
  segs.forEach(function (s) {
    var w = g.measureText(s[0]).width;
    if (lw && lw + gap + w > maxW) {
      lines.push([]);
      lw = 0;
    }
    lines[lines.length - 1].push({ s: s[0], k: s[1], w: w });
    lw += (lw ? gap : 0) + w;
  });
  lines.forEach(function (line, n) {
    if (n) y += sz + 5;
    var total = line.reduce(function (a, b) {
        return a + b.w + gap;
      }, -gap),
      x = 10;
    rrect(4, y - sz - 2, total + 14, sz + 9, 9);
    g.fillStyle = "rgba(8,14,36,.45)";
    g.fill();
    line.forEach(function (o) {
      var a = hudAmt(o.k);
      if (a) {
        g.globalAlpha = a * 0.5;
        rrect(x - 3, y - sz, o.w + 6, sz + 5, 6);
        g.fillStyle = hudTone(o.k);
        g.fill();
        g.globalAlpha = 1;
      }
      hudTx(o.s, x, y, "#fff", sz);
      if (a) {
        g.globalAlpha = a;
        g.fillStyle = hudTone(o.k);
        g.fillText(o.s, x, y);
        g.globalAlpha = 1;
      }
      x += o.w + gap;
    });
  });
  if (!S.in) {
    y += 10;
    var wt =
      (WEATHER_ICON[S.weather] || "🌤") +
      " " +
      S.weather +
      " · " +
      seasonName() +
      " · " +
      (S.driving ? "🚗 Driving" : "🚶 Walking");
    g.font = "500 13px " + '"Fredoka",Verdana,sans-serif';
    rrect(4, y, g.measureText(wt).width + 18, 24, 12);
    g.fillStyle = "rgba(8,14,36,.55)";
    g.fill();
    g.fillStyle = "#fff";
    g.fillText(wt, 13, y + 17);
    y += 24;
  }
  if (S.heat >= 0.3) {
    y += 26;
    g.save();
    if (motionOk) g.globalAlpha = 0.86 + 0.14 * Math.sin(tick * 0.18);
    hudTx(
      "WANTED " + "★".repeat(Math.min(5, Math.ceil(S.heat))),
      10,
      y,
      "#ff3030",
      22,
    );
    g.restore();
  }
  if (S.quest) {
    y += 24;
    hudTx("Deliver package to " + S.quest.to, 10, y, "#ffe14a", 18);
  }
  if (hudDayT > 0) hudDayBanner();
  g.restore();
}
function mini() {
  var m = 110,
    sc = m / W,
    ox = VW - m - 8 - SA.r * pu,
    oy = VH - m - 8 - SA.b * pu;
  g.save();
  rrect(ox - 3, oy - 3, m + 6, m + 6, 14);
  g.fillStyle = "rgba(8,14,36,.62)";
  g.fill();
  g.strokeStyle = "rgba(255,255,255,.4)";
  g.lineWidth = 1.5;
  g.stroke();
  rrect(ox, oy, m, m, 11);
  g.clip();
  g.fillStyle = "rgba(47,160,40,.35)";
  g.fillRect(ox, oy, m, m);
  g.strokeStyle = "#c9ced6";
  g.lineWidth = 2;
  RD.forEach(function (pts) {
    g.beginPath();
    pts.forEach(function (q, k) {
      k
        ? g.lineTo(ox + q.x * sc, oy + q.y * sc)
        : g.moveTo(ox + q.x * sc, oy + q.y * sc);
    });
    g.stroke();
  });
  B.forEach(function (b) {
    g.fillStyle = b.c;
    g.fillRect(
      ox + b.x * sc,
      oy + b.y * sc,
      Math.max(5, b.w * sc),
      Math.max(4, b.h * sc),
    );
  });
  g.strokeStyle = "rgba(255,255,255,.7)";
  g.lineWidth = 1;
  g.strokeRect(ox + camX * sc, oy + camY * sc, vw * sc, vh * sc);
  var pp = motionOk ? (tick % 60) / 60 : 0.4,
    qb = questB();
  if (qb) {
    g.strokeStyle = "rgba(255,225,74," + (1 - pp) + ")";
    g.lineWidth = 2;
    g.beginPath();
    g.arc(ox + qb.dx * sc, oy + qb.dy * sc, 3 + pp * 8, 0, 7);
    g.stroke();
    g.fillStyle = "#ffe14a";
    g.strokeStyle = "#000";
    g.lineWidth = 1;
    g.beginPath();
    g.arc(ox + qb.dx * sc, oy + qb.dy * sc, 3.5, 0, 7);
    g.fill();
    g.stroke();
  }
  g.strokeStyle = "rgba(255,255,255," + (1 - pp) + ")";
  g.lineWidth = 2;
  g.beginPath();
  g.arc(ox + S.x * sc, oy + S.y * sc, 3 + pp * 9, 0, 7);
  g.stroke();
  g.fillStyle = "#fff";
  g.strokeStyle = "#1a5cff";
  g.beginPath();
  g.arc(ox + S.x * sc, oy + S.y * sc, 3.5, 0, 7);
  g.fill();
  g.stroke();
  g.restore();
}
