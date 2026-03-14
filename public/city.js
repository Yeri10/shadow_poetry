// ============================================================
// CITY animation
// CITY expands into a skyline, survey grid, and memory field
// ============================================================

let cityProgress = 0;

let cityPoints = [];
let cityBuildingColumns = [];
let cityFarBuildings = [];
let cityStreetLines = [];
let cityParticles = [];
let cityConstellations = [];
let citySurveyLines = [];
let cityMemoryBlocks = [];
let cityHazeBands = [];
let cityOrbitPoints = [];
let cityPoemWords = [];

// These words feed the lower text field so the city can feel built from both
// language and urban fragments.
const cityWordPool = [
  'CITY', 'STREETS', 'MEMORY', 'TIME', 'BOOKS', 'SHADOW',
  'DARKNESS', 'CENTER', 'HOUSES', 'PLAINS', 'RECOLETA',
  'RETIRO', 'ONCE', 'SOUL', 'DIMNESS', 'ROADS', 'PAGES',
  'NIGHT', 'LIGHT', 'MAP', 'GRID', 'SOUTH', 'ETERNITY',
];

function initCity() {
  cityProgress = 0;
  generateCityScene();
}

function generateCityScene() {
  cityPoints = [];
  cityBuildingColumns = [];
  cityFarBuildings = [];
  cityStreetLines = [];
  cityParticles = [];
  cityConstellations = [];
  citySurveyLines = [];
  cityMemoryBlocks = [];
  cityHazeBands = [];
  cityOrbitPoints = [];
  cityPoemWords = [];

  cityPoints = buildCityPointsCentered();

  // Sample the outline of the word CITY and treat those points as a scaffold
  // for the skyline columns that will later rise out of it.
  for (let i = 0; i < cityPoints.length; i += 2) {
    const p = cityPoints[i];
    const grow = random(70, 260) * map(p.y, height * 0.25, height * 0.75, 1.15, 0.5);
    cityBuildingColumns.push({
      x: p.x,
      y: p.y,
      w: random(4, 12),
      grow,
      winRows: floor(random(3, 9)),
      seed: random(1000),
    });
  }

  let x = -20;
  while (x < width + 20) {
    const w = random(22, 62);
    const h = random(height * 0.08, height * 0.28);
    cityFarBuildings.push({
      x,
      w,
      h,
      flicker: random(1000),
    });
    x += w + random(4, 12);
  }

  const horizon = height * 0.73;
  // Two street systems overlap: horizontal depth bands and perspective lines
  // that pull the eye into the lower field.
  for (let i = 0; i < 28; i++) {
    const y = map(i, 0, 27, horizon, height);
    cityStreetLines.push({
      x1: width * 0.1,
      y1: y,
      x2: width * 0.9,
      y2: y + map(i, 0, 27, 0, height * 0.11),
      a: map(i, 0, 27, 130, 18),
      sw: map(i, 0, 27, 1.6, 0.6),
    });
  }

  for (let i = 0; i < 34; i++) {
    const xg = map(i, 0, 33, width * 0.1, width * 0.9);
    cityStreetLines.push({
      x1: xg,
      y1: horizon,
      x2: lerp(width * 0.5, xg, 1.22),
      y2: height,
      a: 38,
      sw: 0.9,
    });
  }

  for (let i = 0; i < 520; i++) {
    cityParticles.push({
      x: random(width),
      y: random(height),
      s: random(1, 2.8),
      a: random(10, 45),
      drift: random(1000),
      speed: random(0.12, 0.7),
    });
  }

  for (let i = 0; i < 95; i++) {
    cityConstellations.push({
      x: random(width * 0.08, width * 0.92),
      y: random(height * 0.08, height * 0.42),
      r: random(1.6, 4.8),
      seed: random(1000),
    });
  }

  for (let i = 0; i < 22; i++) {
    citySurveyLines.push({
      y: random(height * 0.12, height * 0.78),
      len: random(width * 0.26, width * 0.7),
      x: random(width * 0.06, width * 0.42),
      speed: random(0.1, 0.5),
      phase: random(TWO_PI),
    });
  }

  for (let i = 0; i < 40; i++) {
    cityMemoryBlocks.push({
      x: random(width * 0.06, width * 0.9),
      y: random(height * 0.1, height * 0.68),
      w: random(26, 100),
      h: random(6, 18),
      seed: random(1000),
    });
  }

  for (let i = 0; i < 18; i++) {
    cityHazeBands.push({
      y: map(i, 0, 17, height * 0.12, height * 0.98),
      h: random(24, 64),
      a: map(i, 0, 17, 22, 3),
    });
  }

  for (let i = 0; i < 180; i++) {
    cityOrbitPoints.push({
      ang: map(i, 0, 179, 0, TWO_PI),
      rad: random(width * 0.05, width * 0.34),
      seed: random(1000),
    });
  }

  generateCityPoemWords();
}

function generateCityPoemWords() {
  cityPoemWords = [];
  const horizon = height * 0.73;
  const poemPool = [...cityWordPool, ...getPoemWords('city').map((word) => word.toUpperCase())];

  for (let i = 0; i < 55; i++) {
    cityPoemWords.push({
      word: random(poemPool),
      x: random(width * 0.12, width * 0.88),
      y: random(horizon + 6, height * 0.95),
      size: random(10, 24),
      alpha: random(18, 80),
      seed: random(1000),
      layer: floor(random(3)),
      offsetX: random(-18, 18),
    });
  }

  // Cluster a few words around the base of the CITY skyline so the text feels
  // embedded in the street level rather than only floating behind it.
  for (let i = 0; i < cityBuildingColumns.length; i += 8) {
    const c = cityBuildingColumns[i];
    cityPoemWords.push({
      word: random(poemPool),
      x: c.x + random(-20, 20),
      y: height * 0.76 + random(0, 70),
      size: random(11, 22),
      alpha: random(45, 95),
      seed: random(1000),
      layer: 2,
      offsetX: random(-10, 10),
    });
  }
}

function drawCity(stateTimer, fadeAlpha) {
  cityProgress = constrain(stateTimer / (sceneDuration * 0.86), 0, 1);
  const t = frameCount * 0.01;

  push();
  textFont('Georgia');

  // Build the city in atmospheric layers first, then let the word, street
  // language, and orbital systems sit on top.
  drawCityParticles(t, fadeAlpha);
  drawCityHaze(fadeAlpha);
  drawCityConstellationField(t, fadeAlpha);
  drawCitySurveyField(t, fadeAlpha);
  drawCityMemoryField(t, fadeAlpha);
  drawCityFarBuildings(t, fadeAlpha);
  drawCityStreetGrid(fadeAlpha);
  drawCityFormation(t, fadeAlpha);
  drawCityPoemField(t, fadeAlpha);
  drawCityOrbits(t, fadeAlpha);
  drawCityCenterGlow(t, fadeAlpha);

  pop();
}

function drawCityParticles(t, fadeAlpha) {
  noStroke();
  for (const p of cityParticles) {
    const yy = p.y + sin(t * p.speed + p.drift) * 4;
    const aa = p.a * (0.5 + 0.5 * cityEaseOut(cityProgress)) * (fadeAlpha / 255);
    fill(255, aa);
    circle(p.x, yy, p.s);
  }
}

function drawCityHaze(fadeAlpha) {
  const hazePhase = citySmoothstep(0.12, 1.0, cityProgress) * (fadeAlpha / 255);

  noStroke();
  for (const band of cityHazeBands) {
    fill(255, band.a * hazePhase);
    rect(0, band.y, width, band.h);
  }

  fill(255, 10 * hazePhase);
  rect(0, height * 0.2, width, height * 0.16);

  fill(255, 8 * hazePhase);
  rect(0, height * 0.48, width, height * 0.12);

  fill(255, 6 * hazePhase);
  rect(0, height * 0.74, width, height * 0.1);
}

function drawCityConstellationField(t, fadeAlpha) {
  const phase = citySmoothstep(0.06, 0.68, cityProgress) * (fadeAlpha / 255);

  strokeWeight(1.5);
  for (let i = 0; i < cityConstellations.length; i++) {
    const a = cityConstellations[i];

    for (let j = i + 1; j < min(i + 4, cityConstellations.length); j++) {
      const b = cityConstellations[j];
      const d = dist(a.x, a.y, b.x, b.y);
      if (d < 140) {
        stroke(255, 34 * phase);
        line(a.x, a.y, b.x, b.y);
      }
    }
  }

  noStroke();
  for (const star of cityConstellations) {
    const flick = noise(star.seed, t * 0.42);
    const alpha = map(flick, 0, 1, 40, 150) * phase;
    fill(255, alpha);
    circle(star.x, star.y, star.r);

    fill(255, alpha * 0.35);
    circle(star.x, star.y, star.r * 2.1);
  }
}

function drawCitySurveyField(t, fadeAlpha) {
  const phase = citySmoothstep(0.14, 0.9, cityProgress) * (fadeAlpha / 255);
  strokeWeight(1.3);

  for (const lineInfo of citySurveyLines) {
    const drift = sin(t * lineInfo.speed + lineInfo.phase) * 24;

    stroke(255, 24 * phase);
    line(lineInfo.x + drift, lineInfo.y, lineInfo.x + lineInfo.len + drift, lineInfo.y);

    stroke(255, 16 * phase);
    line(
      lineInfo.x + drift + lineInfo.len * 0.25,
      lineInfo.y - 10,
      lineInfo.x + drift + lineInfo.len * 0.25,
      lineInfo.y + 10
    );
    line(
      lineInfo.x + drift + lineInfo.len * 0.75,
      lineInfo.y - 10,
      lineInfo.x + drift + lineInfo.len * 0.75,
      lineInfo.y + 10
    );
  }

  noStroke();
}

function drawCityMemoryField(t, fadeAlpha) {
  const phase = citySmoothstep(0.18, 0.95, cityProgress) * (fadeAlpha / 255);

  strokeWeight(1.4);
  noFill();

  for (const block of cityMemoryBlocks) {
    const n = noise(block.seed, t * 0.22);
    const alpha = map(n, 0, 1, 12, 56) * phase;
    stroke(255, alpha);
    rect(block.x, block.y, block.w, block.h);

    stroke(255, alpha * 0.8);
    line(block.x + 4, block.y + block.h * 0.5, block.x + block.w - 4, block.y + block.h * 0.5);
  }

  noStroke();
}

function drawCityFarBuildings(t, fadeAlpha) {
  const horizon = height * 0.73;
  const phase = citySmoothstep(0.08, 0.7, cityProgress) * (fadeAlpha / 255);

  for (const building of cityFarBuildings) {
    noStroke();
    fill(255, 22 * phase);
    rect(building.x, horizon - building.h, building.w, building.h);

    const cols = max(1, floor(building.w / 8));
    const rows = max(2, floor(building.h / 10));

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const wx = building.x + 3 + i * 8;
        const wy = horizon - building.h + 4 + j * 10;
        const flick = noise(building.flicker + i * 0.18, j * 0.2, t * 0.7);
        const alpha = map(flick, 0, 1, 10, 95) * phase;
        fill(255, alpha * 0.8);
        rect(wx, wy, 3.5, 4.5);
      }
    }
  }
}

function drawCityStreetGrid(fadeAlpha) {
  const phase = citySmoothstep(0.26, 0.82, cityProgress) * (fadeAlpha / 255);

  for (const lineInfo of cityStreetLines) {
    strokeWeight(lineInfo.sw);
    stroke(255, lineInfo.a * phase);
    line(lineInfo.x1, lineInfo.y1, lineInfo.x2, lineInfo.y2);
  }

  for (let i = 0; i < 12; i++) {
    const y = height * 0.77 + i * 16;
    strokeWeight(0.9);
    stroke(255, 16 * phase);
    line(width * 0.06, y, width * 0.94, y);
  }

  noStroke();
}

function drawCityFormation(t, fadeAlpha) {
  const outlinePhase = citySmoothstep(0.0, 0.16, cityProgress) * (fadeAlpha / 255);
  const stretchPhase = citySmoothstep(0.08, 0.36, cityProgress);
  const buildPhase = citySmoothstep(0.2, 0.84, cityProgress) * (fadeAlpha / 255);
  const volumePhase = citySmoothstep(0.42, 1.0, cityProgress) * (fadeAlpha / 255);

  // The original CITY outline appears first as points and wire segments before
  // thickening into architecture.
  for (const p of cityPoints) {
    const lift = map(stretchPhase, 0, 1, 0, -74);
    const x = p.x;
    const y = p.y + lift;

    fill(255, 235 * outlinePhase);
    circle(x, y, 2.2);

    fill(255, 92 * volumePhase);
    circle(x + 11 * volumePhase, y - 11 * volumePhase, 1.5);
  }

  stroke(255, 65 * citySmoothstep(0.14, 0.72, cityProgress) * (fadeAlpha / 255));
  strokeWeight(1.1);
  for (let i = 0; i < cityPoints.length - 7; i += 6) {
    const p1 = cityPoints[i];
    const p2 = cityPoints[i + 3];
    const lift = map(stretchPhase, 0, 1, 0, -74);
    line(p1.x, p1.y + lift, p2.x, p2.y + lift);
  }
  noStroke();

  for (const column of cityBuildingColumns) {
    const lift = map(stretchPhase, 0, 1, 0, -74);
    const baseY = column.y + lift;
    const growAmt = column.grow * buildPhase;

    fill(255, 165 * buildPhase);
    rect(column.x - column.w * 0.5, baseY - growAmt, column.w, growAmt);

    // Side and roof faces turn the flat columns into simple volumetric blocks.
    if (volumePhase > 0.01) {
      fill(255, 70 * volumePhase);
      beginShape();
      vertex(column.x + column.w * 0.5, baseY);
      vertex(column.x + column.w * 0.5, baseY - growAmt);
      vertex(column.x + column.w * 0.5 + 12 * volumePhase, baseY - growAmt - 12 * volumePhase);
      vertex(column.x + column.w * 0.5 + 12 * volumePhase, baseY - 12 * volumePhase);
      endShape(CLOSE);
    }

    if (volumePhase > 0.01) {
      fill(255, 30 * volumePhase);
      beginShape();
      vertex(column.x - column.w * 0.5, baseY - growAmt);
      vertex(column.x + column.w * 0.5, baseY - growAmt);
      vertex(column.x + column.w * 0.5 + 12 * volumePhase, baseY - growAmt - 12 * volumePhase);
      vertex(column.x - column.w * 0.5 + 12 * volumePhase, baseY - growAmt - 12 * volumePhase);
      endShape(CLOSE);
    }

    const ww = max(2, column.w * 0.28);
    const wh = 6;
    for (let j = 0; j < column.winRows; j++) {
      const wy = baseY - 12 - j * 16;
      if (wy > baseY - growAmt + 6) {
        const alpha = map(noise(column.seed + j * 0.2, t * 0.85), 0, 1, 45, 230) * buildPhase;
        fill(255, alpha);
        rect(column.x - ww * 0.5, wy, ww, wh);
      }
    }
  }

  const clusterPhase = citySmoothstep(0.4, 1.0, cityProgress) * (fadeAlpha / 255);
  noFill();
  strokeWeight(1.2);
  for (let i = 0; i < cityBuildingColumns.length; i += 5) {
    const column = cityBuildingColumns[i];
    const lift = map(stretchPhase, 0, 1, 0, -74);
    const baseY = column.y + lift;
    const gy = column.grow * buildPhase;
    const rw = 24 + (i % 3) * 8;
    const rh = 10 + (i % 4) * 3;
    stroke(255, 28 * clusterPhase);
    rect(column.x + 14, baseY - gy + 20, rw, rh);
  }
  noStroke();
}

function drawCityPoemField(t, fadeAlpha) {
  const phase = citySmoothstep(0.34, 1.0, cityProgress) * (fadeAlpha / 255);

  textAlign(CENTER, CENTER);
  textFont('Noto Sans');

  // The lower word field acts like street signage, map labels, and drifting
  // memory at once, so each layer gets a slightly different treatment.
  for (const wordInfo of cityPoemWords) {
    const flick = noise(wordInfo.seed, t * 0.4);
    const alpha = map(flick, 0, 1, wordInfo.alpha * 0.55, wordInfo.alpha) * phase;

    const yy = wordInfo.y + sin(t * 0.6 + wordInfo.seed) * (wordInfo.layer + 1) * 1.2;
    const xx = wordInfo.x + sin(t * 0.3 + wordInfo.seed) * wordInfo.offsetX * 0.05;

    if (wordInfo.layer === 0) {
      textSize(wordInfo.size);
      fill(255, alpha * 0.55);
      text(wordInfo.word, xx, yy);
    } else if (wordInfo.layer === 1) {
      textSize(wordInfo.size * 0.95);
      fill(255, alpha * 0.75);
      text(wordInfo.word, xx, yy);
      stroke(255, alpha * 0.18);
      line(xx - textWidth(wordInfo.word) * 0.45, yy + 9, xx + textWidth(wordInfo.word) * 0.45, yy + 9);
      noStroke();
    } else {
      textSize(wordInfo.size);
      fill(255, alpha);
      text(wordInfo.word, xx, yy);
      fill(255, alpha * 0.2);
      text(wordInfo.word, xx + 1.5, yy + 1.5);
    }
  }
}

function drawCityOrbits(t, fadeAlpha) {
  const phase = citySmoothstep(0.32, 1.0, cityProgress) * (fadeAlpha / 255);

  push();
  translate(width * 0.5, height * 0.5);

  // Orbital ellipses give the city a surveying / mapping logic instead of a
  // purely literal skyline reading.
  noFill();
  for (let i = 0; i < 6; i++) {
    const rx = width * (0.08 + i * 0.04);
    const ry = height * (0.035 + i * 0.018);
    strokeWeight(map(i, 0, 5, 1.8, 0.8));
    stroke(255, map(i, 0, 5, 32, 10) * phase);
    ellipse(0, 0, rx, ry);
  }

  noStroke();
  for (const point of cityOrbitPoints) {
    const x = cos(point.ang + t * 0.07) * point.rad * 1.12;
    const y = sin(point.ang + t * 0.07) * point.rad * 0.3;
    const alpha = map(noise(point.seed, t * 0.35), 0, 1, 8, 46) * phase;
    fill(255, alpha);
    circle(x, y, 1.8);
  }

  pop();
}

function drawCityCenterGlow(t, fadeAlpha) {
  const phase = citySmoothstep(0.48, 1.0, cityProgress) * (fadeAlpha / 255);

  push();
  translate(width * 0.5, height * 0.5);

  noFill();
  for (let i = 0; i < 7; i++) {
    const r = 36 + i * 24 + sin(t * 1.1 + i) * 2;
    strokeWeight(map(i, 0, 6, 2.1, 0.8));
    stroke(255, map(i, 0, 6, 34, 4) * phase);
    ellipse(0, 0, r * 2.3, r * 0.86);
  }

  noStroke();
  fill(255, 16 * phase);
  ellipse(0, 0, 110, 28);

  fill(255, 8 * phase);
  ellipse(0, 0, 52, 12);

  pop();
}

function buildCityPointsCentered() {
  let pts = [];
  const s = min(width, height) * 0.12;
  const gap = s * 1.08;

  const totalW = gap * 3.58 + s * 0.8;
  const baseX = width * 0.5 - totalW * 0.5;
  const baseY = height * 0.58;

  // Build a geometric CITY skeleton from sampled strokes so the word can
  // transform directly into an urban diagram.
  pts = pts.concat(citySampleRectOutline(baseX, baseY - s, s * 0.82, s * 1.25, 14, [true, false, true, true]));
  pts = pts.concat(citySampleRectOutline(baseX + gap, baseY - s, s * 0.22, s * 1.25, 11, [true, true, true, true]));
  pts = pts.concat(citySampleRectOutline(baseX + gap * 1.82, baseY - s, s * 0.9, s * 0.2, 12, [true, true, true, true]));
  pts = pts.concat(citySampleRectOutline(baseX + gap * 1.82 + s * 0.34, baseY - s, s * 0.22, s * 1.25, 12, [true, true, true, true]));
  pts = pts.concat(citySampleLinePoints(baseX + gap * 2.98, baseY - s, baseX + gap * 3.28, baseY - s * 0.55, 18));
  pts = pts.concat(citySampleLinePoints(baseX + gap * 3.58, baseY - s, baseX + gap * 3.28, baseY - s * 0.55, 18));
  pts = pts.concat(citySampleLinePoints(baseX + gap * 3.28, baseY - s * 0.55, baseX + gap * 3.28, baseY + s * 0.25, 22));

  return pts;
}

function citySampleRectOutline(x, y, w, h, stepCount, sides = [true, true, true, true]) {
  const pts = [];

  if (sides[0]) {
    for (let i = 0; i <= stepCount; i++) pts.push({ x: lerp(x, x + w, i / stepCount), y });
  }
  if (sides[1]) {
    for (let i = 0; i <= stepCount; i++) pts.push({ x: x + w, y: lerp(y, y + h, i / stepCount) });
  }
  if (sides[2]) {
    for (let i = 0; i <= stepCount; i++) pts.push({ x: lerp(x + w, x, i / stepCount), y: y + h });
  }
  if (sides[3]) {
    for (let i = 0; i <= stepCount; i++) pts.push({ x, y: lerp(y + h, y, i / stepCount) });
  }

  return pts;
}

function citySampleLinePoints(x1, y1, x2, y2, count) {
  const pts = [];
  for (let i = 0; i <= count; i++) {
    pts.push({
      x: lerp(x1, x2, i / count),
      y: lerp(y1, y2, i / count),
    });
  }
  return pts;
}

function citySmoothstep(a, b, x) {
  const normalized = constrain((x - a) / (b - a), 0, 1);
  return normalized * normalized * (3 - 2 * normalized);
}

function cityEaseOut(x) {
  return 1 - pow(1 - x, 3);
}
