var devSettings = {
    coinWinChance: 0.5,
    payoutMultiplier: 1,
    slotJackpotChance: 0.05,
    wheelWinChance: 0.253185,
    rocketOddsMultiplier: 1,
    volatility: {},
  },
  devSettingsError = "";
try {
  var savedDevSettings = JSON.parse(
    localStorage.getItem("stickCityDevSettings2") || "null",
  );
  if (savedDevSettings) {
    if (
      Number.isFinite(savedDevSettings.coinWinChance) &&
      savedDevSettings.coinWinChance >= 0 &&
      savedDevSettings.coinWinChance <= 1
    )
      devSettings.coinWinChance = savedDevSettings.coinWinChance;
    if (
      Number.isFinite(savedDevSettings.payoutMultiplier) &&
      savedDevSettings.payoutMultiplier >= 0 &&
      savedDevSettings.payoutMultiplier <= 10
    )
      devSettings.payoutMultiplier = savedDevSettings.payoutMultiplier;
    if (
      Number.isFinite(savedDevSettings.slotJackpotChance) &&
      savedDevSettings.slotJackpotChance >= 0 &&
      savedDevSettings.slotJackpotChance <= 1
    )
      devSettings.slotJackpotChance = savedDevSettings.slotJackpotChance;
    if (
      Number.isFinite(savedDevSettings.wheelWinChance) &&
      savedDevSettings.wheelWinChance >= 0 &&
      savedDevSettings.wheelWinChance <= 1
    )
      devSettings.wheelWinChance = savedDevSettings.wheelWinChance;
    if (
      Number.isFinite(savedDevSettings.rocketOddsMultiplier) &&
      savedDevSettings.rocketOddsMultiplier >= 0 &&
      savedDevSettings.rocketOddsMultiplier <= 5
    )
      devSettings.rocketOddsMultiplier = savedDevSettings.rocketOddsMultiplier;
    if (savedDevSettings.volatility)
      devSettings.volatility = savedDevSettings.volatility;
  }
} catch (e) {
  devSettingsError = "Could not read saved dev settings: " + e.message;
}
var devCasinoWinChance = devSettings.coinWinChance,
  devCasinoPayoutMultiplier = devSettings.payoutMultiplier,
  devCasinoSlotJackpotChance = devSettings.slotJackpotChance,
  devCasinoWheelWinChance = devSettings.wheelWinChance,
  devCasinoRocketOddsMultiplier = devSettings.rocketOddsMultiplier;
if (DEV_MODE) {
  AS.forEach(function (asset) {
    var volatility = devSettings.volatility[asset[0]];
    if (Number.isFinite(volatility) && volatility >= 0 && volatility <= 1)
      asset[4] = volatility;
  });

  var devUi = { tab: "Player", open: false };
  try {
    var savedDevUi = JSON.parse(
      localStorage.getItem("stickCityDevUi") || "null",
    );
    if (savedDevUi) {
      devUi.tab = savedDevUi.tab;
      devUi.open = savedDevUi.open === true;
    }
  } catch (e) {}

  var devTools = document.createElement("details");
  devTools.id = "dev-tools";

  var devTitle = document.createElement("summary");
  devTitle.textContent = "🧪 Dev tools";
  devTools.appendChild(devTitle);

  var devBody = document.createElement("div");
  devBody.className = "dev-body";
  devTools.appendChild(devBody);

  var devTabBar = document.createElement("div");
  devTabBar.className = "dev-tabs";
  devTabBar.setAttribute("role", "tablist");
  devBody.appendChild(devTabBar);

  var devPanes = document.createElement("div");
  devPanes.className = "dev-panes";
  devBody.appendChild(devPanes);

  var devStatus = document.createElement("p");
  devStatus.className = "dev-status";
  devStatus.setAttribute("aria-live", "polite");
  devBody.appendChild(devStatus);

  function devStatusSet(message, isError) {
    devStatus.textContent = (isError ? "⚠ " : "✓ ") + message;
    devStatus.classList.toggle("bad", !!isError);
  }
  if (devSettingsError) devStatusSet(devSettingsError, true);

  function devSaveUi() {
    try {
      localStorage.setItem("stickCityDevUi", JSON.stringify(devUi));
    } catch (e) {}
  }
  function devSave(message) {
    save();
    devStatusSet(message);
  }
  function devSaveSettings(message) {
    save();
    try {
      localStorage.setItem(
        "stickCityDevSettings2",
        JSON.stringify({
          coinWinChance: devCasinoWinChance,
          payoutMultiplier: devCasinoPayoutMultiplier,
          slotJackpotChance: devCasinoSlotJackpotChance,
          wheelWinChance: devCasinoWheelWinChance,
          rocketOddsMultiplier: devCasinoRocketOddsMultiplier,
          volatility: devSettings.volatility,
        }),
      );
      devStatusSet(message);
    } catch (e) {
      devStatusSet(
        "Game saved, but dev settings could not be saved: " + e.message,
        true,
      );
    }
  }
  var devTabs = {};
  function devShowTab(name) {
    Object.keys(devTabs).forEach(function (key) {
      var active = key === name;
      devTabs[key].button.classList.toggle("on", active);
      devTabs[key].button.setAttribute("aria-selected", String(active));
      devTabs[key].pane.hidden = !active;
    });
    devUi.tab = name;
  }
  function devTab(name) {
    var button = document.createElement("button"),
      pane = document.createElement("div");
    button.type = "button";
    button.textContent = name;
    button.setAttribute("role", "tab");
    button.addEventListener("click", function () {
      devShowTab(name);
      devSaveUi();
    });
    devTabBar.appendChild(button);
    pane.className = "dev-pane";
    pane.setAttribute("role", "tabpanel");
    devPanes.appendChild(pane);
    devTabs[name] = { button: button, pane: pane };
    return pane;
  }
  function devSection(parent, title) {
    var section = document.createElement("section"),
      heading = document.createElement("h3");
    section.className = "dev-section";
    heading.textContent = title;
    section.appendChild(heading);
    parent.appendChild(section);
    return section;
  }
  function devRow(parent, labelText, input) {
    var label = document.createElement("label");
    label.className = "dev-row";
    label.appendChild(document.createTextNode(labelText));
    label.appendChild(input);
    parent.appendChild(label);
    return input;
  }
  function devNumber(parent, label, value, min, max, step) {
    var input = document.createElement("input");
    input.type = "number";
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.value = String(value);
    input.setAttribute("aria-label", label);
    input.addEventListener("input", function () {
      input.dataset.dirty = "1";
      input.classList.remove("bad");
    });
    return devRow(parent, label, input);
  }
  function devButtons(parent) {
    var group = document.createElement("div");
    group.className = "dev-buttons";
    parent.appendChild(group);
    return group;
  }
  function devButton(parent, label, action, primary) {
    var button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    if (primary) button.className = "primary";
    button.addEventListener("click", action);
    parent.appendChild(button);
    return button;
  }
  // Returns the field's number, or null after flagging it as invalid.
  function devRead(input, min, max, whole, message) {
    var value = Number(input.value);
    if (
      input.value === "" ||
      !Number.isFinite(value) ||
      value < min ||
      value > max ||
      (whole && !Number.isSafeInteger(value))
    ) {
      input.classList.add("bad");
      devStatusSet(message, true);
      return null;
    }
    input.classList.remove("bad");
    return value;
  }
  // Fields follow the live game, except ones holding an unapplied edit.
  var devRefreshers = [];
  function devLive(input, getValue) {
    devRefreshers.push(function () {
      if (document.activeElement !== input && !input.dataset.dirty)
        input.value = String(getValue());
    });
  }
  function devApplyStat(parent, key, label, min, max) {
    var input = devNumber(parent, label, S[key], min, max, 1);
    devLive(input, function () {
      return S[key];
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") input.blur();
    });
    input.addEventListener("change", function () {
      var value = devRead(
        input,
        min,
        max,
        true,
        label + " must be a whole number from " + min + " to " + max + ".",
      );
      if (value === null) return;
      delete input.dataset.dirty;
      S[key] = value;
      devSave(label + " set to " + value + ".");
    });
  }

  var devPlayerTab = devTab("Player"),
    devPlayerActions = devButtons(devPlayerTab);
  devButton(devPlayerActions, "Add $10,000", function () {
    S.cash += 10000;
    devSave("Added $10,000.");
  });
  devButton(devPlayerActions, "Restore energy and happiness", function () {
    S.en = MAXE;
    S.hap = 100;
    devSave("Energy and happiness restored.");
  });
  [
    [
      "Money",
      [
        ["cash", "Cash", 0, Number.MAX_SAFE_INTEGER],
        ["bank", "Bank", 0, Number.MAX_SAFE_INTEGER],
      ],
    ],
    [
      "Skills",
      [
        ["str", "Strength", 0, 1000000],
        ["int", "Intelligence", 0, 1000000],
        ["cha", "Charisma", 0, 1000000],
      ],
    ],
    [
      "Life",
      [
        ["k", "Karma", -1000000, 1000000],
        ["en", "Energy", 0, MAXE],
        ["hap", "Happiness", 0, 100],
      ],
    ],
  ].forEach(function (group) {
    var section = devSection(devPlayerTab, group[0]);
    group[1].forEach(function (stat) {
      devApplyStat(section, stat[0], stat[1], stat[2], stat[3]);
    });
  });

  var devMarketTab = devTab("Market"),
    marketSection = devSection(devMarketTab, "Asset"),
    marketSelect = document.createElement("select"),
    marketPrice,
    marketVolatility;
  marketSelect.setAttribute("aria-label", "Market asset");
  AS.forEach(function (asset) {
    var option = document.createElement("option");
    option.value = asset[0];
    option.textContent = asset[2] + (asset[3] ? " (crypto)" : " (stock)");
    marketSelect.appendChild(option);
  });
  devRow(marketSection, "Asset", marketSelect);
  marketPrice = devNumber(
    marketSection,
    "Price",
    S.px[AS[0][0]],
    1,
    Number.MAX_SAFE_INTEGER,
    1,
  );
  marketVolatility = devNumber(
    marketSection,
    "Volatility",
    AS[0][4],
    0,
    1,
    0.01,
  );
  devLive(marketPrice, function () {
    return S.px[marketSelect.value];
  });
  function devSelectAsset() {
    var asset = AS.filter(function (item) {
      return item[0] === marketSelect.value;
    })[0];
    delete marketPrice.dataset.dirty;
    delete marketVolatility.dataset.dirty;
    marketPrice.classList.remove("bad");
    marketVolatility.classList.remove("bad");
    marketPrice.value = String(S.px[asset[0]]);
    marketVolatility.value = String(asset[4]);
  }
  marketSelect.addEventListener("change", devSelectAsset);
  var marketActions = devButtons(devMarketTab);
  devButton(
    marketActions,
    "Apply market values",
    function () {
      var asset = AS.filter(function (item) {
          return item[0] === marketSelect.value;
        })[0],
        price = devRead(
          marketPrice,
          1,
          Number.MAX_SAFE_INTEGER,
          true,
          "Price must be a positive whole number.",
        );
      if (!asset) {
        devStatusSet("Choose a valid market asset.", true);
        return;
      }
      if (price === null) return;
      var volatility = devRead(
        marketVolatility,
        0,
        1,
        false,
        "Volatility must be from 0 to 1.",
      );
      if (volatility === null) return;
      delete marketPrice.dataset.dirty;
      delete marketVolatility.dataset.dirty;
      S.px[asset[0]] = price;
      S.pp[asset[0]] = price;
      asset[4] = volatility;
      devSettings.volatility[asset[0]] = volatility;
      devSaveSettings(asset[2] + " price and volatility updated.");
    },
    true,
  );
  devButton(marketActions, "Run market tick", function () {
    priceTick();
    devSave("Market tick completed.");
  });

  var devCasinoTab = devTab("Casino"),
    casinoAll = devSection(devCasinoTab, "All games"),
    payoutPercent = devNumber(
      casinoAll,
      "Payout multiplier (%)",
      devCasinoPayoutMultiplier * 100,
      0,
      1000,
      1,
    ),
    casinoGames = devSection(devCasinoTab, "Per game"),
    coinChance = devNumber(
      casinoGames,
      "Coin flip win chance (%)",
      devCasinoWinChance * 100,
      0,
      100,
      1,
    ),
    jackpotChance = devNumber(
      casinoGames,
      "Slots 7 per-reel chance (%)",
      devCasinoSlotJackpotChance * 100,
      0,
      100,
      0.1,
    ),
    wheelChance = devNumber(
      casinoGames,
      "Mega Wheel win chance (%)",
      devCasinoWheelWinChance * 100,
      0,
      100,
      0.1,
    ),
    rocketOdds = devNumber(
      casinoGames,
      "Rocket odds multiplier (%)",
      devCasinoRocketOddsMultiplier * 100,
      0,
      500,
      1,
    );
  devButton(
    devButtons(devCasinoTab),
    "Apply casino settings",
    function () {
      var payout = devRead(
        payoutPercent,
        0,
        1000,
        false,
        "Payout multiplier must be from 0 to 1000%.",
      );
      if (payout === null) return;
      var chance = devRead(
        coinChance,
        0,
        100,
        false,
        "Coin flip chance must be from 0 to 100%.",
      );
      if (chance === null) return;
      var jackpot = devRead(
        jackpotChance,
        0,
        100,
        false,
        "Slots per-reel jackpot chance must be from 0 to 100%.",
      );
      if (jackpot === null) return;
      var wheel = devRead(
        wheelChance,
        0,
        100,
        false,
        "Mega Wheel win chance must be from 0 to 100%.",
      );
      if (wheel === null) return;
      var rocket = devRead(
        rocketOdds,
        0,
        500,
        false,
        "Rocket odds multiplier must be from 0 to 500%.",
      );
      if (rocket === null) return;
      devCasinoWinChance = chance / 100;
      devCasinoPayoutMultiplier = payout / 100;
      devCasinoSlotJackpotChance = jackpot / 100;
      devCasinoWheelWinChance = wheel / 100;
      devCasinoRocketOddsMultiplier = rocket / 100;
      devSaveSettings("Casino test settings updated.");
    },
    true,
  );

  var worldActions = devButtons(devTab("World"));
  devButton(worldActions, "Advance one day", function () {
    newDay();
    devSave("Advanced to day " + S.day + ".");
  });
  devButton(worldActions, "Trigger random event", function () {
    showRandomEvent("🧪 Test event");
    devStatusSet("Random event opened.");
  });
  devButton(worldActions, "Return to spawn", function () {
    S.x = 600;
    S.y = 600;
    S.in = null;
    S.driving = false;
    ov.hidden = true;
    document.body.classList.remove("in");
    devSave("Returned to spawn.");
  });

  lifeInit();
  var devLifeTab = devTab("Life"),
    devLifeAge = devNumber(devSection(devLifeTab, "Time & age"), "Age", S.age, 0, 120, 1),
    devLifeStats = devSection(devLifeTab, "Life stats"),
    devLifeHealth = devNumber(
      devLifeStats,
      "Health",
      S.life.health,
      0,
      100,
      1,
    ),
    devLifeLooks = devNumber(
      devLifeStats,
      "Looks",
      S.life.looks,
      0,
      100,
      1,
    ),
    devLifeEvents = devSection(devLifeTab, "Events"),
    devLifeEvent = document.createElement("select");
  devLifeEvent.setAttribute("aria-label", "Life event");
  devRow(devLifeEvents, "Life event", devLifeEvent);
  LIFE_EVENTS.forEach(function (event) {
    var option = document.createElement("option");
    option.value = event.id;
    option.textContent = event.title;
    devLifeEvent.appendChild(option);
  });
  var devLifeActions = devButtons(devLifeTab);
  devButton(devLifeActions, "Initialize current save as a life", function () {
    if (!S.life.created) lifeContinueLegacy();
    devSave("Current save is now tracked as a life.");
  });
  devButton(devLifeActions, "Set age", function () {
    var age = devRead(
      devLifeAge,
      0,
      120,
      true,
      "Age must be a whole number from 0 to 120.",
    );
    if (age === null) return;
    delete devLifeAge.dataset.dirty;
    S.age = age;
    S.life.stage = lifeStage(age);
    devSave("Age set to " + age + ".");
  });
  devButton(devLifeActions, "Apply health and looks", function () {
    var health = devRead(
        devLifeHealth,
        0,
        100,
        true,
        "Health must be a whole number from 0 to 100.",
      ),
      looks = devRead(
        devLifeLooks,
        0,
        100,
        true,
        "Looks must be a whole number from 0 to 100.",
      );
    if (health === null || looks === null) return;
    delete devLifeHealth.dataset.dirty;
    delete devLifeLooks.dataset.dirty;
    S.life.health = health;
    S.life.looks = looks;
    devSave("Life health and looks updated.");
  });
  devButton(devLifeActions, "Skip to next birthday", function () {
    if (!S.life.created) {
      devStatusSet("Initialize the current save before aging it up.", true);
      return;
    }
    lifeAgeUp();
    devStatusSet("Processed days through the next birthday.");
  }, true);
  devButton(devLifeActions, "Trigger selected life event", function () {
    if (!S.life.created) {
      devStatusSet("Initialize the current save before triggering life events.", true);
      return;
    }
    S.life.stage = lifeStage(S.age);
    var event = LIFE_EVENTS.filter(function (candidate) {
      return candidate.id === devLifeEvent.value;
    })[0];
    if (!lifeEventEligible(event)) {
      devStatusSet("That event is not eligible at the current age or state.", true);
      return;
    }
    lifeShowEvent(event);
    devStatusSet("Opened " + event.title + ".");
  });
  devButton(devLifeActions, "Trigger random eligible life event", function () {
    if (!S.life.created) {
      devStatusSet("Initialize the current save before triggering life events.", true);
      return;
    }
    S.life.stage = lifeStage(S.age);
    var event = lifePickEvent();
    if (!event) {
      devStatusSet("There are no eligible life events at this age.", true);
      return;
    }
    lifeShowEvent(event);
    devStatusSet("Opened " + event.title + ".");
  });

  devShowTab(
    Object.keys(devTabs).indexOf(devUi.tab) >= 0 ? devUi.tab : "Player",
  );
  devTools.open = devUi.open;
  devTools.addEventListener("toggle", function () {
    devUi.open = devTools.open;
    devSaveUi();
  });
  // Typing in a field must not reach the game's hotkeys in main.js. Keyup still
  // passes through so a movement key released here doesn't stay held.
  devTools.addEventListener("keydown", function (e) {
    if (e.target.matches("input, select")) e.stopPropagation();
  });
  setInterval(function () {
    if (!devTools.open) return;
    devRefreshers.forEach(function (refresh) {
      refresh();
    });
  }, 250);

  document.body.appendChild(devTools);
}
