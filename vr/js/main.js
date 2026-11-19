import * as T from 'three';
import { STATIONS, FICHA_PALMA, PASOS } from './config.js';
import { buildHallazgos, registrar } from './hallazgos.js';
import { destacada } from './palmas.js';
import { createScene } from './scene.js';
import { buildWorld } from './world.js';
import { buildBohio } from './bohio.js';
import { buildProps } from './props.js';
import { buildGallery } from './gallery.js';
import { hits, pulse } from './hotspots.js';
import { createControls } from './controls.js';
import { initUI, openInfo, openReceta } from './ui.js';
import { initXR } from './xr.js';
const plano = (h) => h.replace(/<[^>]+>/g, ' ');

/**
 * Construye el recorrido dentro de `root` (el escenario de virtual-reality.html) y devuelve { go }.
 * Se importa solo cuando la persona pulsa «Entrar al recorrido», para no descargar la escena antes de tiempo.
 * @param {HTMLElement} root  Contenedor del escenario (con los paneles del recorrido ya en el HTML).
 * @param {{estacion?: number}} opciones  Estación con la que empieza (0 = Umbral, 1 = Bohío, 2 = Galería).
 */
export async function iniciar(root, { estacion: inicial = 0 } = {}) {
  const { renderer, scene, camera, seguirSol } = createScene(root);
  const ray = new T.Raycaster();
  let estacion = 0;

  function onTap(e) {
    const r = renderer.domElement.getBoundingClientRect();
    ray.setFromCamera(new T.Vector2((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
    const d = ray.intersectObjects(hits, false)[0]?.object.userData.data;
    if (d) activar(d);
  }
  function activar(d) {
    if (d.palma) return verPalma();
    d.receta !== undefined ? openReceta(d.receta) : openInfo(d);
    if (xr?.presentando) {
      if (d.receta !== undefined) { const [t, det, res] = PASOS[d.receta]; xr.mostrar(`Paso ${d.receta + 1} de ${PASOS.length} · ${t}`, `${res} ${det}`); }
      else xr.mostrar(document.getElementById('m-titulo').textContent, document.getElementById('m-cuerpo').innerText);
    }
    const msg = registrar(d);
    if (msg) { const a = document.getElementById('aviso'); a.textContent = msg; a.classList.add('on'); setTimeout(() => a.classList.remove('on'), 4500); }
  }
  const controls = createControls(camera, renderer.domElement, onTap, root);
  const ui = initUI({ onGo: go, root });
  /** Vuela la cámara hasta la copa de la palma destacada y muestra su ficha. */
  function verPalma() {
    if (xr?.presentando) return xr.mostrar('Palma de cuesco', plano(FICHA_PALMA));
    const { x, z, h } = destacada; controls.goTo([x + 2, h - .5, z + 10], [x, h + .5, z]);
    ui.ficha({ tag: 'Ficha · Flora', titulo: 'Palma de cuesco', html: FICHA_PALMA }, () => go(estacion));
  }
  let xr = null;
  function go(i) {
    estacion = i; ui.show(i); const s = STATIONS[i];
    if (xr?.presentando) { xr.irA(s.cam, s.look); xr.mostrar(s.nombre, plano(s.html)); } else controls.goTo(s.cam, s.look);
  }
  xr = initXR({ renderer, scene, camera, controls, hits, activar, siguiente: () => go((estacion + 1) % STATIONS.length), mount: document.querySelector('.stage-controls') });

  const [flicker, , animProps] = await Promise.all([buildBohio(scene), buildWorld(scene), buildProps(scene)]);
  buildGallery(scene);
  const animHallazgos = buildHallazgos(scene);
  go(inicial);

  // No dibuja mientras el escenario no se ve (fuera de pantalla o pestaña oculta).
  let visible = true;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(root);
  const clock = new T.Clock(), wp = new T.Vector3();
  const fps = location.search.includes('fps') ? Object.assign(document.createElement('div'), { style: 'position:absolute;top:8px;left:8px;z-index:9;padding:2px 8px;background:#000a;color:#fff;font:12px monospace' }) : null; if (fps) root.append(fps);
  let n = 0, t0 = performance.now(), nf = 0, tq = t0, nivel = 0;
  renderer.setAnimationLoop(() => {
    const dt = clock.getDelta(), t = clock.elapsedTime;
    if ((!visible && !renderer.xr.isPresenting) || document.hidden) return;
    flicker(t); animProps(t); animHallazgos(t); pulse(t, camera); renderer.xr.isPresenting ? xr.update(dt) : controls.update(dt); seguirSol(camera.getWorldPosition(wp)); renderer.render(scene, camera);
    if (!renderer.xr.isPresenting && ++nf === 90) { // calidad adaptativa: si baja de ~40 FPS, reduce resolución y luego sombras
      const f = 90000 / (performance.now() - tq); nf = 0; tq = performance.now();
      if (f < 40 && nivel < 2) { nivel++; if (nivel === 1) renderer.setPixelRatio(1); else scene.traverse((o) => { if (o.isDirectionalLight) o.castShadow = false; }); renderer.setSize(root.clientWidth || 1, root.clientHeight || 1, false); }
    }
    if (fps && ++n === 30) { fps.textContent = Math.round(30000 / (performance.now() - t0)) + ' FPS'; n = 0; t0 = performance.now(); }
  });
  return { go };
}
