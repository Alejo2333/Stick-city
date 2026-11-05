// Shared UI pieces for phone apps (HTML strings) and menu screens (DOM).
var KIT_BACKS = ["#ffd9c7", "#cfe8ff", "#d8f3dc", "#ffe6a7", "#e6d9ff", "#ffd6e5"],
  KIT_SHIRTS = ["#e4572e", "#2f6fe4", "#2a9d6f", "#8e44ad", "#d81f55", "#e7a008", "#14919b"],
  KIT_HAIR = ["#2b211c", "#5a3a22", "#a8652a", "#d9a441", "#7a2e2e", "#6b7280", "#1f3a5f"];

// A stable number from any text, so generated details never change between loads.
function kitHash(text) {
  var h = 2166136261;
  text = String(text);
  for (var i = 0; i < text.length; i++)
    h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}
function kitPick(list, seed, salt) {
  return list[kitHash(seed + ":" + salt) % list.length];
}
function kitHairShape(style, color) {
  var shapes = [
    '<path d="M31 37a19 19 0 0 1 38 0c-8-7-28-7-38 0z" fill="' + color + '"/>',
    '<path d="M29 58V38a21 21 0 0 1 42 0v20l-7-3V38c-8-6-20-6-28 0v17z" fill="' + color + '"/>',
    '<g fill="' + color + '"><circle cx="34" cy="28" r="7"/><circle cx="44" cy="22" r="8"/><circle cx="56" cy="22" r="8"/><circle cx="66" cy="28" r="7"/></g>',
    '<g fill="' + color + '"><circle cx="50" cy="13" r="7"/><path d="M31 37a19 19 0 0 1 38 0c-10-6-28-6-38 0z"/></g>',
    '<path d="M31 36l4-14 6 7 5-11 6 10 6-9 4 11 7-4-1 11c-10-7-27-7-37-1z" fill="' + color + '"/>',
    "",
  ];
  return shapes[style];
}
// An original stick-figure portrait. The same seed always draws the same person.
function kitPortrait(seed, cls) {
  var back = kitPick(KIT_BACKS, seed, "back"),
    shirt = kitPick(KIT_SHIRTS, seed, "shirt"),
    hair = kitPick(KIT_HAIR, seed, "hair"),
    style = kitHash(seed + ":style") % 6,
    mouth = [
      "M43 47q7 6 14 0",
      "M44 48q6 3 12 0",
      "M43 45q7 9 14 0z",
    ][kitHash(seed + ":mouth") % 3],
    glasses = kitHash(seed + ":glasses") % 4 === 0;
  return (
    '<svg class="kit-portrait ' +
    (cls || "") +
    '" viewBox="0 0 100 100" aria-hidden="true" focusable="false">' +
    '<rect width="100" height="100" fill="' +
    back +
    '"/>' +
    '<path d="M18 100c2-24 16-36 32-36s30 12 32 36z" fill="' +
    shirt +
    '" stroke="#1b2430" stroke-width="3"/>' +
    '<path d="M50 58v8" stroke="#1b2430" stroke-width="4" stroke-linecap="round"/>' +
    '<circle cx="50" cy="38" r="20" fill="#fff" stroke="#1b2430" stroke-width="3"/>' +
    kitHairShape(style, hair) +
    '<circle cx="43" cy="38" r="2.5" fill="#1b2430"/><circle cx="57" cy="38" r="2.5" fill="#1b2430"/>' +
    (glasses
      ? '<g fill="none" stroke="#1b2430" stroke-width="2"><circle cx="43" cy="38" r="6"/><circle cx="57" cy="38" r="6"/><path d="M49 38h2"/></g>'
      : "") +
    '<path d="' +
    mouth +
    '" fill="none" stroke="#1b2430" stroke-width="2.5" stroke-linecap="round"/>' +
    "</svg>"
  );
}
function kitButton(action, value, label, cls, disabled, ariaLabel) {
  return (
    '<button class="' +
    (cls || "") +
    '" data-a="' +
    action +
    '" data-v="' +
    esc(value === undefined ? "" : value) +
    '"' +
    (ariaLabel ? ' aria-label="' + esc(ariaLabel) + '"' : "") +
    (disabled ? " disabled" : "") +
    ">" +
    label +
    "</button>"
  );
}
function kitChip(text, cls) {
  return '<span class="kit-chip ' + (cls || "") + '">' + esc(text) + "</span>";
}
function kitBar(label, value, max, cls) {
  var shown = Math.max(0, Math.min(max, Math.round(value)));
  return (
    '<div class="kit-bar ' +
    (cls || "") +
    '"><div class="kit-bar-label"><span>' +
    esc(label) +
    "</span><span>" +
    shown +
    "/" +
    max +
    '</span></div><progress max="' +
    max +
    '" value="' +
    shown +
    '" aria-label="' +
    esc(label) +
    '"></progress></div>'
  );
}
// One row of a text-first list: picture, title, detail and an optional action.
function kitRow(action, value, media, title, detail, trailing, disabled) {
  return kitButton(
    action,
    value,
    '<span class="kit-row-media">' +
      media +
      '</span><span class="kit-row-text"><b>' +
      esc(title) +
      "</b><small>" +
      detail +
      '</small></span><span class="kit-row-trail">' +
      (trailing || "›") +
      "</span>",
    "kit-row",
    disabled,
  );
}
function kitEmpty(title, body, actions) {
  return (
    '<div class="kit-empty"><b>' +
    esc(title) +
    "</b><p>" +
    esc(body) +
    "</p>" +
    (actions || "") +
    "</div>"
  );
}
// Small labels for what just changed, such as "+6 Affection".
function kitDeltas(list) {
  return (
    '<div class="kit-deltas">' +
    list
      .map(function (item) {
        return kitChip(item.text, item.good ? "kit-good" : "kit-bad");
      })
      .join("") +
    "</div>"
  );
}
// Asks before a costly or permanent choice. Enter and Escape work as expected.
function kitConfirm(title, body, yesLabel, onYes) {
  var back = document.createElement("div"),
    box = document.createElement("div"),
    heading = document.createElement("h2"),
    text = document.createElement("p"),
    row = document.createElement("div"),
    no = document.createElement("button"),
    yes = document.createElement("button"),
    before = document.activeElement;
  function close() {
    document.removeEventListener("keydown", onKey, true);
    back.remove();
    if (before && before.isConnected) before.focus();
  }
  function onKey(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      close();
    }
  }
  back.className = "kit-confirm-back";
  box.className = "kit-confirm";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-modal", "true");
  box.setAttribute("aria-label", title);
  heading.textContent = title;
  text.textContent = body;
  row.className = "kit-confirm-row";
  no.textContent = "Cancel";
  no.className = "kit-confirm-no";
  yes.textContent = yesLabel;
  yes.className = "kit-confirm-yes";
  no.onclick = function () {
    sfx("click");
    close();
  };
  yes.onclick = function () {
    close();
    onYes();
  };
  row.appendChild(no);
  row.appendChild(yes);
  box.appendChild(heading);
  box.appendChild(text);
  box.appendChild(row);
  back.appendChild(box);
  document.body.appendChild(back);
  document.addEventListener("keydown", onKey, true);
  no.focus();
}
// Turns a kit HTML string into an element for menu screens.
function kitNode(html) {
  var holder = document.createElement("div");
  holder.innerHTML = html;
  return holder.firstChild;
}
// A menu screen row: icon, title, detail and an optional price or status.
function kitMenuItem(d, o) {
  var b = mbtn(d, o.icon, "", o.onClick),
    text = b.lastChild,
    title = document.createElement("b"),
    detail = document.createElement("small");
  b.classList.add("ms-item");
  title.textContent = o.title.charAt(0).toUpperCase() + o.title.slice(1);
  detail.textContent = o.detail || "";
  text.appendChild(title);
  text.appendChild(detail);
  if (o.trail) {
    var trail = document.createElement("em");
    trail.textContent = o.trail;
    b.appendChild(trail);
  }
  b.disabled = !!o.disabled;
  return b;
}
function kitMenuHeading(d, text) {
  var heading = document.createElement("h2");
  heading.className = "ms-heading";
  heading.textContent = text;
  d.appendChild(heading);
}
