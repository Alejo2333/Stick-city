function strokeP(pts, w, c) {
  g.strokeStyle = c;
  g.lineWidth = w;
  g.beginPath();
  g.moveTo(pts[0].x, pts[0].y);
  for (var i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
  g.stroke();
}
// Tileable grass texture, built once.
var grassPat = null;
function grass() {
  if (grassPat) return grassPat;
  var c = document.createElement("canvas"),
    q = c.getContext("2d"),
    n = 256,
    sd = 7;
  function r() {
    sd = (sd * 16807) % 2147483647;
    return sd / 2147483647;
  }
  c.width = c.height = n;
  q.fillStyle = "#33c80a";
  q.fillRect(0, 0, n, n);
  for (var i = 0; i < 26; i++) {
    q.fillStyle =
      r() < 0.5 ? "rgba(255,255,160,.07)" : "rgba(0,80,0,.08)";
    q.beginPath();
    q.ellipse(
      r() * n,
      r() * n,
      18 + r() * 30,
      10 + r() * 18,
      r() * 3,
      0,
      7,
    );
    q.fill();
  }
  for (i = 0; i < 420; i++) {
    var x = r() * n,
      y = r() * n;
    q.strokeStyle =
      r() < 0.6 ? "rgba(20,120,0,.45)" : "rgba(150,240,90,.45)";
    q.lineWidth = 1;
    q.beginPath();
    q.moveTo(x, y);
    q.lineTo(x + (r() - 0.5) * 3, y - 3 - r() * 3);
    q.stroke();
  }
  grassPat = g.createPattern(c, "repeat");
  return grassPat;
}
// Lighten (a > 0) or darken (a < 0) a #rrggbb colour.
function shade(c, a) {
  var m = /^#([0-9a-f]{6})$/i.exec(c);
  if (!m) return c;
  var v = parseInt(m[1], 16),
    f = function (x) {
      x = a > 0 ? x + (255 - x) * a : x * (1 + a);
      return Math.max(0, Math.min(255, Math.round(x)));
    };
  return (
    "rgb(" +
    f(v >> 16) +
    "," +
    f((v >> 8) & 255) +
    "," +
    f(v & 255) +
    ")"
  );
}
function world() {
  g.fillStyle = grass();
  g.fillRect(0, 0, W, H);
  drawGround();
  g.lineCap = "round";
  g.lineJoin = "round";
  g.strokeStyle = "#999";
  g.lineWidth = 44;
  B.forEach(function (b) {
    g.beginPath();
    g.moveTo(b.dx, b.dy);
    g.lineTo(b.px, b.py);
    g.stroke();
  });
  RD.forEach(function (p) {
    strokeP(p, 240, "#a7abb2");
  });
  RD.forEach(function (p) {
    strokeP(p, 150, "#e1e3e6");
  });
  RD.forEach(function (p) {
    strokeP(p, 140, "#55595f");
  });
  RD.forEach(function (p) {
    strokeP(p, 126, "rgba(255,255,255,.75)");
  });
  RD.forEach(function (p) {
    strokeP(p, 120, "#5b5f66");
  });
  g.setLineDash([60, 50]);
  g.lineCap = "butt";
  RD.forEach(function (p) {
    strokeP(p, 6, "#ffd400");
  });
  g.setLineDash([]);
  g.lineCap = "round";
  B.forEach(function (b) {
    if (!vis(b.x + b.w / 2, b.y + b.h / 2, 320)) return;
    // Soft cast shadow, shaded roof and a lit parapet edge.
    g.fillStyle = "rgba(0,0,0,.16)";
    g.fillRect(b.x + 16, b.y + 18, b.w, b.h + 30);
    g.fillStyle = "rgba(0,0,0,.1)";
    g.fillRect(b.x + 8, b.y + 9, b.w + 4, b.h + 30);
    if (!b._rg) {
      b._rg = g.createLinearGradient(b.x, b.y, b.x + b.w, b.y + b.h);
      b._rg.addColorStop(0, shade(b.c, 0.22));
      b._rg.addColorStop(1, shade(b.c, -0.18));
      b._fg = g.createLinearGradient(0, b.y + b.h, 0, b.y + b.h + 30);
      b._fg.addColorStop(0, shade(b.c, -0.35));
      b._fg.addColorStop(1, shade(b.c, -0.6));
    }
    g.fillStyle = b._rg;
    g.strokeStyle = "#000";
    g.lineWidth = 3;
    g.fillRect(b.x, b.y, b.w, b.h);
    g.strokeRect(b.x, b.y, b.w, b.h);
    g.strokeStyle = "rgba(255,255,255,.35)";
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(b.x + 4, b.y + b.h - 4);
    g.lineTo(b.x + 4, b.y + 4);
    g.lineTo(b.x + b.w - 4, b.y + 4);
    g.stroke();
    g.strokeStyle = "#000";
    g.lineWidth = 3;
    // Front facade with framed, reflective windows.
    g.fillStyle = b._fg;
    g.fillRect(b.x, b.y + b.h, b.w, 30);
    g.strokeRect(b.x, b.y + b.h, b.w, 30);
    for (var w = b.x + 16; w < b.x + b.w - 40; w += 56) {
      g.fillStyle = "#1d2a3a";
      g.fillRect(w - 2, b.y + b.h + 4, 36, 22);
      g.fillStyle = "#5fd3ff";
      g.fillRect(w, b.y + b.h + 6, 32, 18);
      g.fillStyle = "rgba(255,255,255,.55)";
      g.beginPath();
      g.moveTo(w + 4, b.y + b.h + 24);
      g.lineTo(w + 14, b.y + b.h + 6);
      g.lineTo(w + 20, b.y + b.h + 6);
      g.lineTo(w + 10, b.y + b.h + 24);
      g.fill();
    }
    g.fillStyle = "#3a2410";
    g.fillRect(b.dx - 24, b.dy - 33, 48, 33);
    g.fillStyle = "#6b3e12";
    g.fillRect(b.dx - 20, b.dy - 30, 40, 30);
    g.strokeRect(b.dx - 20, b.dy - 30, 40, 30);
    g.fillStyle = "rgba(255,220,140,.5)";
    g.fillRect(b.dx - 14, b.dy - 26, 28, 8);
    g.fillStyle = "#fff";
    deco(b);
    if (S.day % 7 === 0 && b.n === "Cafe") {
      for (var k = 0; k < 10; k++) {
        g.fillStyle = ["#ff4b6e", "#ffd152", "#52bdff", "#b77bef"][
          k % 4
        ];
        g.beginPath();
        g.moveTo(b.x + k * 24, b.y - 28);
        g.lineTo(b.x + k * 24 + 11, b.y - 7);
        g.lineTo(b.x + k * 24 + 22, b.y - 28);
        g.fill();
      }
      g.font = "24px Arial";
      g.fillText("🎪", b.x + b.w / 2, b.y - 35);
    }
    if (seasonName() === "Winter") {
      g.fillStyle = "#e6f6ff";
      g.fillRect(b.x, b.y - 5, b.w, 8);
      if (b.n === "Home" || b.n === "Corner Store") {
        g.font = "22px Arial";
        g.fillText("❄️", b.x + b.w - 25, b.y - 15);
      }
    }
    if (seasonName() === "Autumn" && b.n === "Home") {
      g.font = "22px Arial";
      g.fillText("🍂", b.x + 40, b.y - 12);
    }
    g.fillStyle = "#fff";
    g.font = '26px "Patrick Hand","Comic Sans MS",cursive';
    g.textAlign = "center";
    g.lineJoin = "round";
    g.lineWidth = 5;
    g.strokeStyle = "rgba(0,0,0,.65)";
    g.strokeText(b.n, b.x + b.w / 2, b.y + b.h / 2 + 8);
    g.fillText(b.n, b.x + b.w / 2, b.y + b.h / 2 + 8);
    // Bouncing door marker when the player is close.
    var dd = Math.hypot(S.x - b.dx, S.y - b.dy);
    if (dd < 230 && !S.in) {
      var bob = Math.sin(tick * 0.15),
        by = b.dy - 62 + bob * 6;
      g.globalAlpha = Math.min(1, (230 - dd) / 80);
      g.fillStyle = "rgba(255,230,120,.35)";
      g.beginPath();
      g.ellipse(b.dx, b.dy + 6, 34 + bob * 4, 12, 0, 0, 7);
      g.fill();
      g.fillStyle = "#ffd23a";
      g.strokeStyle = "#000";
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(b.dx - 13, by - 12);
      g.lineTo(b.dx + 13, by - 12);
      g.lineTo(b.dx, by + 4);
      g.closePath();
      g.fill();
      g.stroke();
      g.globalAlpha = 1;
    }
  });
  drawProps();
  drawDrops();
}
// Butterflies by day, fireflies at night, falling leaves in autumn.
var AMB = [],
  DUST = [];
function ambient() {
  var dk = dark(),
    ssn = seasonName(),
    wet = S.weather === "Rain" || S.weather === "Storm",
    kind =
      ssn === "Autumn"
        ? 2
        : ssn === "Winter" || wet
          ? -1
          : dk > 0.3
            ? 1
            : 0;
  if (kind < 0) return;
  while (AMB.length < 16)
    AMB.push({ k: -1, ph: Math.random() * 6.28, t: 0 });
  AMB.forEach(function (a, i) {
    if (a.k !== kind || !vis(a.x, a.y, 80)) {
      a.k = kind;
      a.t = 0;
      a.x = camX + Math.random() * vw;
      a.y = camY + Math.random() * vh;
      a.vx = (Math.random() - 0.5) * 1.2;
      a.vy = (Math.random() - 0.5) * 1.2;
    }
    a.t++;
    a.ph += 0.1;
    g.globalAlpha = Math.min(1, a.t / 40);
    if (kind === 0) {
      a.x += a.vx + Math.cos(a.ph * 0.7) * 0.8;
      a.y += a.vy + Math.sin(a.ph * 1.3) * 0.8;
      var fl = 0.25 + Math.abs(Math.sin(a.ph * 2.4)) * 0.75;
      g.fillStyle = ["#ffd23a", "#ff7ac0", "#7ad0ff", "#ff9a3a"][i % 4];
      g.strokeStyle = "#222";
      g.lineWidth = 1;
      [-1, 1].forEach(function (sd) {
        g.beginPath();
        g.ellipse(a.x + sd * 5 * fl, a.y, 5 * fl, 6, 0, 0, 7);
        g.fill();
        g.stroke();
      });
      g.fillStyle = "#222";
      g.fillRect(a.x - 1, a.y - 5, 2, 10);
    } else if (kind === 1) {
      a.x += a.vx * 0.4 + Math.cos(a.ph * 0.3) * 0.4;
      a.y += a.vy * 0.4 + Math.sin(a.ph * 0.4) * 0.4;
      var gl = 0.5 + 0.5 * Math.sin(a.ph * 0.9 + i);
      g.fillStyle = "rgba(220,255,120," + 0.18 * gl + ")";
      g.beginPath();
      g.arc(a.x, a.y, 11, 0, 7);
      g.fill();
      g.fillStyle = "rgba(240,255,170," + (0.4 + 0.6 * gl) + ")";
      g.beginPath();
      g.arc(a.x, a.y, 2.5, 0, 7);
      g.fill();
    } else {
      a.y += 0.9;
      a.x += Math.sin(a.ph * 0.5) * 1.3;
      g.save();
      g.translate(a.x, a.y);
      g.rotate(Math.sin(a.ph * 0.5) * 0.9);
      g.fillStyle = ["#e2741d", "#d9a21b", "#c8461f"][i % 3];
      g.beginPath();
      g.ellipse(0, 0, 7, 3.5, 0, 0, 7);
      g.fill();
      g.restore();
    }
  });
  g.globalAlpha = 1;
}
function drawDust() {
  DUST = DUST.filter(function (d) {
    return d.t < 28;
  });
  DUST.forEach(function (d) {
    d.t++;
    g.fillStyle = "rgba(235,225,200," + 0.4 * (1 - d.t / 28) + ")";
    g.beginPath();
    g.arc(d.x, d.y - d.t * 0.3, 4 + d.t * 0.35, 0, 7);
    g.fill();
  });
}
var vigG = null,
  vigK = "";
function vignette() {
  var k = VW + "x" + VH;
  if (vigK !== k) {
    vigK = k;
    vigG = g.createRadialGradient(
      VW / 2,
      VH / 2,
      Math.min(VW, VH) * 0.42,
      VW / 2,
      VH / 2,
      Math.hypot(VW, VH) * 0.62,
    );
    vigG.addColorStop(0, "rgba(0,0,25,0)");
    vigG.addColorStop(1, "rgba(0,0,25,.34)");
  }
  g.fillStyle = vigG;
  g.fillRect(0, 0, VW, VH);
}
