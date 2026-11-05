// The Marketplace: things to buy, own, use, rent out and sell. The catalog is
// LIFE_SHOP in data/lifesim.js; what you own is saved in S.life.owned.
var SHOP_CONFIRM_FROM = 1000,
  SHOP_FAKE_VALUE = 0.05,
  SHOP_APPRAISAL = 30,
  shopTab = LIFE_SHOP[0].id;

function shopItem(key) {
  for (var i = 0; i < LIFE_SHOP.length; i++) {
    var found = LIFE_SHOP[i].items.filter(function (item) {
      return item.key === key;
    })[0];
    if (found) return found;
  }
  return null;
}
function shopVehicle(key) {
  return VEHICLES.filter(function (vehicle) {
    return vehicle[0] === key;
  })[0];
}
function shopVehicleValue(key) {
  var vehicle = shopVehicle(key);
  return vehicle ? Math.round(vehicle[2] * (1 - lifeVehicleWear(key))) : 0;
}
// An unappraised fake still looks like what you paid for it.
function shopValue(owned) {
  return owned.fake && !owned.known ? owned.paid : owned.value;
}
function shopWorth() {
  if (!S.life || !Array.isArray(S.life.owned)) return 0;
  return S.life.owned.reduce(function (total, owned) {
    return total + shopValue(owned);
  }, 0);
}
function shopOwned(id) {
  return S.life.owned.filter(function (owned) {
    return owned.id === id;
  })[0];
}
function shopHas(key) {
  return S.life.owned.some(function (owned) {
    return owned.key === key;
  });
}
function shopYearly(item) {
  return (
    (item.upkeep ? fmtCash(item.upkeep) + "/yr upkeep" : "") +
    (item.upkeep && item.rent ? " · " : "") +
    (item.rent ? "rents for " + fmtCash(item.rent) + "/yr" : "")
  );
}
// Why this can't be bought right now, or "" if it can.
function shopBlocked(item) {
  if (S.life.prisonYears > 0) return "Not available in prison";
  var age = item.age === undefined ? 18 : item.age;
  if (S.age < age) return "Available from age " + age;
  if (item.license === "boat" && !S.life.licenses.boat) return "Needs a boating license";
  if (item.license === "pilot" && !S.life.licenses.pilot) return "Needs a pilot license";
  if (S.cash < item.price) return "Needs " + fmtCash(item.price);
  return "";
}
function shopDeltas(effect, cost) {
  var names = {
      happiness: "Happiness",
      health: "Health",
      smarts: "Smarts",
      charisma: "Charisma",
      strength: "Strength",
      looks: "Looks",
      karma: "Karma",
      relationship: "Relationship",
    },
    list = [];
  Object.keys(names).forEach(function (key) {
    if (effect && effect[key])
      list.push({
        text: (effect[key] > 0 ? "+" : "") + effect[key] + " " + names[key],
        good: effect[key] > 0,
      });
  });
  if (cost) list.push({ text: "-" + fmtCash(cost), good: false });
  return list;
}
function shopResult(title, story, deltas, back) {
  cityScreen(
    title,
    story,
    function (d) {
      if (deltas.length) d.appendChild(kitNode(kitDeltas(deltas)));
    },
    back,
  );
}
function shopBuy(item) {
  function buy() {
    if (shopBlocked(item) || !citySpend(item.price)) return;
    if (item.type === "vehicle") {
      S.garage[item.key] = 1;
      S.life.vehicleAges[item.key] = 0;
      if (!S.vehicle) S.vehicle = item.key;
      syncFab();
    } else {
      S.life.ownedNext++;
      var owned = {
        id: "own-" + S.life.ownedNext,
        key: item.key,
        paid: item.price,
        value: Math.round(item.price * (item.resale || 1)),
        age: 0,
        rented: 0,
      };
      if (item.fakeChance) {
        var fake = withFate("fake:" + S.day + ":" + owned.id, function () {
          return Math.random() < item.fakeChance;
        });
        if (fake) {
          owned.fake = 1;
          owned.value = Math.round(item.price * SHOP_FAKE_VALUE);
        }
      }
      S.life.owned.push(owned);
    }
    lifeNote("Bought " + item.name + " for " + fmtCash(item.price) + ".", "finance");
    say("You bought " + item.name + "!");
    sfx("spend");
    save();
    lifeShopScreen();
  }
  if (item.price >= SHOP_CONFIRM_FROM)
    kitConfirm(
      "Buy " + item.name + "?",
      "This costs " +
        fmtCash(item.price) +
        ". You have " +
        fmtCash(S.cash) +
        "." +
        (item.upkeep ? " Upkeep is " + fmtCash(item.upkeep) + " a year." : ""),
      "Buy it",
      buy,
    );
  else buy();
}
function shopLottery(item) {
  var prize = withFate("lottery:" + S.day + ":" + item.key, function () {
    var total = 0;
    for (var i = 0; i < item.tickets; i++) {
      var roll = Math.random();
      if (roll < 0.00005) total += 100000;
      else if (roll < 0.00505) total += 500;
      else if (roll < 0.05505) total += 25;
    }
    return total;
  });
  S.cash += prize;
  return prize;
}
function shopUseService(item) {
  function use() {
    if (shopBlocked(item) || S.life.serviceYears[item.key] === S.life.year) return;
    if (!citySpend(item.price)) return;
    S.life.serviceYears[item.key] = S.life.year;
    var effect = item.effect || {},
      story = item.story,
      prize = 0;
    if (item.tickets) {
      prize = shopLottery(item);
      story = prize
        ? "Your numbers came up. You won " + fmtCash(prize) + "!"
        : "No winners this time. The tickets make decent bookmarks.";
    } else if (item.risk) {
      var bad = withFate("risk:" + S.day + ":" + item.key, function () {
        return Math.random() < item.risk.chance;
      });
      if (bad) {
        effect = item.risk.effect;
        story = item.risk.story;
      }
    }
    lifeApplyEventEffect(effect);
    lifeNote(story, "activity");
    sfx(prize ? "coin" : "spend");
    save();
    var deltas = shopDeltas(effect, item.price);
    if (prize) deltas.unshift({ text: "+" + fmtCash(prize), good: true });
    shopResult(item.icon + " " + shopTitle(item.name), story, deltas, lifeShopScreen);
  }
  if (item.price >= SHOP_CONFIRM_FROM)
    kitConfirm(
      item.name + "?",
      "This costs " + fmtCash(item.price) + ". You have " + fmtCash(S.cash) + ".",
      "Go ahead",
      use,
    );
  else use();
}
function shopToggleSub(item) {
  if (S.life.subs[item.key]) {
    delete S.life.subs[item.key];
    lifeNote("Stopped paying for " + item.name + ".", "finance");
  } else {
    if (shopBlocked(item) || !citySpend(item.price)) return;
    S.life.subs[item.key] = 1;
    lifeApplyEventEffect(item.effect);
    lifeNote("Started paying for " + item.name + ".", "finance");
    sfx("spend");
  }
  save();
  lifeShopScreen();
}
function shopBuyLicense(kind) {
  var pilot = kind === "pilot";
  if (S.life.prisonYears > 0) return;
  if (pilot) {
    if (S.life.licenses.lessonYear === S.life.year || !citySpend(LICENSE_LESSON)) return;
    S.life.licenses.lessonYear = S.life.year;
    S.life.licenses.lessons = (S.life.licenses.lessons || 0) + 1;
    if (S.life.licenses.lessons >= PILOT_LESSONS) {
      S.life.licenses.pilot = 1;
      lifeNote("Earned a pilot license.", "milestone");
      say("You earned your pilot license!");
      sfx("up");
    } else {
      lifeNote("Took a flying lesson.", "activity");
      sfx("spend");
    }
  } else {
    if (!citySpend(LICENSE_BOAT)) return;
    S.life.licenses.boat = 1;
    lifeNote("Earned a boating license.", "milestone");
    say("You earned your boating license!");
    sfx("up");
  }
  save();
  lifeShopScreen();
}
function shopLicenseRows(d, tab) {
  if (tab === "boats" && !S.life.licenses.boat) {
    var young = S.age < 16,
      broke = S.cash < LICENSE_BOAT;
    kitMenuItem(d, {
      icon: "🪪",
      title: "Boating license",
      detail: young ? "Available from age 16" : broke ? "Needs " + fmtCash(LICENSE_BOAT) : "Needed for every boat but the kayak",
      trail: fmtCash(LICENSE_BOAT),
      disabled: young || broke || S.life.prisonYears > 0,
      onClick: function () {
        shopBuyLicense("boat");
      },
    });
  }
  if (tab === "air" && !S.life.licenses.pilot) {
    var lessons = S.life.licenses.lessons || 0,
      done = S.life.licenses.lessonYear === S.life.year,
      minor = S.age < 18,
      poor = S.cash < LICENSE_LESSON;
    kitMenuItem(d, {
      icon: "🪪",
      title: "Flying lesson " + (lessons + 1) + " of " + PILOT_LESSONS,
      detail: minor
        ? "Available from age 18"
        : done
          ? "One lesson a year. Come back next year."
          : poor
            ? "Needs " + fmtCash(LICENSE_LESSON)
            : "Finish all " + PILOT_LESSONS + " to earn your license",
      trail: fmtCash(LICENSE_LESSON),
      disabled: minor || done || poor || S.life.prisonYears > 0,
      onClick: function () {
        shopBuyLicense("pilot");
      },
    });
  }
}
function shopItemRow(d, item) {
  var blocked = shopBlocked(item),
    usedThisYear = S.life.serviceYears[item.key] === S.life.year;
  if (item.type === "vehicle") {
    var parked = !!S.garage[item.key];
    kitMenuItem(d, {
      icon: item.icon,
      title: shopTitle(item.name),
      detail: parked ? "Yours · worth " + fmtCash(shopVehicleValue(item.key)) : blocked || "Drive it around the city",
      trail: parked ? "Owned" : fmtCash(item.price),
      disabled: !parked && !!blocked,
      onClick: function () {
        if (parked) lifeVehicleScreen(item.key);
        else shopBuy(item);
      },
    });
    return;
  }
  if (item.type === "sub") {
    var active = !!S.life.subs[item.key];
    kitMenuItem(d, {
      icon: item.icon,
      title: shopTitle(item.name),
      detail: active ? "Active · tap to cancel" : blocked || item.detail,
      trail: fmtCash(item.price) + "/yr",
      disabled: !active && !!blocked,
      onClick: function () {
        shopToggleSub(item);
      },
    });
    return;
  }
  if (item.type === "service") {
    kitMenuItem(d, {
      icon: item.icon,
      title: shopTitle(item.name),
      detail: usedThisYear ? "Done this year. Come back next year." : blocked || item.detail,
      trail: fmtCash(item.price),
      disabled: usedThisYear || !!blocked,
      onClick: function () {
        shopUseService(item);
      },
    });
    return;
  }
  var mine = !item.multi && shopHas(item.key),
    held = mine
      ? S.life.owned.filter(function (owned) {
          return owned.key === item.key;
        })[0]
      : null;
  kitMenuItem(d, {
    icon: item.icon,
    title: shopTitle(item.name),
    detail: mine
      ? "Yours · worth " + fmtCash(shopValue(held))
      : blocked || item.detail || shopYearly(item),
    trail: mine ? "Owned" : fmtCash(item.price),
    disabled: !mine && !!blocked,
    onClick: function () {
      if (mine) lifeOwnedScreen(held.id);
      else shopBuy(item);
    },
  });
}
function lifeShopScreen(tab) {
  lifeInit();
  if (typeof tab === "string") shopTab = tab;
  var current = LIFE_SHOP.filter(function (entry) {
    return entry.id === shopTab;
  })[0];
  cityScreen("🛍️ Marketplace", "You have " + fmtCash(S.cash) + ".", function (d) {
    var tabs = document.createElement("div");
    tabs.className = "ms-tabs";
    LIFE_SHOP.forEach(function (entry) {
      var b = mbtn(tabs, entry.icon, entry.label, function () {
        lifeShopScreen(entry.id);
      });
      b.setAttribute("aria-pressed", entry.id === shopTab ? "true" : "false");
      if (entry.id === shopTab) b.classList.add("on");
    });
    d.appendChild(tabs);
    shopLicenseRows(d, shopTab);
    var group = "";
    current.items.forEach(function (item) {
      if (item.group && item.group !== group) {
        group = item.group;
        kitMenuHeading(d, group);
      }
      shopItemRow(d, item);
    });
  });
}
function lifeOwnedScreen(id) {
  var owned = shopOwned(id),
    item = owned && shopItem(owned.key);
  if (!item) return lifeAssetsScreen();
  function again() {
    lifeOwnedScreen(id);
  }
  cityScreen(
    item.icon + " " + shopTitle(item.name),
    "Worth " +
      fmtCash(shopValue(owned)) +
      " · you paid " +
      fmtCash(owned.paid) +
      (item.upkeep ? " · " + fmtCash(item.upkeep) + "/yr upkeep" : ""),
    function (d) {
      if (item.use) {
        var used = owned.usedYear === S.life.year,
          locked = owned.rented || S.life.prisonYears > 0;
        kitMenuItem(d, {
          icon: "✨",
          title: item.use.label,
          detail: owned.rented ? "Tenants are living here" : used ? "Done this year" : "Once a year",
          disabled: used || !!locked,
          onClick: function () {
            owned.usedYear = S.life.year;
            lifeApplyEventEffect(item.use.effect);
            lifeNote(item.use.story, "activity");
            sfx("up");
            save();
            shopResult(item.icon + " " + shopTitle(item.name), item.use.story, shopDeltas(item.use.effect), again);
          },
        });
      }
      if (item.rent)
        kitMenuItem(d, {
          icon: "🔑",
          title: owned.rented ? "Stop renting it out" : "Rent it out",
          detail: "Earns " + fmtCash(item.rent) + " a year",
          onClick: function () {
            owned.rented = owned.rented ? 0 : 1;
            lifeNote(
              (owned.rented ? "Rented out " : "Stopped renting out ") + item.name + ".",
              "finance",
            );
            save();
            again();
          },
        });
      if (item.fakeChance && !owned.known)
        kitMenuItem(d, {
          icon: "🔍",
          title: "Get it appraised",
          detail: S.cash < SHOP_APPRAISAL ? "Needs " + fmtCash(SHOP_APPRAISAL) : "Find out if it's real",
          trail: fmtCash(SHOP_APPRAISAL),
          disabled: S.cash < SHOP_APPRAISAL,
          onClick: function () {
            if (!citySpend(SHOP_APPRAISAL)) return;
            owned.known = 1;
            var story = owned.fake
              ? "The appraiser squinted, then laughed. It's fake, worth " + fmtCash(owned.value) + "."
              : "It's the real thing, worth " + fmtCash(owned.value) + ".";
            lifeNote(story, "finance");
            save();
            shopResult("🔍 Appraisal", story, shopDeltas(null, SHOP_APPRAISAL), again);
          },
        });
      kitMenuItem(d, {
        icon: "💵",
        title: "Sell it",
        detail: owned.fake && !owned.known ? "Buyers will check it first" : "For " + fmtCash(shopValue(owned)),
        onClick: function () {
          kitConfirm(
            "Sell " + item.name + "?",
            "You'd get about " + fmtCash(shopValue(owned)) + ". You can't undo this.",
            "Sell it",
            function () {
              shopSell(owned, item);
            },
          );
        },
      });
    },
    lifeAssetsScreen,
  );
}
function shopSell(owned, item) {
  S.life.owned = S.life.owned.filter(function (other) {
    return other !== owned;
  });
  S.cash += owned.value;
  S.lifetimeEarned += owned.value;
  var story =
    owned.fake && !owned.known
      ? "The buyer spotted a fake and paid only " + fmtCash(owned.value) + " for " + item.name + "."
      : "Sold " + item.name + " for " + fmtCash(owned.value) + ".";
  lifeNote(story, "finance");
  sfx("coin");
  save();
  shopResult(
    "💵 Sold",
    story,
    [{ text: "+" + fmtCash(owned.value), good: true }],
    lifeAssetsScreen,
  );
}
function lifeVehicleScreen(key) {
  var vehicle = shopVehicle(key),
    value = shopVehicleValue(key);
  if (!vehicle || !S.garage[key]) return lifeAssetsScreen();
  cityScreen(
    vehicle[4] + " " + vehicle[1],
    "Worth " + fmtCash(value) + " · top speed " + vehicle[3],
    function (d) {
      kitMenuItem(d, {
        icon: "🚗",
        title: "Open the garage",
        detail: "Choose what you drive",
        onClick: cityGarage,
      });
      kitMenuItem(d, {
        icon: "💵",
        title: "Sell it",
        detail: "For " + fmtCash(value),
        onClick: function () {
          kitConfirm(
            "Sell " + vehicle[1] + "?",
            "You'd get " + fmtCash(value) + ". You can't undo this.",
            "Sell it",
            function () {
              delete S.garage[key];
              delete S.life.vehicleAges[key];
              if (S.vehicle === key) {
                S.vehicle = null;
                S.driving = false;
                syncFab();
              }
              S.cash += value;
              S.lifetimeEarned += value;
              var story = "Sold " + vehicle[1] + " for " + fmtCash(value) + ".";
              lifeNote(story, "finance");
              sfx("coin");
              save();
              shopResult("💵 Sold", story, [{ text: "+" + fmtCash(value), good: true }], lifeAssetsScreen);
            },
          );
        },
      });
    },
    lifeAssetsScreen,
  );
}
// Runs once per year of life, inside the day's seeded randomness.
function lifeShopYear() {
  var upkeep = 0,
    rent = 0;
  S.life.owned.forEach(function (owned) {
    var item = shopItem(owned.key);
    if (!item) return;
    owned.age++;
    if (item.swing)
      owned.value *= 1 + item.swing[0] + Math.random() * (item.swing[1] - item.swing[0]);
    else if (item.keep) owned.value *= item.keep;
    owned.value = Math.max(1, Math.round(owned.value));
    if (item.upkeep) upkeep += item.upkeep;
    if (owned.rented && item.rent) rent += item.rent;
  });
  if (rent) {
    S.cash += rent;
    S.lifetimeEarned += rent;
    lifeRecord("Your tenants paid " + fmtCash(rent) + " in rent.", "finance");
  }
  if (upkeep) {
    var paid = Math.min(S.cash, upkeep);
    S.cash -= paid;
    if (paid < upkeep) {
      S.life.debt += upkeep - paid;
      lifeRecord(
        "Upkeep cost " + fmtCash(upkeep) + ". You couldn't cover " + fmtCash(upkeep - paid) + ", so it became debt.",
        "finance",
      );
    } else lifeRecord("Paid " + fmtCash(upkeep) + " in upkeep on your things.", "finance");
  }
  Object.keys(S.life.subs).forEach(function (key) {
    var item = shopItem(key);
    if (!item) return delete S.life.subs[key];
    if (S.cash < item.price) {
      delete S.life.subs[key];
      lifeRecord("You couldn't afford " + item.name + " this year, so it ended.", "finance");
      return;
    }
    S.cash -= item.price;
    S.lifetimeSpent += item.price;
    lifeApplyEventEffect(item.effect);
  });
}
function shopTitle(name) {
  var plain = name.replace(/^(a|an) /, "");
  return plain.charAt(0).toUpperCase() + plain.slice(1);
}
function lifeOwnsAny(keys) {
  return S.life.owned.some(function (owned) {
    return keys.indexOf(owned.key) >= 0;
  });
}
// Used by life events: scales the value of the matching things you own.
function shopChangeValue(keys, factor) {
  S.life.owned.forEach(function (owned) {
    if (keys.indexOf(owned.key) >= 0)
      owned.value = Math.max(1, Math.round(owned.value * factor));
  });
}
