import { k } from "./kaboomCtx";
import { BAKERY_STATIONS, COLORS, CUPCAKE_STEPS, GAME_HEIGHT, GAME_WIDTH } from "./constants";
import { clamp, createLabel, createPixelRect } from "./utils";
import backgroundMusicUrl from "../audio/maksymmalko-funny-cartoon-music-532611.mp3?url";
import plopSoundUrl from "../audio/freesound_community-water-splash-80537.mp3?url";
import bakingNoiseUrl from "../audio/danevaer-white-noise-434731.mp3?url";
import ovenBellUrl from "../audio/dragon-studio-bell-ring-390294.mp3?url";
import ingredientWhooshUrl from "../audio/dragon-studio-simple-whoosh-382724.mp3?url";
import dispensePopUrl from "../audio/universfield-bubble-pop-06-351337.mp3?url";
import batterMixUrl from "../audio/freesound_community-slimy-77623.mp3?url";
import levelUpUrl from "../audio/universfield-level-up-05-326133.mp3?url";
import gameStartUrl from "../audio/freesound_community-086354_8-bit-arcade-video-game-start-sound-effect-gun-reload-and-jump-81124.mp3?url";
import quickLinksImpactUrl from "../audio/universfield-cartoon-impact-02-278820.mp3?url";
import sprinkleShineUrl from "../audio/faith_mulato-shine-193240.mp3?url";
import sprinkleShakeUrl from "../audio/freesound_community-salt-shakingwav-14556.mp3?url";
import packageBoxUrl from "../audio/oxidvideos-placing-cardboard-box-453025.mp3?url";
import eatingSoundUrl from "../audio/betoelguapillo-cartoon-eating-sound-effect-427528.mp3?url";
import conveyorSoundUrl from "../audio/freesound_community-bicycle-wheel-fx-39267.mp3?url";
import "./style.css";

const STORAGE_KEY = "tanvis-code-bakery-quest";
const CHARACTER_KEY = "tanvis-code-bakery-character";
const CUPCAKE_KEY = "tanvis-code-bakery-cupcake";
const VOLUME_KEY = "tanvis-code-bakery-volume";
const QUIET_WHOOSH_VOLUME = 0.8;
const HOVER_CAPABLE = window.matchMedia("(hover: hover)");
const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)");
const MOBILE_LAYOUT = window.matchMedia("(max-width: 700px)");
const FINE_POINTER = window.matchMedia("(pointer: fine)");
const bakingNoise = new Audio(bakingNoiseUrl);
const batterMixSound = new Audio(batterMixUrl);
const conveyorSound = new Audio(conveyorSoundUrl);
const soundEffects = {
  plop: { audio: new Audio(plopSoundUrl), volume: 1 },
  whoosh: { audio: new Audio(ingredientWhooshUrl), volume: 1 },
  dispense: { audio: new Audio(dispensePopUrl), volume: 1 },
  levelUp: { audio: new Audio(levelUpUrl), volume: 1 },
  gameStart: { audio: new Audio(gameStartUrl), volume: 1 },
  quickLinks: { audio: new Audio(quickLinksImpactUrl), volume: 1 },
  shine: { audio: new Audio(sprinkleShineUrl), volume: 1 },
  sprinkles: { audio: new Audio(sprinkleShakeUrl), volume: 1, duration: 3000 },
  packageBox: { audio: new Audio(packageBoxUrl), volume: 1 },
  eating: { audio: new Audio(eatingSoundUrl), volume: 1 },
  ovenBell: { audio: new Audio(ovenBellUrl), volume: 1 },
};
const SPRINKLE_COLORS = ["#e98f9d", "#bd5656", "#f0c96b", "#87966f", "#7695a8", "#fff8e8"];
const FROSTING_COLORS = {
  chocolate: ["#7b4b3a", "#563227", "rgba(59, 37, 32, .22)"],
  strawberry: ["#e98f9d", "#9f4647", "rgba(173, 77, 75, .18)"],
  vanilla: ["#f7dfa0", "#d1a653", "rgba(209, 166, 83, .2)"],
};
const BATTER_COLORS = {
  chocolate: ["#a67c68", "#765244", "#8c6251"],
  vanilla: ["#dfc892", "#a9874e", "#c7aa70"],
  strawberry: ["#d9a0a3", "#a4666b", "#bd7f83"],
};
const BOW_COLORS = { berry: "#bd5656", sage: "#87966f", gold: "#d4a84f" };
const DEFAULT_CHARACTER = { name: "", style: "girl", hair: "brown", skin: "peach", eyes: "brown", shirt: "yellow" };
const DEFAULT_CUPCAKE_DESIGN = { batterFlavor: "strawberry", frostingFlavor: "strawberry", sprinkles: false, decoration: "none", bowColor: "berry" };
const DECORATION_OPTIONS = new Set(["cherry", "candle", "heart"]);
const CHARACTER_OPTIONS = {
  style: [["girl", "Girl", "#e98f9d"], ["boy", "Boy", "#7695a8"]],
  hair: [["brown", "Cocoa", "#623f36"], ["black", "Night", "#3b2520"], ["pink", "Berry", "#bd5656"], ["gold", "Honey", "#f2cf83"]],
  skin: [["peach", "Peach", "#f2c4a8"], ["warm", "Warm", "#c98262"], ["deep", "Deep", "#7c4b3a"], ["golden", "Golden", "#e0a477"]],
  eyes: [["brown", "Cocoa", "#51342f"], ["green", "Sage", "#87966f"], ["blue", "Sky", "#7695a8"], ["black", "Black", "#2b1b1b"]],
  shirt: [["yellow", "Honey", "#f2cf83"], ["pink", "Berry", "#e98f9d"], ["blue", "Sky", "#7695a8"], ["sage", "Sage", "#87966f"]],
};
const CHARACTER_LABELS = { style: "Character style", hair: "Hair color", skin: "Skin color", eyes: "Eye color", shirt: "Shirt color" };
const stationPositions = {
  cafeTable: k.vec2(139, 240),
  recipeBook: k.vec2(365, 240),
  displayCase: k.vec2(595, 240),
  oven: k.vec2(821, 240),
  frostingCounter: k.vec2(139, 415),
  decoratingCounter: k.vec2(365, 415),
  deliveryStation: k.vec2(595, 415),
  bakeryDoor: k.vec2(821, 415),
};
const stationEntries = Object.entries(stationPositions);
const stationLabels = {
  cafeTable: "Ingredients",
  recipeBook: "Batter",
  displayCase: "Assembly",
  oven: "Baking",
  frostingCounter: "Frosting",
  decoratingCounter: "Decorating",
  deliveryStation: "Packaging",
  bakeryDoor: "Serving",
};
const stationIconGroups = new Map();

const welcomePanel = document.querySelector("#welcome-panel");
const gameShell = document.querySelector("#game-shell");
const backgroundMusic = document.querySelector("#background-music");
const soundControls = document.querySelector(".sound-controls");
const soundToggle = document.querySelector("#sound-toggle");
const volumeDown = document.querySelector("#volume-down");
const volumeUp = document.querySelector("#volume-up");
const startButton = document.querySelector("#start-button");
const objectiveHelp = document.querySelector("#objective-help");
const objectiveDialog = document.querySelector("#objective-dialog");
const openGuideButton = document.querySelector("#open-guide");
const openGuideDialog = document.querySelector("#open-guide-dialog");
const openGuideCustomize = document.querySelector("#open-guide-customize");
const openGuideEnter = document.querySelector("#open-guide-enter");
const entryChoiceDialog = document.querySelector("#entry-choice-dialog");
const playGameChoice = document.querySelector("#play-game-choice");
const quickLinksChoice = document.querySelector("#quick-links-choice");
const quickNav = document.querySelector(".quick-nav");
const quickLinksGuide = document.querySelector("#quick-links-guide");
const quickLinksGuideClose = document.querySelector("#quick-links-guide-close");
const quickLinksGotIt = document.querySelector("#quick-links-got-it");
const gameCanvas = document.querySelector("#game-canvas");
const customPixelCursor = document.querySelector("#custom-pixel-cursor");
const cursorSprinkleLayer = document.querySelector("#cursor-sprinkle-layer");
const gameHint = document.querySelector("#game-hint");
const homeButton = document.querySelector("#home-button");
const quitGameButton = document.querySelector("#quit-game-button");
const questPanel = document.querySelector("#quest-panel");
const questCount = document.querySelector("#quest-count");
const questStep = document.querySelector("#quest-step");
const questReward = document.querySelector("#quest-reward");
const questDetail = document.querySelector("#quest-detail");
const questProgress = document.querySelector("#quest-progress");
const trackerCount = document.querySelector("#tracker-count");
const trackerToggle = document.querySelector("#tracker-toggle");
const trackerPanel = document.querySelector("#tracker-panel");
const trackerClose = document.querySelector("#tracker-close");
const assemblyCloseGuide = document.querySelector("#assembly-close-guide");
const trackerList = document.querySelector("#tracker-list");
const editCupcakeButton = document.querySelector("#edit-cupcake-button");
const cupcakeSummaryCompact = document.querySelector("#cupcake-summary-compact");
const resetButton = document.querySelector("#reset-button");
const cupcakeEditorDialog = document.querySelector("#cupcake-editor-dialog");
const cupcakeEditorDone = document.querySelector("#cupcake-editor-done");
const cupcakeEditorSummary = document.querySelector("#cupcake-editor-summary");
const editorCupcakePreview = document.querySelector("#editor-cupcake-preview");
const editorDecorationOptions = document.querySelector("#editor-decoration-options");
const recipeDialog = document.querySelector("#recipe-dialog");
const recipeStepNumber = document.querySelector("#recipe-step-number");
const recipeTitle = document.querySelector("#recipe-title");
const recipeSection = document.querySelector("#recipe-section");
const recipeMessage = document.querySelector("#recipe-message");
const recipeContent = document.querySelector("#recipe-content");
const ingredientsInteraction = document.querySelector("#ingredients-interaction");
const ingredientGrid = document.querySelector("#ingredient-grid");
const ingredientFeedback = document.querySelector("#ingredient-feedback");
const batterInteraction = document.querySelector("#batter-interaction");
const batterIngredients = document.querySelector("#batter-ingredients");
const mixingBowl = document.querySelector("#mixing-bowl");
const whiskTool = document.querySelector("#whisk-tool");
const batterFeedback = document.querySelector("#batter-feedback");
const whiskButton = document.querySelector("#whisk-button");
const trayInteraction = document.querySelector("#tray-interaction");
const batterFlavorButtons = document.querySelectorAll("[data-batter-flavor]");
const batterDispenser = document.querySelector("#batter-dispenser");
const projectTray = document.querySelector("#project-tray");
const trayFeedback = document.querySelector("#tray-feedback");
const bakingInteraction = document.querySelector("#baking-interaction");
const bakingFeedback = document.querySelector("#baking-feedback");
const ovenActionButton = document.querySelector("#oven-action-button");
const decoratingInteraction = document.querySelector("#decorating-interaction");
const decoratingCupcake = document.querySelector("#decorating-cupcake");
const decorationOptions = document.querySelector("#decoration-options");
const decorationFeedback = document.querySelector("#decoration-feedback");
const packagingInteraction = document.querySelector("#packaging-interaction");
const bowColorButtons = document.querySelectorAll("[data-bow-color]");
const ribbonPreview = document.querySelector("#ribbon-preview");
const packagingFeedback = document.querySelector("#packaging-feedback");
const packageActionButton = document.querySelector("#package-action-button");
const servingInteraction = document.querySelector("#serving-interaction");
const servingFeedback = document.querySelector("#serving-feedback");
const serveActionButton = document.querySelector("#serve-action-button");
const customerSpeech = document.querySelector("#customer-speech");
const recipeInteractions = {
  ingredients: ingredientsInteraction,
  batter: batterInteraction,
  tray: trayInteraction,
  baking: bakingInteraction,
  decorating: decoratingInteraction,
  packaging: packagingInteraction,
  serving: servingInteraction,
};
const recipeLink = document.querySelector("#recipe-link");
const previousStepButton = document.querySelector("#previous-step-button");
const continueButton = document.querySelector("#continue-button");
const finishQuestReminder = document.querySelector("#finish-quest-reminder");
const finishQuestReminderClose = document.querySelector("#finish-quest-reminder-close");
const skipButton = document.querySelector("#skip-button");
const frostingDialog = document.querySelector("#frosting-dialog");
const previousFrostingButton = document.querySelector("#previous-frosting-button");
const frostButton = document.querySelector("#frost-button");
const frostingFeedback = document.querySelector("#frosting-feedback");
const frostingMeterFill = document.querySelector("#frosting-meter-fill");
const skipFrostingButton = document.querySelector("#skip-frosting-button");
const cupcakePlaceholder = document.querySelector("#cupcake-placeholder");
const frostingFlavorButtons = document.querySelectorAll("[data-frosting-flavor]");
const sprinkleToggle = document.querySelector("#sprinkle-toggle");
const completionDialog = document.querySelector("#completion-dialog");
const exploreButton = document.querySelector("#explore-button");
const completionReplay = document.querySelector("#completion-replay");
const resetDialog = document.querySelector("#reset-dialog");
const confirmReset = document.querySelector("#confirm-reset");
const confettiLayer = document.querySelector("#confetti-layer");
const completionConfettiLayer = document.querySelector("#completion-confetti-layer");
const customizeButton = document.querySelector("#customize-button");
const characterDialog = document.querySelector("#character-dialog");
const characterClose = document.querySelector("#character-close");
const characterOptions = document.querySelector("#character-options");
const defaultCharacter = document.querySelector("#default-character");
const saveCharacter = document.querySelector("#save-character");
const avatarPreview = document.querySelector("#avatar-preview");
const characterName = document.querySelector("#character-name");

let currentStepIndex = readSavedStep();
let player = null;
let playerParts = null;
let activeMarker = null;
let activeMarkerShadow = null;
let activeMarkerPlate = null;
let gamePaused = true;
let pendingStepIndex = null;
let frostingTaps = 0;
let cupcakeDesign = readCupcakeDesign();
let batterFlavor = cupcakeDesign.batterFlavor;
let frostingFlavor = cupcakeDesign.frostingFlavor;
let sprinklesEnabled = cupcakeDesign.sprinkles;
let collectedIngredients = new Set();
let batterIngredientsAdded = new Set();
let whiskMixes = 0;
let trayCupsFilled = 0;
let bakingStage = "ready";
let bakingTimer = null;
let ovenBellTimer = null;
let soundContext = null;
let ovenBellBufferPromise = null;
let sprinkleBufferPromise = null;
let activeSprinkleSource = null;
let packagingStage = "ready";
let ribbonPreviewTimer = null;
let servingStage = "ready";
let servingTimer = null;
let draggingBatterIngredient = null;
let batterMixSoundTimer = null;
let previousFocus = null;
let reviewMode = false;
let activeDialogStepIndex = null;
let freeExplore = currentStepIndex >= CUPCAKE_STEPS.length;
let gameStarted = false;
let entryChoiceShown = false;
let lastSprinkleTime = 0;
let cursorSprinkleCount = 0;
let toastTimer = null;
let musicEnabled = true;
const savedMusicVolume = localStorage.getItem(VOLUME_KEY);
const parsedMusicVolume = Number(savedMusicVolume);
let musicVolume = savedMusicVolume !== null && Number.isFinite(parsedMusicVolume)
  ? clamp(parsedMusicVolume, 0, 0.5)
  : 0.25;
let soundControlsExpanded = false;
let characterChoice = readCharacter();
let draftCharacter = { ...characterChoice };

function readCharacter() {
  try {
    const savedCharacter = JSON.parse(localStorage.getItem(CHARACTER_KEY) ?? "{}");
    if (savedCharacter.eyes === "pink") savedCharacter.eyes = "black";
    if (savedCharacter.shirt === "cream") savedCharacter.shirt = "yellow";
    return { ...DEFAULT_CHARACTER, ...savedCharacter };
  } catch {
    return { ...DEFAULT_CHARACTER };
  }
}

function saveCharacterChoice() {
  localStorage.setItem(CHARACTER_KEY, JSON.stringify(characterChoice));
}

function readCupcakeDesign() {
  try {
    const savedDesign = JSON.parse(localStorage.getItem(CUPCAKE_KEY) ?? "{}");
    return {
      ...DEFAULT_CUPCAKE_DESIGN,
      ...savedDesign,
      batterFlavor: savedDesign.batterFlavor ?? savedDesign.frostingFlavor ?? DEFAULT_CUPCAKE_DESIGN.batterFlavor,
    };
  } catch {
    return { ...DEFAULT_CUPCAKE_DESIGN };
  }
}

function saveCupcakeDesign() {
  localStorage.setItem(CUPCAKE_KEY, JSON.stringify(cupcakeDesign));
}

function readSavedStep() {
  try {
    const savedStep = Number.parseInt(localStorage.getItem(STORAGE_KEY) ?? "0", 10);
    return Number.isFinite(savedStep) ? clamp(savedStep, 0, CUPCAKE_STEPS.length) : 0;
  } catch {
    return 0;
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, String(currentStepIndex));
}

function updateSoundToggle() {
  soundToggle.textContent = musicEnabled ? `♫ ${Math.round(musicVolume * 100)}%` : "♫ Off";
  soundToggle.setAttribute("aria-pressed", String(musicEnabled));
  soundToggle.setAttribute("aria-label", soundControlsExpanded
    ? (musicEnabled ? "Mute background music" : "Play background music")
    : "Show music controls");
  volumeDown.disabled = musicVolume <= 0;
  volumeUp.disabled = musicVolume >= 0.5;
}

function removeMusicUnlockListeners() {
  document.removeEventListener("pointerdown", unlockBackgroundMusic, true);
  document.removeEventListener("keydown", unlockBackgroundMusic, true);
}

function playBackgroundMusic() {
  if (!musicEnabled || !backgroundMusic.paused) return;
  backgroundMusic.play()
    .then(removeMusicUnlockListeners)
    .catch(() => backgroundMusic.load());
}

function unlockBackgroundMusic() {
  playBackgroundMusic();
}

function toggleBackgroundMusic() {
  musicEnabled = !musicEnabled;
  if (musicEnabled) {
    playBackgroundMusic();
    if (bakingStage === "baking") playBakingNoise();
    if (servingStage === "delivering") playConveyorSound();
  } else {
    backgroundMusic.volume = musicVolume;
    backgroundMusic.pause();
    stopBakingNoise();
    stopBatterMixSound();
    stopConveyorSound();
    stopSprinkleSound();
  }
  updateSoundToggle();
}

function setSoundControlsExpanded(expanded) {
  soundControlsExpanded = expanded;
  soundControls.classList.toggle("is-expanded", expanded);
  soundToggle.setAttribute("aria-expanded", String(expanded));
  updateSoundToggle();
}

function adjustBackgroundVolume(change) {
  musicVolume = clamp(Math.round((musicVolume + change) * 100) / 100, 0, 0.5);
  backgroundMusic.volume = musicVolume;
  localStorage.setItem(VOLUME_KEY, String(musicVolume));
  if (!musicEnabled) {
    musicEnabled = true;
    playBackgroundMusic();
    if (bakingStage === "baking") playBakingNoise();
  }
  bakingNoise.volume = musicVolume === 0 ? 0 : clamp(musicVolume * 3.2, 0.4, 1);
  updateSoundToggle();
}

function playSoundEffect(name, volumeOverride) {
  if (!musicEnabled) return;
  const effect = soundEffects[name];
  if (!effect) return;
  const sound = effect.audio.cloneNode();
  const defaultVolume = typeof effect.volume === "function" ? effect.volume() : effect.volume;
  sound.volume = volumeOverride ?? defaultVolume;
  sound.play().catch(() => {});
  if (effect.duration) {
    window.setTimeout(() => {
      sound.pause();
      sound.currentTime = 0;
    }, effect.duration);
  }
}

function stopBatterMixSound() {
  window.clearTimeout(batterMixSoundTimer);
  batterMixSoundTimer = null;
  batterMixSound.pause();
  batterMixSound.currentTime = 0;
}

function playBatterMixSound() {
  if (!musicEnabled) return;
  stopBatterMixSound();
  batterMixSound.volume = 1;
  batterMixSound.play().catch(() => {});
  batterMixSoundTimer = window.setTimeout(stopBatterMixSound, 2200);
}

function stopConveyorSound() {
  conveyorSound.pause();
  conveyorSound.currentTime = 0;
}

function playConveyorSound() {
  if (!musicEnabled) return;
  stopConveyorSound();
  conveyorSound.volume = 1;
  conveyorSound.play().catch(() => {});
}

function playBakingNoise() {
  if (!musicEnabled || !bakingNoise.paused) return;
  bakingNoise.volume = musicVolume === 0 ? 0 : clamp(musicVolume * 3.2, 0.4, 1);
  bakingNoise.play().catch(() => {});
}

function stopBakingNoise() {
  bakingNoise.pause();
  bakingNoise.currentTime = 0;
}

function prepareSprinkleSound() {
  const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!soundContext) soundContext = new AudioContextClass();
  if (soundContext.state === "suspended") soundContext.resume().catch(() => {});
  if (!sprinkleBufferPromise) {
    sprinkleBufferPromise = fetch(sprinkleShakeUrl)
      .then((response) => response.arrayBuffer())
      .then((data) => soundContext.decodeAudioData(data))
      .catch(() => null);
  }
  return sprinkleBufferPromise;
}

function stopSprinkleSound() {
  if (!activeSprinkleSource) return;
  try {
    activeSprinkleSource.stop();
  } catch {}
  activeSprinkleSource = null;
}

async function playSprinkleSound() {
  if (!musicEnabled) return;
  const buffer = await prepareSprinkleSound();
  if (!buffer || !soundContext) {
    playSoundEffect("sprinkles");
    return;
  }
  stopSprinkleSound();
  const source = soundContext.createBufferSource();
  const gain = soundContext.createGain();
  const compressor = soundContext.createDynamicsCompressor();
  source.buffer = buffer;
  gain.gain.value = 1.8;
  compressor.threshold.value = -8;
  compressor.knee.value = 8;
  compressor.ratio.value = 5;
  source.connect(gain).connect(compressor).connect(soundContext.destination);
  activeSprinkleSource = source;
  source.addEventListener("ended", () => {
    if (activeSprinkleSource === source) activeSprinkleSource = null;
  });
  source.start();
  source.stop(soundContext.currentTime + Math.min(3, buffer.duration));
}

function prepareOvenBell() {
  const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!soundContext) soundContext = new AudioContextClass();
  if (soundContext.state === "suspended") soundContext.resume().catch(() => {});
  if (!ovenBellBufferPromise) {
    ovenBellBufferPromise = fetch(ovenBellUrl)
      .then((response) => response.arrayBuffer())
      .then((data) => soundContext.decodeAudioData(data))
      .catch(() => null);
  }
  return ovenBellBufferPromise;
}

async function playOvenBell() {
  if (!musicEnabled) return;
  const buffer = await prepareOvenBell();
  if (!buffer || !soundContext) {
    playSoundEffect("ovenBell");
    return;
  }
  const source = soundContext.createBufferSource();
  const gain = soundContext.createGain();
  const compressor = soundContext.createDynamicsCompressor();
  source.buffer = buffer;
  gain.gain.value = 3;
  compressor.threshold.value = -12;
  compressor.knee.value = 10;
  compressor.ratio.value = 8;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.2;
  source.connect(gain).connect(compressor).connect(soundContext.destination);
  source.start();
}

function finishBakingSound() {
  stopBakingNoise();
  window.clearTimeout(ovenBellTimer);
  ovenBellTimer = window.setTimeout(() => {
    ovenBellTimer = null;
    if (!musicEnabled) return;
    playOvenBell();
  }, 40);
}

function updateChoiceButtons(buttons, dataKey, selectedValue) {
  buttons.forEach((button) => {
    const selected = button.dataset[dataKey] === selectedValue;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

function drawBakery() {
  k.add([k.rect(GAME_WIDTH, GAME_HEIGHT), k.color(k.Color.fromHex(COLORS.cream)), k.pos(0), k.z(-20)]);
  k.add([k.rect(GAME_WIDTH - 64, GAME_HEIGHT - 64), k.color(k.Color.fromHex("#f3d2c5")), k.pos(32, 32), k.z(-19)]);

  for (let x = 48; x < GAME_WIDTH - 48; x += 48) {
    k.add([k.rect(32, 32), k.color(k.Color.fromHex(x % 96 === 0 ? "#e8b9ad" : "#f7dfce")), k.pos(x, 64), k.z(-18)]);
  }

  k.add([k.rect(GAME_WIDTH - 64, 7), k.color(k.Color.fromHex(COLORS.brown)), k.pos(32, 112), k.z(-17)]);
  const bakerySign = k.vec2(GAME_WIDTH / 2, 76);
  k.add([k.rect(210, 50), k.color(k.Color.fromHex(COLORS.brown)), k.pos(bakerySign.add(k.vec2(4, 4))), k.anchor("center"), k.z(-13)]);
  k.add([k.rect(210, 50), k.color(k.Color.fromHex(COLORS.cream)), k.outline(3, k.Color.fromHex(COLORS.brown)), k.pos(bakerySign), k.anchor("center"), k.z(-12)]);
  k.add([k.rect(8, 8), k.color(k.Color.fromHex(COLORS.pink)), k.pos(bakerySign.add(k.vec2(-91, -14))), k.anchor("center"), k.z(-11)]);
  k.add([k.rect(8, 8), k.color(k.Color.fromHex(COLORS.pink)), k.pos(bakerySign.add(k.vec2(91, 14))), k.anchor("center"), k.z(-11)]);
  createLabel(k, "TANVI'S", bakerySign.add(k.vec2(0, -12)), { size: 9, color: COLORS.red });
  createLabel(k, "PORTFOLIO BAKERY", bakerySign.add(k.vec2(0, 8)), { size: 16, color: COLORS.cocoa });
  createLabel(k, "CLICK TO WALK  |  BAKE TO EXPLORE", k.vec2(GAME_WIDTH / 2, 140), { size: 10, color: COLORS.red });

  const stations = [
    ["cafeTable", COLORS.sage, "#dce5d1"],
    ["recipeBook", COLORS.red, "#fff4e2"],
    ["displayCase", COLORS.golden, "#f8dfe2"],
    ["oven", COLORS.red, "#f7dfce"],
    ["frostingCounter", COLORS.red, "#f8dfe2"],
    ["decoratingCounter", COLORS.golden, "#f7dfce"],
    ["deliveryStation", COLORS.red, "#fff4e2"],
    ["bakeryDoor", COLORS.sage, "#f7dfce"],
  ];

  for (const [stationId, color, screenColor] of stations) {
    const position = stationPositions[stationId];
    const stationTitle = stationLabels[stationId];
    const stationDescription = BAKERY_STATIONS[stationId].label;
    const titleSize = stationTitle.length > 16 ? 11 : 13;
    const descriptionSize = stationDescription.length > 24 ? 8 : stationDescription.length > 20 ? 9 : 10;
    const titleColor = color === COLORS.red || color === COLORS.brown ? COLORS.cream : COLORS.brown;
    drawStationRoom(position, color);
    k.add([k.rect(116, 64), k.color(k.Color.fromHex(COLORS.cocoa)), k.pos(position.add(k.vec2(4, 4))), k.anchor("center"), k.z(-1)]);
    createPixelRect(k, position, 116, 64, screenColor);
    k.add([k.rect(104, 3), k.color(k.Color.fromHex(COLORS.cream)), k.pos(position.add(k.vec2(0, -26))), k.anchor("center"), k.z(1)]);
    drawStationIcon(stationId, position);
    k.add([k.rect(156, 18), k.color(k.Color.fromHex(COLORS.cocoa)), k.pos(position.add(k.vec2(3, 53))), k.anchor("center"), k.z(0)]);
    k.add([k.rect(156, 18), k.color(k.Color.fromHex("#fff4e2")), k.outline(2, k.Color.fromHex(COLORS.brown)), k.pos(position.add(k.vec2(0, 50))), k.anchor("center"), k.z(1)]);
    createLabel(k, stationTitle, position.add(k.vec2(0, -53)), { size: titleSize, width: 158, align: "center", color: titleColor });
    createLabel(k, stationDescription, position.add(k.vec2(0, 50)), { size: descriptionSize, width: 152, align: "center", color: COLORS.brown });
  }
}

function drawStationRoom(position, color) {
  k.add([
    k.rect(174, 126), k.color(k.Color.fromHex(COLORS.cocoa)),
    k.pos(position.add(k.vec2(5, 5))), k.anchor("center"), k.z(-17),
  ]);
  k.add([
    k.rect(174, 126), k.color(k.Color.fromHex("#fff4e2")),
    k.outline(4, k.Color.fromHex(COLORS.brown)), k.pos(position), k.anchor("center"), k.z(-16),
  ]);
  k.add([
    k.rect(164, 20), k.color(k.Color.fromHex(color)), k.outline(2, k.Color.fromHex(COLORS.brown)),
    k.pos(position.add(k.vec2(0, -53))), k.anchor("center"), k.z(-15),
  ]);
}

function drawStationIcon(stationId, position) {
  const iconPosition = position.add(k.vec2(0, 2));
  const iconColor = k.Color.fromHex(COLORS.brown);
  const iconParts = [];
  const shadowParts = [];
  const shadowOffset = k.vec2(3, 3);
  stationIconGroups.set(stationId, { center: iconPosition, parts: iconParts, shadowParts, shadowOffset, scale: 1, shadowOpacity: 0 });
  const addIconRect = (width, height, offset, color = iconColor, outlineWidth = 0, z = 3) => {
    const resolvedColor = typeof color === "string" ? k.Color.fromHex(color) : color;
    const shadow = k.add([
      k.rect(width, height), k.color(k.Color.fromHex(COLORS.red)), k.opacity(0), k.scale(1),
      k.pos(iconPosition.add(offset).add(shadowOffset)), k.anchor("center"), k.z(2),
    ]);
    const components = [k.rect(width, height), k.color(resolvedColor), k.scale(1)];
    if (outlineWidth) components.push(k.outline(outlineWidth, iconColor));
    components.push(k.pos(iconPosition.add(offset)), k.anchor("center"), k.z(z));
    const object = k.add(components);
    shadowParts.push({ object: shadow, offset });
    iconParts.push({ object, offset });
    return object;
  };
  const addIconCircle = (radius, offset, color, outlineWidth = 0, z = 4) => {
    const shadow = k.add([
      k.circle(radius), k.color(k.Color.fromHex(COLORS.red)), k.opacity(0), k.scale(1),
      k.pos(iconPosition.add(offset).add(shadowOffset)), k.anchor("center"), k.z(2),
    ]);
    const components = [k.circle(radius), k.color(k.Color.fromHex(color)), k.scale(1)];
    if (outlineWidth) components.push(k.outline(outlineWidth, iconColor));
    components.push(k.pos(iconPosition.add(offset)), k.anchor("center"), k.z(z));
    const object = k.add(components);
    shadowParts.push({ object: shadow, offset });
    iconParts.push({ object, offset });
    return object;
  };
  const drawMiniCupcake = (x, y, scale = 1, frostingColor = "#f7dfa0") => {
    const offset = (offsetY) => k.vec2(x, y + offsetY * scale);
    addIconRect(14 * scale, 10 * scale, offset(8), COLORS.brown, 0, 4);
    addIconRect(10 * scale, 7 * scale, offset(8), COLORS.red, 0, 5);
    addIconRect(18 * scale, 7 * scale, offset(2), COLORS.brown, 0, 5);
    addIconRect(14 * scale, 4 * scale, offset(2), frostingColor, 0, 6);
    addIconRect(14 * scale, 7 * scale, offset(-3), COLORS.brown, 0, 5);
    addIconRect(10 * scale, 4 * scale, offset(-3), frostingColor, 0, 6);
    addIconRect(8 * scale, 7 * scale, offset(-8), COLORS.brown, 0, 5);
    addIconRect(4 * scale, 4 * scale, offset(-8), COLORS.pink, 0, 6);
  };

  if (stationId === "oven") {
    addIconRect(54, 46, k.vec2(0, 0), COLORS.cocoa);
    addIconRect(44, 35, k.vec2(0, 4), COLORS.red);
    addIconRect(34, 21, k.vec2(0, 8), COLORS.cream, 2);
    addIconRect(25, 4, k.vec2(0, -6), COLORS.cocoa);
    addIconRect(5, 5, k.vec2(-15, -15), "#f7dfa0", 1);
    addIconRect(5, 5, k.vec2(-6, -15), COLORS.pink);
    addIconRect(5, 5, k.vec2(15, -15), "#f7dfa0", 1);
    return;
  }

  if (stationId === "displayCase") {
    addIconRect(72, 44, k.vec2(0, 2), COLORS.cocoa);
    addIconRect(69, 41, k.vec2(0, 2), COLORS.cream);
    addIconRect(72, 3, k.vec2(0, -20), COLORS.brown);
    addIconRect(72, 3, k.vec2(0, 24), COLORS.brown);
    for (const y of [-9, 11]) {
      for (const x of [-21, 0, 21]) {
        addIconCircle(7, k.vec2(x, y), COLORS.brown, 0, 5);
        addIconCircle(4, k.vec2(x, y), y < 0 ? "#f7dfa0" : COLORS.pink, 0, 6);
      }
    }
    return;
  }

  if (stationId === "recipeBook") {
    addIconRect(62, 7, k.vec2(0, 1), COLORS.brown);
    addIconRect(54, 3, k.vec2(0, 0), COLORS.cream);
    addIconRect(52, 9, k.vec2(0, 8), COLORS.brown);
    addIconRect(44, 5, k.vec2(0, 8), "#f7dfa0");
    addIconRect(42, 9, k.vec2(0, 15), COLORS.brown);
    addIconRect(34, 5, k.vec2(0, 15), "#f7dfa0");
    addIconRect(32, 9, k.vec2(0, 22), COLORS.brown);
    addIconRect(24, 5, k.vec2(0, 22), "#f7dfa0");
    addIconRect(4, 30, k.vec2(17, -13), COLORS.brown);
    addIconRect(15, 4, k.vec2(12, -26), COLORS.brown);
    return;
  }

  if (stationId === "frostingCounter") {
    drawMiniCupcake(0, 3, 2.15, COLORS.pink);
    return;
  }

  if (stationId === "decoratingCounter") {
    addIconCircle(11, k.vec2(-26, 7), COLORS.brown, 0, 5);
    addIconCircle(8, k.vec2(-26, 7), COLORS.red, 0, 6);
    addIconRect(3, 15, k.vec2(-21, -5), COLORS.brown, 0, 7);
    addIconRect(8, 4, k.vec2(-17, -11), COLORS.sage, 1, 6);

    addIconRect(14, 35, k.vec2(0, 6), COLORS.brown, 0, 5);
    addIconRect(9, 30, k.vec2(0, 6), COLORS.pink, 1, 6);
    addIconRect(9, 5, k.vec2(0, -2), COLORS.cream, 0, 7);
    addIconCircle(6, k.vec2(0, -19), "#f7dfa0", 2, 7);

    addIconRect(26, 10, k.vec2(26, -5), COLORS.brown, 0, 5);
    addIconRect(22, 6, k.vec2(26, -5), COLORS.red, 0, 6);
    addIconRect(20, 10, k.vec2(26, 3), COLORS.brown, 0, 5);
    addIconRect(16, 6, k.vec2(26, 3), COLORS.red, 0, 6);
    addIconRect(12, 10, k.vec2(26, 11), COLORS.brown, 0, 5);
    addIconRect(8, 6, k.vec2(26, 11), COLORS.red, 0, 6);
    return;
  }

  if (stationId === "deliveryStation") {
    addIconRect(54, 39, k.vec2(0, 5), COLORS.cocoa);
    addIconRect(47, 32, k.vec2(0, 5), "#f7dfa0");
    addIconRect(5, 32, k.vec2(0, 5), COLORS.brown);
    addIconRect(47, 4, k.vec2(0, -10), COLORS.cream);
    addIconRect(17, 11, k.vec2(13, 4), COLORS.cream, 1);
    addIconRect(10, 3, k.vec2(13, 2), COLORS.pink);
    addIconRect(23, 5, k.vec2(-13, -15), "#f7dfa0", 2);
    addIconRect(23, 5, k.vec2(13, -15), "#f7dfa0", 2);
    return;
  }

  if (stationId === "cafeTable") {
    addIconRect(66, 30, k.vec2(0, 10), COLORS.cocoa);
    addIconRect(58, 22, k.vec2(0, 9), "#f7dfa0");
    addIconRect(5, 22, k.vec2(-18, 9), COLORS.brown);
    addIconRect(5, 22, k.vec2(18, 9), COLORS.brown);
    addIconRect(74, 6, k.vec2(0, -4), COLORS.brown);
    addIconCircle(11, k.vec2(-21, -15), COLORS.brown, 0, 5);
    addIconCircle(8, k.vec2(-21, -15), COLORS.cream, 0, 6);
    addIconCircle(4, k.vec2(-21, -15), "#f7dfa0", 1, 7);
    addIconRect(18, 23, k.vec2(1, -14), COLORS.brown);
    addIconRect(12, 17, k.vec2(1, -14), COLORS.cream);
    addIconRect(16, 12, k.vec2(22, -12), COLORS.brown);
    addIconRect(10, 6, k.vec2(22, -12), COLORS.pink);
    return;
  }

  if (stationId === "bakeryDoor") {
    addIconRect(46, 52, k.vec2(0, 1), COLORS.cocoa);
    addIconRect(36, 44, k.vec2(0, 4), COLORS.red);
    addIconRect(22, 15, k.vec2(0, -9), COLORS.cocoa);
    addIconRect(15, 8, k.vec2(0, -9), COLORS.pink);
    addIconRect(4, 4, k.vec2(11, 9), "#f7dfa0", 1);
    addIconRect(20, 4, k.vec2(0, 22), "#f7dfa0", 1);
    return;
  }
}

function updateStationIconHover() {
  const canHover = HOVER_CAPABLE.matches && gameCanvas.matches(":hover");
  const mousePosition = k.toWorld(k.mousePos());

  stationIconGroups.forEach((group, stationId) => {
    const stationPosition = stationPositions[stationId];
    const isHovered = canHover
      && Math.abs(mousePosition.x - stationPosition.x) <= 87
      && Math.abs(mousePosition.y - stationPosition.y) <= 63;
    const targetScale = isHovered ? 1.12 : 1;
    const targetShadowOpacity = isHovered ? 0.28 : 0;
    if (!isHovered && Math.abs(group.scale - 1) < 0.001 && group.shadowOpacity < 0.001) return;
    const easing = Math.min(1, k.dt() * 12);
    group.scale += (targetScale - group.scale) * easing;
    group.shadowOpacity += (targetShadowOpacity - group.shadowOpacity) * easing;

    group.parts.forEach(({ object, offset }) => {
      object.scale = k.vec2(group.scale);
      object.pos = group.center.add(k.vec2(offset.x * group.scale, offset.y * group.scale));
    });
    group.shadowParts.forEach(({ object, offset }) => {
      object.scale = k.vec2(group.scale);
      object.opacity = group.shadowOpacity;
      object.pos = group.center.add(k.vec2(
        (offset.x + group.shadowOffset.x) * group.scale,
        (offset.y + group.shadowOffset.y) * group.scale,
      ));
    });
  });
}

function selectedColor(type, value) {
  return CHARACTER_OPTIONS[type].find(([id]) => id === value)?.[2] ?? CHARACTER_OPTIONS[type][0][2];
}

function renderCharacterPreview() {
  characterName.value = draftCharacter.name;
  avatarPreview.dataset.style = draftCharacter.style;
  avatarPreview.style.setProperty("--avatar-hair", selectedColor("hair", draftCharacter.hair));
  avatarPreview.style.setProperty("--avatar-skin", selectedColor("skin", draftCharacter.skin));
  avatarPreview.style.setProperty("--avatar-eyes", selectedColor("eyes", draftCharacter.eyes));
  avatarPreview.style.setProperty("--avatar-shirt", selectedColor("shirt", draftCharacter.shirt));
  characterOptions.innerHTML = Object.entries(CHARACTER_OPTIONS).map(([type, options]) => `
    <fieldset class="character-group"><legend>${CHARACTER_LABELS[type]}</legend><div class="swatch-row">
      ${options.map(([id, label, color]) => `<button class="color-swatch ${draftCharacter[type] === id ? "is-selected" : ""}" type="button" data-character-type="${type}" data-character-value="${id}" style="--swatch-color:${color}" aria-label="${label} ${type}" aria-pressed="${draftCharacter[type] === id}"><span></span></button>`).join("")}
    </div></fieldset>`).join("");
}

function playerHairShape() {
  return characterChoice.style === "boy"
    ? { width: 34, height: 20, y: -17 }
    : { width: 40, height: 52, y: -7 };
}

function positionPlayerParts() {
  if (!player || !playerParts) return;
  const hairShape = playerHairShape();
  playerParts.hair.pos = player.pos.add(k.vec2(0, hairShape.y));
  playerParts.outfit.pos = player.pos.add(k.vec2(0, 16));
  playerParts.leftEye.pos = player.pos.add(k.vec2(-6, -3));
  playerParts.rightEye.pos = player.pos.add(k.vec2(6, -3));
  if (playerParts.nameLabel) playerParts.nameLabel.pos = player.pos.add(k.vec2(0, -40));
}

function updatePlayerAppearance() {
  if (!player || !playerParts) return;
  const hairShape = playerHairShape();
  player.color = k.Color.fromHex(selectedColor("skin", characterChoice.skin));
  playerParts.hair.color = k.Color.fromHex(selectedColor("hair", characterChoice.hair));
  playerParts.hair.width = hairShape.width;
  playerParts.hair.height = hairShape.height;
  playerParts.outfit.color = k.Color.fromHex(selectedColor("shirt", characterChoice.shirt));
  const eyeColor = k.Color.fromHex(selectedColor("eyes", characterChoice.eyes));
  playerParts.leftEye.color = eyeColor;
  playerParts.rightEye.color = eyeColor;
  positionPlayerParts();
}

function openCharacterCreator() {
  playSoundEffect("whoosh", QUIET_WHOOSH_VOLUME);
  draftCharacter = { ...characterChoice };
  renderCharacterPreview();
  characterDialog.showModal();
  characterClose.focus();
}

function addPlayer() {
  const skinColor = selectedColor("skin", characterChoice.skin);
  const hairColor = selectedColor("hair", characterChoice.hair);
  const eyeColor = selectedColor("eyes", characterChoice.eyes);
  const shirtColor = selectedColor("shirt", characterChoice.shirt);
  player = k.add([
    k.rect(28, 30), k.color(k.Color.fromHex(skinColor)),
    k.outline(2, k.Color.fromHex(COLORS.cocoa)),
    k.pos(GAME_WIDTH / 2, 330),
    k.area({ shape: new k.Rect(k.vec2(0), 28, 38) }), k.anchor("center"), k.z(20),
    { speed: 440, destination: null }, "player",
  ]);
  const hairShape = playerHairShape();
  const hair = k.add([k.rect(hairShape.width, hairShape.height), k.color(k.Color.fromHex(hairColor)), k.outline(2, k.Color.fromHex(COLORS.cocoa)), k.pos(player.pos.x, player.pos.y + hairShape.y), k.anchor("center"), k.z(19), "player-hair"]);
  const outfit = k.add([k.rect(30, 22), k.color(k.Color.fromHex(shirtColor)), k.outline(2, k.Color.fromHex(COLORS.cocoa)), k.pos(player.pos.x, player.pos.y + 16), k.anchor("center"), k.z(21), "player-outfit"]);
  const leftEye = k.add([k.rect(4, 4), k.color(k.Color.fromHex(eyeColor)), k.outline(1, k.Color.fromHex("#2b1b1b")), k.pos(player.pos.x - 6, player.pos.y - 3), k.anchor("center"), k.z(22), "player-eye-left"]);
  const rightEye = k.add([k.rect(4, 4), k.color(k.Color.fromHex(eyeColor)), k.outline(1, k.Color.fromHex("#2b1b1b")), k.pos(player.pos.x + 6, player.pos.y - 3), k.anchor("center"), k.z(22), "player-eye-right"]);
  let nameLabel = null;
  if (characterChoice.name.trim()) {
    nameLabel = k.add([k.text(characterChoice.name.trim(), { size: 10, font: "monospace" }), k.color(k.Color.fromHex(COLORS.brown)), k.pos(player.pos.x, player.pos.y - 40), k.anchor("center"), k.z(23), "player-name"]);
  }
  playerParts = { hair, outfit, leftEye, rightEye, nameLabel };
  return player;
}

function renderProgress() {
  const step = CUPCAKE_STEPS[currentStepIndex];
  const stepNumber = Math.min(currentStepIndex + 1, CUPCAKE_STEPS.length);
  questCount.textContent = currentStepIndex >= CUPCAKE_STEPS.length ? "Complete" : `Step ${stepNumber} of ${CUPCAKE_STEPS.length}`;
  questStep.textContent = step?.questLabel ?? "Cupcake Quest Complete!";
  questReward.textContent = step ? `Discover Tanvi’s ${step.portfolioSection}` : "Your portfolio cupcake is ready to serve";
  questDetail.textContent = step?.instruction ?? "Explore freely or reset the quest to bake again.";
  trackerCount.textContent = `${Math.min(currentStepIndex + 1, CUPCAKE_STEPS.length)}/${CUPCAKE_STEPS.length}`;
  questProgress.innerHTML = CUPCAKE_STEPS.map((item, index) => `<span class="${index < currentStepIndex ? "is-done" : ""} ${index === currentStepIndex ? "is-current" : ""}" title="${item.questLabel}"></span>`).join("");
  trackerList.innerHTML = CUPCAKE_STEPS.map((item, index) => {
    const state = index < currentStepIndex ? "completed" : index === currentStepIndex ? "current" : "locked";
    const symbol = state === "completed" ? "✓" : state === "current" ? "→" : "○";
    const content = `<span class="tracker-symbol">${symbol}</span><span><strong>${item.number}. ${item.station}</strong><small>${item.portfolioSection}</small></span>`;
    return state === "completed"
      ? `<button class="tracker-step ${state}" type="button" data-review-step="${index}" aria-label="Review step ${item.number}, ${item.portfolioSection}">${content}</button>`
      : `<div class="tracker-step ${state}">${content}</div>`;
  }).join("");
}

function celebrateStep(completion = false) {
  if (REDUCED_MOTION.matches) return;
  const colors = ["#e98f9d", "#f2cf83", "#87966f", "#bd5656", "#fff8e8"];
  const layer = completion ? completionConfettiLayer : confettiLayer;
  const pieceCount = completion ? 80 : 22;
  const cleanupDelay = completion ? 3400 : 1300;
  layer.replaceChildren();
  for (let index = 0; index < pieceCount; index += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.setProperty("--confetti-x", `${Math.random() * 100}%`);
    piece.style.setProperty("--confetti-delay", `${Math.random() * (completion ? 650 : 130)}ms`);
    piece.style.setProperty("--confetti-fall", completion ? "calc(100vh + 50px)" : "360px");
    piece.style.setProperty("--confetti-drift", `${Math.round(Math.random() * 120 - 60)}px`);
    piece.style.setProperty("--confetti-rotation", `${Math.round(Math.random() * 180)}deg`);
    if (completion) piece.style.animationDuration = `${1800 + Math.random() * 900}ms`;
    piece.style.backgroundColor = colors[index % colors.length];
    layer.append(piece);
  }
  window.setTimeout(() => layer.replaceChildren(), cleanupDelay);
}

function clearMarker() {
  if (activeMarker) {
    activeMarker.destroy();
    activeMarker = null;
  }
  if (activeMarkerShadow) {
    activeMarkerShadow.destroy();
    activeMarkerShadow = null;
  }
  if (activeMarkerPlate) {
    activeMarkerPlate.destroy();
    activeMarkerPlate = null;
  }
}

function highlightStation() {
  clearMarker();
  const step = CUPCAKE_STEPS[currentStepIndex];
  if (!step || freeExplore) return;
  const position = stationPositions[step.stationId];
  activeMarkerShadow = k.add([
    k.rect(54, 20),
    k.color(k.Color.fromHex(COLORS.cocoa)),
    k.pos(position.add(k.vec2(4, -74))),
    k.anchor("center"),
    k.z(8),
  ]);
  activeMarkerPlate = k.add([
    k.rect(54, 20),
    k.color(k.Color.fromHex(COLORS.cream)),
    k.outline(2, k.Color.fromHex(COLORS.brown)),
    k.pos(position.add(k.vec2(0, -78))),
    k.anchor("center"),
    k.z(9),
  ]);
  activeMarker = createLabel(k, "NEXT", position.add(k.vec2(0, -78)), { size: 9, color: COLORS.red });
  activeMarker.onUpdate(() => {
    if (gamePaused) return;
    const markerY = position.y - 78 + Math.sin(k.time() * 4) * 4;
    activeMarker.pos.y = markerY;
    activeMarkerShadow.pos = k.vec2(position.x + 3, markerY + 3);
    activeMarkerPlate.pos = k.vec2(position.x, markerY);
  });
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  gameHint.textContent = message;
  gameHint.classList.add("is-visible", "is-alert");
  toastTimer = window.setTimeout(() => {
    gameHint.classList.remove("is-alert");
    gameHint.textContent = gamePaused ? "Complete the recipe card to continue" : "Directions: click or tap to move · Objective: explore the bakery";
  }, 1800);
}

function openDialog(dialog, focusTarget) {
  previousFocus = document.activeElement;
  gamePaused = true;
  if (!dialog.open) dialog.showModal();
  window.requestAnimationFrame(() => focusTarget.focus());
}

function closeDialog(dialog) {
  if (dialog === recipeDialog) {
    if (bakingTimer) window.clearTimeout(bakingTimer);
    bakingTimer = null;
    window.clearTimeout(ovenBellTimer);
    ovenBellTimer = null;
    stopBakingNoise();
    stopBatterMixSound();
  }
  if (dialog === recipeDialog && servingTimer) {
    window.clearTimeout(servingTimer);
    servingTimer = null;
    stopConveyorSound();
  }
  if (dialog.open) dialog.close();
  if (player) player.destination = null;
  gamePaused = false;
  previousFocus?.focus?.();
  previousFocus = null;
  if (dialog === recipeDialog || dialog === frostingDialog) {
    reviewMode = false;
    activeDialogStepIndex = null;
  }
}

function openRecipeCard(stepIndex, { review = false } = {}) {
  const step = CUPCAKE_STEPS[stepIndex];
  finishQuestReminder.hidden = true;
  reviewMode = review;
  activeDialogStepIndex = stepIndex;
  pendingStepIndex = review ? null : stepIndex;
  recipeStepNumber.textContent = `STEP ${step.number} · ${step.station.toUpperCase()}`;
  recipeTitle.textContent = step.questLabel;
  recipeSection.textContent = step.portfolioSection;
  recipeMessage.textContent = step.completionMessage;
  recipeContent.textContent = step.content;
  Object.entries(recipeInteractions).forEach(([id, interaction]) => {
    interaction.hidden = step.id !== id;
  });
  recipeContent.hidden = Boolean(recipeInteractions[step.id]);
  previousStepButton.hidden = stepIndex === 0;
  skipButton.hidden = review;
  if (review && step.id === "ingredients") collectedIngredients = new Set();
  if (step.id === "batter") openBatterInteraction();
  if (step.id === "tray") openTrayInteraction();
  if (step.id === "baking") openBakingInteraction();
  if (step.id === "decorating") renderDecorationInteraction();
  if (step.id === "packaging") openPackagingInteraction();
  if (step.id === "serving") openServingInteraction();
  continueButton.disabled = step.id === "ingredients" && collectedIngredients.size < step.ingredientItems.length
    || step.id === "batter" && (batterIngredientsAdded.size < 4 || whiskMixes < 1)
    || step.id === "tray" && trayCupsFilled < 4
    || step.id === "baking" && bakingStage !== "complete"
    || step.id === "decorating" && cupcakeDesign.decoration === "none"
    || step.id === "packaging" && packagingStage !== "complete"
    || step.id === "serving" && servingStage !== "complete";
  continueButton.innerHTML = review
    ? "Finish Replay"
    : `${stepIndex === CUPCAKE_STEPS.length - 1 ? "Finish Quest" : "Continue Quest"} <span aria-hidden="true">→</span>`;
  if (step.id === "ingredients") renderIngredients(step);
  recipeLink.hidden = !step.link;
  if (step.link) recipeLink.href = step.link;
  openDialog(recipeDialog, continueButton);
}

function openBatterInteraction() {
  stopBatterMixSound();
  batterIngredientsAdded = new Set();
  whiskMixes = 0;
  batterFeedback.textContent = "4 ingredients to add.";
  whiskButton.disabled = true;
  whiskButton.hidden = true;
  whiskButton.classList.remove("is-mixing");
  mixingBowl.classList.remove("is-mixed");
  mixingBowl.querySelectorAll(".batter-pixel").forEach((pixel) => pixel.classList.remove("is-visible"));
  whiskTool.classList.remove("is-visible", "is-whisking");
  batterIngredients.innerHTML = ["Egg", "Butter", "Flour", "Sugar"].map((label) => `<button class="batter-ingredient" type="button" draggable="true" data-batter-ingredient="${label.toLowerCase()}"><span class="ingredient-icon ingredient-${label.toLowerCase()}" draggable="true" data-batter-ingredient="${label.toLowerCase()}" aria-hidden="true"></span><strong>${label}</strong></button>`).join("");
}

function addBatterIngredient(id) {
  if (batterIngredientsAdded.has(id)) return;
  batterIngredientsAdded.add(id);
  const ingredient = batterIngredients.querySelector(`[data-batter-ingredient="${id}"]`);
  if (!ingredient) return;
  ingredient.classList.add("is-added");
  playSoundEffect("plop");
  ingredient?.setAttribute("aria-pressed", "true");
  mixingBowl.querySelector(`.batter-pixel-${id}`)?.classList.add("is-visible");
  batterFeedback.textContent = batterIngredientsAdded.size === 4 ? "All ingredients are in. Time to whisk!" : `${4 - batterIngredientsAdded.size} ingredients to add.`;
  whiskButton.disabled = batterIngredientsAdded.size < 4;
  whiskButton.hidden = batterIngredientsAdded.size < 4;
  continueButton.disabled = batterIngredientsAdded.size < 4 || whiskMixes < 1;
}

function whiskBatter() {
  if (whiskButton.disabled || whiskMixes >= 1) return;
  playBatterMixSound();
  whiskMixes += 1;
  whiskTool.classList.add("is-visible");
  whiskTool.classList.remove("is-whisking");
  void whiskTool.offsetWidth;
  whiskTool.classList.add("is-whisking");
  whiskButton.classList.remove("is-mixing");
  void whiskButton.offsetWidth;
  whiskButton.classList.add("is-mixing");
  batterFeedback.textContent = "Batter is ready!";
  whiskButton.innerHTML = "<span class=\"whisk-icon\" aria-hidden=\"true\">◡</span> Batter stirred!";
  whiskButton.disabled = true;
  mixingBowl.classList.add("is-mixed");
  window.setTimeout(() => {
    mixingBowl.querySelectorAll(".batter-pixel").forEach((pixel) => pixel.classList.remove("is-visible"));
    whiskTool.classList.remove("is-visible");
  }, 650);
  continueButton.disabled = false;
}

function openTrayInteraction() {
  trayCupsFilled = 0;
  projectTray.querySelectorAll(".tray-cup").forEach((cup) => cup.classList.remove("is-filled"));
  batterDispenser.disabled = false;
  batterDispenser.classList.remove("is-dispensing", "has-dispensed");
  trayFeedback.textContent = "4 project cups to fill.";
  updateBatterFlavorUi();
}

function updateBatterFlavorUi() {
  const [fill, edge] = BATTER_COLORS[batterFlavor] ?? BATTER_COLORS.strawberry;
  trayInteraction.style.setProperty("--batter-color", fill);
  trayInteraction.style.setProperty("--batter-edge", edge);
  updateChoiceButtons(batterFlavorButtons, "batterFlavor", batterFlavor);
}

function selectBatterFlavor(flavor) {
  if (!BATTER_COLORS[flavor]) return;
  const flavorChanged = cupcakeDesign.batterFlavor !== flavor;
  batterFlavor = flavor;
  frostingFlavor = flavor;
  cupcakeDesign.batterFlavor = flavor;
  cupcakeDesign.frostingFlavor = flavor;
  saveCupcakeDesign();
  updateBatterFlavorUi();
  updateCupcakePreviews();
  updateFrostingFlavorButtons();
  if (flavorChanged) playSoundEffect("whoosh", QUIET_WHOOSH_VOLUME);
}

function dispenseBatter() {
  if (trayCupsFilled >= 4) return;
  playSoundEffect("dispense");
  batterDispenser.classList.add("has-dispensed");
  trayCupsFilled += 1;
  projectTray.querySelector(`[data-tray-cup="${trayCupsFilled}"]`)?.classList.add("is-filled");
  batterDispenser.classList.remove("is-dispensing");
  void batterDispenser.offsetWidth;
  batterDispenser.classList.add("is-dispensing");
  const cupsRemaining = 4 - trayCupsFilled;
  trayFeedback.textContent = cupsRemaining ? `${cupsRemaining} project cup${cupsRemaining === 1 ? "" : "s"} to fill.` : "All four project cupcakes are ready to bake!";
  continueButton.disabled = cupsRemaining > 0;
  if (!cupsRemaining) batterDispenser.disabled = true;
}

function openBakingInteraction() {
  if (bakingTimer) window.clearTimeout(bakingTimer);
  window.clearTimeout(ovenBellTimer);
  ovenBellTimer = null;
  stopBakingNoise();
  bakingTimer = null;
  bakingStage = "ready";
  const [batterColor, batterEdge, bakedColor] = BATTER_COLORS[batterFlavor] ?? BATTER_COLORS.strawberry;
  bakingInteraction.style.setProperty("--batter-color", batterColor);
  bakingInteraction.style.setProperty("--batter-edge", batterEdge);
  bakingInteraction.style.setProperty("--baked-color", bakedColor);
  bakingInteraction.classList.remove("is-baking", "is-baked", "is-complete");
  bakingFeedback.textContent = "The filled tray is ready for the oven.";
  ovenActionButton.disabled = false;
  ovenActionButton.textContent = "Put Tray in Oven";
}

function useOven() {
  if (bakingStage === "ready") {
    playSoundEffect("plop");
    prepareOvenBell();
    bakingStage = "baking";
    bakingInteraction.classList.add("is-baking");
    bakingFeedback.textContent = "The project cupcakes are baking...";
    ovenActionButton.disabled = true;
    ovenActionButton.textContent = "Baking...";
    playBakingNoise();
    const bakingDuration = REDUCED_MOTION.matches ? 350 : 1500;
    bakingTimer = window.setTimeout(() => {
      bakingTimer = null;
      finishBakingSound();
      bakingStage = "baked";
      bakingInteraction.classList.remove("is-baking");
      bakingInteraction.classList.add("is-baked");
      bakingFeedback.textContent = "They are baked! Take the tray out.";
      ovenActionButton.disabled = false;
      ovenActionButton.textContent = "Take Cupcakes Out";
    }, bakingDuration);
    return;
  }

  if (bakingStage === "baked") {
    playSoundEffect("whoosh", QUIET_WHOOSH_VOLUME);
    bakingStage = "complete";
    bakingInteraction.classList.remove("is-baked");
    bakingInteraction.classList.add("is-complete");
    bakingFeedback.textContent = "Four baked project cupcakes are ready!";
    ovenActionButton.disabled = true;
    ovenActionButton.textContent = "Cupcakes Removed";
    continueButton.disabled = false;
  }
}

function renderIngredients(step, { revealAll = false } = {}) {
  ingredientGrid.innerHTML = step.ingredientItems.map((ingredient) => {
    const isCollected = revealAll || collectedIngredients.has(ingredient.id);
    return `
    <button class="ingredient-card ${isCollected ? "is-collected" : ""}" type="button" data-ingredient-id="${ingredient.id}" aria-pressed="${isCollected}" ${revealAll ? "disabled" : ""}>
      <span class="ingredient-icon ingredient-${ingredient.id}" aria-hidden="true"></span>
      <strong>${ingredient.label}</strong>
      <small class="ingredient-fact">${ingredient.fact}</small>
    </button>`;
  }).join("");
  ingredientFeedback.textContent = revealAll || collectedIngredients.size === step.ingredientItems.length
    ? "All ingredients gathered. Continue when ready."
    : `${step.ingredientItems.length - collectedIngredients.size} ingredients remain.`;
}

function collectIngredient(button) {
  const step = CUPCAKE_STEPS[activeDialogStepIndex ?? currentStepIndex];
  const ingredient = step?.ingredientItems?.find((item) => item.id === button.dataset.ingredientId);
  if (!ingredient) return;
  playSoundEffect("whoosh");
  collectedIngredients.add(ingredient.id);
  button.classList.add("is-collected");
  button.setAttribute("aria-pressed", "true");
  button.disabled = true;
  renderIngredients(step);
  continueButton.disabled = collectedIngredients.size < step.ingredientItems.length;
}

function openFrostingPanel({ review = false, stepIndex = currentStepIndex } = {}) {
  reviewMode = review;
  activeDialogStepIndex = stepIndex;
  frostingTaps = 0;
  frostingFeedback.textContent = "Ready for the first swirl?";
  frostingMeterFill.style.width = "0%";
  cupcakePlaceholder.querySelectorAll(".frosting-swirl").forEach((swirl) => swirl.classList.remove("is-visible"));
  applyCupcakeDesign(cupcakePlaceholder);
  updateFrostingFlavorButtons();
  updateSprinkleToggle();
  sprinkleToggle.hidden = true;
  previousFrostingButton.hidden = stepIndex === 0;
  frostButton.disabled = false;
  frostButton.textContent = "Tap to Frost";
  openDialog(frostingDialog, frostButton);
}

function updateFrostingFlavorButtons() {
  updateChoiceButtons(frostingFlavorButtons, "frostingFlavor", frostingFlavor);
}

function updateSprinkleToggle() {
  sprinkleToggle.classList.toggle("is-selected", sprinklesEnabled);
  sprinkleToggle.setAttribute("aria-pressed", String(sprinklesEnabled));
  sprinkleToggle.innerHTML = `<span aria-hidden="true">&#10022;</span> ${sprinklesEnabled ? "Sprinkles added" : "Add sprinkles"}`;
}

function updateCupcakePreviews() {
  [cupcakePlaceholder, decoratingCupcake, editorCupcakePreview].forEach(applyCupcakeDesign);
  updateCupcakeEditorSummary();
}

function applyCupcakeDesign(target) {
  if (!target) return;
  const [fill, border, shadow] = FROSTING_COLORS[cupcakeDesign.frostingFlavor] ?? FROSTING_COLORS.strawberry;
  const [, batterEdge, bakedColor] = BATTER_COLORS[cupcakeDesign.batterFlavor] ?? BATTER_COLORS.strawberry;
  target.style.setProperty("--frosting-color", fill);
  target.style.setProperty("--frosting-border", border);
  target.style.setProperty("--frosting-shadow", shadow);
  target.style.setProperty("--cake-color", bakedColor);
  target.style.setProperty("--cake-border", batterEdge);
  target.classList.toggle("has-sprinkles", cupcakeDesign.sprinkles);
  target.dataset.decoration = cupcakeDesign.decoration;
}

function choiceLabel(value) {
  if (value === "none") return "No topper";
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function updateCupcakeEditorSummary() {
  const summary = [
    `${choiceLabel(cupcakeDesign.batterFlavor)} batter`,
    `${choiceLabel(cupcakeDesign.frostingFlavor)} frosting`,
    choiceLabel(cupcakeDesign.decoration),
    `${choiceLabel(cupcakeDesign.bowColor)} ribbon`,
  ].join(" · ");
  cupcakeEditorSummary.textContent = summary;
  cupcakeSummaryCompact.textContent = summary;
}

function openCupcakeEditor() {
  updateCupcakePreviews();
  updateBatterFlavorUi();
  updateFrostingFlavorButtons();
  updateBowPicker();
  updateChoiceButtons(document.querySelectorAll("[data-decoration]"), "decoration", cupcakeDesign.decoration);
  openDialog(cupcakeEditorDialog, cupcakeEditorDone);
}

function selectFrostingFlavor(flavor) {
  if (!FROSTING_COLORS[flavor]) return;
  const flavorChanged = cupcakeDesign.frostingFlavor !== flavor;
  frostingFlavor = flavor;
  cupcakeDesign.frostingFlavor = flavor;
  saveCupcakeDesign();
  updateCupcakePreviews();
  updateFrostingFlavorButtons();
  if (flavorChanged) playSoundEffect("whoosh", QUIET_WHOOSH_VOLUME);
}

function showSprinkleShower() {
  cupcakePlaceholder.querySelectorAll(".sprinkle-shower-piece").forEach((piece) => piece.remove());
  if (REDUCED_MOTION.matches) return;
  const shower = document.createDocumentFragment();
  for (let index = 0; index < 24; index += 1) {
    const sprinkle = document.createElement("span");
    const duration = 480 + Math.random() * 280;
    sprinkle.className = "sprinkle-shower-piece";
    sprinkle.style.setProperty("--sprinkle-x", `${28 + Math.random() * 94}px`);
    sprinkle.style.setProperty("--sprinkle-color", SPRINKLE_COLORS[index % SPRINKLE_COLORS.length]);
    sprinkle.style.setProperty("--sprinkle-delay", `${Math.random() * 220}ms`);
    sprinkle.style.setProperty("--sprinkle-duration", `${duration}ms`);
    sprinkle.style.setProperty("--sprinkle-drift", `${Math.random() * 28 - 14}px`);
    sprinkle.style.setProperty("--sprinkle-fall", `${58 + Math.random() * 28}px`);
    sprinkle.style.setProperty("--sprinkle-turn", `${180 + Math.random() * 260}deg`);
    sprinkle.addEventListener("animationend", () => sprinkle.remove(), { once: true });
    shower.append(sprinkle);
  }
  cupcakePlaceholder.append(shower);
}

function toggleSprinkles() {
  sprinklesEnabled = !sprinklesEnabled;
  if (sprinklesEnabled) {
    playSprinkleSound();
    showSprinkleShower();
  } else {
    cupcakePlaceholder.querySelectorAll(".sprinkle-shower-piece").forEach((piece) => piece.remove());
  }
  cupcakeDesign.sprinkles = sprinklesEnabled;
  saveCupcakeDesign();
  updateCupcakePreviews();
  updateSprinkleToggle();
  if (frostingTaps >= 3) frostingFeedback.textContent = sprinklesEnabled ? "Sprinkles added! Finish when ready." : "Perfectly frosted! Finish when ready.";
}

function renderDecorationInteraction() {
  updateCupcakePreviews();
  updateChoiceButtons(document.querySelectorAll("[data-decoration]"), "decoration", cupcakeDesign.decoration);
  decorationFeedback.textContent = cupcakeDesign.decoration === "none" ? "Pick a decoration to continue." : "Your cupcake is ready for its close-up!";
}

function selectDecoration(decoration, unlockStep = true) {
  if (!DECORATION_OPTIONS.has(decoration)) return;
  const decorationChanged = cupcakeDesign.decoration !== decoration;
  cupcakeDesign.decoration = decoration;
  saveCupcakeDesign();
  renderDecorationInteraction();
  if (decorationChanged) playSoundEffect("whoosh", QUIET_WHOOSH_VOLUME);
  if (unlockStep) continueButton.disabled = false;
}

function openPackagingInteraction() {
  packagingStage = "ready";
  const [frostingColor, frostingBorder] = FROSTING_COLORS[cupcakeDesign.frostingFlavor] ?? FROSTING_COLORS.strawberry;
  packagingInteraction.style.setProperty("--frosting-color", frostingColor);
  packagingInteraction.style.setProperty("--frosting-border", frostingBorder);
  packagingInteraction.classList.toggle("has-sprinkles", cupcakeDesign.sprinkles);
  packagingInteraction.dataset.decoration = cupcakeDesign.decoration;
  packagingInteraction.classList.remove("is-packed", "is-complete");
  window.clearTimeout(ribbonPreviewTimer);
  ribbonPreview.classList.remove("is-visible");
  ribbonPreview.hidden = true;
  packagingFeedback.textContent = "The cupcakes are ready to pack.";
  packageActionButton.disabled = false;
  packageActionButton.textContent = "Pack the Cupcakes";
  updateBowPicker();
}

function updateBowPicker() {
  const bowColor = BOW_COLORS[cupcakeDesign.bowColor] ?? BOW_COLORS.berry;
  packagingInteraction.style.setProperty("--bow-color", bowColor);
  ribbonPreview.style.setProperty("--bow-color", bowColor);
  updateChoiceButtons(bowColorButtons, "bowColor", cupcakeDesign.bowColor);
  updateCupcakeEditorSummary();
}

function showRibbonPreview() {
  window.clearTimeout(ribbonPreviewTimer);
  ribbonPreview.hidden = false;
  ribbonPreview.classList.remove("is-changing");
  void ribbonPreview.offsetWidth;
  ribbonPreview.classList.add("is-visible", "is-changing");
}

function hideRibbonPreview() {
  ribbonPreview.classList.remove("is-visible");
  ribbonPreviewTimer = window.setTimeout(() => {
    ribbonPreview.hidden = true;
  }, 220);
}

function selectBowColor(color, showPreview = true) {
  if (!BOW_COLORS[color]) return;
  const colorChanged = cupcakeDesign.bowColor !== color;
  cupcakeDesign.bowColor = color;
  saveCupcakeDesign();
  updateBowPicker();
  if (showPreview) showRibbonPreview();
  if (colorChanged) playSoundEffect("whoosh", QUIET_WHOOSH_VOLUME);
}

function packageCupcakes() {
  if (packagingStage === "ready") {
    playSoundEffect("packageBox");
    packagingStage = "packed";
    packagingInteraction.classList.add("is-packed");
    packagingFeedback.textContent = "The box is closed. Tie the bow to finish it.";
    packageActionButton.textContent = "Tie the Bow";
    return;
  }

  if (packagingStage === "packed") {
    packagingStage = "complete";
    packagingInteraction.classList.remove("is-packed");
    packagingInteraction.classList.add("is-complete");
    hideRibbonPreview();
    packagingFeedback.textContent = "The project box is packed and ready to deliver!";
    packageActionButton.disabled = true;
    packageActionButton.textContent = "Package Complete";
    continueButton.disabled = false;
  }
}

function openServingInteraction() {
  if (servingTimer) window.clearTimeout(servingTimer);
  servingTimer = null;
  stopConveyorSound();
  servingStage = "ready";
  finishQuestReminder.hidden = true;
  servingInteraction.style.setProperty("--bow-color", BOW_COLORS[cupcakeDesign.bowColor] ?? BOW_COLORS.berry);
  const playerName = characterChoice.name.trim();
  customerSpeech.textContent = playerName ? `Thank you, ${playerName}!` : "Thank you!";
  servingInteraction.classList.remove("is-delivering", "is-delivered");
  servingFeedback.textContent = "The customer is waiting for their order.";
  serveActionButton.disabled = false;
  serveActionButton.removeAttribute("aria-disabled");
  serveActionButton.textContent = "Send Order Down the Belt";
}

function shouldRemindFinishQuest() {
  return !reviewMode && activeDialogStepIndex === CUPCAKE_STEPS.length - 1 && servingStage === "complete";
}

function showFinishQuestReminder() {
  finishQuestReminder.hidden = false;
}

function serveOrder() {
  if (servingStage === "complete") {
    if (shouldRemindFinishQuest()) showFinishQuestReminder();
    return;
  }
  if (servingStage !== "ready") return;
  playConveyorSound();
  servingStage = "delivering";
  servingInteraction.classList.add("is-delivering");
  servingFeedback.textContent = "The finished project box is on its way...";
  serveActionButton.disabled = true;
  serveActionButton.textContent = "Delivering...";
  const servingDuration = REDUCED_MOTION.matches ? 350 : 2200;
  servingTimer = window.setTimeout(() => {
    servingTimer = null;
    stopConveyorSound();
    servingStage = "complete";
    servingInteraction.classList.remove("is-delivering");
    servingInteraction.classList.add("is-delivered");
    const playerName = characterChoice.name.trim();
    customerSpeech.textContent = playerName ? `Ooh, yummy! Thank you, ${playerName}!` : "Ooh, yummy! Thank you!";
    playSoundEffect("eating");
    servingFeedback.textContent = "Order delivered! The customer is ready to connect.";
    serveActionButton.disabled = false;
    serveActionButton.setAttribute("aria-disabled", "true");
    serveActionButton.textContent = "Order Delivered";
    continueButton.disabled = false;
  }, servingDuration);
}

function openCurrentStation() {
  const step = CUPCAKE_STEPS[currentStepIndex];
  if (!step || freeExplore || recipeDialog.open || frostingDialog.open) return;
  openCurrentStepPanel();
}

function openCurrentStepPanel() {
  const step = CUPCAKE_STEPS[currentStepIndex];
  if (!step || freeExplore) return;
  if (step.interactionType === "button") openFrostingPanel();
  else openRecipeCard(currentStepIndex);
}

function replayCompletedStep(stepIndex) {
  const step = CUPCAKE_STEPS[stepIndex];
  if (!step || stepIndex >= currentStepIndex) return;
  trackerPanel.classList.remove("is-open", "is-visible");
  trackerToggle.classList.add("is-visible");
  trackerToggle.setAttribute("aria-expanded", "false");
  if (step.id === "frosting") openFrostingPanel({ review: true, stepIndex });
  else openRecipeCard(stepIndex, { review: true });
}

function openPreviousStep(dialog) {
  const previousStepIndex = (activeDialogStepIndex ?? currentStepIndex) - 1;
  if (previousStepIndex < 0) return;
  closeDialog(dialog);
  replayCompletedStep(previousStepIndex);
}

function advanceQuest() {
  if (reviewMode) {
    reviewMode = false;
    closeDialog(recipeDialog);
    return;
  }
  if (pendingStepIndex !== currentStepIndex) return;
  const completedStepId = CUPCAKE_STEPS[currentStepIndex]?.id;
  closeDialog(recipeDialog);
  currentStepIndex += 1;
  playSoundEffect("levelUp");
  pendingStepIndex = null;
  saveProgress();
  renderProgress();
  highlightStation();
  if (currentStepIndex >= CUPCAKE_STEPS.length) {
    freeExplore = true;
    window.setTimeout(() => {
      openDialog(completionDialog, exploreButton);
      celebrateStep(true);
    }, 180);
  } else {
    celebrateStep();
    if (completedStepId === "tray") window.setTimeout(showAssemblyCloseGuide, 220);
  }
}

function showAssemblyCloseGuide() {
  trackerPanel.classList.add("is-visible", "is-open");
  trackerToggle.classList.remove("is-visible");
  trackerToggle.setAttribute("aria-expanded", "true");
  assemblyCloseGuide.hidden = false;
}

function hideAssemblyCloseGuide() {
  assemblyCloseGuide.hidden = true;
}

function skipCurrentStep() {
  if (reviewMode || currentStepIndex >= CUPCAKE_STEPS.length) return;
  reviewMode = false;
  pendingStepIndex = null;
  closeDialog(recipeDialog);
  closeDialog(frostingDialog);
  currentStepIndex += 1;
  playSoundEffect("levelUp");
  saveProgress();
  renderProgress();
  highlightStation();
  if (currentStepIndex >= CUPCAKE_STEPS.length) {
    freeExplore = true;
    window.setTimeout(() => {
      openDialog(completionDialog, exploreButton);
      celebrateStep(true);
    }, 180);
    return;
  }
  window.setTimeout(openCurrentStepPanel, 120);
}

function frostCupcake() {
  if (frostingTaps >= 3) {
    const completedReview = reviewMode;
    const completedStepIndex = activeDialogStepIndex;
    closeDialog(frostingDialog);
    openRecipeCard(completedReview ? completedStepIndex : currentStepIndex, { review: completedReview });
    return;
  }
  playSoundEffect("plop");
  frostingTaps += 1;
  const feedback = ["First swirl!", "Looking sweet!", "Perfectly frosted!"][frostingTaps - 1];
  frostingFeedback.textContent = feedback;
  frostingMeterFill.style.width = `${frostingTaps * 33.333}%`;
  cupcakePlaceholder.querySelector(`.swirl-${["one", "two", "three"][frostingTaps - 1]}`)?.classList.add("is-visible");
  if (frostingTaps === 3) {
    playSoundEffect("shine");
    frostingFeedback.textContent = "Perfectly frosted! Add sprinkles if you like.";
    sprinkleToggle.hidden = false;
    frostButton.textContent = "Finish Frosting";
  }
}

function resetQuest() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(CUPCAKE_KEY);
  window.location.reload();
}

function showHome() {
  if (bakingTimer) window.clearTimeout(bakingTimer);
  bakingTimer = null;
  if (servingTimer) window.clearTimeout(servingTimer);
  servingTimer = null;
  window.clearTimeout(ovenBellTimer);
  ovenBellTimer = null;
  stopBakingNoise();
  stopBatterMixSound();
  stopConveyorSound();
  stopSprinkleSound();
  [recipeDialog, frostingDialog, cupcakeEditorDialog, completionDialog, characterDialog].forEach((dialog) => {
    if (dialog.open) dialog.close();
  });
  gamePaused = true;
  gameShell.classList.remove("is-playing");
  welcomePanel.classList.remove("is-hidden");
  questPanel.classList.remove("is-visible");
  trackerPanel.classList.remove("is-visible", "is-open");
  hideAssemblyCloseGuide();
  trackerToggle.classList.remove("is-visible");
  gameHint.classList.remove("is-visible");
}

function requestReplay() {
  resetDialog.showModal();
}

function setupCharacterUi() {
  customizeButton.addEventListener("click", openCharacterCreator);
  characterName.addEventListener("input", () => {
    draftCharacter.name = characterName.value;
  });
  characterOptions.addEventListener("click", (event) => {
    const swatch = event.target.closest("button[data-character-type]");
    if (!swatch) return;
    const choiceChanged = draftCharacter[swatch.dataset.characterType] !== swatch.dataset.characterValue;
    draftCharacter[swatch.dataset.characterType] = swatch.dataset.characterValue;
    renderCharacterPreview();
    if (choiceChanged) playSoundEffect("whoosh", QUIET_WHOOSH_VOLUME);
  });
  defaultCharacter.addEventListener("click", () => {
    const choiceChanged = Object.keys(DEFAULT_CHARACTER).some((key) => draftCharacter[key] !== DEFAULT_CHARACTER[key]);
    characterChoice = { ...DEFAULT_CHARACTER };
    draftCharacter = { ...characterChoice };
    saveCharacterChoice();
    renderCharacterPreview();
    updatePlayerAppearance();
    if (choiceChanged) playSoundEffect("whoosh", QUIET_WHOOSH_VOLUME);
  });
  saveCharacter.addEventListener("click", () => {
    characterChoice = { ...draftCharacter };
    saveCharacterChoice();
    updatePlayerAppearance();
    playSoundEffect("shine");
    characterDialog.close();
  });
}

function setupUiEvents() {
  trackerToggle.addEventListener("click", () => {
    trackerPanel.classList.add("is-visible", "is-open");
    trackerToggle.classList.remove("is-visible");
    trackerToggle.setAttribute("aria-expanded", "true");
  });
  trackerClose.addEventListener("click", () => {
    hideAssemblyCloseGuide();
    trackerPanel.classList.remove("is-open", "is-visible");
    trackerToggle.classList.add("is-visible");
    trackerToggle.setAttribute("aria-expanded", "false");
  });
  trackerList.addEventListener("click", (event) => {
    const reviewButton = event.target.closest("button[data-review-step]");
    if (reviewButton) replayCompletedStep(Number(reviewButton.dataset.reviewStep));
  });
  trackerPanel.addEventListener("click", (event) => {
    if (event.target.closest("button, a")) return;
    if (CUPCAKE_STEPS[currentStepIndex]?.id === "baking") {
      showToast("Close Recipe Progress, then click the Baking station.");
    }
  });
  editCupcakeButton.addEventListener("click", openCupcakeEditor);
  cupcakeEditorDone.addEventListener("click", () => closeDialog(cupcakeEditorDialog));
  editorDecorationOptions.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-decoration]");
    if (button) selectDecoration(button.dataset.decoration, false);
  });
  continueButton.addEventListener("click", advanceQuest);
  previousStepButton.addEventListener("click", () => openPreviousStep(recipeDialog));
  previousFrostingButton.addEventListener("click", () => openPreviousStep(frostingDialog));
  skipButton.addEventListener("click", skipCurrentStep);
  recipeDialog.addEventListener("click", (event) => {
    if (event.target !== recipeDialog) return;
    if (shouldRemindFinishQuest()) showFinishQuestReminder();
    else closeDialog(recipeDialog);
  });
  finishQuestReminderClose.addEventListener("click", () => {
    finishQuestReminder.hidden = true;
  });
  ingredientGrid.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-ingredient-id]");
    if (button) collectIngredient(button);
  });
  decorationOptions.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-decoration]");
    if (button) selectDecoration(button.dataset.decoration);
  });
  bowColorButtons.forEach((button) => button.addEventListener("click", () => selectBowColor(button.dataset.bowColor, !cupcakeEditorDialog.contains(button))));
  packageActionButton.addEventListener("click", packageCupcakes);
  serveActionButton.addEventListener("click", serveOrder);
  batterFlavorButtons.forEach((button) => button.addEventListener("click", () => selectBatterFlavor(button.dataset.batterFlavor)));
  batterDispenser.addEventListener("click", dispenseBatter);
  ovenActionButton.addEventListener("click", useOven);
  frostingFlavorButtons.forEach((button) => button.addEventListener("click", () => selectFrostingFlavor(button.dataset.frostingFlavor)));
  sprinkleToggle.addEventListener("click", toggleSprinkles);
  frostButton.addEventListener("click", frostCupcake);
  skipFrostingButton.addEventListener("click", skipCurrentStep);
  whiskButton.addEventListener("click", whiskBatter);
  batterIngredients.addEventListener("click", (event) => {
    const ingredient = event.target.closest("[data-batter-ingredient]");
    if (ingredient) addBatterIngredient(ingredient.dataset.batterIngredient);
  });
  batterIngredients.addEventListener("pointerdown", (event) => {
    const icon = event.target.closest(".ingredient-icon[data-batter-ingredient]");
    if (!icon || batterIngredientsAdded.has(icon.dataset.batterIngredient)) return;
    event.preventDefault();
    draggingBatterIngredient = icon.dataset.batterIngredient;
    icon.closest(".batter-ingredient")?.classList.add("is-dragging");
  });
  document.addEventListener("pointermove", (event) => {
    if (!draggingBatterIngredient) return;
    const bowlRect = mixingBowl.getBoundingClientRect();
    mixingBowl.classList.toggle("is-hovered", event.clientX >= bowlRect.left && event.clientX <= bowlRect.right && event.clientY >= bowlRect.top && event.clientY <= bowlRect.bottom);
  });
  document.addEventListener("pointerup", (event) => {
    if (!draggingBatterIngredient) return;
    const id = draggingBatterIngredient;
    const bowlRect = mixingBowl.getBoundingClientRect();
    const droppedInBowl = event.clientX >= bowlRect.left && event.clientX <= bowlRect.right && event.clientY >= bowlRect.top && event.clientY <= bowlRect.bottom;
    if (droppedInBowl) addBatterIngredient(id);
    batterIngredients.querySelector(`[data-batter-ingredient="${id}"]`)?.classList.remove("is-dragging");
    mixingBowl.classList.remove("is-hovered");
    draggingBatterIngredient = null;
  });
  batterIngredients.addEventListener("dragstart", (event) => {
    const ingredient = event.target.closest("[data-batter-ingredient]");
    if (ingredient) {
      event.dataTransfer.effectAllowed = "copy";
      event.dataTransfer.setData("text/plain", ingredient.dataset.batterIngredient);
    }
  });
  mixingBowl.addEventListener("dragover", (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  });
  mixingBowl.addEventListener("drop", (event) => {
    event.preventDefault();
    addBatterIngredient(event.dataTransfer.getData("text/plain"));
  });
  mixingBowl.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const nextIngredient = ["egg", "butter", "flour", "sugar"].find((id) => !batterIngredientsAdded.has(id));
      if (nextIngredient) addBatterIngredient(nextIngredient);
    }
  });
  frostButton.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      frostCupcake();
    }
  });
  exploreButton.addEventListener("click", () => closeDialog(completionDialog));
  resetButton.addEventListener("click", requestReplay);
  completionReplay.addEventListener("click", requestReplay);
  confirmReset.addEventListener("click", resetQuest);
  [recipeDialog, frostingDialog, completionDialog].forEach((dialog) => dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeDialog(dialog);
  }));
}

function showGameScreen() {
  gameShell.classList.add("is-playing");
  updateCupcakeEditorSummary();
  welcomePanel.classList.add("is-hidden");
  gameHint.classList.add("is-visible");
  questPanel.classList.add("is-visible");
  trackerPanel.classList.add("is-visible");
  trackerToggle.classList.toggle("is-visible", MOBILE_LAYOUT.matches);
}

function showEntryChoice() {
  if (entryChoiceShown) return;
  entryChoiceShown = true;
  window.setTimeout(() => openDialog(entryChoiceDialog, playGameChoice), 180);
}

function showQuickLinksGuide() {
  gamePaused = true;
  quickLinksGuide.hidden = false;
  quickLinksGuide.classList.add("is-visible");
  quickNav.classList.add("is-guided", "is-tour-active");
  window.requestAnimationFrame(() => quickLinksGotIt.focus());
}

function hideQuickLinksGuide({ resumeGame = true } = {}) {
  if (quickLinksGuide.hidden) return;
  quickLinksGuide.classList.remove("is-visible");
  quickNav.classList.remove("is-guided", "is-tour-active");
  quickLinksGuide.hidden = true;
  if (resumeGame && gameStarted) gamePaused = false;
}

function startGame() {
  playBackgroundMusic();
  playSoundEffect("whoosh", QUIET_WHOOSH_VOLUME);
  if (gameStarted) {
    showGameScreen();
    gamePaused = false;
    showEntryChoice();
    return;
  }
  gameStarted = true;
  showGameScreen();
  renderProgress();
  setupUiEvents();
  clearMarker();

  k.scene("bakery", () => {
    drawBakery();
    addPlayer();
    gamePaused = false;
    highlightStation();

    const setDestination = () => {
      if (gamePaused || !player) return;
      player.destination = k.toWorld(k.mousePos());
    };

    k.onMouseDown((button) => {
      if (button === "left") setDestination();
    });
    k.onTouchStart(setDestination);
    gameCanvas.addEventListener("pointerdown", setDestination, { passive: true });

    k.onUpdate(() => {
      updateStationIconHover();
      if (gamePaused || !player) return;
      const movementRequested = Boolean(player.destination);
      let arrivedAtDestination = false;
      if (player.destination) {
        const distance = player.pos.dist(player.destination);
        if (distance >= 4) {
          player.moveTo(player.destination, player.speed);
          player.pos.x = clamp(player.pos.x, 70, GAME_WIDTH - 70);
          player.pos.y = clamp(player.pos.y, 170, GAME_HEIGHT - 112);
          positionPlayerParts();
        } else {
          player.destination = null;
          arrivedAtDestination = true;
        }
      }

      if (!movementRequested || !arrivedAtDestination) return;
      const nearestStation = stationEntries.find(([, position]) => player.pos.dist(position) < 58)?.[0] ?? null;
      const activeStep = CUPCAKE_STEPS[currentStepIndex];
      if (!nearestStation) {
        if (activeStep?.id === "baking" && trackerPanel.classList.contains("is-visible")) {
          showToast("Close Recipe Progress, then click the Baking station.");
        }
        return;
      }
      if (freeExplore) return;
      if (activeStep?.stationId === nearestStation) openCurrentStation();
      else showToast(`Wrong station. Click on "${activeStep.station}" to progress.`);
    });
  });
  k.go("bakery");
  showEntryChoice();
}

startButton.addEventListener("click", startGame);
soundToggle.addEventListener("click", () => {
  if (soundControlsExpanded) toggleBackgroundMusic();
  else setSoundControlsExpanded(true);
});
volumeDown.addEventListener("click", () => adjustBackgroundVolume(-0.1));
volumeUp.addEventListener("click", () => adjustBackgroundVolume(0.1));
document.addEventListener("click", (event) => {
  if (soundControlsExpanded && !soundControls.contains(event.target)) setSoundControlsExpanded(false);
});
document.addEventListener("pointerdown", unlockBackgroundMusic, true);
document.addEventListener("keydown", unlockBackgroundMusic, true);
window.addEventListener("pageshow", playBackgroundMusic);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) playBackgroundMusic();
});
homeButton.addEventListener("click", () => {
  hideQuickLinksGuide({ resumeGame: false });
  showHome();
});
quitGameButton.addEventListener("click", () => {
  hideQuickLinksGuide({ resumeGame: false });
  showHome();
});
objectiveHelp.addEventListener("click", () => objectiveDialog.showModal());
openGuideButton.addEventListener("click", () => openGuideDialog.showModal());
openGuideCustomize.addEventListener("click", () => {
  openGuideDialog.close();
  openCharacterCreator();
});
openGuideEnter.addEventListener("click", () => {
  openGuideDialog.close();
  startGame();
});
playGameChoice.addEventListener("click", () => {
  playSoundEffect("gameStart");
  closeDialog(entryChoiceDialog);
});
quickLinksChoice.addEventListener("click", () => {
  playSoundEffect("quickLinks");
  closeDialog(entryChoiceDialog);
  showQuickLinksGuide();
});
quickLinksGuideClose.addEventListener("click", () => hideQuickLinksGuide());
quickLinksGotIt.addEventListener("click", () => hideQuickLinksGuide());
quickLinksGuide.addEventListener("click", (event) => {
  if (event.target === quickLinksGuide) hideQuickLinksGuide();
});
quickNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) hideQuickLinksGuide();
});

document.querySelectorAll(".dialog-close").forEach((closeButton) => closeButton.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  const dialog = closeButton.closest("dialog");
  if (!dialog?.open) return;
  if (dialog === recipeDialog && shouldRemindFinishQuest()) {
    showFinishQuestReminder();
    return;
  }
  if (dialog === recipeDialog || dialog === frostingDialog || dialog === cupcakeEditorDialog) closeDialog(dialog);
  else dialog.close();
}));
objectiveDialog.addEventListener("click", (event) => {
  if (event.target === objectiveDialog) objectiveDialog.close();
});
openGuideDialog.addEventListener("click", (event) => {
  if (event.target === openGuideDialog) openGuideDialog.close();
});
entryChoiceDialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeDialog(entryChoiceDialog);
});
cupcakeEditorDialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeDialog(cupcakeEditorDialog);
});

function emitCursorSprinkle(x, y) {
  if (REDUCED_MOTION.matches || performance.now() - lastSprinkleTime < 32) return;
  if (cursorSprinkleCount >= 70) return;
  lastSprinkleTime = performance.now();

  const sprinkle = document.createElement("span");
  const openDialogs = document.querySelectorAll("dialog[open]");
  const layer = openDialogs[openDialogs.length - 1] ?? cursorSprinkleLayer;
  const life = 1400 + Math.random() * 700;
  sprinkle.className = "cursor-sprinkle";
  sprinkle.style.left = `${x + 7 + Math.random() * 5}px`;
  sprinkle.style.top = `${y + 12 + Math.random() * 5}px`;
  sprinkle.style.setProperty("--sprinkle-color", SPRINKLE_COLORS[Math.floor(Math.random() * SPRINKLE_COLORS.length)]);
  sprinkle.style.setProperty("--sprinkle-rotation", `${Math.round(Math.random() * 180)}deg`);
  sprinkle.style.setProperty("--sprinkle-drift", `${Math.round(Math.random() * 64 - 32)}px`);
  sprinkle.style.setProperty("--sprinkle-fall", `${Math.round(105 + Math.random() * 90)}px`);
  sprinkle.style.setProperty("--sprinkle-life", `${Math.round(life)}ms`);
  layer.append(sprinkle);
  cursorSprinkleCount += 1;
  const removeSprinkle = () => {
    if (!sprinkle.isConnected) return;
    sprinkle.remove();
    cursorSprinkleCount -= 1;
  };
  sprinkle.addEventListener("animationend", removeSprinkle, { once: true });
  window.setTimeout(removeSprinkle, life + 150);
}

if (FINE_POINTER.matches) {
  document.body.classList.add("has-custom-cursor");
  window.addEventListener("pointermove", (event) => {
    customPixelCursor.style.left = `${event.clientX}px`;
    customPixelCursor.style.top = `${event.clientY}px`;
    customPixelCursor.classList.add("is-visible");
    emitCursorSprinkle(event.clientX, event.clientY);
  });
  document.documentElement.addEventListener("mouseleave", () => customPixelCursor.classList.remove("is-visible"));
}
setupCharacterUi();
Object.values(soundEffects).forEach(({ audio }) => {
  audio.preload = "auto";
});
batterMixSound.preload = "auto";
bakingNoise.preload = "auto";
bakingNoise.loop = true;
conveyorSound.preload = "auto";
conveyorSound.loop = true;
backgroundMusic.src = backgroundMusicUrl;
backgroundMusic.volume = musicVolume;
backgroundMusic.loop = true;
backgroundMusic.load();
updateSoundToggle();
playBackgroundMusic();
renderProgress();
drawBakery();
highlightStation();
