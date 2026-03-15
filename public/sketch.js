// ============================================================
// Shadow Lexicon
// sketch.js - main controller
// Handles the webcam, recognition, state management, and animation modules
// ============================================================

// -- 1. Local Teachable Machine model --------------------------------
// This model classifies webcam input into the five project scenes:
// book, city, time, memory, and shadow.
const modelUrl = './models/79ZGnRrSq/';

const labelMap = {
  book: 'book',
  city: 'city',
  time: 'time',
  memory: 'memory',
  shadow: 'shadow',
};

// -- 2. Poem lines ---------------------------------------------------
let poemLines = {};

// -- State -----------------------------------------------------------
let model, webcam;
let isModelLoaded = false;
let currentLabel  = 'background';
let confidence    = 0;
let currentLabelConfidence = 0;
let predictionSnapshot = [];
let candidateLabel = 'background';
let candidateHits = 0;
let hasLockedPrediction = false;
let clearFrames = 0;

let activeState = 'idle';   // idle / book / city / time / memory / shadow
let stateTimer  = 0;
let fadeAlpha   = 0;
let hudEl;
let hudPredictionsEl;
let hudStateEl;
let hudConfidenceEl;
let hudActivePanelEl;
let hudSceneValueEl;
let hudSceneSubEl;
let hudReleaseValueEl;
let hudReleaseSubEl;
let hudSceneFillEl;
let hudReleaseLabelEl;
let hudReleaseFillEl;

const triggerThreshold = 0.55;
const releaseThreshold = 0.35;
const requiredSwitchHits = 2;
const clearFramesRequired = 6;
// Every scene shares one global duration so recognition and HUD timing stay aligned.
const sceneDuration = 480;
const labelThresholds = {
  shadow: 0.72,
};
const labelRequiredHits = {
  shadow: 4,
};
const sceneModules = {
  book: { init: initBook, draw: drawBook },
  city: { init: initCity, draw: drawCity },
  time: { init: initTime, draw: drawTime },
  memory: { init: initMemory, draw: drawMemory },
  shadow: { init: initShadow, draw: drawShadow },
};


// ============================================================
// SETUP
// ============================================================
function preload() {
  poemLines = loadJSON('poems.json');
}

async function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(RGB);
  textFont('Georgia');
  initHud();

  await initWebcam();
  await loadTMModel();
}

function initHud() {
  // Cache the HUD nodes once; the render loop only updates their content.
  hudEl = document.getElementById('hud');
  hudPredictionsEl = document.getElementById('hud-predictions');
  hudStateEl = document.getElementById('hud-state');
  hudConfidenceEl = document.getElementById('hud-confidence');
  hudActivePanelEl = document.getElementById('hud-active-panel');
  hudSceneValueEl = document.getElementById('hud-scene-value');
  hudSceneSubEl = document.getElementById('hud-scene-sub');
  hudReleaseValueEl = document.getElementById('hud-release-value');
  hudReleaseSubEl = document.getElementById('hud-release-sub');
  hudSceneFillEl = document.getElementById('hud-scene-fill');
  hudReleaseLabelEl = document.getElementById('hud-release-label');
  hudReleaseFillEl = document.getElementById('hud-release-fill');
}

async function loadTMModel() {
  try {
    model = await tmImage.load(
      modelUrl + 'model.json',
      modelUrl + 'metadata.json'
    );
    isModelLoaded = true;
    predictLoop();
  } catch (e) {
    console.warn('⚠ Failed to load model. Check the local model files:', e);
  }
}

async function initWebcam() {
  webcam = new tmImage.Webcam(224, 224, true);
  await webcam.setup();
  await webcam.play();
}

// -- Recognition loop (runs independently and does not block draw) ---
async function predictLoop() {
  if (!isModelLoaded || !webcam) return;

  webcam.update();
  // Convert raw model classes into the project's five scene labels, then sort
  // them so the strongest candidate can drive both triggering and the HUD.
  const predictions = await model.predict(webcam.canvas);
  predictionSnapshot = predictions
    .map((p) => ({
      label: normalizeLabel(p.className),
      probability: p.probability,
    }))
    .sort((a, b) => b.probability - a.probability);

  let maxConf  = 0;
  let maxLabel = 'background';
  let effectiveConf = 0;
  currentLabelConfidence = 0;

  for (let p of predictionSnapshot) {
    if (p.probability > maxConf) {
      maxConf  = p.probability;
    }
    if (p.probability > effectiveConf) {
      effectiveConf = p.probability;
      maxLabel = p.label;
    }
    if (p.label === currentLabel) {
      currentLabelConfidence = p.probability;
    }
  }

  const activeThreshold = labelThresholds[maxLabel] || triggerThreshold;
  const activeRequiredHits = labelRequiredHits[maxLabel] || requiredSwitchHits;

  if (
    effectiveConf >= activeThreshold &&
    maxLabel !== 'background'
  ) {
    clearFrames = 0;

    if (!hasLockedPrediction) {
      // Ask for a short run of consistent hits before switching scenes to keep
      // the interaction responsive without making it jittery.
      if (maxLabel === candidateLabel) {
        candidateHits += 1;
      } else {
        candidateLabel = maxLabel;
        candidateHits = 1;
      }

      if (candidateHits >= activeRequiredHits) {
        triggerState(maxLabel);
        currentLabel = maxLabel;
        hasLockedPrediction = true;
        candidateLabel = 'background';
        candidateHits = 0;
      }
    } else if (maxLabel === currentLabel) {
      candidateLabel = 'background';
      candidateHits = 0;
    } else {
      candidateLabel = 'background';
      candidateHits = 0;
    }
  } else if (
    hasLockedPrediction &&
    currentLabel !== 'background' &&
    currentLabelConfidence < releaseThreshold
  ) {
    // Once a scene is locked, release only after the current label stays weak
    // for several frames, which reopens scanning for the next image.
    clearFrames += 1;
    candidateLabel = 'background';
    candidateHits = 0;

    if (clearFrames >= clearFramesRequired) {
      hasLockedPrediction = false;
      currentLabel = 'background';
      if (activeState !== 'idle') {
        activeState = 'idle';
        stateTimer = 0;
        fadeAlpha = 0;
      }
    }
  } else if (!hasLockedPrediction && effectiveConf < triggerThreshold) {
    candidateLabel = 'background';
    candidateHits = 0;
    clearFrames = 0;
  } else {
    clearFrames = 0;
  }

  confidence = maxConf;

  requestAnimationFrame(predictLoop);
}

function normalizeLabel(label) {
  if (!label) return 'background';
  return labelMap[label.trim().toLowerCase()] || 'background';
}

function getPoemEntry(label) {
  const entry = poemLines[label];
  if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
    return {
      poem: typeof entry.poem === 'string' && entry.poem.trim() ? entry.poem : label,
      concept: typeof entry.concept === 'string' && entry.concept.trim() ? entry.concept : '',
    };
  }
  if (Array.isArray(entry)) {
    return {
      poem: entry[0] || label,
      concept: '',
    };
  }
  if (typeof entry === 'string' && entry.trim()) {
    return {
      poem: entry,
      concept: '',
    };
  }
  return {
    poem: label,
    concept: '',
  };
}

function getPoemLine(label) {
  return getPoemEntry(label).poem;
}

function getPoemLines(label) {
  const entry = getPoemEntry(label);
  return entry.concept ? [entry.poem, entry.concept] : [entry.poem];
}

function getPoemWords(label) {
  const entry = getPoemEntry(label);
  const line = [entry.poem, entry.concept].filter(Boolean).join(' ');
  const words = line.toLowerCase().split(/\s+/).filter(Boolean);
  return words.length ? words : [label];
}

// -- Trigger a new state and call the matching init function ---------
function triggerState(label) {
  activeState = label;
  stateTimer  = 0;
  fadeAlpha   = 0;
  initActiveScene(label);
}

function initActiveScene(label) {
  // Each scene owns its own setup routine so visual state stays isolated.
  const scene = sceneModules[label];
  if (scene) scene.init();
}


// ============================================================
// DRAW - main loop
// ============================================================
function draw() {
  background(0);
  stateTimer++;

  if (activeState === 'idle') {
    drawIdle();
    drawPredictionPanel();
    return;
  }

  // Fade in
  fadeAlpha = min(fadeAlpha + 10, 255);

  // Call the draw function for the active module
  const scene = sceneModules[activeState];
  if (scene) scene.draw(stateTimer, fadeAlpha);

  // Keep the poem and concept visible as a shared footer across all scenes.
  drawPoemLine();

  if (stateTimer > sceneDuration) resetToScanning();

  drawPredictionPanel();
}

function resetToScanning() {
  // Clear both the scene state and the recognition memory before listening again.
  activeState = 'idle';
  stateTimer = 0;
  fadeAlpha = 0;
  currentLabel = 'background';
  currentLabelConfidence = 0;
  confidence = 0;
  candidateLabel = 'background';
  candidateHits = 0;
  hasLockedPrediction = false;
  clearFrames = 0;
}


// ============================================================
// English typography inspired by Zhu Yingchun:
// small size, wide spacing, low opacity, all lowercase
// ============================================================
function drawStyledEnglish(str, cx, y, options = {}) {
  const size    = options.size    || 10;
  const alpha   = options.alpha   || 48;
  const spacing = options.spacing || 8;   // Extra spacing between letters (px)

  push();
  fill(255, alpha);
  noStroke();
  textSize(size);
  textStyle(NORMAL);
  textAlign(LEFT, CENTER);

  const chars = str.toLowerCase().split('');

  // Measure total width first so the word can be centered
  let totalW = 0;
  for (let ch of chars) totalW += textWidth(ch) + spacing;
  totalW -= spacing;

  let x = cx - totalW / 2;
  for (let ch of chars) {
    text(ch, x, y);
    x += textWidth(ch) + spacing;
  }
  pop();
}


// ============================================================
// IDLE - floating noun cloud
// ============================================================
function drawIdle() {
  const nouns = ['BOOK', 'CITY', 'TIME', 'MEMORY', 'SHADOW'];

  nouns.forEach((noun, i) => {
    let x = width / 2 + sin(frameCount * 0.012 + i * 1.3) * 140;
    let y = height / 2 + cos(frameCount * 0.009 + i * 1.0) * 70 + (i - 2) * 65;
    let a = map(sin(frameCount * 0.025 + i * 0.8), -1, 1, 15, 55);

    push();
    fill(255, a);
    noStroke();
    textSize(18);
    textAlign(CENTER, CENTER);
    text(noun, x, y);
    pop();
  });

  // Prompt text with larger size, wider spacing, and breathing opacity
  let promptA = map(sin(frameCount * 0.04), -1, 1, 60, 140);
  drawStyledEnglish(
    'place an image before the camera',
    width / 2,
    height / 2 + 148,
    { size: 22, alpha: promptA, spacing: 3 }
  );
}


// ============================================================
// Shared poem line fade-in
// ============================================================
function drawPoemLine() {
  const lines = getPoemLines(activeState);
  if (!lines.length) return;

  const a = min(stateTimer * 8, 120);
  const baseX = 60;
  const baseY = height - 86;
  const lineGap = 22;

  // First line is the poem; the second line is treated as the concept label.
  lines.forEach((line, index) => {
    push();
    noStroke();
    textAlign(LEFT, BOTTOM);
    if (index === 0) {
      fill(255, a);
      textSize(12);
    } else {
      fill(255, a * 0.72);
      textSize(11);
    }
    text(line, baseX, baseY + index * lineGap);
    pop();
  });

}

function drawPredictionPanel() {
  if (!hudEl) return;

  const sceneRatio = constrain(stateTimer / sceneDuration, 0, 1);
  const secondsLeft = max(0, (sceneDuration - stateTimer) / 60);
  const isReleaseActive = currentLabelConfidence < releaseThreshold;
  const releaseRatio = isReleaseActive
    ? constrain(clearFrames / clearFramesRequired, 0, 1)
    : 0;

  // The HUD structure lives in HTML/CSS. This function only pushes live values
  // into the existing nodes.
  renderPredictionRows(predictionSnapshot);

  hudStateEl.textContent = activeState;
  hudConfidenceEl.textContent = `${(confidence * 100).toFixed(1)}%`;
  hudActivePanelEl.hidden = activeState === 'idle';

  if (activeState === 'idle') return;

  hudSceneValueEl.textContent = `${secondsLeft.toFixed(1)}s`;
  hudSceneSubEl.textContent = `${Math.round(sceneRatio * 100)}% complete`;
  hudReleaseValueEl.textContent = isReleaseActive
    ? `${clearFrames}/${clearFramesRequired}`
    : 'LOCKED';
  hudReleaseSubEl.textContent = isReleaseActive
    ? 'unlocking now'
    : `${(currentLabelConfidence * 100).toFixed(1)}% / ${Math.round(releaseThreshold * 100)}%`;
  hudSceneFillEl.style.width = `${sceneRatio * 100}%`;
  hudReleaseLabelEl.textContent = isReleaseActive ? 'release progress' : 'release locked';
  hudReleaseFillEl.style.width = `${releaseRatio * 100}%`;
  hudReleaseFillEl.style.background = isReleaseActive
    ? 'rgba(140,205,255,0.9)'
    : 'rgba(255,255,255,0.25)';
}

function renderPredictionRows(items) {
  if (!hudPredictionsEl) return;

  hudPredictionsEl.replaceChildren();

  if (!items.length) {
    hudPredictionsEl.appendChild(createHudRow('waiting for prediction...', '', true));
    return;
  }

  items.forEach((item, index) => {
    hudPredictionsEl.appendChild(
      createHudRow(item.label.toUpperCase(), `${(item.probability * 100).toFixed(1)}%`, index !== 0)
    );
  });
}

function createHudRow(label, value, isDim) {
  const row = document.createElement('div');
  row.className = `hud-row${isDim ? ' dim' : ''}`;

  const labelEl = document.createElement('span');
  labelEl.textContent = label;

  const valueEl = document.createElement('span');
  valueEl.textContent = value;

  row.append(labelEl, valueEl);
  return row;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function keyPressed() {
  if (key === 'f' || key === 'F') {
    fullscreen(!fullscreen());
    return false;
  }
}
