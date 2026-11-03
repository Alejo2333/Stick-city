function deco(b) {
  if (!vis(b.x + b.w / 2, b.y + b.h / 2, 260)) return;
  var x = b.x,
    y = b.y,
    w = b.w,
    h = b.h,
    q,
    k;
  g.lineWidth = 2;
  g.fillStyle = "rgba(0,0,0,.13)";
  g.fillRect(x + 10, y + 10, w - 20, h - 20);
  g.strokeStyle = "rgba(0,0,0,.3)";
  g.strokeRect(x + 10, y + 10, w - 20, h - 20);
  [
    [x + 20, y + 18],
    [x + w - 54, y + h - 44],
  ].forEach(function (a) {
    g.fillStyle = "rgba(255,255,255,.3)";
    g.fillRect(a[0], a[1], 34, 22);
    g.strokeRect(a[0], a[1], 34, 22);
    g.fillStyle = "rgba(0,0,0,.35)";
    g.beginPath();
    g.arc(a[0] + 17, a[1] + 11, 7, 0, 7);
    g.fill();
  });
  switch (b.n) {
    case "Factory":
      for (q = 0; q < 2; q++) {
        var cx0 = x + 36 + q * 52,
          cy0 = y + 40;
        g.fillStyle = "#3d4349";
        g.fillRect(cx0 - 12, cy0 - 12, 24, 24);
        g.strokeStyle = "#000";
        g.strokeRect(cx0 - 12, cy0 - 12, 24, 24);
        g.fillStyle = "#15181b";
        g.beginPath();
        g.arc(cx0, cy0, 7, 0, 7);
        g.fill();
        smoke(cx0, cy0, 5, q * 11);
      }
      break;
    case "Home":
      g.fillStyle = "#9c3b2a";
      g.fillRect(x + w - 52, y + 22, 22, 22);
      g.strokeStyle = "#000";
      g.strokeRect(x + w - 52, y + 22, 22, 22);
      smoke(x + w - 41, y + 22, 4, 0);
      break;
    case "Hospital":
      g.fillStyle = "#fff";
      g.fillRect(x + w - 82, y + 34, 54, 54);
      g.fillStyle = "#e02020";
      g.fillRect(x + w - 70, y + 52, 30, 18);
      g.fillRect(x + w - 64, y + 46, 18, 30);
      break;
    case "Police Station":
      var on = tick % 50 < 25;
      [
        [x + 34, y + 34, on ? "#ff2a2a" : "#5a1010"],
        [x + 66, y + 34, on ? "#1a2a5a" : "#3a7bff"],
      ].forEach(function (a) {
        g.fillStyle = a[2];
        g.strokeStyle = "#000";
        g.beginPath();
        g.arc(a[0], a[1], 9, 0, 7);
        g.fill();
        g.stroke();
      });
      break;
    case "Burger Joint":
      g.fillStyle = "#e6a23c";
      g.beginPath();
      g.ellipse(x + w - 56, y + 46, 28, 13, 0, Math.PI, 0);
      g.fill();
      g.fillStyle = "#4a2a14";
      g.fillRect(x + w - 84, y + 48, 56, 9);
      g.fillStyle = "#5bbf3a";
      g.fillRect(x + w - 86, y + 57, 60, 5);
      g.fillStyle = "#d58f2b";
      g.fillRect(x + w - 82, y + 62, 52, 9);
      break;
    case "Cafe":
      [x + b.w / 2 - 85, x + b.w / 2 + 85].forEach(function (tx, i) {
        var ty = y + h + 40;
        g.fillStyle = "rgba(0,0,0,.2)";
        g.beginPath();
        g.ellipse(tx + 5, ty + 6, 22, 16, 0, 0, 7);
        g.fill();
        g.fillStyle = i ? "#e84393" : "#f5f5f5";
        g.strokeStyle = "#000";
        g.lineWidth = 2;
        g.beginPath();
        g.arc(tx, ty, 21, 0, 7);
        g.fill();
        g.stroke();
        g.fillStyle = i ? "#fff" : "#d63031";
        for (k = 0; k < 4; k++) {
          g.beginPath();
          g.moveTo(tx, ty);
          g.arc(tx, ty, 21, k * 1.571, k * 1.571 + 0.785);
          g.closePath();
          g.fill();
        }
      });
      break;
    case "School":
      g.strokeStyle = "#222";
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(x + w - 40, y + 24);
      g.lineTo(x + w - 40, y + 86);
      g.stroke();
      g.fillStyle = "#e02020";
      g.beginPath();
      g.moveTo(x + w - 40, y + 26);
      for (k = 0; k <= 5; k++)
        g.lineTo(
          x + w - 40 + k * 7,
          y + 26 + Math.sin(tick * 0.12 + k) * 3,
        );
      for (k = 5; k >= 0; k--)
        g.lineTo(
          x + w - 40 + k * 7,
          y + 42 + Math.sin(tick * 0.12 + k) * 3,
        );
      g.closePath();
      g.fill();
      break;
    case "Bank":
      g.fillStyle = "rgba(255,255,255,.35)";
      g.strokeStyle = "rgba(0,0,0,.4)";
      g.beginPath();
      g.arc(x + w - 62, y + 62, 30, 0, 7);
      g.fill();
      g.stroke();
      g.beginPath();
      g.arc(x + w - 62, y + 62, 16, 0, 7);
      g.stroke();
      break;
    case "Gym":
      g.fillStyle = "#222";
      g.fillRect(x + w - 92, y + 62, 56, 6);
      [-1, 1].forEach(function (sd) {
        g.beginPath();
        g.arc(x + w - 64 + sd * 28, y + 65, 12, 0, 7);
        g.fill();
      });
      break;
    case "Pawn Shop":
      g.fillStyle = "#f2c230";
      g.strokeStyle = "#000";
      g.lineWidth = 2;
      for (k = 0; k < 3; k++) {
        g.beginPath();
        g.arc(x + w - 90 + k * 26, y + 56, 11, 0, 7);
        g.fill();
        g.stroke();
      }
      break;
    case "Corner Store":
      for (k = 0; k < 10; k++) {
        g.fillStyle = k % 2 ? "#ffffff" : "#d63031";
        g.fillRect(x + 6 + k * 22.8, y + h - 16, 22.8, 18);
      }
      g.strokeStyle = "#000";
      g.strokeRect(x + 6, y + h - 16, w - 12, 18);
      break;
    case "Office":
      g.strokeStyle = "#222";
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(x + 40, y + 40);
      g.lineTo(x + 40, y + 96);
      g.stroke();
      g.fillStyle = tick % 60 < 30 ? "#ff3030" : "#601010";
      g.beginPath();
      g.arc(x + 40, y + 38, 5, 0, 7);
      g.fill();
      break;
  }
  g.lineWidth = 2;
  g.strokeStyle = "#000";
  g.fillStyle = "#fff";
  for (k = 0; k < 8; k++) {
    g.fillStyle = k % 2 ? "#ffffff" : "#d63031";
    g.fillRect(b.dx - 32 + k * 8, b.dy - 40, 8, 11);
  }
  g.strokeRect(b.dx - 32, b.dy - 40, 64, 11);
  g.fillStyle = "#8b5a2b";
  [-1, 1].forEach(function (sd) {
    g.fillRect(b.dx + sd * 46 - 6, b.dy - 12, 12, 10);
    g.fillStyle = "#2f9e3f";
    g.beginPath();
    g.arc(b.dx + sd * 46, b.dy - 16, 9, 0, 7);
    g.fill();
    g.stroke();
    g.fillStyle = "#8b5a2b";
  });
  g.fillStyle = "#7a1c1c";
  g.fillRect(b.dx - 16, b.dy + 2, 32, 8);
  g.fillStyle = "#ffd34a";
  g.beginPath();
  g.arc(b.dx + 12, b.dy - 14, 2.5, 0, 7);
  g.fill();
}
function drawProps() {
  BN.forEach(function (q) {
    if (!vis(q.x, q.y, 50)) return;
    g.save();
    g.translate(q.x, q.y);
    g.rotate(q.a);
    g.fillStyle = "rgba(0,0,0,.18)";
    g.fillRect(-20, -6, 48, 20);
    g.fillStyle = "#9b6a3a";
    g.strokeStyle = "#000";
    g.lineWidth = 2;
    g.fillRect(-24, -10, 48, 18);
    g.strokeRect(-24, -10, 48, 18);
    g.strokeStyle = "#5a3a1a";
    g.beginPath();
    g.moveTo(-24, -4);
    g.lineTo(24, -4);
    g.moveTo(-24, 2);
    g.lineTo(24, 2);
    g.stroke();
    g.restore();
  });
  LP.forEach(function (l) {
    if (!vis(l.x, l.y, 30)) return;
    g.fillStyle = "rgba(0,0,0,.2)";
    g.beginPath();
    g.arc(l.x + 5, l.y + 6, 6, 0, 7);
    g.fill();
    g.fillStyle = "#333";
    g.strokeStyle = "#000";
    g.lineWidth = 2;
    g.beginPath();
    g.arc(l.x, l.y, 6, 0, 7);
    g.fill();
    g.stroke();
    g.fillStyle = "#ffe9a0";
    g.beginPath();
    g.arc(l.x, l.y, 3.5, 0, 7);
    g.fill();
  });
  BU.forEach(function (q) {
    if (!vis(q.x, q.y, 40)) return;
    g.fillStyle = "rgba(0,0,0,.18)";
    g.beginPath();
    g.ellipse(q.x + 5, q.y + 7, q.r * 1.1, q.r * 0.8, 0, 0, 7);
    g.fill();
    g.fillStyle = "#2a9d3c";
    g.strokeStyle = "#0c4a17";
    g.lineWidth = 2;
    [
      [0, 0, 1],
      [-0.7, 0.3, 0.75],
      [0.7, 0.3, 0.75],
    ].forEach(function (c) {
      g.beginPath();
      g.arc(q.x + c[0] * q.r, q.y + c[1] * q.r, q.r * c[2], 0, 7);
      g.fill();
      g.stroke();
    });
  });
  CARS.forEach(drawCar);
  var ssn = seasonName();
  TR.forEach(function (t, ti) {
    if (!vis(t.x, t.y, t.r + 30)) return;
    var sw = Math.sin(tick * 0.03 + t.ph) * 2,
      col =
        ssn === "Autumn"
          ? ["#e2741d", "#d9a21b", "#c8461f", "#e8b53a"][ti % 4]
          : t.c;
    t._d = t._d || {};
    var dc = t._d[col] || (t._d[col] = shade(col, -0.3));
    g.fillStyle = "rgba(0,0,0,.2)";
    g.beginPath();
    g.ellipse(t.x + 12, t.y + 14, t.r * 0.95, t.r * 0.6, 0, 0, 7);
    g.fill();
    g.fillStyle = "#6b4423";
    g.fillRect(t.x - 5, t.y - 4, 10, 18);
    g.fillStyle = dc;
    g.beginPath();
    g.arc(t.x + sw + 3, t.y - 5, t.r, 0, 7);
    g.fill();
    g.fillStyle = col;
    g.strokeStyle = ssn === "Autumn" ? "#6a2a08" : "#0c4a17";
    g.lineWidth = 3;
    g.beginPath();
    g.arc(t.x + sw, t.y - 8, t.r, 0, 7);
    g.fill();
    g.stroke();
    g.fillStyle = dc;
    g.beginPath();
    g.arc(t.x + sw + t.r * 0.35, t.y - 8 + t.r * 0.3, t.r * 0.45, 0, 7);
    g.fill();
    g.fillStyle = "rgba(255,255,255,.2)";
    g.beginPath();
    g.arc(t.x + sw - t.r * 0.3, t.y - 8 - t.r * 0.3, t.r * 0.45, 0, 7);
    g.fill();
    if (ssn === "Spring") {
      g.fillStyle = "#ffc0dc";
      for (var k = 0; k < 6; k++) {
        var an = k * 1.05 + ti;
        g.beginPath();
        g.arc(
          t.x + sw + Math.cos(an) * t.r * 0.6,
          t.y - 8 + Math.sin(an) * t.r * 0.6,
          3,
          0,
          7,
        );
        g.fill();
      }
    } else if (ssn === "Winter") {
      g.fillStyle = "rgba(255,255,255,.9)";
      g.beginPath();
      g.ellipse(
        t.x + sw - t.r * 0.15,
        t.y - 8 - t.r * 0.35,
        t.r * 0.72,
        t.r * 0.42,
        0,
        0,
        7,
      );
      g.fill();
    }
  });
}
function drawPet(n) {
  if (n.a !== null) n.fa = n.a;
  var a = n.fa || 0,
    s = Math.sin(n.ph) * 3;
  g.save();
  g.translate(n.x, n.y);
  g.rotate(a);
  g.fillStyle = "rgba(0,0,0,.18)";
  g.beginPath();
  g.ellipse(2, 5, 13, 7, 0, 0, 7);
  g.fill();
  g.strokeStyle = "#000";
  g.lineWidth = 2;
  g.fillStyle = n.col;
  g.beginPath();
  g.moveTo(-6, -5);
  g.lineTo(-6 + s, -9);
  g.moveTo(-6, 5);
  g.lineTo(-6 - s, 9);
  g.moveTo(6, -5);
  g.lineTo(6 - s, -9);
  g.moveTo(6, 5);
  g.lineTo(6 + s, 9);
  g.stroke();
  g.beginPath();
  g.ellipse(0, 0, 12, 7, 0, 0, 7);
  g.fill();
  g.stroke();
  g.beginPath();
  g.arc(12, 0, 6, 0, 7);
  g.fill();
  g.stroke();
  g.beginPath();
  g.moveTo(-12, 0);
  g.lineTo(-18, -4 + s);
  g.stroke();
  g.restore();
}
function sky(cx, cy) {
  var dk = dark();
  if (dk >= 0.4) return;
  g.save();
  g.scale(zoom, zoom);
  g.translate(-cx, -cy);
  g.fillStyle = "rgba(0,30,0," + 0.08 * (1 - dk / 0.4) + ")";
  CLD.forEach(function (c) {
    c.x += c.s;
    if (c.x > W + 300) c.x = -300;
    if (!vis(c.x, c.y, c.rx + 60)) return;
    g.beginPath();
    g.ellipse(c.x, c.y, c.rx, c.ry, 0, 0, 7);
    g.fill();
    g.beginPath();
    g.ellipse(
      c.x + c.rx * 0.5,
      c.y + c.ry * 0.4,
      c.rx * 0.6,
      c.ry * 0.7,
      0,
      0,
      7,
    );
    g.fill();
  });
  BIRDS.forEach(function (bd) {
    bd.x += Math.cos(bd.a) * bd.s;
    bd.y += Math.sin(bd.a) * bd.s;
    var rb = Math.hypot(vw, vh) / 2 + 143,
      dd = Math.hypot(bd.x - (cx + vw / 2), bd.y - (cy + vh / 2));
    if (dd > rb + 280) {
      var an = Math.random() * 6.283;
      bd.x = cx + vw / 2 + Math.cos(an) * rb;
      bd.y = cy + vh / 2 + Math.sin(an) * rb;
      bd.a = an + Math.PI + (Math.random() - 0.5) * 0.8;
    }
    var fl = Math.sin(tick * 0.35 + bd.ph) * 5;
    g.fillStyle = "rgba(0,0,0,.14)";
    g.beginPath();
    g.ellipse(bd.x + 10, bd.y + 40, 7, 3, 0, 0, 7);
    g.fill();
    g.strokeStyle = "#222";
    g.lineWidth = 2.5;
    g.beginPath();
    g.moveTo(bd.x - 8, bd.y - fl);
    g.lineTo(bd.x, bd.y + 2);
    g.lineTo(bd.x + 8, bd.y - fl);
    g.stroke();
  });
  g.restore();
}
var NEON = {
  Casino: 1,
  "Night Club": 1,
  Arcade: 1,
  Bar: 1,
};
function lights(cx, cy) {
  var dk = dark();
  if (dk < 0.15) return;
  var al = Math.min(1, dk / 0.62);
  g.save();
  g.scale(zoom, zoom);
  g.translate(-cx, -cy);
  g.globalCompositeOperation = "lighter";
  LP.forEach(function (l) {
    if (!vis(l.x, l.y, 110)) return;
    var gr = g.createRadialGradient(l.x, l.y, 3, l.x, l.y, 100);
    gr.addColorStop(0, "rgba(255,205,110," + 0.5 * al + ")");
    gr.addColorStop(1, "rgba(255,205,110,0)");
    g.fillStyle = gr;
    g.fillRect(l.x - 100, l.y - 100, 200, 200);
  });
  CARS.forEach(function (c) {
    var q = carPos(c);
    if (!vis(q.x, q.y, 150)) return;
    var hx = q.x + Math.cos(c.a) * 85,
      hy = q.y + Math.sin(c.a) * 85,
      gr = g.createRadialGradient(hx, hy, 4, hx, hy, 75);
    gr.addColorStop(0, "rgba(255,245,170," + 0.45 * al + ")");
    gr.addColorStop(1, "rgba(255,245,170,0)");
    g.fillStyle = gr;
    g.fillRect(hx - 75, hy - 75, 150, 150);
  });
  g.globalCompositeOperation = "source-over";
  g.globalAlpha = al;
  B.forEach(function (b) {
    if (!NEON[b.n] || !vis(b.x + b.w / 2, b.y + b.h / 2, 260)) return;
    g.strokeStyle = "hsl(" + ((tick * 3 + b.x) % 360) + ",100%,62%)";
    g.lineWidth = 5;
    g.strokeRect(b.x + 4, b.y + 4, b.w - 8, b.h - 8);
  });
  g.restore();
}
