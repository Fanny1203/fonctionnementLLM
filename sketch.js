/*************************************************
 * Configuration et constantes
 *************************************************/
const CONFIG = {
  // Canvas
  canvasWidth: 1200,
  canvasHeight: 500,

  // Éléments graphiques
  gearSize: 40,
  networkSize: 300,
  arrowSize: 10,
  inputBoxWidth: 200,
  inputBoxHeight: 100,
  
  // Distribution
  barHeight: 30,
  maxBarWidth: 200,
  barSpacing: 50,
  
  // Animation
  animationDuration: 500, // ms par phase
  frameRate: 30, // images par seconde
  
  // Probabilités
  minProb: 0.05,
  maxProb: 0.95,
  baseProb: 0.25,
  probIncrement: 0.2,
  maxOtherCorrections: 20
};

const STATES = {
  TRAINING: {
    INITIAL: 0,
    CALCULATED: 1,
    CORRECTING: 2,
    CORRECTED: 3
  },
  USAGE: {
    INITIAL: 0,
    CALCULATING: 1,
    SELECTED: 2
  }
};

const STEPS = {
  RECOLTE: 0,
  ENTRAINEMENT: 1,
  UTILISATION: 2,
  FIN: 3
};

const TITLES = {
  recolte: "1) Récolte des données",
  entrainement: "2) Entraînement",
  utilisation: "3) Utilisation du modèle",
  fin: "Conclusion"
};

const MESSAGES = {
  recolte: `Lors de la collecte, on extrait automatiquement de très nombreux exemples à partir de textes (livres, Wikipedia, forums, sites web, etc.)
Chaque exemple est une paire entrée-sortie : un début de phrase et sa suite.
On parle d'apprentissage auto-supervisé car ces paires sont construites automatiquement, sans étiquettes fournies par un humain.
On ne met ici que quelques exemples de "paires". Dans les modèles récents, il y a des milliers de milliards de paires (sous-estimation).`,
  entrainement: {
    initial: "On va essayer de trouver une fonction qui calcule correctement le mot suivant. <br/>Ici, on a représenté une fonction avec 9 paramètres, en mars 2025, les modèles les plus utilisés en comptent plusieurs centaines de milliards.<br/>",
    prempiercalcul : "Au premier passage, la distribution calculée est très mauvaise, car les paramètres initiaux sont aléatoires",
    calculssuivants: "La distribution s'améliore au fil des entraînements. <br/>Dans les modèles récents, il peut y avoir de l'ordre d'un million d'itérations.",
    correction: "La correction ajuste les poids pour réduire l'erreur."
  },
  utilisation: {
    initial: "Une fois entraîné, le modèle ne bouge plus et on peut l'utiliser pour compléter n'importe quel début de phrase, même s'il ne l’a jamais vu, en utilisant la même fonction.",
    calcul: "Le réseau calcule la distribution des mots suivants. Il peut paraître étonnant (et fascinant !) que les mots prédits soient raisonnables alors que le réseau n'avait jamais vu cette phrase avant.",
    selection: (mot) => `Le mot *<span class="highlighted-word">${mot}</span>* a été tiré au sort et ajouté à la phrase en entrée.`
  },
  fin: `# Récapitulons :  
  Une particularité de ce qu'on appelle les IA, c'est qu'on n'écrit pas directement un programme, mais on le "cherche". 
  Dans le cas d'un LLM, on cherche une fonction qui calcule correctement le mot suivant et pour trouver cette fonction, on part d'une fonction initiale aléatoire et on utilise un système d'essais-erreurs pour qu'elle s'améliore au fur et à mesure.
  1) Récolte : on a extrait automatiquement des paires entrée-sortie à partir de textes.
  2) Entraînement : on a entraîné un modèle, c’est-à-dire ajusté les paramètres d'une fonction pour qu’elle prédise correctement la sortie à partir de l’entrée sur ces paires collectées.
  3) Utilisation : on utilise ensuite le modèle obtenu pour compléter des phrases nouvelles.
  # Et après ?
  Après cette étape, le modèle n'est pas directement utilisable. Il doit être *fine-tuné* pour ne pas se contenter de compléter des phrases mais répondre à des questions.`
};

const DATA = {
  TRAINING: [
    { input: "Le chat dort sur", output: "le canapé" },
    { input: "Marie mange une", output: "pomme" },
    { input: "Il fait beau", output: "aujourd'hui" },
    { input: "Le soleil brille dans", output: "le ciel" }
  ],
  USAGE: {
    initialPhrase: "Loula avait froid, ",
    suite: ["\nc'était ", "l'hiver ", "et ", "le", "\nfeu", "était", "éteint"],
    distributions: [
      [
        { word: "elle", prob: 0.6 },
        { word: "c'était", prob: 0.3 },
        { word: "sa", prob: 0.1 }
      ],
      [
        { word: "l'hiver", prob: 0.6 },
        { word: "le", prob: 0.3 },
        { word: "triste", prob: 0.1 }
      ],
      [
        { word: "en", prob: 0.6 },
        { word: "le", prob: 0.3 },
        { word: "et", prob: 0.1 }
      ],
      [
        { word: "jamais", prob: 0.6 },
        { word: "le", prob: 0.3 },
        { word: "sa", prob: 0.1 }
      ],
      [
        { word: "feu", prob: 0.6 },
        { word: "foyer", prob: 0.3 },
        { word: "ciel", prob: 0.1 }
      ]
    ]
  }
};

/*************************************************
 * Cache des éléments DOM
 *************************************************/
const dom = {
  explanation: document.getElementById('explanation'),
  stepTitle: document.getElementById('step-title'),
  trainingControls: document.getElementById('training-controls'),
  utilisation: document.getElementById('utilisation'),
  recolte: document.getElementById('recolte'),
  trainingCanvasContainer: document.getElementById('training-canvas-container'),
  usageCanvasContainer: document.getElementById('usage-canvas-container'),
  calculateBtn: document.getElementById('calculate-btn'),
  correctBtn: document.getElementById('correct-btn'),
  calculateUsageBtn: document.getElementById('calculate-usage-btn'),
  selectWordBtn: document.getElementById('select-word-btn'),
  phraseSelect: document.getElementById('phrase-select'),
  prevBtn: document.getElementById('prev-btn'),
  nextBtn: document.getElementById('next-btn')
};

/*************************************************
 * Etat global de l'application
 *************************************************/
let state = {
  globalStep: STEPS.RECOLTE,
  selectedDataIndex: 0,
  animationProgress: 0,
  trainingState: STATES.TRAINING.INITIAL,
  correctionPhase: 0,
  lastUpdateTime: 0,
  nombreEntrainement: 0,
  trainingProgress: [0, 0, 0, 0],
  // Données de la phase de récolte
  dataCollection: DATA.TRAINING,
  // Phase d'utilisation
  currentPhrase: DATA.USAGE.initialPhrase,
  ajoutsPhrase: DATA.USAGE.suite,
  compteurUsage: 0,
  usageState: STATES.USAGE.INITIAL,
  possibleNextWords: DATA.USAGE.distributions
};

/*************************************************
 * p5.js canvas et image
 *************************************************/
let canvas, gearImg;

// Cache pour le réseau pré-rendu
let networkBuffer;
const GEARS_POSITIONS = [
  { x: 50, y: 50, phase: 2 },
  { x: 150, y: 50, phase: 1 },
  { x: 250, y: 50, phase: 0 },
  { x: 50, y: 150, phase: 2 },
  { x: 150, y: 150, phase: 1 },
  { x: 250, y: 150, phase: 0 },
  { x: 50, y: 250, phase: 2 },
  { x: 150, y: 250, phase: 1 },
  { x: 250, y: 250, phase: 0 }
];

function initNetworkBuffer() {
  networkBuffer = createGraphics(CONFIG.networkSize, CONFIG.networkSize);
  networkBuffer.fill(0);
  networkBuffer.stroke(255);
  networkBuffer.strokeWeight(2);
  networkBuffer.rect(0, 0, CONFIG.networkSize, CONFIG.networkSize);
}

/*************************************************
 * Fonctions DOM & UI
 *************************************************/
function updateExplanation(text) {
  // Configurer marked pour permettre HTML dans le markdown
  marked.setOptions({
    breaks: true,
    sanitize: false
  });
  // Convertir le markdown en HTML
  dom.explanation.innerHTML = marked.parse(text);
}

function updateStepTitle(text) {
  dom.stepTitle.textContent = text;
  dom.stepTitle.style.display = text ? 'block' : 'none';
}

function updateButtonStates() {
  switch (state.globalStep) {
    case STEPS.ENTRAINEMENT:
      dom.calculateBtn.disabled = state.trainingState === STATES.TRAINING.CALCULATED || 
                                state.trainingState === STATES.TRAINING.CORRECTING;
      dom.correctBtn.disabled = state.trainingState !== STATES.TRAINING.CALCULATED;
      break;
    case STEPS.UTILISATION:
      dom.selectWordBtn.disabled = state.usageState !== STATES.USAGE.CALCULATING;
      dom.calculateUsageBtn.disabled = state.usageState === STATES.USAGE.CALCULATING;
      break;
  }
}

function updateUI() {
  // On touche au DOM uniquement lors d'un changement d'étape
  switch (state.globalStep) {
    case STEPS.RECOLTE:
      updateStepTitle(TITLES.recolte);
      dom.trainingControls.style.display = 'none';
      dom.utilisation.style.display = 'none';
      dom.recolte.style.display = 'block';
      dom.trainingCanvasContainer.style.display = 'none';
      dom.usageCanvasContainer.style.display = 'none';
      dom.calculateBtn.style.display = 'none';
      updateExplanation(MESSAGES.recolte);
      // Cacher le bouton précédent sur la première étape
      dom.prevBtn.style.display = 'none';
      dom.nextBtn.textContent = 'Suivant →';
      break;
    case STEPS.ENTRAINEMENT:
      updateStepTitle(TITLES.entrainement);
      dom.trainingControls.style.display = 'flex';
      dom.utilisation.style.display = 'none';
      dom.recolte.style.display = 'none';
      dom.trainingCanvasContainer.style.display = 'flex';
      dom.usageCanvasContainer.style.display = 'none';
      dom.calculateBtn.style.display = 'inline-block';
      dom.correctBtn.style.display = 'inline-block';
      if(state.trainingState === STATES.TRAINING.INITIAL){
        updateExplanation(MESSAGES.entrainement.initial);
      }
      else if (state.trainingState === STATES.TRAINING.CALCULATED){
        updateExplanation(state.nombreEntrainement==0?MESSAGES.entrainement.prempiercalcul:MESSAGES.entrainement.calculssuivants);
      }
      else if (state.trainingState === STATES.TRAINING.CORRECTING){
        updateExplanation(MESSAGES.entrainement.correction);
      }
      updateButtonStates();
      dom.prevBtn.style.display = 'block';
      dom.nextBtn.textContent = 'Suivant →';
      break;
    case STEPS.UTILISATION:
      updateStepTitle(TITLES.utilisation);
      dom.trainingControls.style.display = 'none';
      dom.utilisation.style.display = 'flex';
      dom.recolte.style.display = 'none';
      dom.trainingCanvasContainer.style.display = 'none';
      dom.usageCanvasContainer.style.display = 'flex';
      dom.calculateUsageBtn.style.display = 'inline-block';
      dom.phraseSelect.style.display = 'inline-block';
      switch (state.usageState) {
        case STATES.USAGE.INITIAL:
          updateExplanation(MESSAGES.utilisation.initial);
          break;
        case STATES.USAGE.CALCULATING:
          updateExplanation(MESSAGES.utilisation.calcul);
          break;
        case STATES.USAGE.SELECTED:
          updateExplanation(MESSAGES.utilisation.selection(state.ajoutsPhrase[state.compteurUsage-1]));
          break;
      }
      updateButtonStates();
      dom.prevBtn.style.display = 'block';
      dom.nextBtn.textContent = 'Suivant →';
      break;
    case STEPS.FIN:
      updateStepTitle(TITLES.fin);
      dom.trainingControls.style.display = 'none';
      dom.utilisation.style.display = 'none';
      dom.recolte.style.display = 'none';
      dom.trainingCanvasContainer.style.display = 'none';
      dom.usageCanvasContainer.style.display = 'none';
      dom.calculateBtn.style.display = 'none';
      dom.correctBtn.style.display = 'none';
      dom.calculateUsageBtn.style.display = 'none';
      dom.phraseSelect.style.display = 'none';
      updateExplanation(MESSAGES.fin);
      // Changer le texte du bouton suivant sur la dernière étape
      dom.nextBtn.textContent = 'Refaire l\'expérience';
      dom.prevBtn.style.display = 'block';
      break;
  }
}

function createDataTable() {
  const container = dom.recolte;
  const table = document.createElement('table');
  table.className = 'recolte';
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  ['Entrée', 'Sortie'].forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);
  const tbody = document.createElement('tbody');
  state.dataCollection.forEach(data => {
    const row = document.createElement('tr');
    const inputCell = document.createElement('td');
    const outputCell = document.createElement('td');
    inputCell.textContent = data.input;
    outputCell.textContent = data.output;
    row.appendChild(inputCell);
    row.appendChild(outputCell);
    tbody.appendChild(row);
  });
  
  const row = document.createElement('tr');
  const inputCell = document.createElement('td');
  const outputCell = document.createElement('td');
  inputCell.textContent = "...";
  outputCell.textContent = "...";
  row.appendChild(inputCell);
  row.appendChild(outputCell);
  tbody.appendChild(row);

  table.appendChild(tbody);
  container.appendChild(table);
}

/*************************************************
 * Fonctions de dessin (p5.js)
 *************************************************/
function drawStep(step) {
  switch (step) {
    case STEPS.RECOLTE:
      fill(0);
      textSize(20);
      textAlign(CENTER, CENTER);
      text("Phase de récolte", width / 2, height / 2);
      break;
    case STEPS.ENTRAINEMENT:
      textSize(16);
      fill(0);
      text(`Entraînements: ${state.nombreEntrainement}`, 100, 80);
      drawInputBox(50, 200, state.dataCollection[state.selectedDataIndex].input);
      drawArrow(250, 250, 350, 250);
      drawNetwork(350, 100, false, state.animationProgress, state.correctionPhase);
      
      // N'affiche la distribution que si on est en état CALCULATED
      if (state.trainingState === STATES.TRAINING.CALCULATED) {
        drawArrow(650, 250, 750, 250);
        const distribution = calculateDistribution();
        drawDistribution(distribution, 750, 100, state.dataCollection[state.selectedDataIndex].output);
      }
      break;
    case STEPS.UTILISATION:
      drawInputBox(50, 200, state.currentPhrase, 2);
      drawArrow(250, 250, 350, 250);
      drawNetwork(350, 100, true, 0, 0);
      if (state.usageState === STATES.USAGE.CALCULATING) {
        drawArrow(650, 250, 750, 250);
        drawDistribution(state.possibleNextWords[state.compteurUsage], 750, 100, state.ajoutsPhrase[state.compteurUsage-1]);
      }
      if(state.compteurUsage === state.possibleNextWords.length) {
        nextStep();
      }
      break;
  }
}

function drawNetwork(x, y, trained, progress = 0, phase = 0) {
  if (!networkBuffer) {
    initNetworkBuffer();
  }

  push();
  translate(x, y);
  
  // Dessiner le fond pré-rendu
  image(networkBuffer, 0, 0);
  
  const halfSize = CONFIG.gearSize / 2;
  if (gearImg && gearImg.width > 0) {
    GEARS_POSITIONS.forEach((gear, i) => {
      push();
      translate(gear.x, gear.y);
      if (!trained && state.trainingState === STATES.TRAINING.CORRECTING && gear.phase === phase) {
        rotate(progress * PI * (i % 2 === 0 ? 1 : -1));
      }
      image(gearImg, -halfSize, -halfSize, CONFIG.gearSize, CONFIG.gearSize);
      pop();
    });
  }
  pop();
}

function drawDistribution(dist, x, y, chosenWord) {
  push();
  translate(x, y);
  stroke(0);
  strokeWeight(1);
  fill(255);
  rect(0, 0, 300, 300);
  fill(0);
  textAlign(CENTER);
  textSize(14);
  text("Distribution de probabilité", 150, 30);
  const barHeight = CONFIG.barHeight;
  const maxBarWidth = CONFIG.maxBarWidth;
  const spacing = CONFIG.barSpacing;
  for (let i = 0; i < dist.length; i++) {
    let item = dist[i];
    let barWidth = item.prob * maxBarWidth;
    let yPos = i * spacing + 60;
    fill(item.word === chosenWord ? color(100, 200, 255) : 200);
    noStroke();
    rect(80, yPos, barWidth, barHeight);
    fill(0);
    textAlign(LEFT);
    text((item.prob * 100).toFixed(0) + "%", barWidth + 90, yPos + barHeight / 2 + 5);
    textAlign(RIGHT);
    text(item.word, 70, yPos + barHeight / 2 + 5);
  }
  pop();
}

function drawInputBox(x, y, content, nblines = 1) {
  push();
  translate(x, y);
  stroke(0);
  fill(255);
  rect(0, 0, CONFIG.inputBoxWidth, CONFIG.inputBoxHeight);
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(16);
  text(content, CONFIG.inputBoxWidth/2, nblines==1 ? CONFIG.inputBoxHeight/2 : CONFIG.inputBoxHeight/4);
  pop();
}

function drawArrow(x1, y1, x2, y2) {
  push();
  stroke(0);
  strokeWeight(2);
  line(x1, y1, x2, y2);
  let angle = atan2(y2 - y1, x2 - x1);
  const arrowSize = CONFIG.arrowSize;
  fill(0);
  triangle(
    x2, y2,
    x2 - arrowSize * cos(angle - PI / 6), y2 - arrowSize * sin(angle - PI / 6),
    x2 - arrowSize * cos(angle + PI / 6), y2 - arrowSize * sin(angle + PI / 6)
  );
  pop();
}

/*************************************************
 * Logique métier et actions utilisateur
 *************************************************/
function cleanupStep() {
  state.trainingState = STATES.TRAINING.INITIAL;
  state.correctionPhase = 0;
  state.animationProgress = 0;
  state.usageState = STATES.USAGE.INITIAL;
  if (window.gc) window.gc();
}

function nextStep(k = 1) {
  cleanupStep();
  const stepsCount = Object.keys(STEPS).length;
  state.globalStep = (state.globalStep + k + stepsCount) % stepsCount; // ajout + stepsCount sinon -1 reste à -1
  updateUI();
  if (state.globalStep === STEPS.ENTRAINEMENT) {
    canvas.parent(dom.trainingCanvasContainer);
  } else if (state.globalStep === STEPS.UTILISATION) {
    canvas.parent(dom.usageCanvasContainer);
  }
}

// Calcule la distribution à la volée (on se passe de initializeDistribution)
function calculateDistribution() {
  const index = state.selectedDataIndex;
  const correctWord = state.dataCollection[index].output;
  const baseProb = CONFIG.baseProb + state.trainingProgress[index] * CONFIG.probIncrement;
  const otherCorrections = state.trainingProgress.reduce((sum, count, i) =>
    i !== index ? sum + count : sum, 0);
  const malus = Math.min(otherCorrections, CONFIG.maxOtherCorrections) * 0.01;
  const correctProb = Math.max(CONFIG.minProb, Math.min(CONFIG.maxProb, baseProb - malus));
  
  let distribution = [];
  distribution.push({ word: correctWord, prob: correctProb });
  const remainingProb = 1.0 - correctProb;
  const otherWords = state.dataCollection.map(d => d.output).filter(word => word !== correctWord);
  const probPerWord = remainingProb / otherWords.length;
  otherWords.forEach(word => {
    distribution.push({ word, prob: probPerWord });
  });
  return distribution;
}

function calculate() {
  if (state.trainingState === STATES.TRAINING.INITIAL || 
      state.trainingState === STATES.TRAINING.CORRECTED) {
    state.trainingState = STATES.TRAINING.CALCULATED;
    updateUI();
  }
}

function calculatePhrase() {
  state.usageState = STATES.USAGE.CALCULATING;
  state.lastUpdateTime = millis();
  dom.calculateUsageBtn.disabled = true;
  dom.selectWordBtn.disabled = false;
  updateUI();
}

function selectWord() {
  state.usageState = STATES.USAGE.SELECTED;
  state.currentPhrase += state.ajoutsPhrase[state.compteurUsage];
  state.compteurUsage++;
  dom.calculateUsageBtn.disabled = false;
  dom.selectWordBtn.disabled = true;
  updateUI();
}

function correct() {
  if (state.trainingState === STATES.TRAINING.CALCULATED) {
    state.nombreEntrainement++;
    state.trainingState = STATES.TRAINING.CORRECTING;
    state.correctionPhase = 0;
    state.lastUpdateTime = millis();
    state.trainingProgress[state.selectedDataIndex]++;
    updateUI();
  }
}

/*************************************************
 * p5.js setup et draw
 *************************************************/
function setup() {
  canvas = createCanvas(CONFIG.canvasWidth, CONFIG.canvasHeight);
  canvas.parent(dom.trainingCanvasContainer);
  frameRate(CONFIG.frameRate);
  gearImg = loadImage('gear.svg');
  initNetworkBuffer();
  
  // Initialisation du sélecteur sur la première phrase
  state.selectedDataIndex = 0;
  dom.phraseSelect.value = "0";
  
  dom.phraseSelect.addEventListener('change', function(e) {
    state.selectedDataIndex = parseInt(e.target.value);
    if (state.trainingState !== STATES.TRAINING.CORRECTING) {
      state.trainingState = STATES.TRAINING.INITIAL;
      dom.calculateBtn.disabled = false;
      dom.correctBtn.disabled = true;
    }
  });
  
  createDataTable();
  updateUI();
}

function draw() {
  background(249);
  
  // Animation de correction
  if (state.trainingState === STATES.TRAINING.CORRECTING) {
    let currentTime = millis();
    if (currentTime - state.lastUpdateTime > CONFIG.animationDuration) {
      if (state.correctionPhase < 2) {
        state.correctionPhase++;
        state.lastUpdateTime = currentTime;
      } else {
        state.trainingState = STATES.TRAINING.CORRECTED;
        state.correctionPhase = 0;
        updateUI();
      }
    }
    state.animationProgress = (currentTime - state.lastUpdateTime) / CONFIG.animationDuration;
  }
  
  drawStep(state.globalStep);
}
