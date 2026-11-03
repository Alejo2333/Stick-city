function cityHomes() {
  cityScreen(
    "🏡 Home & Property",
    "Own multiple homes, move in, decorate rooms and invite friends. Investment properties earn rent.",
    function (d) {
      [
        ["starter", "Starter home", 0],
        ["apartment", "Apartment", 700],
        ["townhouse", "Townhouse", 1700],
        ["mansion", "Mansion", 3000],
      ].forEach(function (a) {
        var owned =
          a[0] === "starter" ||
          (a[0] === "mansion" ? !!S.mansion : !!S.owns[a[0]]);
        var b = mbtn(
          d,
          "🏠",
          a[1] +
            " · " +
            (owned
              ? S.activeHome === a[0]
                ? "Living here"
                : "Move in"
              : fmtCash(a[2])),
          function () {
            if (!owned) {
              if (!citySpend(a[2])) return;
              if (a[0] === "mansion") S.mansion = 1;
              else S.owns[a[0]] = 1;
              cityNotice("You purchased a " + a[1] + "!");
            }
            S.activeHome = a[0];
            save();
            cityHomes();
          },
        );
        b.disabled = S.activeHome === a[0];
      });
      mbtn(d, "🪴", "Decorate and arrange furniture", cityLayout);
      mbtn(d, "💌", "Invite a friend over", cityInvite);
      mbtn(d, "🛒", "Visit furniture showroom", function () {
        cityShops();
      });
    },
  );
}
function cityBusinesses() {
  cityScreen(
    "🏢 Business Empire",
    "Purchase businesses or upgrade their daily profit. Income arrives every morning.",
    function (d) {
      [
        ["cafe", "Neighborhood cafe", 600, 28],
        ["delivery", "Delivery service", 850, 38],
        ["arcade", "Game arcade", 1100, 44],
        ["store", "Corner store", 1350, 52],
        ["factory", "Small factory", 2200, 80],
      ].forEach(function (a) {
        var lv = S.businessUpgrades[a[0]] || 0,
          owned = !!S.businesses[a[0]],
          price = owned ? (lv + 1) * 350 : a[2];
        var b = mbtn(
          d,
          "💼",
          a[1] +
            " · " +
            (owned
              ? "Level " +
                (lv + 1) +
                " · " +
                fmtCash(a[3] * (lv + 1)) +
                "/day · " +
                (lv >= 5 ? "Max level" : "upgrade " + fmtCash(price))
              : "Buy " + fmtCash(price)),
          function () {
            if (!citySpend(price)) return;
            if (!owned) S.businesses[a[0]] = 1;
            else S.businessUpgrades[a[0]] = lv + 1;
            cityNotice(
              owned
                ? "Upgraded " + a[1] + "!"
                : "Purchased " + a[1] + "!",
            );
            cityBusinesses();
          },
        );
        b.disabled = owned && lv >= 5;
      });
    },
  );
}
function cityGarage() {
  if (S.vehicle && !S.garage[S.vehicle]) S.garage[S.vehicle] = 1; // import older saves
  cityScreen(
    "🚗 Vehicle Garage",
    "Collect multiple vehicles. Select one to drive on the road; park it to walk and enter shops.",
    function (d) {
      VEHICLES.forEach(function (a) {
        var owned = !!S.garage[a[0]];
        mbtn(
          d,
          a[4],
          a[1] +
            " · " +
            (owned
              ? S.vehicle === a[0]
                ? "Selected"
                : "Select"
              : "Buy " + fmtCash(a[2])) +
            " · speed " +
            a[3],
          function () {
            if (!owned) {
              if (!citySpend(a[2])) return;
              S.garage[a[0]] = 1;
            }
            S.vehicle = a[0];
            S.driving = true;
            cityNotice("Now driving " + a[1] + ".");
            cityGarage();
          },
        );
      });
      if (S.vehicle)
        mbtn(
          d,
          "🅿️",
          S.driving ? "Park your vehicle" : "Drive selected vehicle",
          function () {
            S.driving = !S.driving;
            save();
            cityGarage();
          },
        );
      mbtn(
        d,
        "📏",
        "Distance driven: " + Math.floor(S.driveDistance),
        function () {
          cityGarage();
        },
      );
    },
  );
}
function cityOutfits() {
  cityScreen(
    "👕 Your Wardrobe",
    "Outfits are purchased at the Clothing Boutique. Change into an owned outfit here.",
    function (d) {
      [
        ["Blue", "#0b63c9"],
        ["Red", "#d01818"],
        ["Green", "#22a66f"],
        ["Purple", "#9853d3"],
        ["Gold", "#e7b629"],
        ["Black", "#303038"],
        ["Pink", "#f26aa8"],
      ].forEach(function (a) {
        var owned =
          a[0] === "Blue" ||
          !!(S.outfitsOwned || {})[a[0]] ||
          a[0] === S.outfit;
        var b = mbtn(
          d,
          "👕",
          a[0] +
            (S.outfit === a[0]
              ? " ✓"
              : owned
                ? " · Wear"
                : " · Visit boutique"),
          function () {
            if (!owned) {
              cityShops();
              return;
            }
            S.outfit = a[0];
            save();
            cityOutfits();
          },
        );
      });
    },
  );
}
function cityTravel() {
  cityScreen(
    "🗺️ City Guide",
    "Today: " +
      S.weather +
      " · Tomorrow: " +
      S.forecast +
      ". Visit locations to discover the city.",
    function (d) {
      B.forEach(function (b) {
        mbtn(
          d,
          S.placesVisited[b.n] ? "📍" : "🧭",
          b.n + (S.placesVisited[b.n] ? " ✓" : ""),
          function () {
            if (S.in) {
              S.in = null;
              ov.hidden = true;
              document.body.classList.remove("in");
            }
            S.x = b.dx;
            S.y = b.dy + 85;
            adv(0.5);
            cityNotice("Fast-traveled to " + b.n + ".");
            closeMenu();
          },
        );
      });
    },
  );
}
