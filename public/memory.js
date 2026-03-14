// ============================================================
// MEMORY animation
// IMAGE disappears into darkness, then reforms as MEMORY
// ============================================================

const memoryFont = 'Noto Sans, sans-serif';
const memoryImageWord = 'IMAGE';
const memoryFinalWord = 'MEMORY';
const memoryFinalY = 104;
const memoryYOffset = -56;

let memoryFragments = [];
let memoryDust = [];
let memoryTraceLines = [];
let memoryBlocks = [];
let memoryEchoWords = [];

function memoryEase(t) {
  const clamped = constrain(t, 0, 1);
  return clamped * clamped * (3 - 2 * clamped);
}

function initMemory() {
  // The main word is broken into a few larger fragments so the transition from
  // IMAGE to MEMORY reads as reconstruction, not particle noise.
  memoryFragments = [
    {
      text: 'ME',
      baseX: -118,
      baseY: -24,
      driftX: -172,
      driftY: -62,
      finalX: -108,
      finalY: memoryFinalY,
      size: 66,
      alpha: 238,
      rotate: -0.08,
      delay: 0.34,
    },
    {
      text: 'MOR',
      baseX: 0,
      baseY: 22,
      driftX: 18,
      driftY: 34,
      finalX: 12,
      finalY: memoryFinalY,
      size: 62,
      alpha: 255,
      rotate: 0.04,
      delay: 0.42,
    },
    {
      text: 'Y',
      baseX: 124,
      baseY: 96,
      driftX: 168,
      driftY: 124,
      finalX: 150,
      finalY: memoryFinalY,
      size: 70,
      alpha: 220,
      rotate: 0.09,
      delay: 0.5,
    },
  ];

  memoryDust = Array.from({ length: 220 }, () => ({
    x: random(-width * 0.34, width * 0.34),
    y: random(-height * 0.28, height * 0.34),
    size: random(1.2, 3.2),
    alpha: random(8, 28),
    drift: random(TWO_PI),
    speed: random(0.12, 0.45),
  }));

  memoryTraceLines = Array.from({ length: 12 }, (_, index) => ({
    x: random(-width * 0.24, width * 0.14),
    y: random(-height * 0.12, height * 0.16),
    len: random(width * 0.12, width * 0.3),
    alpha: map(index, 0, 11, 28, 8),
    phase: random(TWO_PI),
  }));

  memoryBlocks = Array.from({ length: 28 }, () => ({
    x: random(-width * 0.24, width * 0.22),
    y: random(-height * 0.18, height * 0.18),
    w: random(26, 92),
    h: random(7, 18),
    seed: random(1000),
  }));

  const wordPool = getPoemWords('memory')
    .filter(Boolean)
    .map((word) => word.replace(/[.,;:!?]/g, '').toUpperCase())
    .filter(Boolean);

  // These drifting words act like stray recall: present for a while, then
  // fading before the final composition settles into place.
  memoryEchoWords = Array.from({ length: 26 }, () => ({
    word: random(wordPool.length ? wordPool : ['MEMORY', 'READ', 'IMAGE']),
    x: random(-width * 0.22, width * 0.22),
    y: random(-height * 0.16, height * 0.22),
    size: random(11, 22),
    alpha: random(12, 48),
    drift: random(TWO_PI),
    offsetX: random(-16, 16),
  }));
}

function drawMemory(stateTimer, fadeAlpha) {
  const progress = constrain(map(stateTimer, 0, sceneDuration * 0.94, 0, 1), 0, 1);

  push();
  translate(width / 2, height / 2 - 16 + memoryYOffset);
  textFont(memoryFont);
  textAlign(CENTER, CENTER);
  noStroke();

  // Build a soft field of dust, traces, and archival marks before the main
  // word drama starts, so memory feels spatial rather than isolated.
  drawMemoryDust(progress, fadeAlpha);
  drawMemoryHaze(progress, fadeAlpha);
  drawMemoryTraceLines(progress, fadeAlpha);
  drawMemoryBlocks(progress, fadeAlpha);
  drawMemoryEchoWords(progress, fadeAlpha);
  drawMemoryImage(progress, fadeAlpha);
  drawMemoryStrike(progress, fadeAlpha);
  drawMemoryBlindness(progress, fadeAlpha);
  drawMemoryFragments(progress, fadeAlpha);
  drawMemoryFrame(progress, fadeAlpha);
  drawMemoryReconstruction(progress, fadeAlpha);
  drawMemoryClosingStack(progress, fadeAlpha);

  pop();
}

function drawMemoryDust(progress, fadeAlpha) {
  const phase = memoryEase(map(progress, 0.04, 0.92, 0, 1));
  if (phase <= 0) return;

  noStroke();
  for (const dust of memoryDust) {
    const x = dust.x + sin(frameCount * 0.01 * dust.speed + dust.drift) * 6;
    const y = dust.y + cos(frameCount * 0.012 * dust.speed + dust.drift) * 5;
    fill(255, dust.alpha * phase * (fadeAlpha / 255));
    circle(x, y, dust.size);
  }
}

function drawMemoryHaze(progress, fadeAlpha) {
  const phase = memoryEase(map(progress, 0.1, 0.88, 0, 1));
  if (phase <= 0) return;

  noStroke();
  fill(255, 8 * phase * (fadeAlpha / 255));
  rectMode(CENTER);
  rect(0, -84, width * 0.54, 68);
  fill(255, 11 * phase * (fadeAlpha / 255));
  rect(0, 18, width * 0.6, 96);
  fill(255, 7 * phase * (fadeAlpha / 255));
  rect(0, 154, width * 0.48, 62);
}

function drawMemoryTraceLines(progress, fadeAlpha) {
  const phase = memoryEase(map(progress, 0.16, 0.84, 0, 1));
  if (phase <= 0) return;

  strokeWeight(1.2);
  for (const trace of memoryTraceLines) {
    const drift = sin(frameCount * 0.014 + trace.phase) * 14;
    stroke(255, trace.alpha * phase * (fadeAlpha / 255));
    line(trace.x + drift, trace.y, trace.x + trace.len + drift, trace.y);
  }
  noStroke();
}

function drawMemoryBlocks(progress, fadeAlpha) {
  const phase = memoryEase(map(progress, 0.2, 0.9, 0, 1));
  if (phase <= 0) return;

  noFill();
  strokeWeight(1.2);
  for (const block of memoryBlocks) {
    const alpha = map(noise(block.seed, frameCount * 0.008), 0, 1, 8, 42) * phase * (fadeAlpha / 255);
    stroke(255, alpha);
    rect(block.x, block.y, block.w, block.h);
    stroke(255, alpha * 0.6);
    line(block.x + 4, block.y + block.h * 0.5, block.x + block.w - 4, block.y + block.h * 0.5);
  }
  noStroke();
}

function drawMemoryEchoWords(progress, fadeAlpha) {
  const appear = memoryEase(map(progress, 0.26, 0.72, 0, 1));
  const fade = 1 - memoryEase(map(progress, 0.74, 0.96, 0, 1));
  const phase = appear * fade;
  if (phase <= 0) return;

  textAlign(CENTER, CENTER);
  textFont(memoryFont);

  for (const word of memoryEchoWords) {
    const xx = word.x + sin(frameCount * 0.015 + word.drift) * word.offsetX * 0.12;
    const yy = word.y + cos(frameCount * 0.013 + word.drift) * 4;
    textSize(word.size);
    fill(255, word.alpha * phase * (fadeAlpha / 255));
    text(word.word, xx, yy);
  }
}

function drawMemoryImage(progress, fadeAlpha) {
  const imageFadeIn = memoryEase(map(progress, 0.02, 0.16, 0, 1));
  const imageFadeOut = 1 - memoryEase(map(progress, 0.18, 0.38, 0, 1));
  const alpha = 255 * imageFadeIn * imageFadeOut * (fadeAlpha / 255);

  if (alpha <= 0) return;

  fill(255, alpha);
  textSize(108);
  text(memoryImageWord, 0, 0);
}

function drawMemoryStrike(progress, fadeAlpha) {
  // The strike line cancels IMAGE before darkness fully covers it.
  const strike = memoryEase(map(progress, 0.14, 0.3, 0, 1));
  if (strike <= 0) return;

  const lineAlpha = 255 * strike * (fadeAlpha / 255);
  const x1 = lerp(-42, -232, strike);
  const x2 = lerp(42, 232, strike);
  const y = lerp(-4, 8, strike);

  stroke(0, lineAlpha);
  strokeWeight(3.2);
  line(x1, y, x2, y);

  stroke(0, lineAlpha * 0.4);
  strokeWeight(6.5);
  line(x1 + 6, y + 2, x2 - 4, y + 2);
  noStroke();
}

function drawMemoryBlindness(progress, fadeAlpha) {
  const cover = memoryEase(map(progress, 0.14, 0.34, 0, 1));
  if (cover <= 0) return;

  const coverWidth = lerp(40, 560, cover);
  const coverHeight = lerp(26, 170, cover);
  const veilAlpha = 255 * cover * (fadeAlpha / 255);

  push();
  rectMode(CENTER);
  fill(0, veilAlpha);
  rect(0, 0, coverWidth, coverHeight);

  // Extra black passes keep the cover from feeling like a thin overlay.
  fill(0, veilAlpha * 0.42);
  rect(-24, -8, coverWidth * 0.92, coverHeight * 0.84);
  rect(18, 10, coverWidth * 0.86, coverHeight * 0.78);
  pop();
}

function drawMemoryFragments(progress, fadeAlpha) {
  const appear = memoryEase(map(progress, 0.3, 0.48, 0, 1));
  const driftStage = memoryEase(map(progress, 0.42, 0.7, 0, 1));
  const rebuildStage = memoryEase(map(progress, 0.68, 0.94, 0, 1));

  // Fragments first drift away from the center, then are slowly called back
  // into the final MEMORY composition.
  memoryFragments.forEach((fragment, index) => {
    const local = memoryEase(map(progress, fragment.delay, fragment.delay + 0.18, 0, 1));
    if (local <= 0) return;

    const x1 = lerp(fragment.baseX, fragment.driftX, driftStage * local);
    const y1 = lerp(fragment.baseY, fragment.driftY, driftStage * local);
    const x = lerp(x1, fragment.finalX, rebuildStage);
    const y = lerp(y1, fragment.finalY, rebuildStage);
    const rot = fragment.rotate * local * (1 - rebuildStage);
    const alpha = fragment.alpha * appear * (1 - rebuildStage * 0.36) * (fadeAlpha / 255);
    const haze = (1 - rebuildStage) * 0.46;

    push();
    translate(x, y);
    rotate(rot);
    textSize(fragment.size);

    fill(255, alpha * haze * 0.34);
    text(fragment.text, -10 * haze, 5 * haze);
    fill(255, alpha * haze * 0.22);
    text(fragment.text, 8 * haze, -3 * haze);

    fill(255, alpha);
    text(fragment.text, 0, 0);
    pop();
  });
}

function drawMemoryReconstruction(progress, fadeAlpha) {
  const rebuild = memoryEase(map(progress, 0.78, 0.98, 0, 1));
  if (rebuild <= 0) return;

  const frameReveal = memoryEase(map(progress, 0.86, 1, 0, 1));
  const alpha = 255 * rebuild * (fadeAlpha / 255);
  // A slight size drift keeps the rebuilt word from feeling mechanically fixed.
  const breathe = sin(frameCount * 0.02) * 0.5 + 0.5;
  const size = lerp(94, 102, breathe * 0.35 + rebuild * 0.65);
  const ink = lerp(255, 0, frameReveal);

  textSize(size);

  fill(ink, alpha * 0.14 * (1 - rebuild));
  text(memoryFinalWord, -8 * (1 - rebuild), memoryFinalY + 3 * (1 - rebuild));
  fill(ink, alpha * 0.08 * (1 - rebuild));
  text(memoryFinalWord, 8 * (1 - rebuild), memoryFinalY - 2 * (1 - rebuild));

  fill(ink, alpha);
  text(memoryFinalWord, 0, memoryFinalY);
}

function drawMemoryClosingStack(progress, fadeAlpha) {
  const reveal = memoryEase(map(progress, 0.82, 1, 0, 1));
  if (reveal <= 0) return;

  const frameReveal = memoryEase(map(progress, 0.86, 1, 0, 1));
  const ink = lerp(255, 0, frameReveal);
  // These lines complete the final reading statement around the rebuilt word.
  const lines = [
    { text: 'I', y: -116, size: 34, alpha: 235 },
    { text: 'still', y: -56, size: 42, alpha: 220 },
    { text: 'read', y: -2, size: 40, alpha: 220 },
    { text: 'in', y: 46, size: 34, alpha: 235 },
  ];

  lines.forEach((line, index) => {
    const local = memoryEase(map(reveal, index * 0.08, 0.58 + index * 0.08, 0, 1));
    const alpha = line.alpha * local * (fadeAlpha / 255);
    if (alpha <= 0) return;

    fill(ink, alpha);
    textSize(line.size);
    text(line.text, 0, line.y);
  });
}

function drawMemoryFrame(progress, fadeAlpha) {
  const reveal = memoryEase(map(progress, 0.86, 1, 0, 1));
  if (reveal <= 0) return;

  const frameAlpha = 255 * reveal * (fadeAlpha / 255);
  const paperW = 452;
  const paperH = 468;
  const paperY = 38;
  const tilt = radians(-1.6);

  push();
  rotate(tilt);
  rectMode(CENTER);

  // The final state lands on an archival print, shifting memory from drifting
  // thought into something that feels stored and handled.
  // Use a warm aged-paper tone so the print feels archival rather than new.
  noStroke();
  fill(0, frameAlpha * 0.16);
  rect(8, paperY + 10, paperW, paperH, 4);

  fill(198, 178, 132, frameAlpha);
  stroke(68, 54, 30, frameAlpha * 0.46);
  strokeWeight(1);
  rect(0, paperY, paperW, paperH, 3);

  drawMemoryTape(-118, paperY - paperH * 0.48, 112, 30, radians(-6), frameAlpha);
  drawMemoryTape(126, paperY - paperH * 0.46, 106, 28, radians(7), frameAlpha);

  // A faint inner image window suggests the top/side margins of a Polaroid,
  // while the larger empty lower margin is left open.
  noFill();
  stroke(96, 76, 40, frameAlpha * 0.28);
  rect(0, paperY - 34, 378, 278, 1.5);
  pop();
}

function drawMemoryTape(x, y, w, h, angle, frameAlpha) {
  push();
  translate(x, y);
  rotate(angle);
  rectMode(CENTER);

  noStroke();

  // Aged paper tape keeps the print from reading as a clean digital panel.
  fill(214, 188, 116, frameAlpha * 0.8);
  rect(0, 0, w, h, 2);

  // A softer center makes the strip feel slightly fibrous and worn.
  fill(236, 215, 154, frameAlpha * 0.26);
  rect(-2, -1, w * 0.72, h * 0.62, 1.5);

  // Folded corners keep the tape from reading as a flat digital bar.
  fill(171, 142, 84, frameAlpha * 0.34);
  beginShape();
  vertex(-w * 0.5, -h * 0.5);
  vertex(-w * 0.33, -h * 0.5);
  vertex(-w * 0.42, -h * 0.12);
  vertex(-w * 0.5, h * 0.02);
  endShape(CLOSE);

  beginShape();
  vertex(w * 0.5, h * 0.5);
  vertex(w * 0.28, h * 0.5);
  vertex(w * 0.38, h * 0.08);
  vertex(w * 0.5, -h * 0.04);
  endShape(CLOSE);

  // A few faint fibers break up the fill so it feels closer to paper tape.
  strokeWeight(1);
  for (let i = 0; i < 4; i++) {
    const yy = map(i, 0, 3, -h * 0.28, h * 0.24);
    stroke(255, frameAlpha * 0.06);
    line(-w * 0.34, yy, w * 0.32, yy + random(-1.2, 1.2));
  }

  pop();
}
