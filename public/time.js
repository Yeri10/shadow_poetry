// ============================================================
// TIME animation
// TIME drifts through dials, residue, and slow temporal echoes
// ============================================================

let timeLetters = [];
let timeGhosts = [];
let timeParticles = [];
let timeArcs = [];

let timeIntroProgress = 0;
let timeDriftStart = false;
let timeGlobalTime = 0;

function initTime() {
  timeIntroProgress = 0;
  timeDriftStart = false;
  timeGlobalTime = 0;
  initTimeLetters();
  initTimeParticles();
  initTimeArcs();
  timeGhosts = [];
}

function drawTime(stateTimer, fadeAlpha) {
  timeGlobalTime = millis() * 0.001;

  push();
  textAlign(CENTER, CENTER);
  textFont('Times New Roman');
  rectMode(CORNER);

  // The scene builds from ambient systems into readable clock imagery, then
  // lets the word TIME loosen and drift once the intro has settled.
  drawTimeSoftVignette(fadeAlpha);
  drawTimeBackgroundParticles(fadeAlpha);
  drawTimeOrbitalArcs(fadeAlpha);
  drawTimeMainDial(fadeAlpha);
  drawTimeSecondaryDials(fadeAlpha);
  drawTimeSecondHandCloseup(fadeAlpha);
  drawTimeHourglass(fadeAlpha);
  updateTimeIntro(stateTimer);
  updateTimeLetters(fadeAlpha);
  drawTimeGhosts(fadeAlpha);
  drawTimeLetters(fadeAlpha);
  drawTimeDriftLines(fadeAlpha);
  drawTimeCenterBreath(fadeAlpha);

  pop();
}

function initTimeLetters() {
  timeLetters = [];
  const word = 'TIME';
  const spacing = min(width, height) * 0.13;
  const baseSize = min(width, height) * 0.18;

  // Store each letter as a small motion system so the intro can begin in a
  // stable lockup and later peel apart into slow temporal drift.
  for (let i = 0; i < word.length; i++) {
    const x = width / 2 + (i - 1.5) * spacing;
    const y = height / 2;

    timeLetters.push({
      char: word[i],
      baseX: x,
      baseY: y,
      x,
      y,
      size: baseSize + random(-8, 8),
      alpha: 255,
      noiseX: random(1000),
      noiseY: random(1000),
      speedX: random(0.001, 0.0035),
      speedY: random(0.001, 0.003),
      scaleX: random(18, 70),
      scaleY: random(12, 55),
      phase: random(TWO_PI),
      rotation: random(-0.04, 0.04),
      echoGap: random(2, 7),
      verticalBias: random(-25, 25),
      horizontalBias: map(i, 0, 3, -18, 18),
    });
  }
}

function initTimeParticles() {
  timeParticles = [];
  const count = floor((width * height) / 16000);

  // Background particles stay sparse and slow so they read as temporal dust,
  // not as a competing star field.
  for (let i = 0; i < count; i++) {
    timeParticles.push({
      x: random(width),
      y: random(height),
      s: random(1, 3),
      a: random(12, 70),
      n: random(1000),
      vx: random(-0.08, 0.08),
      vy: random(-0.03, 0.03),
    });
  }
}

function initTimeArcs() {
  timeArcs = [];
  // Offset arc speeds and lengths so the dial field feels layered rather than
  // mechanically synchronized.
  for (let i = 0; i < 12; i++) {
    timeArcs.push({
      r: random(min(width, height) * 0.15, min(width, height) * 0.55),
      start: random(TWO_PI),
      len: random(0.3, 1.5),
      speed: random(-0.006, 0.006),
      alpha: random(10, 50),
      weight: random(0.5, 1.5),
    });
  }
}

function updateTimeIntro(stateTimer) {
  if (!timeDriftStart) {
    timeIntroProgress += 0.006;
    if (timeIntroProgress >= 1.0) {
      timeIntroProgress = 1.0;
      if (stateTimer > 150) timeDriftStart = true;
    }
  }
}

function updateTimeLetters(fadeAlpha) {
  for (let i = 0; i < timeLetters.length; i++) {
    const letter = timeLetters[i];

    if (!timeDriftStart) {
      letter.x = lerp(letter.x, letter.baseX, 0.08);
      letter.y = lerp(letter.y, letter.baseY, 0.08);
      letter.alpha = lerp(letter.alpha, 255, 0.08);
    } else {
      // Noise handles the main displacement while slower sine waves keep the
      // movement from feeling purely random.
      const dx = (noise(letter.noiseX + frameCount * letter.speedX) - 0.5) * letter.scaleX * 2;
      const dy = (noise(letter.noiseY + frameCount * letter.speedY) - 0.5) * letter.scaleY * 2;

      const waveX = sin(timeGlobalTime * 0.22 + letter.phase) * 16;
      const waveY = cos(timeGlobalTime * 0.18 + letter.phase * 1.3) * 10;

      letter.x = letter.baseX + dx + waveX + letter.horizontalBias;
      letter.y = letter.baseY + dy + waveY + letter.verticalBias * sin(timeGlobalTime * 0.08 + i);

      const alphaNoise = noise(letter.noiseY + frameCount * 0.008 + 100);
      letter.alpha = map(alphaNoise, 0, 1, 70, 240);

      // Leave fading traces behind the drifting letters so the scene keeps a
      // readable temporal residue after the lockup breaks apart.
      if (frameCount % 2 === 0) {
        timeGhosts.push({
          char: letter.char,
          x: letter.x,
          y: letter.y,
          size: letter.size,
          alpha: random(16, 70) * (fadeAlpha / 255),
          decay: random(0.5, 1.2),
          rot: random(-0.03, 0.03),
        });
      }
    }
  }

  for (let i = timeGhosts.length - 1; i >= 0; i--) {
    timeGhosts[i].alpha -= timeGhosts[i].decay;
    if (timeGhosts[i].alpha <= 0) timeGhosts.splice(i, 1);
  }
}

function drawTimeLetters(fadeAlpha) {
  if (!timeDriftStart) {
    const introAlpha = timeEaseOutCubic(timeIntroProgress) * 255 * (fadeAlpha / 255);
    const introSize = min(width, height) * 0.19;
    const spacing = min(width, height) * 0.13;
    const chars = 'TIME';

    push();
    translate(width / 2, height / 2);

    // Draw a short stacked echo first so the word lands with some depth before
    // the drift systems start modifying each letter independently.
    for (let i = 0; i < chars.length; i++) {
      const x = (i - 1.5) * spacing;

      fill(255, introAlpha * 0.12);
      textSize(introSize);
      text(chars[i], x - 6, 4);

      fill(255, introAlpha * 0.22);
      text(chars[i], x - 3, 2);

      fill(255, introAlpha);
      text(chars[i], x, 0);
    }
    pop();
  }

  for (let i = 0; i < timeLetters.length; i++) {
    const letter = timeLetters[i];

    push();
    translate(letter.x, letter.y);
    rotate(sin(timeGlobalTime * 0.15 + i) * letter.rotation);

    // Keep a few soft offset copies behind each letter so the final word feels
    // unstable without becoming unreadable.
    for (let k = 5; k >= 1; k--) {
      fill(255, letter.alpha * 0.05 * (fadeAlpha / 255));
      textSize(letter.size);
      text(letter.char, -k * letter.echoGap, k * 1.2);
    }

    fill(255, letter.alpha * 0.25 * (fadeAlpha / 255));
    textSize(letter.size);
    text(letter.char, -2, 1);

    fill(255, letter.alpha * (fadeAlpha / 255));
    textSize(letter.size);
    text(letter.char, 0, 0);

    pop();
  }
}

function drawTimeGhosts(fadeAlpha) {
  for (const ghost of timeGhosts) {
    push();
    translate(ghost.x, ghost.y);
    rotate(ghost.rot);
    fill(255, ghost.alpha * (fadeAlpha / 255));
    textSize(ghost.size);
    text(ghost.char, 0, 0);
    pop();
  }
}

function drawTimeMainDial(fadeAlpha) {
  push();
  translate(width / 2, height / 2);
  noFill();

  const rBase = min(width, height) * 0.28;

  // Concentric rings and tick marks establish a stable clock face before the
  // surrounding fragments start competing for attention.
  for (let i = 0; i < 4; i++) {
    const rr = rBase + i * min(width, height) * 0.06 + sin(timeGlobalTime * 0.7 + i) * 3;
    stroke(255, (25 + i * 18) * (fadeAlpha / 255));
    strokeWeight(1);
    ellipse(0, 0, rr * 2, rr * 2);
  }

  for (let i = 0; i < 60; i++) {
    const a = map(i, 0, 60, 0, TWO_PI) + sin(timeGlobalTime * 0.08) * 0.05;
    const len = i % 5 === 0 ? 18 : 8;
    const r1 = rBase;
    const r2 = rBase + len;

    const x1 = cos(a) * r1;
    const y1 = sin(a) * r1;
    const x2 = cos(a) * r2;
    const y2 = sin(a) * r2;

    stroke(255, (i % 5 === 0 ? 90 : 34) * (fadeAlpha / 255));
    strokeWeight(i % 5 === 0 ? 1.2 : 0.8);
    line(x1, y1, x2, y2);
  }

  const secA = -HALF_PI + timeGlobalTime * 0.72;
  const minA = -HALF_PI + timeGlobalTime * 0.11;
  const hourA = -HALF_PI + timeGlobalTime * 0.03;

  for (let k = 8; k > 0; k--) {
    const aa = secA - k * 0.035;
    stroke(255, (8 + k * 5) * (fadeAlpha / 255));
    strokeWeight(1);
    line(0, 0, cos(aa) * rBase * 1.05, sin(aa) * rBase * 1.05);
  }

  stroke(255, 110 * (fadeAlpha / 255));
  strokeWeight(3);
  line(0, 0, cos(hourA) * rBase * 0.42, sin(hourA) * rBase * 0.42);

  stroke(255, 170 * (fadeAlpha / 255));
  strokeWeight(2);
  line(0, 0, cos(minA) * rBase * 0.68, sin(minA) * rBase * 0.68);

  stroke(255, 255 * (fadeAlpha / 255));
  strokeWeight(1.2);
  line(0, 0, cos(secA) * rBase * 0.96, sin(secA) * rBase * 0.96);

  noStroke();
  fill(255, 180 * (fadeAlpha / 255));
  ellipse(0, 0, 9, 9);

  pop();
}

function drawTimeSecondaryDials(fadeAlpha) {
  push();
  noFill();

  const positions = [
    { x: width * 0.18, y: height * 0.22, r: min(width, height) * 0.08 },
    { x: width * 0.82, y: height * 0.24, r: min(width, height) * 0.06 },
    { x: width * 0.2, y: height * 0.78, r: min(width, height) * 0.07 },
  ];

  for (const pos of positions) {
    push();
    translate(pos.x, pos.y);

    // Secondary dials move at location-derived speeds so they feel related to
    // the main clock, but not locked to the same rhythm.
    for (let i = 0; i < 3; i++) {
      stroke(255, (18 + i * 14) * (fadeAlpha / 255));
      ellipse(0, 0, (pos.r + i * 12) * 2);
    }

    const a = -HALF_PI + timeGlobalTime * timeRandomDialSpeed(pos.x, pos.y);

    stroke(255, 90 * (fadeAlpha / 255));
    strokeWeight(1);
    line(0, 0, cos(a) * pos.r * 0.9, sin(a) * pos.r * 0.9);

    pop();
  }

  pop();
}

function timeRandomDialSpeed(x, y) {
  return map(noise(x * 0.001, y * 0.001), 0, 1, 0.15, 0.5);
}

function drawTimeSecondHandCloseup(fadeAlpha) {
  const px = width * 0.1;
  const py = height * 0.12;
  const pw = width * 0.28;
  const ph = height * 0.26;

  // This inset reframes the second hand as a technical detail, adding a tighter
  // instrument view alongside the large central clock.
  noStroke();
  fill(255, 10 * (fadeAlpha / 255));
  rect(px, py, pw, ph);

  stroke(255, 30 * (fadeAlpha / 255));
  noFill();
  rect(px, py, pw, ph);

  push();
  translate(px + pw * 0.55, py + ph * 0.55);

  const a = -HALF_PI + timeGlobalTime * 1.2;

  for (let i = 0; i < 6; i++) {
    stroke(255, (12 + i * 10) * (fadeAlpha / 255));
    strokeWeight(1);
    arc(0, 0, pw * (0.55 + i * 0.1), pw * (0.55 + i * 0.1), -2.0, 1.0);
  }

  for (let i = 0; i < 20; i++) {
    const aa = map(i, 0, 19, -2.1, 1.1);
    const r1 = pw * 0.18;
    const r2 = pw * 0.31 + (i % 4 === 0 ? 8 : 0);

    stroke(255, (i % 4 === 0 ? 110 : 40) * (fadeAlpha / 255));
    line(cos(aa) * r1, sin(aa) * r1, cos(aa) * r2, sin(aa) * r2);
  }

  for (let k = 10; k > 0; k--) {
    const aa = a - k * 0.05;
    stroke(255, (5 + k * 8) * (fadeAlpha / 255));
    strokeWeight(1);
    line(-18, 12, cos(aa) * pw * 0.22, sin(aa) * pw * 0.22);
  }

  stroke(255, 240 * (fadeAlpha / 255));
  strokeWeight(2);
  line(-18, 12, cos(a) * pw * 0.22, sin(a) * pw * 0.22);

  noStroke();
  fill(255, 180 * (fadeAlpha / 255));
  ellipse(-18, 12, 8, 8);

  pop();
}

function drawTimeHourglass(fadeAlpha) {
  const gx = width * 0.84;
  const gy = height * 0.74;
  const w = min(width, height) * 0.12;
  const h = min(width, height) * 0.21;

  push();
  translate(gx, gy);

  // A simple hourglass adds a second timekeeping symbol so the scene reads as a
  // field of temporal instruments rather than a single clock illustration.
  stroke(255, 100 * (fadeAlpha / 255));
  strokeWeight(1.2);
  noFill();

  line(-w * 0.5, -h * 0.5, w * 0.5, -h * 0.5);
  line(-w * 0.5, h * 0.5, w * 0.5, h * 0.5);

  line(-w * 0.5, -h * 0.5, w * 0.12, -h * 0.04);
  line(w * 0.5, -h * 0.5, -w * 0.12, -h * 0.04);
  line(-w * 0.5, h * 0.5, w * 0.12, h * 0.04);
  line(w * 0.5, h * 0.5, -w * 0.12, h * 0.04);

  const flow = map(sin(timeGlobalTime * 0.18), -1, 1, 0.15, 0.85);

  noStroke();
  fill(255, 55 * (fadeAlpha / 255));

  beginShape();
  vertex(-w * 0.28, -h * 0.33);
  vertex(w * 0.28, -h * 0.33);
  vertex(w * flow * 0.22, -h * 0.12);
  vertex(-w * flow * 0.22, -h * 0.12);
  endShape(CLOSE);

  beginShape();
  vertex(-w * (1 - flow) * 0.24, h * 0.12);
  vertex(w * (1 - flow) * 0.24, h * 0.12);
  vertex(w * 0.28, h * 0.33);
  vertex(-w * 0.28, h * 0.33);
  endShape(CLOSE);

  stroke(255, 110 * (fadeAlpha / 255));
  strokeWeight(1);
  line(0, -h * 0.05, 0, h * 0.08);

  noStroke();
  fill(255, 100 * (fadeAlpha / 255));
  ellipse(0, h * 0.14 + sin(timeGlobalTime * 2.2) * 1.5, 4, 4);

  pop();
}

function drawTimeBackgroundParticles(fadeAlpha) {
  noStroke();
  for (const particle of timeParticles) {
    // Noise nudges each particle off its base velocity so the field drifts in
    // loose currents instead of straight lines.
    const nx = (noise(particle.n + frameCount * 0.003) - 0.5) * 0.4;
    const ny = (noise(particle.n + 500 + frameCount * 0.002) - 0.5) * 0.2;

    particle.x += particle.vx + nx;
    particle.y += particle.vy + ny;

    if (particle.x < 0) particle.x = width;
    if (particle.x > width) particle.x = 0;
    if (particle.y < 0) particle.y = height;
    if (particle.y > height) particle.y = 0;

    fill(255, particle.a * (fadeAlpha / 255));
    ellipse(particle.x, particle.y, particle.s, particle.s);
  }
}

function drawTimeOrbitalArcs(fadeAlpha) {
  push();
  translate(width / 2, height / 2);
  noFill();

  // These arcs extend the clock motif outward, giving the scene a broader
  // orbital structure around the word.
  for (const arcInfo of timeArcs) {
    stroke(255, arcInfo.alpha * (fadeAlpha / 255));
    strokeWeight(arcInfo.weight);
    arc(
      0,
      0,
      arcInfo.r * 2,
      arcInfo.r * 2,
      arcInfo.start + timeGlobalTime * arcInfo.speed * 10,
      arcInfo.start + arcInfo.len + timeGlobalTime * arcInfo.speed * 10
    );
  }

  pop();
}

function drawTimeDriftLines(fadeAlpha) {
  strokeWeight(1);

  // Horizontal drifts flatten the composition slightly, like scan lines or
  // layered timeline marks passing behind the typography.
  for (let i = 0; i < 11; i++) {
    const y = map(i, 0, 10, height * 0.1, height * 0.9);
    const offset = sin(timeGlobalTime * 0.16 + i * 0.7) * 55;

    stroke(255, (8 + i * 2) * (fadeAlpha / 255));
    line(width * 0.15 + offset, y, width * 0.85 - offset * 0.7, y);
  }
}

function drawTimeCenterBreath(fadeAlpha) {
  push();
  translate(width / 2, height / 2);

  // A dark breathing core stops the center from becoming visually flat once
  // the rings, text, and echoes accumulate.
  const r = min(width, height) * 0.12 + sin(timeGlobalTime * 0.5) * 6;
  noStroke();
  fill(0, 28 * (fadeAlpha / 255));
  ellipse(0, 0, r * 2.5, r * 2.5);

  stroke(255, 18 * (fadeAlpha / 255));
  noFill();
  ellipse(0, 0, r * 2.9, r * 2.9);

  pop();
}

function drawTimeSoftVignette(fadeAlpha) {
  noStroke();
  // Build the vignette with repeated inset rectangles so the edges stay soft
  // without introducing gradients or image assets.
  for (let i = 0; i < 10; i++) {
    fill(0, 8 * (fadeAlpha / 255));
    rect(i * 4, i * 4, width - i * 8, height - i * 8);
  }
}

function timeEaseOutCubic(t) {
  return 1 - pow(1 - t, 3);
}
