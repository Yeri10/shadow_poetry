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

function memoryEase(t) {
  const clamped = constrain(t, 0, 1);
  return clamped * clamped * (3 - 2 * clamped);
}

function initMemory() {
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
}

function drawMemory(stateTimer, fadeAlpha) {
  const progress = constrain(map(stateTimer, 0, sceneDuration * 0.94, 0, 1), 0, 1);

  push();
  translate(width / 2, height / 2 - 16 + memoryYOffset);
  textFont(memoryFont);
  textAlign(CENTER, CENTER);
  noStroke();

  drawMemoryImage(progress, fadeAlpha);
  drawMemoryBlindness(progress, fadeAlpha);
  drawMemoryFragments(progress, fadeAlpha);
  drawMemoryFrame(progress, fadeAlpha);
  drawMemoryReconstruction(progress, fadeAlpha);
  drawMemoryClosingStack(progress, fadeAlpha);

  pop();
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

  // A few extra black passes make the cover feel heavy and final.
  fill(0, veilAlpha * 0.42);
  rect(-24, -8, coverWidth * 0.92, coverHeight * 0.84);
  rect(18, 10, coverWidth * 0.86, coverHeight * 0.78);
  pop();
}

function drawMemoryFragments(progress, fadeAlpha) {
  const appear = memoryEase(map(progress, 0.3, 0.48, 0, 1));
  const driftStage = memoryEase(map(progress, 0.42, 0.7, 0, 1));
  const rebuildStage = memoryEase(map(progress, 0.68, 0.94, 0, 1));

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

  // Use a warm aged-paper tone so the print feels archival rather than new.
  noStroke();
  fill(0, frameAlpha * 0.16);
  rect(8, paperY + 10, paperW, paperH, 4);

  fill(198, 178, 132, frameAlpha);
  stroke(68, 54, 30, frameAlpha * 0.46);
  strokeWeight(1);
  rect(0, paperY, paperW, paperH, 3);

  // A faint inner image window suggests the top/side margins of a Polaroid,
  // while the larger empty lower margin is left open.
  noFill();
  stroke(96, 76, 40, frameAlpha * 0.28);
  rect(0, paperY - 34, 378, 278, 1.5);
  pop();
}
