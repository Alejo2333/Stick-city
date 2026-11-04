// The phone's Investments app: every holding in one place, with a page per asset
// for buying and selling. Prices and trades come from systems/market.js.
var investKey = "";
function investMoney(n) {
  var abs = Math.abs(n);
  return (
    (n < 0 ? "-$" : "$") +
    (abs >= 1000 ? Math.round(abs).toLocaleString("en-US") : fmtPx(abs))
  );
}
function investDelta(n, pct) {
  return (
    '<span class="' +
    (n >= 0 ? "up" : "dn") +
    '">' +
    (n >= 0 ? "▲" : "▼") +
    (pct ? Math.abs(n) + "%" : investMoney(Math.abs(n))) +
    "</span>"
  );
}
function investStats(k) {
  var units = S.hold[k] || 0,
    price = S.px[k],
    value = units * price,
    paid = S.cost[k] || 0,
    gain = value - paid;
  return {
    units: units,
    value: value,
    paid: paid,
    gain: gain,
    gainPct: paid ? Math.round((gain / paid) * 1000) / 10 : 0,
    today: units * (price - (S.pp[k] || price)),
  };
}
function investRow(a) {
  var k = a[0],
    st = investStats(k);
  return (
    '<button class="inv-row" data-a="invOpen" data-v="' +
    k +
    '"><span class="inv-ic">' +
    a[1] +
    "</span><span><b>" +
    esc(a[2]) +
    "</b><small>" +
    (st.units
      ? st.units.toLocaleString("en-US") + " × $" + pcPrice(S.px[k])
      : "$" + pcPrice(S.px[k])) +
    '</small></span><span class="inv-end"><b>' +
    (st.units ? investMoney(st.value) : "") +
    "</b><small>" +
    (st.units ? investDelta(st.gain) + " total" : investDelta(pxChange(k), true) + " today") +
    "</small></span></button>"
  );
}
function investPage() {
  var owned = AS.filter(function (a) {
      return S.hold[a[0]];
    }).sort(function (a, b) {
      return investStats(b[0]).value - investStats(a[0]).value;
    }),
    total = 0,
    paid = 0,
    today = 0;
  owned.forEach(function (a) {
    var st = investStats(a[0]);
    total += st.value;
    paid += st.paid;
    today += st.today;
  });
  function others(crypto, title) {
    var rows = AS.filter(function (a) {
      return !S.hold[a[0]] && !!a[3] === crypto;
    });
    return rows.length
      ? '<div class="card"><b>' + title + "</b>" + rows.map(investRow).join("") + "</div>"
      : "";
  }
  return (
    '<div class="card"><small>Portfolio value</small><div class="inv-total">' +
    investMoney(total) +
    "</div>" +
    '<div class="inv-sum"><span>Today<br>' +
    investDelta(today) +
    "</span><span>Total gain<br>" +
    investDelta(total - paid) +
    "</span><span>Cash<br><b>" +
    investMoney(S.cash) +
    "</b></span></div></div>" +
    '<div class="card"><b>Your holdings</b>' +
    (owned.length
      ? owned.map(investRow).join("")
      : "<div>You don't own anything yet. Pick a stock or coin below to get started.</div>") +
    "</div>" +
    others(false, "Stocks to buy") +
    others(true, "Coins to buy")
  );
}
function investDetail() {
  var a = AS.filter(function (asset) {
      return asset[0] === investKey;
    })[0],
    k = a[0],
    px = S.px[k],
    st = investStats(k),
    half = Math.ceil(st.units / 2),
    news = S.news.filter(function (line) {
      return line.indexOf(a[2]) >= 0;
    });
  return (
    '<div class="card"><b>' +
    a[1] +
    " " +
    esc(a[2]) +
    '</b><div class="inv-total">$' +
    pcPrice(px) +
    "</div>" +
    investDelta(pxChange(k), true) +
    " today" +
    priceChart(k) +
    "</div>" +
    (news.length
      ? '<div class="card note"><b>📰 News</b><br>' + news.map(esc).join("<br>") + "</div>"
      : "") +
    (st.units
      ? '<div class="card"><b>Your position</b><div class="inv-sum"><span>Owned<br><b>' +
        st.units.toLocaleString("en-US") +
        "</b></span><span>Value<br><b>" +
        investMoney(st.value) +
        "</b></span><span>Avg paid<br><b>$" +
        pcPrice(st.paid / st.units) +
        '</b></span></div><div class="inv-sum"><span>Today<br>' +
        investDelta(st.today) +
        "</span><span>Total gain<br>" +
        investDelta(st.gain) +
        "</span><span>Return<br>" +
        investDelta(st.gainPct, true) +
        "</span></div></div>"
      : "") +
    '<div class="card"><b>Buy</b> · ' +
    investMoney(S.cash) +
    ' cash<div class="rw">' +
    pb("buy", k + ":1", "1", "g", S.cash < px) +
    pb("buy", k + ":10", "10", "g", S.cash < px * 10) +
    pb("buy", k + ":100", "100", "g", S.cash < px * 100) +
    pb("buy", k + ":max", "Max", "g", S.cash < px) +
    '</div><b>Sell</b><div class="rw">' +
    pb("sell", k + ":1", "1", "r", !st.units) +
    pb("sell", k + ":" + half, "Half", "r", !st.units) +
    pb("sell", k, "All", "r", !st.units) +
    "</div></div>"
  );
}
PA.invOpen = function (k) {
  investKey = k;
  pv = "invd";
};
