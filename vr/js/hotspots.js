import * as T from 'three';
import { PAL, sol } from './patrones.js';
export const hits = [], pins = [];
const COL = { receta: PAL.amarillo, info: PAL.verde, cartel: PAL.rojo }, v = new T.Vector3();

/** Marcador: sol de la marca con aro blanco y contorno oscuro (legible sobre cualquier fondo) + etiqueta. */
function marcador(tipo, texto) {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 256; const c = cv.getContext('2d'), tex = new T.CanvasTexture(cv); tex.colorSpace = T.SRGBColorSpace;
  const dib = () => {
    c.clearRect(0, 0, 512, 256);
    for (const [r, col] of [[76, PAL.tierra], [68, '#ffffff'], [58, COL[tipo]]]) { c.fillStyle = col; c.beginPath(); c.arc(256, 84, r, 0, 7); c.fill(); }
    sol(c, 256, 84, 44, PAL.crema, COL[tipo]);
    c.font = '700 40px Montserrat, sans-serif'; c.textAlign = 'center'; const w = Math.min(500, c.measureText(texto).width + 48);
    c.fillStyle = '#2b1d12ee'; c.beginPath(); c.roundRect(256 - w / 2, 176, w, 64, 32); c.fill(); c.strokeStyle = COL[tipo]; c.lineWidth = 5; c.stroke();
    c.fillStyle = PAL.crema; c.fillText(texto, 256, 222, 470); tex.needsUpdate = true;
  };
  dib(); document.fonts?.ready.then(dib);
  const s = new T.Sprite(new T.SpriteMaterial({ map: tex, depthTest: false, depthWrite: false, transparent: true, sizeAttenuation: false }));
  s.renderOrder = 999; s.scale.set(.26, .13, 1); return s;
}
/** Marca un objeto como interactivo: sus mallas y un marcador con etiqueta responden al toque. */
export function addHotspot(obj, data, pinPos) {
  obj.traverse((o) => { if (o.isMesh) { o.userData.data = data; hits.push(o); } });
  const tipo = data.receta !== undefined ? 'receta' : data.tipo === 'cartel' ? 'cartel' : 'info';
  const p = marcador(tipo, data.etiqueta || 'Tocar'); p.position.set(...pinPos); p.userData.data = data; obj.add(p); hits.push(p); pins.push(p);
}
/** Latido suave y desvanecimiento con la distancia (visibles hasta ~20 m). */
export function pulse(t, cam) {
  const k = 1 + .07 * Math.sin(t * 4);
  for (const p of pins) { p.getWorldPosition(v); const a = T.MathUtils.clamp((20 - v.distanceTo(cam.position)) / 6, 0, 1); p.visible = a > 0; p.material.opacity = a; p.scale.set(.26 * k, .13 * k, 1); }
}
