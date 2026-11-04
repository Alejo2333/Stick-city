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
    if (motionOk)
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
    setTalk(null);
    room();
  } else {
    var dx = 0,
      dy = 0;
    if (keys.ArrowLeft || keys.a) dx--;
    if (keys.ArrowRight || keys.d) dx++;
    if (keys.ArrowUp || keys.w) dy--;
    if (keys.ArrowDown || keys.s) dy++;
    // Keys win over the joystick, whose vector is analog (length 0..1).
    if (!dx && !dy && held.x !== undefined) {
      dx = held.x;
      dy = held.y;
    }
    if (dx || dy) {
      var L = Math.hypot(dx, dy),
        m = Math.min(1, L),
        spd =
          m *
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
        nx = S.x + (dx / L) * spd,
        ny = S.y + (dy / L) * spd;
      var oldX = S.x,
        oldY = S.y;
      if (!hit(nx, S.y)) S.x = nx;
      if (!hit(S.x, ny)) S.y = ny;
      if (S.driving)
        S.driveDistance += Math.hypot(S.x - oldX, S.y - oldY);
      S.ph += 0.3 * m;
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
    var near = null;
    if (n && !S.driving) enter(n);
    else if (!paused)
      for (var q = 0; q < NP.length; q++)
        if (
          !NP[q].cop &&
          !NP[q].amb &&
          NP[q].cool <= 0 &&
          Math.hypot(NP[q].x - S.x, NP[q].y - S.y) < 40
        ) {
          near = NP[q];
          break;
        }
    setTalk(near);
  }
  drawFx();
  if (flash > 0) {
    if (motionOk) {
      g.fillStyle = "rgba(255,0,0," + flash / 48 + ")";
      g.fillRect(0, 0, VW, VH);
    }
    flash--;
  }
  hud();
}
window.addEventListener("keydown", function (e) {
  if (
    e.target &&
    (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) ||
      e.target.isContentEditable) &&
    e.key !== "Escape"
  )
    return;
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
      bagClose();
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
  var key = keyName(e);
  if (key === "m") {
    sfx("click");
    menu(false);
    return;
  }
  if (key === "i") {
    sfx("click");
    bag();
    return;
  }
  if (key === "p") {
    sfx("click");
    phone("home");
    return;
  }
  if (key === "c" && !S.in && !paused) {
    toggleDrive();
    return;
  }
  if (key === "e" && !e.repeat && talkTarget && !paused) {
    talkNow();
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
  keys[key] = true;
  if (e.key.indexOf("Arrow") === 0) e.preventDefault();
});
window.addEventListener("keyup", function (e) {
  keys[keyName(e)] = false;
});
// Letters are tracked in lowercase: Shift or Caps Lock can change e.key between
// press and release, which would otherwise leave a key stuck down.
function keyName(e) {
  var k = e.key || "";
  return k.length === 1 ? k.toLowerCase() : k;
}
// Floating joystick: touch anywhere in the lower-left zone to drop the
// stick there, then drag. How far you push sets the walking speed.
// It writes {x, y} into `held`, which menus already clear with held = {}.
var joy = document.getElementById("joy"),
  joyB = joy.firstElementChild,
  joyK = joyB.firstElementChild,
  joyId = null,
  joyX = 0,
  joyY = 0,
  JOYR = 48,
  JOYDZ = 0.18;
function joyMove(e) {
  var ox = e.clientX - joyX,
    oy = e.clientY - joyY,
    d = Math.hypot(ox, oy);
  if (d > JOYR) {
    ox *= JOYR / d;
    oy *= JOYR / d;
    d = JOYR;
  }
  joyK.style.transform = "translate(" + ox + "px," + oy + "px)";
  var m = d / JOYR;
  if (m < JOYDZ) {
    held = { x: 0, y: 0 };
    return;
  }
  // Rescale past the dead zone so a light push still starts at 0.
  var k = (m - JOYDZ) / (1 - JOYDZ) / m;
  held = { x: (ox / JOYR) * k, y: (oy / JOYR) * k };
}
function joyEnd(e) {
  if (e && e.pointerId !== joyId) return;
  joyId = null;
  held = {};
  joy.classList.remove("on");
  joyB.style.left = joyB.style.top = joyK.style.transform = "";
}
joy.addEventListener("pointerdown", function (e) {
  if (joyId !== null || paused) return;
  e.preventDefault();
  joyId = e.pointerId;
  joy.setPointerCapture(e.pointerId);
  var r = joy.getBoundingClientRect(),
    pad = JOYR + 12;
  joyX = Math.max(r.left + pad, Math.min(r.right - pad, e.clientX));
  joyY = Math.max(r.top + pad, Math.min(r.bottom - pad, e.clientY));
  joyB.style.left = joyX - r.left + "px";
  joyB.style.top = joyY - r.top + "px";
  joy.classList.add("on");
  joyMove(e);
});
joy.addEventListener("pointermove", function (e) {
  if (e.pointerId === joyId) joyMove(e);
});
// Entering a building hides the zone, which drops capture and lands here.
["pointerup", "pointercancel", "lostpointercapture"].forEach(function (t) {
  joy.addEventListener(t, joyEnd);
});
document.getElementById("menub").onclick = function () {
  sfx("click");
  menu(false);
};
var rewb = document.getElementById("rewb");
rewb.onclick = function () {
  sfx("click");
  menu(false);
  rewindScreen();
};
document.getElementById("bagb").onclick = function () {
  sfx("click");
  bag();
};
var carb = document.getElementById("carb"),
  phb = document.getElementById("phb"),
  phBadge = document.createElement("b"),
  phUnread = 0,
  parkHint = null;
phBadge.className = "mail-badge fab-badge";
phBadge.hidden = true;
phBadge.setAttribute("aria-hidden", "true");
phb.appendChild(phBadge);
function toggleDrive() {
  if (!S.vehicle) return;
  sfx("click");
  S.driving = !S.driving;
  parkHint = null;
  say(S.driving ? "Back on the road." : "Parked. You're on foot.");
  save();
  syncFab();
}
carb.onclick = toggleDrive;
// Keep the floating buttons in sync with the garage and the inbox.
function syncFab() {
  rewb.hidden = !citizenOn;
  carb.hidden = !S.vehicle;
  carb.textContent = S.driving ? "🅿️" : "🚗";
  carb.setAttribute(
    "aria-label",
    S.driving ? "Park your vehicle" : "Drive your vehicle",
  );
  var n = unreadMailCount();
  if (n === phUnread) return;
  phBadge.hidden = !n;
  phBadge.textContent = n > 9 ? "9+" : n;
  phb.setAttribute("aria-label", n ? "Phone, " + n + " unread" : "Phone");
  if (n > phUnread) {
    phb.classList.remove("fab-bump");
    void phb.offsetWidth;
    phb.classList.add("fab-bump");
  }
  phUnread = n;
}
setInterval(syncFab, 250);
phb.onclick = function () {
  sfx("click");
  phone("home");
};
// Talking is a choice, so walking past someone doesn't interrupt the player.
var talkb = document.getElementById("talkb"),
  talkTarget = null,
  talkTouch = matchMedia("(pointer: coarse)").matches;
function setTalk(n) {
  if (talkTarget === n) return;
  talkTarget = n;
  talkb.hidden = !n;
  if (n)
    talkb.textContent =
      "💬 Talk to " + n.name + (talkTouch ? "" : " (E)");
}
function talkNow() {
  var n = talkTarget;
  if (!n) return;
  setTalk(null);
  sfx("click");
  talk(n);
}
talkb.onclick = talkNow;
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
  joyEnd();
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
lifeBoot();
if (!S.life.created)
  say("Welcome to Stick City. Start a life story or continue an existing save.");
menu(true);
rewindResume();
requestAnimationFrame(frame);
