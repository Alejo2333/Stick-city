function loop() {
  g.setTransform(sc, 0, 0, sc, 0, 0);
  tick++;
  if (zoom !== zoomT) {
    zoom =
      Math.abs(zoomT - zoom) < 0.002
        ? zoomT
        : zoom + (zoomT - zoom) * 0.25;
    setView();
  }
  if (shake > 0) {
    g.translate(
      (Math.random() - 0.5) * shake,
      (Math.random() - 0.5) * shake,
    );
    shake = Math.max(0, shake - 0.8);
  }
  if (paused) {
    keys = {};
    held = {};
  }
  if (S.in) {
    room();
  } else {
    var dx = 0,
      dy = 0;
    if (keys.ArrowLeft || keys.a || held.l) dx--;
    if (keys.ArrowRight || keys.d || held.r) dx++;
    if (keys.ArrowUp || keys.w || held.u) dy--;
    if (keys.ArrowDown || keys.s || held.d) dy++;
    if (dx || dy) {
      var L = Math.hypot(dx, dy),
        nx =
          S.x +
          (dx / L) *
            (S.driving
              ? (VEHICLES.filter(function (a) {
                  return a[0] === S.vehicle;
                })[0] || [0, 0, 0, 5.5])[3] *
                (S.weather === "Fog"
                  ? 0.72
                  : S.weather === "Storm"
                    ? 0.8
                    : 1)
              : 4),
        ny =
          S.y +
          (dy / L) *
            (S.driving
              ? (VEHICLES.filter(function (a) {
                  return a[0] === S.vehicle;
                })[0] || [0, 0, 0, 5.5])[3] *
                (S.weather === "Fog"
                  ? 0.72
                  : S.weather === "Storm"
                    ? 0.8
                    : 1)
              : 4);
      var oldX = S.x,
        oldY = S.y;
      if (!hit(nx, S.y)) S.x = nx;
      if (!hit(S.x, ny)) S.y = ny;
      if (S.driving)
        S.driveDistance += Math.hypot(S.x - oldX, S.y - oldY);
      S.ph += 0.3;
      adv(0.0015);
      var ta = Math.atan2(dy, dx);
      S.face +=
        Math.atan2(Math.sin(ta - S.face), Math.cos(ta - S.face)) * 0.3;
    }
    var cx = Math.max(0, Math.min(W - vw, S.x - vw / 2)),
      cy = Math.max(0, Math.min(H - vh, S.y - vh / 2));
    camX = cx;
    camY = cy;
    if (!paused) npcStep();
    if (!paused)
      for (var ri = DR.length - 1; ri >= 0; ri--)
        if (Math.hypot(DR[ri].x - S.x, DR[ri].y - S.y) < 34) {
          var rd = DR.splice(ri, 1)[0];
          S.cash += rd.v;
          pop("+$" + rd.v, "#7dff7d");
          sfx("coin");
          if (rd.gem) say("You found a rare gem worth $" + rd.v + "!");
        }
    g.save();
    g.scale(zoom, zoom);
    g.translate(-cx, -cy);
    world();
    NP.forEach(drawNpc);
    player(S.x, S.y, !!(dx || dy));
    ambient();
    g.restore();
    sky(cx, cy);
    tint(cx, cy);
    lights(cx, cy);
    cityWeather(cx, cy);
    vignette();
    mini();
    var n = paused ? null : nearby();
    if (n && S.driving) {
      if (parkHint !== n) {
        parkHint = n;
        say("Park (🅿️ or C) to go inside " + n.n + ".");
      }
    } else if (!n) parkHint = null;
    if (n && !S.driving) enter(n);
    else if (!paused)
      for (var q = 0; q < NP.length; q++)
        if (
          !NP[q].cop &&
          !NP[q].amb &&
          NP[q].cool <= 0 &&
          Math.hypot(NP[q].x - S.x, NP[q].y - S.y) < 40
        ) {
          talk(NP[q]);
          break;
        }
  }
  drawFx();
  if (flash > 0) {
    g.fillStyle = "rgba(255,0,0," + flash / 48 + ")";
    g.fillRect(0, 0, VW, VH);
    flash--;
  }
  hud();
}
window.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    if (!phn.hidden) {
      phClose();
      return;
    }
    if (!mn.hidden) {
      if (!onTitle) closeMenu();
      return;
    }
    if (!bp.hidden) {
      bp.hidden = true;
      paused = false;
      return;
    }
    if (S.in) {
      leave();
      return;
    }
    menu(false);
    return;
  }
  if (!mn.hidden || !phn.hidden) return;
  if (e.key === "m" || e.key === "M") {
    menu(false);
    return;
  }
  if (e.key === "i" || e.key === "I") {
    bag();
    return;
  }
  if (e.key === "p" || e.key === "P") {
    phone("home");
    return;
  }
  if ((e.key === "c" || e.key === "C") && !S.in && !paused) {
    toggleDrive();
    return;
  }
  if (!S.in && !paused && !e.ctrlKey && !e.metaKey && !e.altKey) {
    if (e.key === "+" || e.key === "=") {
      zoomBy(e.repeat ? 1.05 : 1.25);
      return;
    }
    if (e.key === "-" || e.key === "_") {
      zoomBy(e.repeat ? 0.95 : 0.8);
      return;
    }
    if (e.key === "0") {
      setZoom(zDef);
      return;
    }
  }
  if (S.in) return;
  keys[e.key] = true;
  if (e.key.indexOf("Arrow") === 0) e.preventDefault();
});
window.addEventListener("keyup", function (e) {
  keys[e.key] = false;
});
[
  ["bu", "u"],
  ["bd", "d"],
  ["bl", "l"],
  ["br", "r"],
].forEach(function (p) {
  var el = document.getElementById(p[0]);
  el.addEventListener("pointerdown", function (e) {
    e.preventDefault();
    held[p[1]] = true;
  });
  ["pointerup", "pointerleave", "pointercancel"].forEach(function (t) {
    el.addEventListener(t, function () {
      held[p[1]] = false;
    });
  });
});
document.getElementById("menub").onclick = function () {
  menu(false);
};
document.getElementById("bagb").onclick = bag;
var carb = document.getElementById("carb"),
  parkHint = null;
function toggleDrive() {
  if (!S.vehicle) return;
  S.driving = !S.driving;
  parkHint = null;
  say(S.driving ? "Back on the road." : "Parked. You're on foot.");
  save();
}
carb.onclick = toggleDrive;
// Keep the park/drive button in sync with the garage state.
setInterval(function () {
  carb.hidden = !S.vehicle;
  carb.textContent = S.driving ? "🅿️" : "🚗";
  carb.setAttribute(
    "aria-label",
    S.driving ? "Park your vehicle" : "Drive your vehicle",
  );
}, 250);
document.getElementById("phb").onclick = function () {
  phone("home");
};
var sc = 1,
  roomS = 1,
  roomX = 0,
  roomY = 0,
  pu = 1,
  SA = { t: 0, r: 0, b: 0, l: 0 },
  ZMIN = 0.4,
  ZMAX = 2.5,
  ZK = "stickCityZoom",
  zDef =
    Math.min(window.innerWidth, window.innerHeight) < 600 ? 1.3 : 1,
  zoom = zDef,
  zoomT = zDef,
  vw = VW,
  vh = VH,
  zT1,
  zT2;
try {
  var zs = parseFloat(localStorage.getItem(ZK));
  if (zs > 0) zoom = zoomT = zs;
} catch (e) {}
function clampZ(z) {
  return Math.max(ZMIN, Math.min(ZMAX, z));
}
function setView() {
  vw = VW / zoom;
  vh = VH / zoom;
}
function readSafe() {
  var cs = getComputedStyle(document.getElementById("sa"));
  SA.t = parseFloat(cs.paddingTop) || 0;
  SA.r = parseFloat(cs.paddingRight) || 0;
  SA.b = parseFloat(cs.paddingBottom) || 0;
  SA.l = parseFloat(cs.paddingLeft) || 0;
}
function fit() {
  var vv = window.visualViewport,
    iw = (vv && vv.scale === 1 && vv.width) || window.innerWidth || 800,
    ih =
      (vv && vv.scale === 1 && vv.height) || window.innerHeight || 520,
    a = iw / ih;
  VH = 520;
  VW = Math.round(VH * a);
  if (VW < 640) {
    VW = 640;
    VH = Math.round(VW / a);
  }
  sc = Math.min(3, (ih * (window.devicePixelRatio || 1)) / VH);
  if (cv.width !== Math.round(VW * sc)) cv.width = Math.round(VW * sc);
  if (cv.height !== Math.round(VH * sc))
    cv.height = Math.round(VH * sc);
  roomS = Math.min(1, VW / 800);
  roomX = (VW - 800 * roomS) / 2;
  roomY = (VH - 520 * roomS) / 2;
  if (iw <= 560)
    roomY = Math.max(
      0,
      Math.min(roomY, VH * 0.48 - (72 * VH) / ih - 520 * roomS - 10),
    );
  pu = VW / iw;
  pausedFrames = 0;
  readSafe();
  ZMIN = Math.max(0.4, VW / W, VH / H);
  zoomT = clampZ(zoomT);
  zoom = clampZ(zoom);
  setView();
  document.documentElement.style.setProperty(
    "--ovl",
    ((roomX + 350 * roomS) / VW) * 100 + "%",
  );
}
window.addEventListener("resize", fit);
if (window.visualViewport)
  window.visualViewport.addEventListener("resize", fit);
window.addEventListener("orientationchange", function () {
  setTimeout(fit, 250);
});
fit();
var zin = document.getElementById("zin"),
  zout = document.getElementById("zout"),
  zl = document.getElementById("zl");
function setZoom(z, now) {
  zoomT = clampZ(z);
  if (now) {
    zoom = zoomT;
    setView();
  }
  zl.textContent = Math.round(zoomT * 100) + "%";
  zl.classList.add("on");
  zin.style.opacity = zoomT >= ZMAX - 0.001 ? 0.45 : "";
  zout.style.opacity = zoomT <= ZMIN + 0.001 ? 0.45 : "";
  clearTimeout(zT1);
  zT1 = setTimeout(function () {
    zl.classList.remove("on");
  }, 900);
  clearTimeout(zT2);
  zT2 = setTimeout(function () {
    try {
      localStorage.setItem(ZK, String(zoomT));
    } catch (e) {}
  }, 400);
}
function zoomBy(f) {
  if (!S.in && !paused) setZoom(zoomT * f);
}
zin.onclick = function () {
  zoomBy(1.25);
};
zout.onclick = function () {
  zoomBy(0.8);
};
cv.addEventListener(
  "wheel",
  function (e) {
    e.preventDefault();
    var d =
      e.deltaY * (e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? 400 : 1);
    if (!S.in && !paused)
      setZoom(zoomT * Math.exp(-d * (e.ctrlKey ? 0.01 : 0.0012)));
  },
  { passive: false },
);
var ptr = {},
  pinch = null;
function pdist() {
  var k = Object.keys(ptr);
  if (k.length < 2) return 0;
  return Math.hypot(
    ptr[k[0]].x - ptr[k[1]].x,
    ptr[k[0]].y - ptr[k[1]].y,
  );
}
cv.addEventListener("pointerdown", function (e) {
  if (e.pointerType === "mouse") return;
  ptr[e.pointerId] = { x: e.clientX, y: e.clientY };
  if (Object.keys(ptr).length === 2)
    pinch = { d: pdist() || 1, z: zoomT };
});
cv.addEventListener("pointermove", function (e) {
  var q = ptr[e.pointerId];
  if (!q) return;
  q.x = e.clientX;
  q.y = e.clientY;
  if (pinch && !S.in && !paused)
    setZoom(pinch.z * (pdist() / pinch.d), true);
});
function pend(e) {
  delete ptr[e.pointerId];
  if (Object.keys(ptr).length < 2) pinch = null;
}
cv.addEventListener("pointerup", pend);
cv.addEventListener("pointercancel", pend);
["gesturestart", "gesturechange", "gestureend"].forEach(function (t) {
  document.addEventListener(
    t,
    function (e) {
      if (!(e.target.closest && e.target.closest(".screen,.ov")))
        e.preventDefault();
    },
    { passive: false },
  );
});
function release() {
  keys = {};
  held = {};
}
window.addEventListener("blur", release);
document.addEventListener("visibilitychange", function () {
  if (document.hidden) release();
});
var lastT = 0,
  pausedFrames = 0,
  fAcc = 0,
  STEP = 1000 / 60;
function frame(now) {
  requestAnimationFrame(frame);
  if (!lastT) lastT = now;
  fAcc = Math.min(fAcc + (now - lastT), STEP * 3);
  lastT = now;
  if (fAcc < STEP - 2) return;
  fAcc -= STEP;
  // While a menu is open the scene is frozen, so stop redrawing it
  // after it settles; this keeps the main thread free for the menus.
  if (paused) {
    if (pausedFrames > 2 && !shake && !flash) return;
    pausedFrames++;
  } else pausedFrames = 0;
  loop();
}
// Startup runs last, once every file has loaded.
genDrops();
say("Welcome to Stick City. You have $100 and a dream.");
menu(true);
requestAnimationFrame(frame);
