import { startAudio } from "../vr/js/audio.js";
import { ASSETS, STATIONS } from "../vr/js/config.js";

const stage = document.getElementById("vr-stage");
const status = document.getElementById("scene-status");
const fullscreenButton = document.getElementById("fullscreen-button");
const exitButton = document.getElementById("exit-button");
const enterButton = document.getElementById("entrar");
const intro = document.getElementById("intro");
const soundButton = document.getElementById("sonido");
const modal = document.getElementById("modal");

/* ── Pantalla completa ─────────────────────────────────────────────── */
function maximize() {
  stage.classList.add("is-maximized");
  document.documentElement.classList.add("is-locked");
  if (stage.requestFullscreen) stage.requestFullscreen().catch(() => {});
  stage.focus({ preventScroll: true });
}

function minimize() {
  stage.classList.remove("is-maximized");
  document.documentElement.classList.remove("is-locked");
  if (document.fullscreenElement) document.exitFullscreen();
}

fullscreenButton.addEventListener("click", maximize);
exitButton.addEventListener("click", minimize);
document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement && stage.classList.contains("is-maximized")) minimize();
});
document.addEventListener("keydown", (event) => {
  // Con una ficha abierta, Esc solo la cierra (lo hace el recorrido).
  if (event.key === "Escape" && stage.classList.contains("is-maximized") && modal.hidden) minimize();
});

/* ── Recorrido 3D ──────────────────────────────────────────────────── */
// virtual-reality.html#bohio (o #umbral, #galeria) abre el recorrido en esa estación.
const stationFromHash = () => {
  const index = STATIONS.findIndex((station) => station.id === location.hash.slice(1));
  return index < 0 ? null : index;
};

let audio = null;
let tour = null;
let loading = false;

async function enter() {
  if (loading || tour) return;
  loading = true;
  enterButton.disabled = true;
  enterButton.textContent = "Cargando el recorrido…";
  status.textContent = "Cargando el escenario 3D. La primera vez puede tardar unos segundos.";
  // El sonido se inicia dentro del clic: si se espera a que cargue la escena, el navegador puede bloquearlo.
  audio = startAudio(ASSETS.audio);

  try {
    const { iniciar } = await import("../vr/js/main.js");
    tour = await iniciar(stage, { estacion: stationFromHash() ?? 0 });
    intro.hidden = true;
    stage.classList.add("vr-on");
    status.textContent = "";
    stage.focus({ preventScroll: true });
  } catch (error) {
    console.error(error);
    audio.detener();
    audio = null;
    stage.querySelector("canvas")?.remove();
    loading = false;
    enterButton.disabled = false;
    enterButton.textContent = "Entrar al recorrido";
    status.textContent = /webgl/i.test(String(error && error.message))
      ? "Tu navegador no puede mostrar el escenario 3D."
      : "No se pudo cargar el escenario 3D. Revisa tu conexión a internet e inténtalo de nuevo.";
  }
}

enterButton.addEventListener("click", enter);

soundButton.addEventListener("click", () => {
  if (!audio) return;
  const playing = audio.alternar();
  soundButton.setAttribute("aria-pressed", String(playing));
  soundButton.textContent = playing ? "🔊 Sonido" : "🔇 Sin sonido";
});

window.addEventListener("hashchange", () => {
  const index = stationFromHash();
  if (index !== null && tour) tour.go(index);
});

// Si se llega desde otra página con #bohio, #galeria o #umbral, baja hasta el escenario.
if (stationFromHash() !== null) {
  document.getElementById("heading-stage").scrollIntoView();
}
