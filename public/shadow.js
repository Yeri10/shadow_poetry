// ============================================================
// SHADOW animation
// The poem becomes the typography and collapses into shadow
// ============================================================

let shadowLayout = {
  topWord: 'NOW',
  coreWord: 'SHADOW',
  tailWords: ['becomes', 'my', 'world'],
};
let shadowPhraseTokens = [];
let shadowInkDust = [];
const shadowYOffset = -130;
const shadowFont = 'Noto Sans, sans-serif';
// Four density bands build the shadow from a light top edge to a dense base.
const shadowRowCounts = [10, 24, 110, 160];
const shadowDustCount = 54;

function createShadowAnchor(row, index, total) {
  // Place each phrase inside a slanted wedge so the text field reads as a
  // projected shadow rather than a centered cloud.
  const cols = max(5, ceil(sqrt(total * 1.45)));
  const rows = ceil(total / cols);
  const col = index % cols;
  const line = floor(index / cols);
  const colT = cols <= 1 ? 0.5 : col / (cols - 1);
  const lineT = rows <= 1 ? 0.5 : line / (rows - 1);
  const bandStarts = [0.08, 0.26, 0.48, 0.7];
  const bandEnds = [0.22, 0.46, 0.74, 1.0];
  const depth = lerp(bandStarts[row - 1], bandEnds[row - 1], lineT);
  const topLeftX = width / 2 - 190;
  const topRightX = width / 2 + 82;
  const bottomLeftX = width / 2 + 126;
  const bottomRightX = width / 2 + 620;
  const topY = height / 2 + 10 + shadowYOffset;
  const bottomY = height / 2 + 396 + shadowYOffset;
  const leftX = lerp(topLeftX, bottomLeftX, depth);
  const rightX = lerp(topRightX, bottomRightX, depth);
  const cellWidth = cols <= 1 ? 0 : (rightX - leftX) / cols;
  const columnOffset = (line % 2 === 0 ? -0.22 : 0.22) * cellWidth;
  const x = lerp(leftX, rightX, colT) + columnOffset;
  const y = lerp(topY, bottomY, depth) + lineT * lerp(5, 24, depth);
  const ridge = sin(colT * PI) * lerp(4, 12, depth);
  const stagger = (line % 3 - 1) * lerp(2, 6, depth);

  return {
    x: x + random(-0.9, 0.9),
    y: y - ridge + stagger + random(-0.9, 0.9),
  };
}

function initShadow() {
  const poemWords = getPoemLine('shadow')
    .replace(/[.,;:!?]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  shadowLayout = {
    topWord: (poemWords[0] || 'Now').toUpperCase(),
    coreWord: (poemWords[1] || 'shadow').toUpperCase(),
    tailWords: poemWords.slice(2).length ? poemWords.slice(2) : ['becomes', 'my', 'world'],
  };

  const rowOneY = height / 2 + 108 + shadowYOffset;
  const rowTwoY = height / 2 + 164 + shadowYOffset;
  const phrase = shadowLayout.tailWords.join(' ');
  // Each band keeps its own scale, opacity, and spawn range, but all rows
  // resolve into the same shadow structure below the main word.
  const rowConfigs = [
    {
      row: 1,
      count: shadowRowCounts[0],
      baseXRange: 440,
      baseYMin: rowOneY - 12,
      baseYMax: rowOneY + 30,
      sizeMin: 15,
      sizeMax: 19,
      alphaMin: 120,
      alphaMax: 150,
      targetYMin: 0,
      targetYMax: 0,
      delayMin: 0.1,
      delayMax: 0.37,
      sequencedDelay: true,
    },
    {
      row: 2,
      count: shadowRowCounts[1],
      baseXRange: 460,
      baseYMin: rowTwoY - 10,
      baseYMax: rowTwoY + 44,
      sizeMin: 14,
      sizeMax: 18,
      alphaMin: 96,
      alphaMax: 132,
      targetYMin: 0,
      targetYMax: 0,
      delayMin: 0.14,
      delayMax: 0.56,
      sequencedDelay: false,
    },
    {
      row: 3,
      count: shadowRowCounts[2],
      baseXRange: 520,
      baseYMin: height / 2 + 92,
      baseYMax: height / 2 + 280,
      sizeMin: 12,
      sizeMax: 16,
      alphaMin: 34,
      alphaMax: 92,
      targetYMin: -5,
      targetYMax: 6,
      delayMin: 0.12,
      delayMax: 0.82,
      sequencedDelay: false,
    },
    {
      row: 4,
      count: shadowRowCounts[3],
      baseXRange: 540,
      baseYMin: height / 2 + 96,
      baseYMax: height / 2 + 428,
      sizeMin: 10.5,
      sizeMax: 14.5,
      alphaMin: 20,
      alphaMax: 70,
      targetYMin: -6,
      targetYMax: 8,
      delayMin: 0.1,
      delayMax: 0.88,
      sequencedDelay: false,
    },
  ];

  shadowPhraseTokens = [];
  rowConfigs.forEach((config) => {
    for (let i = 0; i < config.count; i++) {
      const anchor = createShadowAnchor(config.row, i, config.count);
      shadowPhraseTokens.push({
        text: phrase,
        baseX: width / 2 + random(-config.baseXRange, config.baseXRange),
        baseY: random(config.baseYMin, config.baseYMax),
        targetX: anchor.x,
        targetY: anchor.y + random(config.targetYMin, config.targetYMax),
        size: random(config.sizeMin, config.sizeMax),
        alpha: random(config.alphaMin, config.alphaMax),
        phase: random(TWO_PI),
        delay: config.sequencedDelay
          ? config.delayMin + i * 0.03
          : random(config.delayMin, config.delayMax),
      });
    }
  });

  shadowInkDust = Array.from({ length: shadowDustCount }, () => ({
    x: width / 2 + random(-210, 210),
    y: height / 2 + random(-10, 110),
    size: random(1.5, 4.5),
    alpha: random(8, 26),
    phase: random(TWO_PI),
  }));
}

function drawShadow(stateTimer, fadeAlpha) {
  const progress = constrain(map(stateTimer, 0, sceneDuration * 0.94, 0, 1), 0, 1);
  const topFade = constrain(map(progress, 0.02, 0.18, 0, 1), 0, 1);
  const coreFade = constrain(map(progress, 0.06, 0.28, 0, 1), 0, 1);
  const phraseFade = constrain(map(progress, 0.18, 0.72, 0, 1), 0, 1);
  const mergeFade = constrain(map(progress, 0.54, 1, 0, 1), 0, 1);

  drawShadowPrelude(topFade, fadeAlpha);
  drawShadowCore(progress, coreFade, mergeFade, fadeAlpha);
  drawShadowPoemField(progress, phraseFade, mergeFade, fadeAlpha);
}

function drawShadowPrelude(topFade, fadeAlpha) {
  const letters = shadowLayout.topWord.split('');
  const startY = height / 2 - 178 + shadowYOffset;
  const stepY = 28;

  push();
  textAlign(CENTER, CENTER);
  textFont(shadowFont);
  noStroke();
  fill(255, 255 * topFade * (fadeAlpha / 255));
  textSize(28);
  letters.forEach((letter, index) => {
    text(letter, width / 2, startY + index * stepY);
  });
  pop();
}

function drawShadowCore(progress, coreFade, mergeFade, fadeAlpha) {
  push();
  translate(width / 2, height / 2 - 10 + shadowYOffset);
  textAlign(CENTER, CENTER);
  textFont(shadowFont);
  textStyle(BOLD);

  const grow = progress;
  const pulse = lerp(0.96, 1.12, grow);
  const baseAlpha = 255 * coreFade * (1 - mergeFade * 0.08) * (fadeAlpha / 255);
  const glyphSize = lerp(94, 114, grow);
  const weightStroke = lerp(0.25, 3.4, grow) * coreFade;

  scale(pulse);

  textSize(glyphSize);
  // Keep the word single-layered, but let a same-color contour thicken it as
  // it grows so the scale change feels heavier rather than blurry.
  strokeJoin(ROUND);
  stroke(255, baseAlpha);
  strokeWeight(weightStroke);
  fill(255, baseAlpha);
  text(shadowLayout.coreWord, 0, 0);

  pop();
}

function drawShadowPoemField(progress, phraseFade, mergeFade, fadeAlpha) {
  push();
  textAlign(CENTER, CENTER);
  textFont(shadowFont);
  const fadeScale = fadeAlpha / 255;
  const dustFade = constrain(map(progress, 0.3, 0.92, 0, 1), 0, 1);

  shadowPhraseTokens.forEach((token, index) => {
    const local = constrain(map(progress, token.delay, 1, 0, 1), 0, 1);
    if (local <= 0) return;

    const clarity = pow(local, 1.35);
    const gather = constrain(map(progress, token.delay + 0.1, 0.96, 0, 1), 0, 1);
    const pull = max(gather * 0.82, mergeFade * 0.46);
    const jitterX = sin(frameCount * 0.03 + token.phase + index) * (1 - clarity) * 9;
    const jitterY = sin(frameCount * 0.024 + token.phase) * (1 - clarity) * 7;
    const x = lerp(token.baseX, token.targetX, pull) + jitterX * (1 - pull);
    const y = lerp(token.baseY, token.targetY, pull) + jitterY * (1 - pull);
    const alpha = token.alpha * (0.12 + clarity * 0.88) * phraseFade * (1 - mergeFade * 0.12) * fadeScale;
    const ghostFade = (1 - clarity) * phraseFade * fadeScale;

    noStroke();
    textSize(token.size);

    // The phrase starts as a soft memory trace, then settles into a sharper
    // line as it is pulled deeper into the shadow field.
    fill(255, token.alpha * 0.22 * ghostFade);
    text(token.text, x - (1 - clarity) * 10, y + (1 - clarity) * 2);
    fill(255, token.alpha * 0.16 * ghostFade);
    text(token.text, x + (1 - clarity) * 8, y - (1 - clarity) * 3);

    fill(255, alpha);
    text(token.text, x, y);
  });

  shadowInkDust.forEach((dust, index) => {
    if (dustFade <= 0) return;

    const driftY = sin(frameCount * 0.03 + dust.phase + index * 0.2) * 3;
    noStroke();
    fill(255, dust.alpha * dustFade * (1 - mergeFade * 0.45) * fadeScale);
    circle(dust.x, dust.y + driftY, dust.size);
  });

  pop();
}
