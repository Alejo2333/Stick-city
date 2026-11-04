var bp = document.getElementById("bp");
function bagClose() {
  closeFx(bp);
  bp.hidden = true;
  paused = false;
}
function bag() {
  if (!bp.hidden) return bagClose();
  keys = {};
  held = {};
  paused = true;
  bagRender();
}
function bagRender() {
  var place = bp.hidden ? null : holdPlace(bp);
  bp.innerHTML = "";
  var panel = document.createElement("div");
  panel.className = "screen-panel";
  keepStill(bp, panel, "bag");
  bp.appendChild(panel);
  var ttl = document.createElement("h1");
  ttl.textContent = "🎒 Backpack";
  panel.appendChild(ttl);
  var h = document.createElement("p");
  h.textContent =
    "Backpack. Fight power: " +
    (S.str + wp()) +
    (S.wpn && S.inv[S.wpn]
      ? " (" + ITEMS[S.wpn].n + " equipped)"
      : " (unarmed)") +
    (S.partner ? ". Partner: " + S.partner : "") +
    ".";
  panel.appendChild(h);
  var d = document.createElement("div");
  d.className = "menu";
  var any = 0;
  Object.keys(ITEMS).forEach(function (id) {
    var c = S.inv[id] || 0;
    if (!c) return;
    any = 1;
    var m = ITEMS[id],
      b = document.createElement("button"),
      ic = document.createElement("span"),
      tx = document.createElement("span");
    ic.className = "ico";
    ic.textContent = m.i;
    tx.textContent =
      m.n +
      " ×" +
      c +
      (m.heal
        ? " – tap to use (+" + m.heal + " HP)"
        : m.w
          ? S.wpn === id
            ? " – equipped"
            : " – tap to equip"
          : " – a gift for someone you like");
    b.appendChild(ic);
    b.appendChild(tx);
    b.disabled = !(m.heal || m.w);
    b.onclick = function () {
      sfx(m.heal ? "up" : "click");
      if (m.heal) {
        S.inv[id]--;
        S.en = Math.min(MAXE, S.en + m.heal);
        say("You used a " + m.n.toLowerCase() + ".");
      } else S.wpn = id;
      save();
      bagRender();
    };
    d.appendChild(b);
  });
  var x = document.createElement("button"),
    xi = document.createElement("span"),
    xt = document.createElement("span");
  xi.className = "ico";
  xi.textContent = "⬅️";
  xt.textContent = "Back to game";
  x.appendChild(xi);
  x.appendChild(xt);
  x.onclick = function () {
    sfx("click");
    bagClose();
  };
  d.appendChild(x);
  if (!any) {
    var e = document.createElement("p");
    e.textContent =
      "Nothing yet. Try the Corner Store or the Pawn Shop.";
    panel.appendChild(e);
  }
  panel.appendChild(d);
  bp.hidden = false;
  if (place) return place();
  var bf = bp.querySelector("button:not(:disabled)");
  if (bf) bf.focus();
}
var sayT,
  sayQ = [],
  sayUntil = 0,
  SAY_MIN = 1800,
  SAY_LONG = 6000;
function say(m) {
  if (!m) {
    sayQ = [];
    sayUntil = 0;
    clearTimeout(sayT);
    var l = document.getElementById("log");
    l.classList.remove("out");
    l.textContent = "";
    return;
  }
  // A message stays up long enough to read. Only the newest one waits, so a
  // burst of updates can't play out stale news afterwards.
  var wait = sayUntil - Date.now();
  if (wait <= 0) return sayShow(m);
  sayQ = [m];
  clearTimeout(sayT);
  sayT = setTimeout(sayNext, wait);
}
function sayShow(m) {
  var l = document.getElementById("log");
  l.classList.remove("out", "pop");
  l.textContent = m;
  void l.offsetWidth;
  l.classList.add("pop");
  sayUntil = Date.now() + SAY_MIN;
  clearTimeout(sayT);
  sayT = setTimeout(sayNext, sayQ.length ? SAY_MIN : SAY_LONG);
}
function sayNext() {
  if (sayQ.length) return sayShow(sayQ.shift());
  var l = document.getElementById("log");
  l.classList.remove("pop");
  l.classList.add("out");
  sayT = setTimeout(function () {
    l.classList.remove("out");
    l.textContent = "";
  }, 220);
}
