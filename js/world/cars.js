function carPos(c) {
  return {
    x: c.x - Math.sin(c.a) * 30,
    y: c.y + Math.cos(c.a) * 30,
  };
}
function drawCar(c) {
  var q = carPos(c);
  if (!vis(q.x, q.y, 90)) return;
  var len = c.bus ? 112 : 64,
    wd = c.bus ? 42 : 34,
    hl = len / 2,
    hw = wd / 2;
  g.save();
  g.translate(q.x, q.y);
  g.rotate(c.a);
  g.fillStyle = "rgba(0,0,0,.2)";
  g.fillRect(-hl + 4, -hw + 6, len, wd);
  g.fillStyle = "#000";
  [-0.3, 0.3].forEach(function (f) {
    g.fillRect(len * f - 7, -hw - 3, 14, 5);
    g.fillRect(len * f - 7, hw - 2, 14, 5);
  });
  g.fillStyle = c.col;
  g.strokeStyle = "#000";
  g.lineWidth = 3;
  g.fillRect(-hl, -hw, len, wd);
  g.strokeRect(-hl, -hw, len, wd);
  g.fillStyle = "#bfe9ff";
  if (c.bus) {
    for (var k = -4; k <= 3; k++) {
      g.fillRect(k * 11 + 2, -hw + 4, 8, 7);
      g.fillRect(k * 11 + 2, hw - 11, 8, 7);
    }
    g.fillRect(hl - 12, -hw + 5, 8, wd - 10);
  } else {
    g.fillRect(hl * 0.18, -hw + 4, hl * 0.32, wd - 8);
    g.fillRect(-hl * 0.62, -hw + 5, hl * 0.2, wd - 10);
    g.fillStyle = "rgba(255,255,255,.25)";
    g.fillRect(-hl * 0.4, -hw + 4, hl * 0.52, wd - 8);
  }
  g.fillStyle = "#fff3a0";
  g.fillRect(hl - 4, -hw + 3, 4, 7);
  g.fillRect(hl - 4, hw - 10, 4, 7);
  g.fillStyle = c.v < 0.25 ? "#ff2020" : "#7a1010";
  g.fillRect(-hl, -hw + 3, 4, 7);
  g.fillRect(-hl, hw - 10, 4, 7);
  g.restore();
}
function carStep() {
  CARS.forEach(function (c) {
    var pts = RD[c.r],
      tg = pts[c.i + c.dir];
    if (!tg) {
      c.i = c.dir > 0 ? 0 : pts.length - 1;
      c.x = pts[c.i].x;
      c.y = pts[c.i].y;
      tg = pts[c.i + c.dir];
      if (!tg) return;
    }
    var dx = tg.x - c.x,
      dy = tg.y - c.y,
      d = Math.hypot(dx, dy) || 1,
      ax = Math.cos(c.a),
      ay = Math.sin(c.a),
      q = carPos(c),
      px = S.x - q.x,
      py = S.y - q.y,
      fw = px * ax + py * ay,
      lat = -px * ay + py * ax,
      pstop = fw > 0 && fw < 95 && Math.abs(lat) < 42,
      stop = pstop;
    CARS.forEach(function (o) {
      if (o === c || o.r !== c.r || o.dir !== c.dir) return;
      var ox = o.x - c.x,
        oy = o.y - c.y,
        f2 = ox * ax + oy * ay;
      if (f2 > 0 && f2 < 110) stop = true;
    });
    if (c.cool > 0) c.cool--;
    if (stop) {
      c.v = Math.max(0, c.v - 0.12);
      if (pstop && !c.cool && c.v < 0.4) {
        c.cool = 360;
        tone(392, 0.12, "square", 0.05);
        tone(392, 0.2, "square", 0.05, 0, 0.16);
      }
    } else c.v = Math.min(c.vmax, c.v + 0.04);
    if (d <= c.v) {
      c.i += c.dir;
      c.x = tg.x;
      c.y = tg.y;
    } else {
      c.x += (dx / d) * c.v;
      c.y += (dy / d) * c.v;
    }
    var ta = Math.atan2(dy, dx);
    c.a += Math.atan2(Math.sin(ta - c.a), Math.cos(ta - c.a)) * 0.12;
  });
}
function smoke(x, y, n, off) {
  for (var k = 0; k < n; k++) {
    var ph = (tick * 0.5 + k * 22 + off) % 110;
    g.fillStyle = "rgba(235,235,235," + 0.55 * (1 - ph / 110) + ")";
    g.beginPath();
    g.arc(x + ph * 0.35, y - ph * 0.55, 6 + ph * 0.14, 0, 7);
    g.fill();
  }
}
