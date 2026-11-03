// Cash and gem pickups scattered around the roads.
var DR = [];
function genDrops() {
  DR = [];
  for (var i = 0; i < 9; i++) {
    var q = RS[Math.floor(Math.random() * RS.length)],
      x = q.x + (Math.random() - 0.5) * 240,
      y = q.y + (Math.random() - 0.5) * 240,
      r = Math.random();
    if (hit(x, y)) continue;
    DR.push({
      x: x,
      y: y,
      gem: r < 0.08,
      v:
        r < 0.08
          ? 150 + Math.floor(Math.random() * 250)
          : 3 + Math.floor(Math.random() * 28),
    });
  }
}
function drawDrops() {
  DR.forEach(function (d) {
    if (!vis(d.x, d.y, 30)) return;
    var b = Math.sin(tick * 0.08 + d.x) * 3;
    g.fillStyle = "rgba(0,0,0,.2)";
    g.beginPath();
    g.ellipse(d.x + 3, d.y + 12, 12, 6, 0, 0, 7);
    g.fill();
    g.lineWidth = 2;
    g.strokeStyle = "#000";
    if (d.gem) {
      g.fillStyle = "#6ee7ff";
      g.beginPath();
      g.moveTo(d.x, d.y - 14 + b);
      g.lineTo(d.x + 11, d.y + b);
      g.lineTo(d.x, d.y + 12 + b);
      g.lineTo(d.x - 11, d.y + b);
      g.closePath();
      g.fill();
      g.stroke();
    } else {
      g.fillStyle = "#3fbf4f";
      g.fillRect(d.x - 13, d.y - 8 + b, 26, 16);
      g.strokeRect(d.x - 13, d.y - 8 + b, 26, 16);
      g.fillStyle = "#0c4a17";
      g.font = "bold 14px Verdana";
      g.textAlign = "center";
      g.fillText("$", d.x, d.y + 5 + b);
    }
  });
}
