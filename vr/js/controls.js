import * as T from 'three';
import { resolver, AREA } from './colision.js';
/** Mirar arrastrando, caminar con W A S D / flechas / joystick táctil y viajar entre estaciones. */
export function createControls(camera, dom, onTap, root = dom) {
  let yaw = 0, pitch = 0, ty = null, tpitch = 0, down = false, moved = 0, lx = 0, ly = 0;
  const tpos = camera.position.clone(), keys = {}, joy = { x: 0, y: 0 };
  dom.addEventListener('pointerdown', (e) => { down = true; moved = 0; lx = e.clientX; ly = e.clientY; root.focus({ preventScroll: true }); });
  dom.addEventListener('pointermove', (e) => {
    if (!down) return; const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY; moved += Math.abs(dx) + Math.abs(dy);
    if (moved > 6) { ty = null; yaw -= dx * .005; pitch = Math.max(-1.2, Math.min(1.2, pitch - dy * .005)); }
  });
  dom.addEventListener('pointerup', (e) => { down = false; if (moved < 6) onTap(e); });
  dom.addEventListener('pointercancel', () => { down = false; });
  // El teclado solo mueve la cámara mientras el escenario tiene el foco, para no bloquear el desplazamiento de la página.
  const CAMINAR = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ShiftLeft']);
  root.addEventListener('keydown', (e) => { if (!CAMINAR.has(e.code)) return; keys[e.code] = true; if (e.code !== 'ShiftLeft') e.preventDefault(); });
  root.addEventListener('keyup', (e) => { keys[e.code] = false; });
  root.addEventListener('focusout', (e) => { if (!root.contains(e.relatedTarget)) for (const k in keys) keys[k] = false; });
  // Joystick virtual (solo visible en pantallas táctiles)
  const el = document.getElementById('joy'), knob = document.getElementById('knob'); let jp = null;
  const mover = (e) => {
    const r = el.getBoundingClientRect(); let dx = (e.clientX - r.left - r.width / 2) / (r.width / 2), dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
    const l = Math.hypot(dx, dy); if (l > 1) { dx /= l; dy /= l; } joy.x = dx; joy.y = dy; knob.style.transform = `translate(${dx * 30}px,${dy * 30}px)`;
  };
  const soltar = () => { jp = null; joy.x = joy.y = 0; knob.style.transform = ''; };
  el.addEventListener('pointerdown', (e) => { jp = e.pointerId; el.setPointerCapture(jp); mover(e); });
  el.addEventListener('pointermove', (e) => { if (e.pointerId === jp) mover(e); });
  el.addEventListener('pointerup', soltar); el.addEventListener('pointercancel', soltar);
  let tAviso = 0;
  const aviso = (m) => { const el = document.getElementById('aviso'); el.textContent = m; el.classList.add('on'); clearTimeout(tAviso); tAviso = setTimeout(() => el.classList.remove('on'), 2500); };
  return {
    goTo(pos, look) {
      tpos.set(...pos); const d = new T.Vector3(...look).sub(tpos);
      ty = Math.atan2(-d.x, -d.z); tpitch = Math.atan2(d.y, Math.hypot(d.x, d.z));
    },
    update(dt = .016) {
      const ix = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0) + joy.x, iz = (keys.KeyS || keys.ArrowDown ? 1 : 0) - (keys.KeyW || keys.ArrowUp ? 1 : 0) + joy.y, l = Math.hypot(ix, iz);
      if (l > .05) { // caminar: cancela el viaje automático
        ty = null; const k = Math.min(1, l) / l * 4 * dt * (keys.ShiftLeft ? 1.8 : 1), s = Math.sin(yaw), c = Math.cos(yaw);
        const [x, z] = resolver(camera.position.x + (ix * c + iz * s) * k, camera.position.z + (-ix * s + iz * c) * k);
        camera.position.set(x, camera.position.y + (1.7 - camera.position.y) * Math.min(1, dt * 3), z); tpos.copy(camera.position); // baja suave al suelo tras la vista de la palma
        if (Math.hypot(x, z) > AREA - .6) aviso('Has llegado al límite del recorrido. Vuelve hacia el Bohío y las viviendas.');
      } else camera.position.lerp(tpos, .05);
      if (ty !== null) { yaw += Math.atan2(Math.sin(ty - yaw), Math.cos(ty - yaw)) * .05; pitch += (tpitch - pitch) * .05; }
      camera.rotation.set(pitch, yaw, 0);
    },
  };
}
