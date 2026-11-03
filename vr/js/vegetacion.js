import * as T from 'three';
import { addCirculo, circulos } from './colision.js';
import { materialPBR } from './materials.js';
import { follaje, corteza, guadua } from './textures.js';
let seed = 5; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const VERDES = [0xcfe8b0, 0xa8d890, 0xbfe39a, 0x95cf8a, 0xd6ecaa].map((c) => new T.Color(c));
const libre = (x, z, m = 1.5) => !(Math.abs(x) < 5.5 && z > 6) && Math.hypot(x, z) > 17 && !circulos.some((c) => Math.hypot(x - c.x, z - c.z) < c.r + m);
function sitio(r0, r1, m) { for (let i = 0; i < 40; i++) { const a = rnd() * 6.283, r = r0 + rnd() * (r1 - r0), x = Math.sin(a) * r, z = Math.cos(a) * r; if (libre(x, z, m)) return [x, z]; } return null; }

/** Promedia las normales de vértices coincidentes (costura y polos) para un sombreado suave sin aristas. */
function suavizar(g) {
  g.computeVertexNormals(); const p = g.attributes.position, n = g.attributes.normal, m = new Map(), k = (i) => `${p.getX(i).toFixed(4)},${p.getY(i).toFixed(4)},${p.getZ(i).toFixed(4)}`;
  for (let i = 0; i < p.count; i++) { const e = m.get(k(i)) || [0, 0, 0]; e[0] += n.getX(i); e[1] += n.getY(i); e[2] += n.getZ(i); m.set(k(i), e); }
  for (let i = 0; i < p.count; i++) { const e = m.get(k(i)), l = Math.hypot(...e) || 1; n.setXYZ(i, e[0] / l, e[1] / l, e[2] / l); }
}
/** Masa de follaje sólida: esfera deformada con lóbulos (ruido de varias frecuencias), base más plana y degradado de color (más clara arriba). */
function copa(sem) {
  const g = new T.SphereGeometry(1, 30, 22), p = g.attributes.position, col = [], f = [1 + sem * 1.7, 2 + sem * .9, 3 + sem * 1.3, sem * 6.28];
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), r = 1 + .16 * Math.sin(x * 3.1 * f[0] + f[3]) * Math.cos(y * 2.7 * f[1]) + .12 * Math.sin(z * 4.3 * f[2] + y * 3.7) * Math.cos(x * 5.1 + f[3]) + .06 * Math.sin((x + y + z) * 9);
    p.setXYZ(i, x * r, (y < 0 ? y * .55 : y) * r, z * r);
    const k = .6 + .4 * (y * .5 + .5) + Math.sin(x * 7 + z * 5) * .04; col.push(k * .92, k, k * .88);
  }
  g.setAttribute('color', new T.Float32BufferAttribute(col, 3)); suavizar(g); return g;
}
/** Árboles de copa ancha (lóbulos de follaje sólidos sobre tronco con ramas), guaduales y arbustos. */
export function buildVegetacion(scene) {
  const d = new T.Object3D(), mat = materialPBR('follaje', 18, 9, { respaldo: follaje([30, 15]), vertexColors: true, roughness: 1 });
  const masas = new T.InstancedMesh(copa(.35), mat, 1400); masas.count = 0;
  const masa = (cx, cy, cz, sx, sy, sz) => {
    d.position.set(cx, cy, cz); d.rotation.set((rnd() - .5) * .3, rnd() * 6.28, (rnd() - .5) * .3); d.scale.set(sx, sy, sz); d.updateMatrix();
    masas.setMatrixAt(masas.count, d.matrix); masas.setColorAt(masas.count, VERDES[(rnd() * VERDES.length) | 0]); masas.count++;
  };
  const N = 55, tr = new T.InstancedMesh(new T.CylinderGeometry(.3, .5, 1, 8).translate(0, .5, 0), materialPBR('corteza', 1.5, 6, { respaldo: corteza(), roughness: 1 }), N);
  const ra = new T.InstancedMesh(new T.CylinderGeometry(.07, .15, 1, 6).translate(0, .5, 0), materialPBR('corteza', .5, 2, { respaldo: corteza(), roughness: 1 }), N * 3);
  let n = 0;
  for (let i = 0; i < N; i++) {
    const s = sitio(30, 85, 2.5); if (!s) continue; const [x, z] = s, h = 5 + rnd() * 4, k = .85 + rnd() * .5;
    d.position.set(x, 0, z); d.rotation.set(0, rnd() * 6, 0); d.scale.set(k, h, k); d.updateMatrix(); tr.setMatrixAt(n, d.matrix); addCirculo(x, z, .5);
    for (let j = 0; j < 3; j++) { d.position.set(x, h * .7, z); d.rotation.set(.7 + rnd() * .4, (j / 3 + rnd() * .2) * 6.28, 0, 'YXZ'); d.scale.set(k, 1.8 + rnd() * .8, k); d.updateMatrix(); ra.setMatrixAt(n * 3 + j, d.matrix); }
    d.rotation.order = 'XYZ';
    masa(x, h + 1, z, 3.2 * k, 2.1 * k, 3.2 * k);                       // masa principal
    for (let j = 0; j < 5; j++) { const a = j / 5 * 6.28 + rnd(), r = (1.9 + rnd() * .8) * k, q = (1.4 + rnd() * .7) * k; masa(x + Math.cos(a) * r, h + .4 + rnd() * 1.1, z + Math.sin(a) * r, q, q * (.8 + rnd() * .4), q); } // lóbulos laterales
    masa(x + (rnd() - .5), h + 2.7 * k, z + (rnd() - .5), 1.8 * k, 1.3 * k, 1.8 * k);                                                                  // remate
    n++;
  }
  tr.count = n; ra.count = n * 3;
  // Guaduales: macollas de culmos delgados con un copete sólido en la punta
  const G = 10, culmo = new T.InstancedMesh(new T.CylinderGeometry(.06, .05, 1, 6).translate(0, .5, 0), new T.MeshStandardMaterial({ map: guadua(), roughness: .7 }), G * 10); let c = 0;
  for (let i = 0; i < G; i++) {
    const s = sitio(28, 62, 3); if (!s) continue; addCirculo(s[0], s[1], 1.3);
    for (let j = 0; j < 10; j++) {
      const a = rnd() * 6.283, r = rnd() * .9, h = 8 + rnd() * 5, lean = .06 + rnd() * .16, px = s[0] + Math.cos(a) * r, pz = s[1] + Math.sin(a) * r;
      d.position.set(px, 0, pz); d.rotation.set(Math.sin(a) * lean, 0, -Math.cos(a) * lean); d.scale.set(1, h, 1); d.updateMatrix(); culmo.setMatrixAt(c++, d.matrix); d.rotation.set(0, 0, 0);
      masa(px + Math.cos(a) * h * lean, h * .96, pz + Math.sin(a) * h * lean, .7, .45, .7);
    }
  }
  culmo.count = c;
  // Arbustos bajos: 2 a 3 lóbulos pegados al suelo
  for (let i = 0; i < 110; i++) { const s = sitio(17, 70, .8); if (!s) continue; const k = .7 + rnd() * .9; for (let j = 0; j < 2 + (rnd() > .5); j++) masa(s[0] + (rnd() - .5) * k, .4 * k, s[1] + (rnd() - .5) * k, (.8 + rnd() * .4) * k, (.55 + rnd() * .25) * k, (.8 + rnd() * .4) * k); }
  for (const o of [tr, ra, culmo, masas]) { o.frustumCulled = false; o.castShadow = true; o.receiveShadow = o === masas || o === tr; scene.add(o); }
}
