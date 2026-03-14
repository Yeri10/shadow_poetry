// ============================================================
// CITY animation
// Letters become skyline, blocks, windows, and street grids
// ============================================================

let cityBuildings = [];

function initCity() {
  cityBuildings = Array.from({ length: 12 }, (_, i) => ({
    x: map(i, 0, 11, -250, 250),
    h: 0,
    targetH: random(70, 210),
    w: random(24, 54),
    delay: i * 5,
    flickerSeed: random(1000),
  }));
}

function drawCity(stateTimer, fadeAlpha) {
  const ground = height / 2 + 96;

  push();
  translate(width / 2, 0);

  stroke(255, 38);
  strokeWeight(0.7);
  line(-320, ground, 320, ground);

  for (let gx = -280; gx <= 280; gx += 28) {
    const ga = map(abs(gx), 0, 280, 24, 8);
    stroke(255, ga);
    line(gx, ground + 2, gx + sin(frameCount * 0.02 + gx) * 5, ground + 110);
  }

  for (let gy = 0; gy < 6; gy++) {
    const y = ground + 14 + gy * 18;
    stroke(255, 10);
    line(-280, y, 280, y);
  }

  cityBuildings.forEach((building, index) => {
    const grow = constrain(map(stateTimer, building.delay, building.delay + 90, 0, 1), 0, 1);
    if (grow <= 0) return;

    building.h = lerp(building.h, building.targetH, 0.08);
    const alpha = fadeAlpha * map(grow, 0, 1, 0.2, 0.7);

    noFill();
    stroke(255, alpha * 0.7);
    strokeWeight(0.8);
    rect(building.x - building.w / 2, ground - building.h, building.w, building.h);

    noStroke();
    for (let wy = ground - building.h + 10; wy < ground - 10; wy += 14) {
      for (let wx = building.x - building.w / 2 + 7; wx < building.x + building.w / 2 - 4; wx += 11) {
        const blink = noise(building.flickerSeed + wx * 0.03, wy * 0.05, frameCount * 0.03);
        fill(255, map(blink, 0, 1, 10, 78) * grow);
        rect(wx, wy, 5, 6);
      }
    }
  });

  noStroke();
  textAlign(CENTER, BOTTOM);
  [
    { ch: 'C', x: -176, size: 92,  stretch: 0.9 },
    { ch: 'I', x:  -54, size: 182, stretch: 1.18 },
    { ch: 'T', x:   56, size: 116, stretch: 1.0 },
    { ch: 'Y', x:  182, size: 132, stretch: 1.06 },
  ].forEach((letter, index) => {
    const yWarp = sin(frameCount * 0.02 + index) * 3;
    fill(255, fadeAlpha);
    textSize(letter.size * letter.stretch);
    text(letter.ch, letter.x, ground + yWarp);
  });

  pop();
}
