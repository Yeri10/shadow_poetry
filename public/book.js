// ============================================================
// BOOK animation
// A luminous book keeps turning through remembered fragments of text
// ============================================================

let bookPages = [];
const bookPageCount = 10;
const bookFlipDuration = 150;
const bookFont = 'Noto Sans';
// The book scene reuses a fixed excerpt so each generated page feels like a
// different opening in the same remembered volume.
const bookPoem = [
  'Old age (that is the name others give it)',
  'may be the time of our happiness.',
  '',
  'The animal has died, or almost died.',
  'What remains is the man and his soul.',
  '',
  'I live among luminous and vague forms',
  'that are not yet shadow or darkness.',
  '',
  'Buenos Aires, the city,',
  'which once spread through its suburbs',
  'toward the endless plains,',
  'has returned to being Recoleta and Retiro,',
  'the blurred streets of Once,',
  'and the fragile old houses',
  'that we still call the South.',
  '',
  'Democritus of Abdera put out his eyes',
  'in order to think;',
  'time has been my Democritus.',
  '',
  'This dimness develops slowly and does not hurt;',
  'it flows down a gentle slope',
  'and resembles eternity.',
  '',
  'I cannot distinguish the faces of my friends;',
  'women remain what they were years ago;',
  'the pages of books are blurred.',
  '',
  'Among the generations of books,',
  'I have read only a few;',
  'I continue reading in my memory.',
  '',
  'Roads that intersect',
  'lead me to my secret center.',
  '',
  'Now I can forget them all.',
  'I have reached my center.',
];

function initBook() {
  bookPages = Array.from({ length: bookPageCount }, (_, i) => new TextPage(i));
}

function drawBook(stateTimer, fadeAlpha) {
  const globalTurn = stateTimer / bookFlipDuration;
  const turnIndex = floor(globalTurn);
  const rawT = globalTurn - turnIndex;
  const t = easeInOutCubic(rawT);

  push();
  textFont(bookFont);
  textAlign(LEFT, CENTER);
  noStroke();

  drawBookSpineGlow(fadeAlpha);
  drawBookGhostSheets(fadeAlpha);
  drawBookCenterPanel(fadeAlpha);

  drawBookLeftStack(turnIndex, t, fadeAlpha);
  drawBookRightFarStack(turnIndex, t, fadeAlpha);
  drawBookPreparedNextPage(turnIndex, rawT, fadeAlpha);
  drawBookTransparentOverlay(turnIndex, t, fadeAlpha);
  drawBookTurningPage(turnIndex, t, fadeAlpha);

  pop();
}

function drawBookSpineGlow(fadeAlpha) {
  // A faint vertical glow anchors the composition at the book spine.
  stroke(255, 18 * (fadeAlpha / 255));
  strokeWeight(1);
  line(width / 2, height * 0.08, width / 2, height * 0.92);

  stroke(255, 5 * (fadeAlpha / 255));
  strokeWeight(10);
  line(width / 2, height * 0.16, width / 2, height * 0.84);

  noStroke();
}

function drawBookCenterPanel(fadeAlpha) {
  const w = min(width * 0.36, 460);
  const h = height * 0.8;

  push();
  rectMode(CENTER);
  noStroke();

  for (let i = 0; i < 90; i++) {
    const y = map(i, 0, 89, -h / 2, h / 2);
    const distToCenter = abs(y) / (h / 2);
    const alpha = lerp(14, 4, distToCenter) * (fadeAlpha / 255);
    fill(255, alpha);
    rect(width / 2, height / 2 + y, w, h / 90 + 1);
  }

  stroke(255, 7 * (fadeAlpha / 255));
  line(width / 2 - w / 2, height / 2 - h / 2, width / 2 - w / 2, height / 2 + h / 2);
  line(width / 2 + w / 2, height / 2 - h / 2, width / 2 + w / 2, height / 2 + h / 2);

  noStroke();
  pop();
}

function drawBookGhostSheets(fadeAlpha) {
  push();
  translate(width / 2, height / 2);

  const pageH = height * 0.76;

  // These contour lines keep the book readable as an object even when the
  // animated pages thin out during the turn.
  for (let i = 0; i < 4; i++) {
    const offset = i * 5;
    const alpha = (6 - i) * (fadeAlpha / 255);

    stroke(255, alpha);
    strokeWeight(1);

    line(-230 - offset, -pageH * 0.49, -230 - offset, pageH * 0.49);
    line(-35 - offset * 0.2, -pageH * 0.49, -220 - offset, -pageH * 0.49);
    line(-35 - offset * 0.2, pageH * 0.49, -220 - offset, pageH * 0.49);

    line(230 + offset, -pageH * 0.49, 230 + offset, pageH * 0.49);
    line(35 + offset * 0.2, -pageH * 0.49, 220 + offset, -pageH * 0.49);
    line(35 + offset * 0.2, pageH * 0.49, 220 + offset, pageH * 0.49);
  }

  noStroke();
  pop();
}

function drawBookLeftStack(turnIndex, t, fadeAlpha) {
  // Pages that have already turned settle into the left stack.
  for (let i = 0; i < 5; i++) {
    const idx = mod(turnIndex - 1 - i, bookPages.length);
    const page = bookPages[idx];

    let alpha = map(i, 0, 4, 105, 10) * (fadeAlpha / 255);
    if (i === 0) alpha = lerp(120, 0, t) * (fadeAlpha / 255);

    const settle = i === 0 ? (1 - t) * 12 : 0;

    push();
    translate(width / 2 - 238 - i * 9 - settle, height / 2 + i * 2.2);
    page.drawStaticPage('left', alpha);
    pop();
  }
}

function drawBookRightFarStack(turnIndex, t, fadeAlpha) {
  // The far-right stack hints at pages that are still waiting to turn.
  for (let i = 4; i >= 2; i--) {
    const idx = mod(turnIndex + i, bookPages.length);
    const page = bookPages[idx];
    const alpha = map(i, 2, 4, 22, 6) * (fadeAlpha / 255);

    push();
    translate(width / 2 + 242 + i * 7 - t * 2, height / 2 + i * 2);
    page.drawStaticPage('right', alpha);
    pop();
  }
}

function drawBookPreparedNextPage(turnIndex, rawT, fadeAlpha) {
  const idx = mod(turnIndex + 1, bookPages.length);
  const page = bookPages[idx];

  const alpha = lerp(0, 140, rawT) * (fadeAlpha / 255);
  const x = lerp(width / 2 + 248, width / 2 + 230, rawT);
  const y = height / 2 + lerp(3, 0, rawT);

  push();
  translate(x, y);

  const sx = lerp(0.985, 1.0, rawT);
  applyMatrix(sx, 0, -0.015 * (1 - rawT), 1, 0, 0);

  page.drawPreparedPage(alpha, rawT);
  pop();
}

function drawBookTransparentOverlay(turnIndex, t, fadeAlpha) {
  const idx = mod(turnIndex + 2, bookPages.length);
  const page = bookPages[idx];

  push();
  translate(lerp(width / 2 + 215, width / 2 + 140, t * 0.25), height / 2 - 2);

  const sx = lerp(1.0, 0.94, t * 0.22);
  applyMatrix(sx, 0, -0.03, 1, 0, 0);

  page.drawTransparentPage(18 * (fadeAlpha / 255));
  pop();
}

function drawBookTurningPage(turnIndex, t, fadeAlpha) {
  const idx = mod(turnIndex, bookPages.length);
  const page = bookPages[idx];

  push();
  translate(width / 2, height / 2);

  const centerX = lerp(238, -238, t);
  const liftY = -sin(t * PI) * 7;
  translate(centerX, liftY);

  let sx = abs(cos(t * PI));
  sx = max(sx, 0.035);

  const shearAmount = -0.12 * sin(t * PI);
  applyMatrix(sx, 0, shearAmount, 1, 0, 0);

  // After the halfway point the page has crossed the spine, so the face flips.
  if (t > 0.5) scale(-1, 1);

  const cornerCurl = sin(t * PI) * 52;
  const cornerLift = sin(t * PI) * 40;

  page.drawTurningPage({
    alpha: 255 * (fadeAlpha / 255),
    t,
    cornerCurl,
    cornerLift,
  });

  pop();
}

class TextPage {
  constructor(index) {
    this.index = index;
    this.pageW = min(width * 0.34, 430);
    this.pageH = height * 0.76;
    this.phase = random(1000);
    this.edgeSeed = random(1000);
    this.lines = this.makeLines(index);
  }

  makeLines(index) {
    // Rotate through the excerpt so every page shows a shifted slice of the
    // same text rather than repeating a single static spread.
    const rotated = rotateArray(bookPoem, index * 4);
    const chosen = rotated.slice(0, 16);

    return chosen.map((line, i) => ({
      text: line,
      y: map(i, 0, chosen.length - 1, -this.pageH * 0.39, this.pageH * 0.39),
      size: this.pickSize(line),
    }));
  }

  pickSize(line) {
    if (line === '') return 18;
    if (line.length > 42) return 13;
    if (line.length > 34) return 14;
    if (line.length > 26) return 15;
    return 17;
  }

  drawStaticPage(side, alpha) {
    stroke(255, alpha * 0.04);
    strokeWeight(1);

    const outerEdgeX = side === 'left' ? -this.pageW * 0.47 : this.pageW * 0.47;
    line(outerEdgeX, -this.pageH * 0.5, outerEdgeX, this.pageH * 0.5);

    line(
      side === 'left' ? -this.pageW * 0.46 : -this.pageW * 0.36,
      -this.pageH * 0.5,
      side === 'left' ? -this.pageW * 0.08 : this.pageW * 0.46,
      -this.pageH * 0.5
    );
    line(
      side === 'left' ? -this.pageW * 0.46 : -this.pageW * 0.36,
      this.pageH * 0.5,
      side === 'left' ? -this.pageW * 0.08 : this.pageW * 0.46,
      this.pageH * 0.5
    );

    noStroke();

    for (const row of this.lines) {
      if (!row.text) continue;

      textSize(row.size);

      const x = -this.pageW * 0.43;
      const drift = side === 'right' ? 4 : -4;
      const breathe = sin(frameCount * 0.02 + row.y * 0.018 + this.phase) * 0.7;

      // A soft duplicate keeps distant pages luminous without pulling focus
      // from the actively turning sheet.
      fill(255, alpha * 0.025);
      text(row.text, x + drift, row.y + breathe);

      fill(255, alpha);
      text(row.text, x, row.y + breathe);
    }
  }

  drawPreparedPage(alpha, rawT) {
    stroke(255, alpha * 0.05);
    strokeWeight(1);
    line(this.pageW * 0.47, -this.pageH * 0.5, this.pageW * 0.47, this.pageH * 0.5);
    noStroke();

    for (const row of this.lines) {
      if (!row.text) continue;

      textSize(row.size);

      const x = -this.pageW * 0.43;
      const revealLift = (1 - rawT) * 1.2;
      const shimmer = sin(frameCount * 0.02 + row.y * 0.02 + this.phase) * 0.45;

      fill(255, alpha * 0.05);
      text(row.text, x + 2, row.y + revealLift + shimmer);

      fill(255, alpha);
      text(row.text, x, row.y + shimmer);
    }
  }

  drawTransparentPage(alpha) {
    stroke(255, alpha * 0.08);
    strokeWeight(1);
    line(this.pageW * 0.46, -this.pageH * 0.5, this.pageW * 0.46, this.pageH * 0.5);
    noStroke();

    for (const row of this.lines) {
      if (!row.text) continue;

      textSize(row.size);

      const x = -this.pageW * 0.43;
      const shimmer = sin(frameCount * 0.03 + row.y * 0.02 + this.phase) * 0.9;

      fill(255, alpha * 0.18);
      text(row.text, x + 2, row.y + shimmer);

      fill(255, alpha);
      text(row.text, x, row.y + shimmer);
    }
  }

  drawTurningPage({ alpha, t, cornerCurl, cornerLift }) {
    this.drawCornerArc(alpha, cornerCurl, cornerLift);

    for (const row of this.lines) {
      if (!row.text) continue;
      this.drawTurningRow(row, alpha, t, cornerCurl, cornerLift);
    }

    const jitter = (noise(this.edgeSeed + frameCount * 0.03) - 0.5) * 2.5;
    const topEdgePull = -cornerLift * 0.24;
    const bottomEdgePull = cornerLift * 0.05;

    stroke(255, alpha * 0.12);
    strokeWeight(1);
    line(
      this.pageW * 0.47 + jitter,
      -this.pageH * 0.5 + topEdgePull,
      this.pageW * 0.47 + jitter * 0.2,
      this.pageH * 0.5 + bottomEdgePull
    );
    noStroke();
  }

  drawCornerArc(alpha, cornerCurl, cornerLift) {
    push();
    noFill();
    strokeWeight(1);

    // Layered bezier traces suggest the lifted paper corner without filling it.
    for (let i = 0; i < 4; i++) {
      const a = alpha * (0.09 - i * 0.018);
      stroke(255, a);

      const startX = this.pageW * 0.18 + i * 4;
      const startY = -this.pageH * 0.46 + i * 2;

      const cp1x = this.pageW * 0.4 - cornerCurl * 0.1 + i * 2;
      const cp1y = -this.pageH * 0.6 - cornerLift * 0.12 + i * 2;

      const cp2x = this.pageW * 0.53 - cornerCurl * 0.18 + i * 2;
      const cp2y = -this.pageH * 0.3 - cornerLift * 0.05 + i * 2;

      const endX = this.pageW * 0.47 - cornerCurl * 0.2 + i;
      const endY = -this.pageH * 0.52 - cornerLift * 0.18 + i * 1.5;

      bezier(startX, startY, cp1x, cp1y, cp2x, cp2y, endX, endY);
    }

    pop();
  }

  drawTurningRow(row, alpha, t, cornerCurl, cornerLift) {
    const chars = row.text.split('');
    textSize(row.size);

    const spacing = row.size * 0.56;
    const usableWidth = this.pageW * 0.84;
    const startX = -usableWidth * 0.5;

    for (let i = 0; i < chars.length; i++) {
      const xLocal = i * spacing;
      if (xLocal > usableWidth) break;

      const u = constrain(map(xLocal, 0, usableWidth, 0, 1), 0, 1);
      const v = constrain(map(row.y, -this.pageH * 0.4, this.pageH * 0.4, 0, 1), 0, 1);

      const rightWeight = pow(u, 2.0);
      const topWeight = pow(1 - v, 1.8);
      const cornerWeight = rightWeight * (0.28 + 0.72 * topWeight);

      const x = startX + xLocal;
      const curlX = -cornerCurl * 0.66 * cornerWeight;
      const liftY = -cornerLift * 0.46 * cornerWeight;
      const bodyCurveY = sin(rightWeight * PI) * cornerCurl * 0.07;
      const flutterY = sin(frameCount * 0.07 + i * 0.34 + this.phase + v * 1.7) * 0.7 * cornerWeight;
      const rot = -0.38 * cornerWeight * sin(t * PI);

      // Characters nearest the lifted corner distort the most, which lets the
      // page feel like a flexible surface instead of a flat card.
      push();
      translate(x + curlX + 2.0, row.y + liftY + bodyCurveY + flutterY);
      rotate(rot);
      fill(255, alpha * 0.1);
      text(chars[i], 0, 0);
      pop();

      push();
      translate(x + curlX, row.y + liftY + bodyCurveY + flutterY);
      rotate(rot);
      fill(255, alpha);
      text(chars[i], 0, 0);
      pop();
    }
  }
}

function rotateArray(arr, shift) {
  const n = arr.length;
  const out = [];
  for (let i = 0; i < n; i++) out.push(arr[(i + shift) % n]);
  return out;
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

function easeInOutCubic(t) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - pow(-2 * t + 2, 3) / 2;
}
