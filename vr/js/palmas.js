import * as T from 'three';
import { tronco } from './textures.js';
import { materialPBR } from './materials.js';
import { loadModel, ajustar } from './loader.js';
import { ASSETS, VIVIENDAS } from './config.js';
import { posicion } from './viviendas.js';
import { addCirculo } from './colision.js';
import { addHotspot } from './hotspots.js';
/** Palma que la cámara visita para mostrar la copa (se completa al construir). */
export const destacada = { x: 0, z: 0, h: 15 };
let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
// Medidas reales (Attalea butyracea): estípite liso de 35–75 cm de diámetro y 8–25 m de alto; hojas de 4–12 m de largo
// y hasta 1,6 m de ancho; frutos ovoides de 5–7 cm de largo por 3–4 cm de ancho.
const LH = 8;

/** Fronda pinnada (crece hacia +z): ~46 foliolos por lado, arqueados y de punta clara; ancho total máx. 1,6 m. */
function frondaGeo() {
  const pos = [], col = [], N = 46, v = (a, b, c) => pos.push(a, b, c);
  for (let i = 0; i < N; i++) {
    const t = .06 + i / N * .94, pz = LH * t, py = -.22 * LH * t * t, d = LH / N * .9, w = .8 * Math.max(0, Math.sin(Math.PI * Math.min(1, t * 1.08))) ** .6 + .1;
    for (const s of [-1, 1]) {
      const k = .9 + rnd() * .2, j = (rnd() - .5) * .25, wl = w * (.9 + rnd() * .2);
      const m1 = [s * .5 * wl, py + .1 * wl, pz + .12 * wl], tip = [s * wl, py - .3 * wl - rnd() * .1, pz + .6 * wl + j];
      v(0, py, pz); v(0, py, pz + d); v(m1[0], m1[1], m1[2] + d * .7);          // base → medio
      v(0, py, pz); v(m1[0], m1[1], m1[2] + d * .7); v(...m1);
      v(...m1); v(m1[0], m1[1], m1[2] + d * .7); v(...tip);                      // medio → punta
      for (const c of [[.12, .3, .1], [.12, .3, .1], [.22, .45, .14], [.12, .3, .1], [.22, .45, .14], [.22, .45, .14], [.22, .45, .14], [.22, .45, .14], [.38, .58, .2]]) col.push(c[0] * k, c[1] * k, c[2] * k);
    }
  }
  const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new T.Float32BufferAttribute(col, 3)); g.computeVertexNormals(); return g;
}
export async function buildPalmas(scene) {
  const tpl = await loadModel(ASSETS.models.palma), casas = VIVIENDAS.map(posicion), lista = [];
  [[-6.5, 16, 15], [7, 21, 18], [-8, 27, 14], [8.5, 31, 17]].forEach(([x, z, h]) => lista.push({ x, z, h })); // flanquean el camino
  for (let n = 0, i = 0; n < 26 && i < 400; i++) {
    const a = rnd() * 6.283, r = 14 + rnd() * 36, x = Math.sin(a) * r, z = Math.cos(a) * r;
    if (Math.abs(x) < 5 && z > 8) continue;                                   // camino
    if (casas.some(([cx, cz]) => Math.hypot(x - cx, z - cz) < 6)) continue;  // viviendas
    lista.push({ x, z, h: 12 + rnd() * 10 }); n++;                            // 12 a 22 m
  }
  lista.forEach(({ x, z }) => addCirculo(x, z, .45));
  Object.assign(destacada, lista[0]); const hs = new T.Group(); hs.position.set(destacada.x, 0, destacada.z); scene.add(hs); addHotspot(hs, { palma: true, etiqueta: 'Palma: ver la copa' }, [0, 2.6, 0]);
  if (tpl) { lista.forEach(({ x, z, h }) => { const p = ajustar(tpl.clone(), { alto: h }); p.position.set(x, 0, z); p.rotation.y = rnd() * 6.28; scene.add(p); }); return; }
  // Palmas procedurales con instancias: troncos, collarines, frondas, pedúnculos y frutos
  const d = new T.Object3D(), F = 16, K = 90, n = lista.length, std = (c, o = {}) => new T.MeshStandardMaterial({ color: c, roughness: .8, ...o });
  const tr = new T.InstancedMesh(new T.CylinderGeometry(.92, 1, 1, 14, 10).translate(0, .5, 0), materialPBR('tronco', 1.5, 16, { respaldo: tronco(), roughness: .95 }), n);
  const co = new T.InstancedMesh(new T.CylinderGeometry(.9, 1, 1.4, 12).translate(0, -.7, 0), std(0x6f6d3a), n);
  const fr = new T.InstancedMesh(frondaGeo(), new T.MeshStandardMaterial({ vertexColors: true, side: T.DoubleSide, roughness: .7 }), n * F);
  const pe = new T.InstancedMesh(new T.CylinderGeometry(.05, .03, 1.1, 6).translate(0, -.55, 0), std(0x6b4a2a), n);
  const fu = new T.InstancedMesh(new T.IcosahedronGeometry(1, 0), std(0xa35a22, { roughness: .5 }), n * K);
  lista.forEach(({ x, z, h }, i) => {
    const r = .21 + rnd() * .08; // radio 21–29 cm → diámetro 42–58 cm
    d.position.set(x, 0, z); d.rotation.set(0, rnd() * 6.28, 0); d.scale.set(r, h, r); d.updateMatrix(); tr.setMatrixAt(i, d.matrix);
    d.position.set(x, h, z); d.scale.set(r * 1.25, 1, r * 1.25); d.updateMatrix(); co.setMatrixAt(i, d.matrix);
    for (let f = 0; f < F; f++) { // las 4 primeras, erguidas; las siguientes se abren; las últimas caen en arco
      const erg = f < 4, pitch = erg ? -1.2 + rnd() * .15 : f < 10 ? -.65 + rnd() * .3 : rnd() * .45;
      d.position.set(x, h, z); d.rotation.set(pitch, f * 2.4 + rnd() * .35, (rnd() - .5) * .3, 'YXZ'); d.scale.set(.85 + rnd() * .2, 1, (.7 + rnd() * .55) * (erg ? .85 : 1)); d.updateMatrix(); fr.setMatrixAt(i * F + f, d.matrix);
    }
    const ox = x + (rnd() - .5) * .5, oz = z + (rnd() - .5) * .5;
    d.position.set(ox, h - 1.5, oz); d.rotation.set(0, 0, 0); d.scale.set(1, 1, 1); d.updateMatrix(); pe.setMatrixAt(i, d.matrix);
    for (let k = 0; k < K; k++) { // racimo compacto: frutos ovoides ampliados ~3× (17 × 10 cm) para que se noten desde lejos
      const t = k / K, a = rnd() * 6.283, rr = .03 + rnd() * .13 * (1 - t * .55), q = .9 + rnd() * .2;
      d.position.set(ox + Math.cos(a) * rr, h - 1.5 - t * .95 - rnd() * .1, oz + Math.sin(a) * rr); d.rotation.set(rnd() * .5, rnd() * 6, rnd() * .5); d.scale.set(.05 * q, .085 * q, .05 * q); d.updateMatrix(); fu.setMatrixAt(i * K + k, d.matrix);
    }
  });
  tr.castShadow = fr.castShadow = co.castShadow = true; [tr, co, fr, pe, fu].forEach((m) => { m.frustumCulled = false; scene.add(m); });
}
