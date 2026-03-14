// ============================================================
// TIME animation
// Letters drift at different speeds, leaving slow temporal residue
// ============================================================

let timeTrails = [];

function initTime() {
  timeTrails = Array.from({ length: 8 }, (_, i) => ({
    lag: i * 16,
    alpha: map(i, 0, 7, 240, 10),
    size: map(i, 0, 7, 122, 84),
  }));
}

function drawTime(stateTimer, fadeAlpha) {
  push();
  translate(width / 2, height / 2 - 20);
  noStroke();
  textAlign(CENTER, CENTER);

  const letters = [
    { ch: 'T', xBase: -90, drift: 18, rise: 11, phase: 0.0 },
    { ch: 'I', xBase: -22, drift: 25, rise: 17, phase: 0.7 },
    { ch: 'M', xBase:  28, drift: 32, rise: 12, phase: 1.4 },
    { ch: 'E', xBase:  96, drift: 20, rise: 18, phase: 2.0 },
  ];

  for (let i = timeTrails.length - 1; i >= 0; i--) {
    const layer = timeTrails[i];
    letters.forEach((letter, index) => {
      const t = stateTimer - layer.lag;
      const dx = letter.xBase + sin(t * 0.013 + letter.phase) * letter.drift;
      const dy = cos(t * 0.009 + letter.phase * 1.3) * letter.rise + sin(t * 0.006 + index) * 6;
      fill(255, layer.alpha * (fadeAlpha / 255));
      textSize(layer.size);
      text(letter.ch, dx, dy);
    });
  }

  noFill();
  stroke(255, 18);
  strokeWeight(0.7);
  for (let i = 0; i < 14; i++) {
    const angle = TWO_PI * i / 14 - HALF_PI + stateTimer * 0.002;
    const r1 = 124;
    const r2 = i % 2 === 0 ? 154 : 142;
    line(cos(angle) * r1, sin(angle) * r1, cos(angle) * r2, sin(angle) * r2);
  }
  pop();

}
