import * as T from 'three';
import { bahareque, zinc, paja, procedural, cal, piedra, celosia, flecos } from './textures.js';
import { materialPBR, maderaMat } from './materials.js';
import { loadModel } from './loader.js';
import { ASSETS, VIVIENDAS } from './config.js';
import { addCirculo } from './colision.js';
const M = (o) => new T.MeshStandardMaterial({ roughness: .9, ...o });
const wall = materialPBR('bahareque', 1, 1, { respaldo: bahareque([.5, .5]), roughness: 1 }), wood = maderaMat(1, 1);
const dark = M({ color: 0x24160b }), conc = M({ map: procedural({ base: '#9a948a', speck: 160, repeat: [3, 1] }) }), clay = M({ color: 0xa8532a, side: T.DoubleSide });
const hoja = paja([5, 2]), zn = zinc([6, 1]);
const techoMat = (t, len = 6, ancho = 7) => t === 'zinc' ? materialPBR('zinc', len, ancho, { respaldo: zinc([6, 1]), roughness: .4, metalness: .65, side: T.DoubleSide }) : materialPBR('paja', len, ancho, { respaldo: paja([len / 1.5, ancho / 1.5]), roughness: 1, side: T.DoubleSide });
export const posicion = ({ a, r }) => [Math.sin(a * Math.PI / 180) * r, Math.cos(a * Math.PI / 180) * r];

function caja(g, w, h, d, x, y, z, mat = wood) { const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; g.add(m); return m; }

// ── Vivienda encalada de techo de paja a cuatro aguas (referencia: casas tradicionales del Tolima) ──
const calMat = () => materialPBR('cal', 1, 1, { respaldo: cal(), roughness: 1 });
const pajaMat = () => materialPBR('paja', 1, 1, { respaldo: paja([1, 1]), roughness: 1, side: T.DoubleSide });
const pared = new T.MeshStandardMaterial({ map: celosia(), roughness: .9 });
/** BoxGeometry con UV en metros, para que las texturas PBR conserven su escala real. */
function uvMetros(geo, w, h, d) {
  const tam = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]], uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) { const [u, v] = tam[i >> 2]; uv.setXY(i, uv.getX(i) * u, uv.getY(i) * v); }
  return geo;
}
/** Techo a cuatro aguas: 2 faldones trapezoidales y 2 caballetes triangulares, con UV planas en metros. */
function cuatroAguas(a, b, c, y0, y1) {
  const P = (x, y, z) => new T.Vector3(x, y, z), pos = [], uv = [];
  const cara = (...p) => {
    const e1 = p[1].clone().sub(p[0]).normalize(), e2 = p[1].clone().sub(p[0]).cross(p[2].clone().sub(p[0])).cross(e1).normalize();
    for (const i of p.length === 4 ? [0, 1, 2, 0, 2, 3] : [0, 1, 2]) { const q = p[i].clone().sub(p[0]); pos.push(p[i].x, p[i].y, p[i].z); uv.push(q.dot(e1), q.dot(e2)); }
  };
  const E0 = P(-a, y0, -b), E1 = P(a, y0, -b), E2 = P(a, y0, b), E3 = P(-a, y0, b), R0 = P(-c, y1, 0), R1 = P(c, y1, 0);
  cara(E0, E1, R1, R0); cara(E3, E2, R1, R0); cara(E0, E3, R0); cara(E2, E1, R1);
  const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); g.computeVertexNormals(); return g;
}
/** Vivienda a cuatro aguas con voladizos, sobre plataforma: techo de paja (palmicha) o de zinc. */
function casaPaja(techo) {
  const g = new T.Group(), Lw = 6.4, Ww = 4.2, Hw = 2.3, a = Lw / 2 + .8, b = Ww / 2 + .8, y0 = Hw - .1, y1 = y0 + 2.1, c = a - b;
  const body = new T.Mesh(uvMetros(new T.BoxGeometry(Lw, Hw, Ww), Lw, Hw, Ww), techo === 'zinc' ? wall : calMat()); body.position.y = Hw / 2; body.castShadow = body.receiveShadow = true; g.add(body);
  caja(g, Lw + .2, .25, Ww + .2, 0, .125, 0, conc);
  const roof = new T.Mesh(cuatroAguas(a, b, c, y0, y1), techoMat(techo, 1, 1)); roof.castShadow = true; g.add(roof);
  const cum = new T.Mesh(new T.CylinderGeometry(.13, .13, 2 * c + .5, 8).rotateZ(Math.PI / 2), M({ color: 0x6e5a3c, roughness: 1 })); cum.position.y = y1 + .04; g.add(cum);
  // Flecos de paja (hebras con transparencia) en los cuatro bordes del alero
  if (techo !== 'zinc') for (const [len, x, z, ry] of [[2 * a, 0, -b, 0], [2 * a, 0, b, 0], [2 * b, a, 0, Math.PI / 2], [2 * b, -a, 0, Math.PI / 2]]) {
    const ft = flecos(); ft.repeat.set(len / 2, 1); const m = new T.Mesh(new T.PlaneGeometry(len, .7), new T.MeshStandardMaterial({ map: ft, alphaTest: .45, side: T.DoubleSide, roughness: 1 }));
    m.position.set(x, y0 - .25, z); m.rotation.y = ry; g.add(m);
  }
  // Puerta, ventanas con celosía y ventana lateral (frente = +z)
  const zf = Ww / 2 + .03; caja(g, .95, 1.9, .08, -1.6, 1.2, zf + .01);
  for (const x of [-2.1, -1.1]) caja(g, .1, 2, .1, x, 1.25, zf); caja(g, 1.2, .1, .1, -1.6, 2.2, zf);
  for (const x of [.5, 1.9]) {
    const w = new T.Mesh(new T.BoxGeometry(1.1, .95, .05), pared); w.position.set(x, 1.55, zf); g.add(w);
    caja(g, 1.25, .08, .1, x, 2.06, zf); caja(g, 1.25, .08, .1, x, 1.04, zf); for (const s of [-1, 1]) caja(g, .08, 1.1, .1, x + s * .6, 1.55, zf);
  }
  const lat = new T.Mesh(new T.BoxGeometry(.05, .95, 1.1), pared); lat.position.set(Lw / 2 + .03, 1.55, 0); g.add(lat);
  // Muro bajo de piedra de río al frente, con apertura para entrar
  for (const s of [-1, 1]) {
    const x = s * 2.7, p = new T.Mesh(uvMetros(new T.BoxGeometry(3.6, .85, .5), 3.6, .85, .5), materialPBR('piedra', 1, 1, { respaldo: piedra(), roughness: 1 })); p.position.set(x, .425, Ww / 2 + 3.4); p.castShadow = p.receiveShadow = true; g.add(p);
    caja(g, 3.7, .1, .62, x, .9, Ww / 2 + 3.4, conc);
  }
  return g;
}
export async function buildViviendas(scene) {
  const tpl = await loadModel(ASSETS.models.vivienda);
  for (const v of VIVIENDAS) {
    const w = new T.Group(), c = tpl ? tpl.clone() : casaPaja(v.techo), [x, z] = posicion(v);
    w.add(c); // la puerta mira hacia el Bohío
    w.position.set(x, 0, z); w.scale.setScalar(v.s); w.lookAt(0, 0, 0); scene.add(w); addCirculo(x, z, 3.9 * v.s);
  }
}
