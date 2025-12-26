// ============================================================
// Geri Dönüşüm Kahramanları - p5.js (UPDATED)
// ✅ çöpler.png Y ekseninde yukarı doğru uzatıldı
// ✅ Hitbox + hole noktaları yeni ölçeğe göre güncellendi (drag-drop bozulmasın)
// ✅ Çöpler daha yavaş düşüyor + biraz daha seyrek spawn
// ✅ DOĞRU EŞLEŞTİRİNCE stars.mp3 çalıyor
// ============================================================

const VW = 1536, VH = 864;

let scene = "MENU"; // MENU, ABOUT, SETTINGS, PLAY, END

let kasiaFont;

// UI images
let imgMenu, imgPlayBg, imgAbout, imgSettings;

// bins sheet + stars
let binsSheetImg; // çöpler.png
let starsImg;     // yıldızlar.png

// End variants
let winScreens = [];   // bilgiekranı1..4
let loseScreens = [];  // bitiş1..4
let endImg = null;
let endType = "win";

// Cursor + icon
let cursorImg, sesIcon;

// Audio
let bgm, sfxButton, sfxStars; // ✅ eklendi
let musicOn = true;
let volumeValue = 0.7;

// Lives
const MAX_LIVES = 3;
let lives = MAX_LIVES;

// Bins hitboxes
let bins = [];

// Trash images
let cam1, cam2, cam3, cam4;
let plastik1, plastik2, plastik3, plastik4, plastik5;
let kağıt1, kağıt2, kağıt3, kağıt4, kağıt5;
let organik1, organik2, organik3, organik4, organik5;

const BIN_KEYS = ["cam", "plastik", "kağıt", "organik"];
let trashImgs = { cam: [], plastik: [], "kağıt": [], organik: [] };

// Menu buttons hitboxes
let btnStart, btnAbout, btnSettings;

// Back buttons
let btnAboutBack, btnSettingsBack;

// Settings UI
let sliderVol;
let sliderDragging = false;
let btnMusicToggle;

// End screen button
let btnEndButton;

// Game state
let trashes = [];
let spawnTimer = 0;

// ✅ Daha yavaş spawn
let spawnInterval = 120;

let correctCount = 0;
let draggingTrash = null;
let dragOffsetX = 0, dragOffsetY = 0;

// Stars FX
let starsFX = []; // {x,y,life,maxLife}

// ============================================================
// Responsive scaling helpers
function getScaleAndOffset() {
  const s = Math.min(width / VW, height / VH);
  const ox = (width - VW * s) / 2;
  const oy = (height - VH * s) / 2;
  return { s, ox, oy };
}
function beginVirtualDraw() {
  const { s, ox, oy } = getScaleAndOffset();
  push();
  translate(ox, oy);
  scale(s);
}
function endVirtualDraw() { pop(); }
function screenToVirtual(px, py) {
  const { s, ox, oy } = getScaleAndOffset();
  return { x: (px - ox) / s, y: (py - oy) / s };
}

// ============================================================
// Safe loaders
function loadImageSafe(path, label) {
  return loadImage(
    path,
    () => console.log("✅ image ok:", label, path),
    (e) => console.error("❌ image FAIL:", label, path, e)
  );
}
function loadFontSafe(path, label) {
  return loadFont(
    path,
    () => console.log("✅ font ok:", label, path),
    (e) => console.error("❌ font FAIL:", label, path, e)
  );
}
function loadSoundSafe(path, label) {
  return loadSound(
    path,
    () => console.log("✅ sound ok:", label, path),
    (e) => console.error("❌ sound FAIL:", label, path, e)
  );
}

// ============================================================
function preload() {
  kasiaFont = loadFontSafe("Kasia-Bold.ttf", "Kasia");

  imgMenu     = loadImageSafe("Çalışma yüzeyi 1.jpg", "menu");
  imgPlayBg   = loadImageSafe("Çalışma yüzeyi 2.jpg", "playbg");
  imgAbout    = loadImageSafe("hakkında.jpg", "about");
  imgSettings = loadImageSafe("ayarlar.jpg", "settings");

  binsSheetImg = loadImageSafe("çöpler.png", "binsSheet");
  starsImg     = loadImageSafe("yıldızlar.png", "stars");

  winScreens[0] = loadImageSafe("bilgiekranı1.jpg", "win1");
  winScreens[1] = loadImageSafe("bilgiekranı2.jpg", "win2");
  winScreens[2] = loadImageSafe("bilgiekranı3.jpg", "win3");
  winScreens[3] = loadImageSafe("bilgiekranı4.jpg", "win4");

  loseScreens[0] = loadImageSafe("bitiş1.jpg", "lose1");
  loseScreens[1] = loadImageSafe("bitiş2.jpg", "lose2");
  loseScreens[2] = loadImageSafe("bitiş3.jpg", "lose3");
  loseScreens[3] = loadImageSafe("bitiş4.jpg", "lose4");

  cursorImg = loadImageSafe("cursor.png", "cursor");
  sesIcon   = loadImageSafe("ses.png", "sesicon");

  bgm       = loadSoundSafe("game.mp3", "bgm");
  sfxButton = loadSoundSafe("gamebutton.mp3", "btn");
  sfxStars  = loadSoundSafe("stars.mp3", "stars"); // ✅ eklendi

  // Trash images
  cam1 = loadImageSafe("cam1.png", "cam1");
  cam2 = loadImageSafe("cam2.png", "cam2");
  cam3 = loadImageSafe("cam3.png", "cam3");
  cam4 = loadImageSafe("cam4.png", "cam4");

  plastik1 = loadImageSafe("plastik1.png", "plastik1");
  plastik2 = loadImageSafe("plastik2.png", "plastik2");
  plastik3 = loadImageSafe("plastik3.png", "plastik3");
  plastik4 = loadImageSafe("plastik4.png", "plastik4");
  plastik5 = loadImageSafe("plastik5.png", "plastik5");

  kağıt1 = loadImageSafe("kağıt1.png", "kağıt1");
  kağıt2 = loadImageSafe("kağıt2.png", "kağıt2");
  kağıt3 = loadImageSafe("kağıt3.png", "kağıt3");
  kağıt4 = loadImageSafe("kağıt4.png", "kağıt4");
  kağıt5 = loadImageSafe("kağıt5.png", "kağıt5");

  organik1 = loadImageSafe("organik1.png", "organik1");
  organik2 = loadImageSafe("organik2.png", "organik2");
  organik3 = loadImageSafe("organik3.png", "organik3");
  organik4 = loadImageSafe("organik4.png", "organik4");
  organik5 = loadImageSafe("organik5.png", "organik5");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);

  textFont(kasiaFont);
  textStyle(BOLD);

  trashImgs.cam = [cam1, cam2, cam3, cam4];
  trashImgs.plastik = [plastik1, plastik2, plastik3, plastik4, plastik5];
  trashImgs["kağıt"] = [kağıt1, kağıt2, kağıt3, kağıt4, kağıt5];
  trashImgs.organik = [organik1, organik2, organik3, organik4, organik5];

  // MENU hitboxes
  btnStart    = makeRect(VW/2 - 260, 365, 520, 140);
  btnAbout    = makeRect(VW/2 - 520, 675, 500, 120);
  btnSettings = makeRect(VW/2 + 20,  675, 500, 120);

  // ABOUT/SETTINGS back
  btnAboutBack    = makeRect(VW/2 - 320, 620, 640, 140);
  btnSettingsBack = makeRect(VW/2 - 320, 620, 640, 140);

  // END button
  btnEndButton = makeRect(VW/2 - 340, 590, 680, 150);

  // SETTINGS slider
  sliderVol = { x: 520, y: 360, w: 520, h: 18, knobR: 22 };
  btnMusicToggle = makeRect(520, 450, 520, 90);

  applyAudioSettings();
  resetGame();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Cursor
function applyGameCursor() {
  if (cursorImg) cursor(cursorImg, 0, 0);
}
function mouseMoved() { applyGameCursor(); }

// ============================================================
function draw() {
  applyGameCursor();

  background(0);
  beginVirtualDraw();

  if (scene === "MENU") drawMenu();
  else if (scene === "ABOUT") drawAbout();
  else if (scene === "SETTINGS") drawSettings();
  else if (scene === "PLAY") drawPlay();
  else if (scene === "END") drawEnd();

  endVirtualDraw();
}

// ============================================================
// Scenes
function drawMenu() {
  imageMode(CORNER);
  if (imgMenu) image(imgMenu, 0, 0, VW, VH);
}

function drawAbout() {
  imageMode(CORNER);
  if (imgAbout) image(imgAbout, 0, 0, VW, VH);
}

function drawSettings() {
  imageMode(CORNER);
  if (imgSettings) image(imgSettings, 0, 0, VW, VH);

  if (sesIcon) {
    imageMode(CENTER);
    image(sesIcon, sliderVol.x - 55, sliderVol.y - 6, 70, 70);
    imageMode(CORNER);
  }

  drawSlider(sliderVol, volumeValue);

  const label = musicOn ? "MÜZİK: AÇIK" : "MÜZİK: KAPALI";
  drawGreenButton(btnMusicToggle, label);
}

function drawPlay() {
  imageMode(CORNER);
  if (imgPlayBg) image(imgPlayBg, 0, 0, VW, VH);

  // ✅ ÇÖPLER.PNG: Y ekseninde yukarı doğru uzatıldı
  const binsX = 60;
  const binsY = 300;   // yukarı çekildi
  const binsW = 1415;
  const binsH = 550;   // yükseklik arttı (uzadı)
  if (binsSheetImg) image(binsSheetImg, binsX, binsY, binsW, binsH);

  // UI top bar
  fill(0, 40);
  rect(0, 0, VW, 90);

  fill(255);
  textAlign(LEFT, CENTER);
  textSize(28);
  text(`Doğru: ${correctCount}/8`, 30, 45);

  drawLivesTopRight();

  // spawn
  spawnTimer++;
  if (spawnTimer >= spawnInterval) {
    spawnTimer = 0;
    spawnTrash();
  }

  // update trashes
  for (let i = trashes.length - 1; i >= 0; i--) {
    const t = trashes[i];
    if (!t || typeof t.update !== "function") { trashes.splice(i, 1); continue; }

    t.update();
    t.draw();

    // ✅ ALT SINIR: çöp görseli canvas altına değince kaybolur
    const bottomLimit = VH - (t.size / 2);
    if (t.state === "fall" && t.y > bottomLimit) {
      trashes.splice(i, 1);
      loseLife(1);
      if (lives <= 0) { goLoseScreen(); return; }
    }

    if (t.state === "inbin" && t.done) trashes.splice(i, 1);
  }

  updateAndDrawStars();

  if (correctCount >= 8) { goWinScreen(); return; }
}

function drawEnd() {
  imageMode(CORNER);
  if (endImg) image(endImg, 0, 0, VW, VH);
}

// ============================================================
// Input
function mousePressed() {
  const m = screenToVirtual(mouseX, mouseY);
  const click = () => playButtonSfx();

  if (scene === "MENU") {
    if (hitRect(btnStart, m.x, m.y)) { click(); startGame(); }
    else if (hitRect(btnAbout, m.x, m.y)) { click(); scene = "ABOUT"; }
    else if (hitRect(btnSettings, m.x, m.y)) { click(); scene = "SETTINGS"; }
  }

  else if (scene === "ABOUT") {
    if (hitRect(btnAboutBack, m.x, m.y)) { click(); scene = "MENU"; }
  }

  else if (scene === "SETTINGS") {
    if (hitRect(btnSettingsBack, m.x, m.y)) { click(); scene = "MENU"; }
    else if (hitSlider(sliderVol, m.x, m.y)) { click(); sliderDragging = true; setVolumeFromX(m.x); }
    else if (hitRect(btnMusicToggle, m.x, m.y)) { click(); musicOn = !musicOn; applyAudioSettings(); ensureBgmState(); }
  }

  else if (scene === "PLAY") {
    for (let i = trashes.length - 1; i >= 0; i--) {
      const t = trashes[i];
      if (!t || typeof t.hit !== "function") continue;
      if (t.hit(m.x, m.y)) {
        draggingTrash = t;
        dragOffsetX = m.x - draggingTrash.x;
        dragOffsetY = m.y - draggingTrash.y;
        draggingTrash.state = "drag";
        trashes.splice(i, 1);
        trashes.push(draggingTrash);
        break;
      }
    }
  }

  else if (scene === "END") {
    if (hitRect(btnEndButton, m.x, m.y)) {
      click();
      if (endType === "win") { stopBgm(); resetGame(); scene = "MENU"; }
      else { startGame(); }
    }
  }
}

function mouseDragged() {
  const m = screenToVirtual(mouseX, mouseY);

  if (scene === "SETTINGS" && sliderDragging) setVolumeFromX(m.x);

  if (scene === "PLAY" && draggingTrash) {
    draggingTrash.x = m.x - dragOffsetX;
    draggingTrash.y = m.y - dragOffsetY;
  }
}

function mouseReleased() {
  const m = screenToVirtual(mouseX, mouseY);

  if (scene === "SETTINGS") sliderDragging = false;

  if (scene === "PLAY" && draggingTrash) {
    const bin = getBinUnderPoint(draggingTrash.x, draggingTrash.y);

    if (bin) {
      if (bin.key === draggingTrash.type) {
        correctCount++;
        addStarsFX(draggingTrash.x, draggingTrash.y - 70);
        playStarsSfx(); // ✅ doğru eşleşince stars.mp3

        draggingTrash.state = "inbin";
        draggingTrash.targetX = bin.hole.x;
        draggingTrash.targetY = bin.hole.y;

        if (correctCount >= 8) {
          goWinScreen();
          draggingTrash = null;
          return;
        }
      } else {
        loseLife(1);
        removeTrash(draggingTrash);
        if (lives <= 0) { goLoseScreen(); draggingTrash = null; return; }
      }
    } else {
      draggingTrash.state = "fall";
    }

    draggingTrash = null;
  }
}

// ============================================================
// End screens
function pickRandom(arr) {
  const valid = arr.filter(Boolean);
  return valid.length ? random(valid) : null;
}
function goWinScreen() {
  if (scene === "END") return;
  endType = "win";
  endImg = pickRandom(winScreens);
  trashes = [];
  starsFX = [];
  scene = "END";
}
function goLoseScreen() {
  if (scene === "END") return;
  endType = "lose";
  endImg = pickRandom(loseScreens);
  trashes = [];
  starsFX = [];
  scene = "END";
}

// ============================================================
// Game
function startGame() {
  resetGame();
  scene = "PLAY";
  ensureAudioContext();
  ensureBgmState();
}

function resetGame() {
  trashes = [];
  starsFX = [];
  spawnTimer = 0;
  correctCount = 0;
  lives = MAX_LIVES;

  // ✅ Hitbox'lar (çöpler.png uzatılmış haline göre)
  bins = [
    { key:"cam",     x:  95, y: 440, w: 305, h: 410, hole:{ x: 250,  y: 585 } },
    { key:"plastik", x: 435, y: 440, w: 330, h: 410, hole:{ x: 600,  y: 585 } },
    { key:"kağıt",   x: 805, y: 440, w: 330, h: 410, hole:{ x: 970,  y: 585 } },
    { key:"organik", x:1165, y: 440, w: 305, h: 410, hole:{ x:1320,  y: 595 } }
  ];
}

function spawnTrash() {
  const type = random(BIN_KEYS);
  const list = trashImgs[type];
  if (!Array.isArray(list) || list.length === 0) return;

  const img = random(list);
  if (!img) return;

  const x = random(110, VW - 110);

  // ✅ Daha yavaş düşüş
  const vy = random(0.85, 1.45);

  // ✅ ÜST SINIR: arkaplanın içinden başlasın
  const startY = 95 / 2;

  trashes.push(new TrashItem(x, startY, type, img, vy));
}

function getBinUnderPoint(px, py) {
  for (const b of bins) {
    if (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) return b;
  }
  return null;
}

function removeTrash(t) {
  const idx = trashes.indexOf(t);
  if (idx >= 0) trashes.splice(idx, 1);
}

function loseLife(n = 1) {
  lives = max(0, lives - n);
}

// ============================================================
// Stars FX
function addStarsFX(x, y) {
  starsFX.push({ x, y, life: 0, maxLife: 28 });
}
function updateAndDrawStars() {
  if (!starsImg) return;

  for (let i = starsFX.length - 1; i >= 0; i--) {
    const fx = starsFX[i];
    fx.life++;

    const t = fx.life / fx.maxLife;
    const alpha = 255 * (1 - t);
    const s = 1.0 + 0.25 * sin(t * PI);
    const floatUp = 18 * t;

    push();
    tint(255, alpha);
    imageMode(CENTER);
    image(starsImg, fx.x, fx.y - floatUp, 180 * s, 90 * s);
    imageMode(CORNER);
    noTint();
    pop();

    if (fx.life >= fx.maxLife) starsFX.splice(i, 1);
  }
}

// ============================================================
// Audio
function ensureAudioContext() {
  try { userStartAudio(); } catch (e) {}
}
function applyAudioSettings() {
  try { masterVolume(volumeValue); } catch (e) {}
  if (sfxButton) sfxButton.setVolume(volumeValue);
  if (sfxStars)  sfxStars.setVolume(volumeValue); // ✅ eklendi
  if (bgm) bgm.setVolume(musicOn ? volumeValue : 0);
}
function ensureBgmState() {
  if (!bgm) return;
  applyAudioSettings();
  if (musicOn) {
    if (!bgm.isPlaying()) bgm.loop();
  } else {
    if (bgm.isPlaying()) bgm.stop();
  }
}
function stopBgm() {
  if (bgm && bgm.isPlaying()) bgm.stop();
}
function playButtonSfx() {
  ensureAudioContext();
  if (!sfxButton) return;
  if (sfxButton.isPlaying()) sfxButton.stop();
  sfxButton.play();
}

// ✅ stars.mp3 çalan helper
function playStarsSfx() {
  ensureAudioContext();
  if (!sfxStars) return;
  if (sfxStars.isPlaying()) sfxStars.stop();
  sfxStars.play();
}

// ============================================================
// Slider
function hitSlider(s, px, py) {
  return (px >= s.x - 20 && px <= s.x + s.w + 20 &&
          py >= s.y - 35 && py <= s.y + 35);
}
function setVolumeFromX(px) {
  volumeValue = constrain((px - sliderVol.x) / sliderVol.w, 0, 1);
  applyAudioSettings();
}
function drawSlider(s, value01) {
  const trackY = s.y;

  noStroke();
  fill(0, 0, 0, 40);
  rect(s.x + 4, trackY + 4, s.w, s.h, 20);

  fill(45, 120, 75);
  rect(s.x, trackY, s.w, s.h, 20);

  fill(95, 175, 120);
  rect(s.x, trackY, s.w * value01, s.h, 20);

  const kx = s.x + s.w * value01;
  fill(20, 90, 55);
  circle(kx, trackY + s.h/2, s.knobR * 2);

  fill(255, 255, 255, 60);
  circle(kx - 5, trackY + s.h/2 - 5, s.knobR);
}

// ============================================================
// Trash class
class TrashItem {
  constructor(x, y, type, img, vy) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.img = img;
    this.vy = vy;

    this.size = 95;
    this.r = this.size / 2;

    this.state = "fall"; // fall, drag, inbin
    this.targetX = x;
    this.targetY = y;
    this.done = false;
  }

  update() {
    if (this.state === "fall") {
      this.y += this.vy;
    } else if (this.state === "inbin") {
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      this.x += dx * 0.22;
      this.y += dy * 0.22;
      if (abs(dx) < 2 && abs(dy) < 2) this.done = true;
    }
  }

  draw() {
    imageMode(CENTER);
    if (this.img) image(this.img, this.x, this.y, this.size, this.size);
    imageMode(CORNER);
  }

  hit(px, py) {
    return dist(px, py, this.x, this.y) < this.r;
  }
}

// ============================================================
// UI helpers
function makeRect(x, y, w, h) { return {x, y, w, h}; }
function hitRect(r, px, py) { return px >= r.x && px <= r.x+r.w && py >= r.y && py <= r.y+r.h; }

function drawGreenButton(r, label) {
  const shadow = color(0, 0, 0, 60);
  noStroke();
  fill(shadow);
  rect(r.x + 6, r.y + 6, r.w, r.h, 22);

  fill(45, 120, 75);
  rect(r.x, r.y, r.w, r.h, 22);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(30);
  text(label, r.x + r.w/2, r.y + r.h/2 + 2);
}

function drawLivesTopRight() {
  const startX = VW - 30;
  const y = 45;
  const gap = 38;

  fill(255);
  textAlign(RIGHT, CENTER);
  textSize(22);
  text("CAN", VW - 190, y);

  for (let i = 0; i < MAX_LIVES; i++) {
    const x = startX - i * gap;
    if (i < lives) fill(255, 80, 90);
    else fill(255, 255, 255, 60);
    drawHeart(x, y, 18);
  }
}

function drawHeart(x, y, s) {
  push();
  translate(x, y);
  noStroke();
  beginShape();
  vertex(0, s * 0.6);
  bezierVertex(s * 0.9, s * 0.1, s * 0.6, -s * 0.7, 0, -s * 0.15);
  bezierVertex(-s * 0.6, -s * 0.7, -s * 0.9, s * 0.1, 0, s * 0.6);
  endShape(CLOSE);
  pop();
}
