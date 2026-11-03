var hudE = 0,
  hudT = 0,
  hudC = 0;
function rrect(x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}
function hud() {
  g.save();
  g.translate(SA.l * pu, SA.t * pu);
  var f = '"Impact","Arial Black",sans-serif';
  g.textAlign = "left";
  g.strokeStyle = "#000";
  g.lineWidth = 2;
  function tx(s, x, y, c, sz) {
    g.font = sz + "px " + f;
    g.fillStyle = c;
    g.strokeText(s, x, y);
    g.fillText(s, x, y);
  }
  // Narrow screens (phones held upright) get smaller type and wrapped stats.
  var nr = VW < 760,
    bw = nr ? 130 : 170,
    low = S.en / MAXE < 0.25;
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
  var hs = low ? 1 + Math.max(0, Math.sin(tick * 0.25)) * 0.18 : 1;
  g.translate(24, 31);
  g.scale(hs, hs);
  tx("♥", -14, 11, "#ff2a3a", nr ? 28 : 34);
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
  g.restore();
  rrect(44, 16, bw, 24, 8);
  g.strokeStyle = "rgba(255,255,255,.75)";
  g.lineWidth = 2;
  g.stroke();
  g.strokeStyle = "#000";
  tx(Math.round(S.en) + "/ " + MAXE, 44 + bw / 2 - 25, 35, "#fff", 18);
  tx(fmtCash(Math.round(hudC)), cashX, 42, "#ffc21a", nr ? 28 : 34);
  g.fillStyle = "#e9eef7";
  g.beginPath();
  g.arc(cx, cy, r, 0, 7);
  g.fill();
  g.stroke();
  var night = S.t < 6 || S.t >= 19;
  g.fillStyle = night ? "#3a3f9a" : "#2a8cff";
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
  g.fillText(night ? "🌙" : "☀️", cx, cy + r * 0.35);
  g.textAlign = "left";
  tx("DAY " + S.day, cx + r + 14, 42, "#5fb0ff", nr ? 24 : 30);
  var st1 = "AGE " + S.age + "   HAPPY " + S.hap + "   STR " + S.str,
    st2 =
      "INT " +
      S.int +
      "   CHA " +
      S.cha +
      "   KARMA " +
      S.k +
      (S.partner ? "   ♥ " + S.partner : "") +
      (S.won ? "   ★ PRESIDENT" : ""),
    y = 74;
  function pill(s, py, sz) {
    g.font = sz + "px " + f;
    rrect(4, py - sz - 2, g.measureText(s).width + 14, sz + 9, 9);
    g.fillStyle = "rgba(8,14,36,.45)";
    g.fill();
    tx(s, 10, py, "#fff", sz);
  }
  if (nr) {
    pill(st1, y, 17);
    y += 22;
    pill(st2, y, 17);
  } else pill(st1 + "   " + st2, y, 20);
  if (!S.in) {
    y += 10;
    var wt =
      "🌤 " +
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
    tx(
      "WANTED " + "★".repeat(Math.min(5, Math.ceil(S.heat))),
      10,
      y,
      "#ff3030",
      22,
    );
  }
  if (S.quest) {
    y += 24;
    tx("Deliver package to " + S.quest.to, 10, y, "#ffe14a", 18);
  }
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
  var pp = (tick % 60) / 60;
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
