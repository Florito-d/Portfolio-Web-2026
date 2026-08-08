// ================================
// CONFIGURATION (par page)
// ================================
var isMobile = window.matchMedia("(max-width: 768px)").matches; /*pour la version sur mobile*/
var cfg = window.MODEL_CONFIG || {};

// UID du modèle Sketchfab
var urlid = cfg.urlid;

// Réglages du mouvement
var cameraScrollSpeed = cfg.cameraScrollSpeed ?? 1.35;  // augmente si tu veux que le zoom arrive plus vite
var rotateSpeed = cfg.rotateSpeed ?? 0.005;

// Paramètres du travelling cinématique
var distFarMul   = cfg.distFarMul   ?? 3.2;     // distance de départ (loin)
var distNearMul  = cfg.distNearMul  ?? 0.95;    // distance d'arrivée (près)
var liftMulStart = cfg.liftMulStart ?? 2.75;    // hauteur initial (plongée) en fraction de dist
var liftMulEnd   = cfg.liftMulEnd   ?? 0.0;     // hauteur finale (de face, quasi à plat)

var scrollStart = cfg.scrollStart ?? 6;
var scrollEnd   = cfg.scrollEnd   ?? 90;   

// ================================
// ÉTAT GLOBAL
// ================================

var win = document.querySelector(".window");
var iframe = document.querySelector("#api-frame");

var cameraPosition = null;
var cameraTarget = null;

var basePos = null;
var baseTarget = null;
var viewDir = null;
var baseDist = null;

var yawOffset = 0; // rotation cumulée (radians)
var lastProgress = null;

// ================================
// OUTILS
// ================================

// easing doux (cinématique)
function smoothstep(t) {
  t = Math.max(0, Math.min(1, t));
  return t * t * (3 - 2 * t);
}

// ================================
// INITIALISATION VIEWER
// ================================

var viewer = new Viewer(urlid, iframe, function () {

  // Caméra initiale fourni par Sketchfab
  cameraPosition = vec3.fromValues(
    viewer.camera.position[0],
    viewer.camera.position[1],
    viewer.camera.position[2]
  );

  cameraTarget = vec3.fromValues(
    viewer.camera.target[0],
    viewer.camera.target[1],
    viewer.camera.target[2]
  );

  basePos = vec3.clone(cameraPosition);
  baseTarget = vec3.clone(cameraTarget);

  // direction de vue (target -> caméra)
  viewDir = vec3.create();
  vec3.sub(viewDir, basePos, baseTarget);
  baseDist = vec3.length(viewDir);
  vec3.normalize(viewDir, viewDir);

});

// ================================
// SCROLL → ANIMATION CAMÉRA
// ================================

var scrollWindow = new ScrollWindow(win, function (progress) {
  
   // Empêche recalcul inutile (clé contre le recentrage)
  if (progress === lastProgress) return;
  lastProgress = progress;
  
  var viewerEl = document.querySelector(".viewer");
  var helpEl = document.querySelector(".window__help");

  // Visibilité viewer + help (synchro)
  var inRange = (progress >= scrollStart && progress <= scrollEnd);

  if (!inRange) {
  viewerEl.classList.remove("visible");
  if (helpEl) {
    helpEl.classList.remove("is-active");
    helpEl.classList.remove("is-visible"); // <-- important si fade-text est présent
  }
  return;
} else {
  viewerEl.classList.add("visible");
  if (helpEl) {
    helpEl.classList.add("is-active");
    helpEl.classList.add("is-visible"); // <-- important si fade-text est présent
  }
}

  if (!cameraPosition || !baseTarget || !viewDir || !baseDist) return;

  // normalisation 0..1 sur la zone active
  var tRaw = (progress - scrollStart) / (scrollEnd - scrollStart);
  tRaw = Math.max(0, Math.min(1, tRaw));
  var t = smoothstep(tRaw);

  // Dolly (avance/recul)
  var distFar = baseDist * distFarMul;
  var distNear = baseDist * distNearMul;
  var dist = distFar + (distNear - distFar) * t;

  // Arc vertical (plongée -> face)
  var liftStart = baseDist * liftMulStart;
  var liftEnd = baseDist * liftMulEnd;
  var lift = liftStart + (liftEnd - liftStart) * t;

  // Position caméra
  var tmp = vec3.create();
  vec3.scale(tmp, viewDir, dist);
  vec3.add(tmp, baseTarget, tmp);
  tmp[1] += lift;

  // Rotation utilisateur (yaw) autour de la target
  var rotated = vec3.create();
  vec3.rotateY(rotated, tmp, baseTarget, yawOffset);

  vec3.set(cameraPosition, rotated[0], rotated[1], rotated[2]);
  vec3.set(cameraTarget, baseTarget[0], baseTarget[1], baseTarget[2]);

  // Application finale
  viewer.api.setCameraLookAt(cameraPosition, cameraTarget, 0);

if (isMobile) return;


});

// ================================
// DRAG → ROTATION LIBRE
// ================================

var isDragging = false;
var initialX = 0;

win.addEventListener("mousedown", startDrag);
win.addEventListener("touchstart", startDrag, { passive: true });

window.addEventListener("mousemove", drag);
window.addEventListener("touchmove", drag, { passive: true });

window.addEventListener("mouseup", endDrag);
window.addEventListener("touchend", endDrag);

function startDrag(e) {
  var x = e.touches ? e.touches[0].screenX : e.screenX;
  isDragging = true;
  initialX = x;
}

function drag(e) {
  if (!isDragging) return;

  var x = e.touches ? e.touches[0].screenX : e.screenX;
  var dx = x - initialX;

  yawOffset += -dx * rotateSpeed;
  initialX = x;
}

function endDrag() {
  isDragging = false;
}

if (isMobile) {
  win.removeEventListener("mousedown", startDrag);
  win.removeEventListener("touchstart", startDrag);
}

// ================================
// DOUBLE-CLIC → RESET ROTATION
// ================================

document.addEventListener("dblclick", function () {
  yawOffset = 0;
});

// ================================
// ÉTAT INITIAL — window-help caché
// ================================

document.addEventListener("DOMContentLoaded", function () {
  var helpEl = document.querySelector(".window__help");
  if (!helpEl) return;

  helpEl.classList.remove("is-active");
  helpEl.classList.remove("is-visible");
});

