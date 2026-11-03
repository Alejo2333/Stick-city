var bp = document.getElementById("bp");
function bag() {
  if (!bp.hidden) {
    bp.hidden = true;
    paused = false;
    return;
  }
  keys = {};
  held = {};
  paused = true;
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
      if (m.heal) {
        S.inv[id]--;
        S.en = Math.min(MAXE, S.en + m.heal);
        say("You used a " + m.n.toLowerCase() + ".");
      } else S.wpn = id;
      save();
      bp.hidden = true;
      bag();
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
    bp.hidden = true;
    paused = false;
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
  var bf = bp.querySelector("button:not(:disabled)");
  if (bf) bf.focus();
}
var sayT;
function say(m) {
  var l = document.getElementById("log");
  l.textContent = m;
  if (m) {
    l.classList.remove("pop");
    void l.offsetWidth;
    l.classList.add("pop");
  }
  clearTimeout(sayT);
  if (m)
    sayT = setTimeout(function () {
      l.textContent = "";
    }, 6000);
}
