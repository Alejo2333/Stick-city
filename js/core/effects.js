var AC = null,
  muted = false,
  motionOk = !matchMedia("(prefers-reduced-motion: reduce)").matches;
try {
  muted = localStorage.getItem("stickCityMute") === "1";
} catch (e) {}
function tone(f, d, type, vol, to, delay) {
  if (muted) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === "suspended") AC.resume();
    var t0 = AC.currentTime + (delay || 0),
      o = AC.createOscillator(),
      a = AC.createGain();
    o.type = type || "square";
    o.frequency.setValueAtTime(f, t0);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + d);
    a.gain.setValueAtTime(vol || 0.06, t0);
    a.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    o.connect(a);
    a.connect(AC.destination);
    o.start(t0);
    o.stop(t0 + d + 0.02);
  } catch (e) {}
}
var SFX = {
  click: function () {
    tone(520, 0.05, "square", 0.04);
  },
  coin: function () {
    tone(988, 0.08, "square", 0.05);
    tone(1319, 0.16, "square", 0.05, 0, 0.08);
  },
  spend: function () {
    tone(330, 0.09, "triangle", 0.08);
    tone(247, 0.12, "triangle", 0.08, 0, 0.07);
  },
  up: function () {
    tone(523, 0.09, "square", 0.05);
    tone(659, 0.09, "square", 0.05, 0, 0.09);
    tone(784, 0.16, "square", 0.05, 0, 0.18);
  },
  hurt: function () {
    tone(180, 0.22, "sawtooth", 0.07, 70);
  },
  door: function () {
    tone(200, 0.09, "triangle", 0.09);
    tone(300, 0.09, "triangle", 0.09, 0, 0.08);
  },
  bad: function () {
    tone(220, 0.12, "square", 0.05);
    tone(160, 0.2, "square", 0.05, 0, 0.12);
  },
  siren: function () {
    for (var i = 0; i < 4; i++)
      tone(i % 2 ? 700 : 900, 0.18, "square", 0.05, 0, i * 0.18);
  },
};
function sfx(n) {
  if (SFX[n]) SFX[n]();
}
var FX = [],
  shake = 0,
  flash = 0,
  camX = 0,
  camY = 0;
function pop(txt, col, i) {
  FX.push({ s: txt, c: col, t: 0, d: (i || 0) * 5, o: (i || 0) * 34 });
}
function drawFx() {
  if (!FX.length) return;
  var ax, ay;
  if (S.in) {
    ax = roomX + 190 * roomS;
    ay = roomY + 170 * roomS;
  } else {
    ax = (S.x - camX) * zoom;
    ay = (S.y - camY - 40) * zoom;
  }
  g.textAlign = "center";
  g.lineJoin = "round";
  g.lineWidth = 5;
  g.strokeStyle = "#000";
  g.font = '32px "Impact","Arial Black",sans-serif';
  FX = FX.filter(function (f) {
    return f.t < 60;
  });
  FX.forEach(function (f) {
    if (f.d > 0) {
      f.d--;
      return;
    }
    f.t++;
    g.globalAlpha = Math.max(0, 1 - f.t / 60);
    var y = ay - f.o - f.t * 1.2,
      ps = f.t < 10 ? 1 + (10 - f.t) * 0.06 : 1;
    g.save();
    g.translate(ax, y);
    g.scale(ps, ps);
    g.strokeText(f.s, 0, 0);
    g.fillStyle = f.c;
    g.fillText(f.s, 0, 0);
    g.restore();
  });
  g.globalAlpha = 1;
}
function feedback(b0, seen) {
  var i = 0,
    dc = S.cash - b0.cash,
    de = S.en - b0.en,
    dk = S.k - b0.k,
    up = 0;
  if (dc)
    pop(
      (dc > 0 ? "+$" : "−$") + Math.abs(dc),
      dc > 0 ? "#7dff7d" : "#ff7676",
      i++,
    );
  if (Math.round(de))
    pop(
      (de > 0 ? "+" : "−") + Math.abs(Math.round(de)) + " HP",
      de > 0 ? "#ff9aa8" : "#ff5a5a",
      i++,
    );
  [
    ["str", "STR", "#ffd34a"],
    ["int", "INT", "#6ec1ff"],
    ["cha", "CHA", "#ff8fd8"],
  ].forEach(function (a) {
    var d = S[a[0]] - b0[a[0]];
    if (d) {
      up = 1;
      pop((d > 0 ? "+" : "−") + Math.abs(d) + " " + a[1], a[2], i++);
    }
  });
  if (dk)
    pop(
      (dk > 0 ? "+" : "−") + Math.abs(dk) + " karma",
      dk > 0 ? "#c9a0ff" : "#ff9a5a",
      i++,
    );
  if (seen) pop("WANTED!", "#ff3030", i++);
  if (seen) sfx("siren");
  else if (de <= -6) {
    sfx("hurt");
    shake = Math.min(14, -de * 1.5);
  } else if (up) sfx("up");
  else if (dc > 0) sfx("coin");
  else if (dc < 0) sfx("spend");
  else if (dk < 0) sfx("bad");
  else sfx("click");
}
function dark() {
  var t = S.t;
  if (t < 8) return (0.3 * (8 - t)) / 2;
  if (t < 17) return 0;
  if (t < 20) return (0.62 * (t - 17)) / 3;
  return 0.62;
}
function tint(cx, cy) {
  var dk = dark();
  if (dk < 0.01) return;
  var px = (S.x - cx) * zoom,
    py = (S.y - cy) * zoom,
    gr = g.createRadialGradient(px, py, 40 * zoom, px, py, 380 * zoom);
  gr.addColorStop(0, "rgba(8,12,50," + dk * 0.3 + ")");
  gr.addColorStop(1, "rgba(8,12,50," + dk + ")");
  g.fillStyle = gr;
  g.fillRect(0, 0, VW, VH);
  if (dk > 0.15) {
    g.save();
    g.scale(zoom, zoom);
    g.translate(-cx, -cy);
    g.fillStyle = "rgba(255,226,120," + Math.min(1, dk * 1.6) + ")";
    B.forEach(function (b) {
      if (
        b.x + b.w < cx ||
        b.x > cx + vw ||
        b.y + b.h + 40 < cy ||
        b.y > cy + vh
      )
        return;
      for (
        var w = b.x + 16, wi = 0;
        w < b.x + b.w - 40;
        w += 56, wi++
      ) {
        if ((b.x + wi * 37 + S.day * 13) % 5 < 1) continue;
        g.globalAlpha = 0.3;
        g.fillRect(w - 6, b.y + b.h + 2, 44, 26);
        g.globalAlpha = 1;
        g.fillRect(w, b.y + b.h + 6, 32, 18);
      }
    });
    g.restore();
  }
}
