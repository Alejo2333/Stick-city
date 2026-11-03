function player(x, y, mv) {
  var s = mv ? Math.sin(S.ph) * 10 : 0;
  if (mv && !paused && tick % (S.driving ? 3 : 7) === 0)
    DUST.push({
      x: x - Math.cos(S.face) * (S.driving ? 34 : 14),
      y: y - Math.sin(S.face) * (S.driving ? 34 : 14) + 8,
      t: 0,
    });
  drawDust();
  g.fillStyle = "rgba(0,0,0,.2)";
  g.beginPath();
  g.ellipse(x + 4, y + 12, 24, 16, 0, 0, 7);
  g.fill();
  g.save();
  g.translate(x, y);
  g.rotate(S.face);
  if (S.driving && S.vehicle) {
    g.fillStyle =
      ["car", "sportscar"].indexOf(S.vehicle) >= 0
        ? "#e8b024"
        : ["scooter", "motorcycle"].indexOf(S.vehicle) >= 0
          ? "#ff5b50"
          : "#e3e3e3";
    g.strokeStyle = "#222";
    g.lineWidth = 3;
    if (S.vehicle === "car" || S.vehicle === "sportscar") {
      g.fillRect(-30, -31, 67, 62);
      g.strokeRect(-30, -31, 67, 62);
      g.fillStyle = "#a7dcf6";
      g.fillRect(-4, -25, 20, 50);
    } else {
      g.beginPath();
      g.arc(-18, 0, 11, 0, 7);
      g.arc(25, 0, 11, 0, 7);
      g.stroke();
    }
  }
  var bs = mv
    ? 1 + Math.abs(Math.sin(S.ph)) * 0.06
    : 1 + Math.sin(tick * 0.06) * 0.015;
  g.scale(bs, bs);
  g.strokeStyle = "#000";
  g.lineWidth = 3;
  g.lineCap = "round";
  g.beginPath();
  g.moveTo(0, -18);
  g.lineTo(s, -28);
  g.moveTo(0, 18);
  g.lineTo(-s, 28);
  g.stroke();
  g.fillStyle =
    S.heat >= 0.3
      ? "#d01818"
      : {
          Blue: "#0b63c9",
          Red: "#d01818",
          Green: "#22a66f",
          Purple: "#9853d3",
          Gold: "#e7b629",
          Black: "#303038",
          Pink: "#f26aa8",
        }[S.outfit] || "#0b63c9";
  g.beginPath();
  g.arc(0, 0, 22, 0, 7);
  g.fill();
  g.stroke();
  g.fillStyle = "#fff";
  g.beginPath();
  g.arc(13, -8, 4, 0, 7);
  g.arc(13, 8, 4, 0, 7);
  g.fill();
  g.fillStyle = "#000";
  g.beginPath();
  g.arc(15, -8, 2, 0, 7);
  g.arc(15, 8, 2, 0, 7);
  g.fill();
  g.restore();
}
function room() {
  var b = S.in;
  g.lineWidth = 3;
  g.strokeStyle = "#000";
  g.lineCap = "round";
  g.fillStyle = b.wall;
  g.fillRect(0, 0, VW, VH);
  g.fillStyle = b.floor;
  g.fillRect(0, roomY + 330 * roomS, VW, VH - roomY - 330 * roomS);
  g.save();
  g.translate(roomX, roomY);
  g.scale(roomS, roomS);
  g.fillStyle = "#69c8ff";
  g.fillRect(40, 100, 300, 200);
  g.strokeRect(40, 100, 300, 200);
  if (b.skin) {
    g.fillStyle = b.skin;
    g.beginPath();
    g.arc(140, 190, 36, 0, 7);
    g.fill();
    g.stroke();
    g.fillStyle = b.hair;
    g.beginPath();
    g.arc(140, 184, 42, Math.PI, 0);
    g.fill();
    g.stroke();
    g.fillStyle = "#000";
    g.fillRect(124, 190, 10, 8);
    g.fillRect(148, 190, 10, 8);
    g.beginPath();
    g.moveTo(140, 226);
    g.lineTo(140, 300);
    g.moveTo(140, 245);
    g.lineTo(100, 285);
    g.moveTo(140, 245);
    g.lineTo(180, 285);
    g.stroke();
  } else {
    g.fillStyle = "#d94b4b";
    g.fillRect(70, 190, 240, 110);
    g.strokeRect(70, 190, 240, 110);
    g.fillStyle = "#fff";
    g.fillRect(80, 200, 80, 40);
    g.strokeRect(80, 200, 80, 40);
  }
  if (b.n === "Home") {
    // Drawn in the left "window" panel, which the options box never covers.
    g.save();
    var hue =
      {
        Classic: "#f3e6c4",
        Ocean: "#a4dcee",
        Sunset: "#f7c6a6",
        Forest: "#b5d7ac",
        Midnight: "#66748f",
      }[S.houseStyle] || "#f3e6c4";
    var owned = FURN.filter(function (f) {
      return S.furniture[f[0]];
    });
    if (owned.length) {
      g.fillStyle = hue;
      g.fillRect(40, 100, 300, 200);
      g.strokeRect(40, 100, 300, 200);
      g.font = "30px Arial";
      g.textAlign = "center";
      owned.forEach(function (f) {
        var s = furnSlot(f[0]);
        g.fillText(
          f[1],
          70 + (s % 5) * 60,
          180 + Math.floor(s / 5) * 80,
        );
      });
    }
    g.font = "bold 14px Verdana";
    g.textAlign = "center";
    g.fillStyle = "#182a3f";
    g.fillText(
      (S.activeHome || "starter").toUpperCase() + " · " + S.houseStyle,
      190,
      292,
    );
    if (S.invitedGuest && S.guestDay === S.day) {
      g.font = "32px Arial";
      g.fillText("🧑", 310, 140);
      g.font = "bold 15px Verdana";
      g.fillText(S.invitedGuest + " visiting!", 105, 370);
    }
    g.restore();
  }
  g.fillStyle = "#9d9444";
  g.fillRect(-roomX / roomS - 4, 300, VW / roomS + 8, 40);
  g.strokeRect(-roomX / roomS - 4, 300, VW / roomS + 8, 40);
  g.fillStyle = "#d0d0d0";
  g.fillRect(40, 380, 130, 120);
  g.strokeRect(40, 380, 130, 120);
  g.fillStyle = "#000";
  g.font = '22px "Patrick Hand","Comic Sans MS",cursive';
  g.textAlign = "center";
  b.sign.forEach(function (l, i) {
    g.fillText(l, 105, 425 + i * 26);
  });
  g.restore();
}
