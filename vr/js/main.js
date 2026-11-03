import * as T from 'three';
import { STATIONS, FICHA_PALMA } from './config.js';
import { destacada } from './palmas.js';
import { createScene } from './scene.js';
import { buildWorld } from './world.js';
import { buildBohio } from './bohio.js';
import { buildProps } from './props.js';
import { buildGallery } from './gallery.js';
import { hits, pulse } from './hotspots.js';
import { createControls } from './controls.js';
import { initUI, openInfo, openReceta } from './ui.js';

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
    if (!d) return;
    if (d.palma) return verPalma();
    d.receta !== undefined ? openReceta(d.receta) : openInfo(d);
  }
  const controls = createControls(camera, renderer.domElement, onTap, root);
  const ui = initUI({ onGo: go, root });
  /** Vuela la cámara hasta la copa de la palma destacada y muestra su ficha. */
  function verPalma() {
    const { x, z, h } = destacada; controls.goTo([x + 2, h - .5, z + 10], [x, h + .5, z]);
    ui.ficha({ tag: 'Ficha · Flora', titulo: 'Palma de cuesco', html: FICHA_PALMA }, () => go(estacion));
  }
  function go(i) { estacion = i; ui.show(i); controls.goTo(STATIONS[i].cam, STATIONS[i].look); }

  const [flicker, , animProps] = await Promise.all([buildBohio(scene), buildWorld(scene), buildProps(scene)]);
  buildGallery(scene);
  go(inicial);

  // No dibuja mientras el escenario no se ve (fuera de pantalla o pestaña oculta).
  let visible = true;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(root);
  const clock = new T.Clock();
  renderer.setAnimationLoop(() => {
    const dt = clock.getDelta(), t = clock.elapsedTime;
    if (!visible || document.hidden) return;
    flicker(t); animProps(t); pulse(t, camera); controls.update(dt); seguirSol(camera.position); renderer.render(scene, camera);
  });
  return { go };
}
