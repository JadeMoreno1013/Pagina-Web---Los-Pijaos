import * as T from 'three';
import { procedural, paja, ladrillo, flecos } from './textures.js';
import { materialPBR, maderaMat } from './materials.js';
import { BRAND, ASSETS } from './config.js';
import { PAL, sol } from './patrones.js';
import { loadModel } from './loader.js';
const std = (c, o = {}) => new T.MeshStandardMaterial({ color: c, roughness: .85, ...o });
// Proporciones tomadas de la foto de referencia: cono alto de paja que baja casi hasta el muro,
// muro bajo de ladrillo con remate de concreto, pocos postes oscuros y tapa de zinc en la punta.
const R = 11.6, H = 7.2, BASE = 2.4, RW = 9.4, GAP = .45, PI2 = Math.PI * 2;
const under = (r, d = .2) => BASE + (R - r) / R * H - d; // altura de la cara interior del techo a la distancia r

/** Bohío: casa ceremonial, punto de encuentro comunitario y espiritual. */
export async function buildBohio(scene) {
  scene.add((await loadModel(ASSETS.models.bohio)) || buildProcedural());
  const fire = new T.PointLight(0xff8a3a, 30, 14, 2); fire.position.set(-.45, 1.15, .1); scene.add(fire); // fogón
  return (t) => { fire.intensity = 28 + Math.sin(t * 9) * 3 + Math.sin(t * 23) * 2; };
}
function buildProcedural() {
  const g = new T.Group(), wood = procedural({ base: '#3a2a1a', stripes: 24, repeat: [1, 3] }), beam = maderaMat(1, 3);
  // Piso de tierra apisonada con los anillos de la marca
  const floor = new T.Mesh(new T.CircleGeometry(10.2, 64), materialPBR('piso', 20.4, 20.4, { respaldo: procedural({ base: '#9a7a52', speck: 100, stripes: 20, repeat: [5, 5] }), alterno: 'tierra', roughness: 1 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = .02; floor.receiveShadow = true; g.add(floor);
  [[5.2, 5.35, BRAND.rojo], [5.6, 5.75, BRAND.amarillo], [6, 6.15, BRAND.verde]].forEach(([a, b, c]) => {
    const r = new T.Mesh(new T.RingGeometry(a, b, 64), std(c)); r.rotation.x = -Math.PI / 2; r.position.y = .04; r.receiveShadow = true; g.add(r);
  });
  // Muro bajo de ladrillo con remate; la entrada queda abierta al frente
  const brick = materialPBR('ladrillo', 51, 1.1, { respaldo: ladrillo(), side: T.DoubleSide }), arc = [GAP, PI2 - 2 * GAP];
  for (const r of [RW + .12, RW - .12]) { const w = new T.Mesh(new T.CylinderGeometry(r, r, 1.1, 96, 1, true, ...arc), brick); w.position.y = .55; w.castShadow = w.receiveShadow = true; g.add(w); }
  const cap = new T.Mesh(new T.RingGeometry(RW - .12, RW + .12, 96, 1, GAP - Math.PI / 2, PI2 - 2 * GAP), std(0xb7b2a8, { side: T.DoubleSide }));
  cap.rotation.x = -Math.PI / 2; cap.position.y = 1.11; g.add(cap);
  // Sol de la marca bajo la mesa larga
  const sc = document.createElement('canvas'); sc.width = sc.height = 512; sol(sc.getContext('2d'), 256, 256, 240, PAL.amarillo, PAL.rojo);
  const st = new T.CanvasTexture(sc); st.colorSpace = T.SRGBColorSpace; st.anisotropy = 8;
  const disco = new T.Mesh(new T.CircleGeometry(3.4, 64), new T.MeshStandardMaterial({ map: st, transparent: true, roughness: 1 })); disco.rotation.x = -Math.PI / 2; disco.position.y = .035; disco.receiveShadow = true; g.add(disco);
  // Pilastras de ladrillo que cierran los extremos del muro junto a la entrada
  const pil = materialPBR('ladrillo', .5, 1.25, { respaldo: ladrillo([1, 3]) });
  for (const sg of [-1, 1]) {
    const th = sg * (GAP + .02), b = new T.Mesh(new T.BoxGeometry(.5, 1.25, .5), pil); b.position.set(Math.sin(th) * RW, .625, Math.cos(th) * RW); b.rotation.y = th; b.castShadow = b.receiveShadow = true; g.add(b);
    const t = new T.Mesh(new T.BoxGeometry(.62, .1, .62), std(0xb7b2a8)); t.position.set(b.position.x, 1.3, b.position.z); t.rotation.y = th; g.add(t);
  }
  // Postes oscuros
  for (let i = 1; i < 8; i++) { const a = i / 8 * PI2, p = new T.Mesh(new T.CylinderGeometry(.13, .17, under(RW, 0), 10), beam); p.position.set(Math.sin(a) * RW, under(RW, 0) / 2, Math.cos(a) * RW); p.castShadow = true; g.add(p); }
  g.add(techo()); // techo de paja en capas
  const ft = flecos(); ft.repeat.set(40, 1); // flecos: hebras de paja con transparencia, sin bloques rígidos
  const fl = new T.Mesh(new T.CylinderGeometry(R - .065, R - .064, .9, 96, 1, true), std(0xffffff, { map: ft, alphaTest: .45, side: T.DoubleSide, roughness: 1 })); fl.position.y = BASE - .55; g.add(fl);
  // Tapa de lámina metálica en la punta
  const cap2 = new T.Mesh(new T.ConeGeometry(R / H * 1.55, 1.55, 40, 1, true), std(0xd5d9dc, { metalness: .7, roughness: .35, side: T.DoubleSide })); cap2.position.y = BASE + H - .7; g.add(cap2);
  const vp = new T.Mesh(new T.TorusGeometry(RW, .1, 8, 96), beam); vp.rotation.x = Math.PI / 2; vp.position.y = under(RW, 0) - .05; g.add(vp); // viga perimetral
  // Estructura interior: cabios radiales y anillos de amarre
  const apex = new T.Vector3(0, BASE + H - .25, 0);
  for (let i = 0; i < 20; i++) {
    const a = i / 20 * PI2, e = new T.Vector3(Math.sin(a) * 11, under(11), Math.cos(a) * 11), b = new T.Mesh(new T.CylinderGeometry(.06, .07, apex.distanceTo(e), 6).rotateX(Math.PI / 2), beam);
    b.position.copy(apex).lerp(e, .5); b.lookAt(e); g.add(b);
  }
  for (const r of [8, 5]) { const t = new T.Mesh(new T.TorusGeometry(r, .07, 6, 64), beam); t.rotation.x = Math.PI / 2; t.position.y = under(r, .15); g.add(t); }
  return g;
}

/** Techo de paja en 8 capas traslapadas: borde inferior irregular y perfil que se abre hacia el alero. */
function techo() {
  const mat = materialPBR('paja', 73, 1.9, { respaldo: paja([36, 1]), roughness: 1, side: T.DoubleSide }), g = new T.Group();
  const perfil = (t) => new T.Vector2(R * t, BASE + H * (1 - t) - Math.max(0, t - .85) * .8), N = 8, SEG = 96, ruido = Array.from({ length: SEG }, () => Math.random());
  for (let k = 0; k < N; k++) {
    const t0 = k / N, t1 = Math.min(1, (k + 1) / N + .04), pts = [];
    for (let j = 0; j <= 4; j++) { const p = perfil(t0 + (t1 - t0) * j / 4); p.x += .12 * j / 4; pts.push(p); } // cada capa sobresale de la anterior
    const geo = new T.LatheGeometry(pts, SEG), pos = geo.attributes.position, n = pts.length;
    for (let i = 0; i <= SEG; i++) { const v = i * n + n - 1; pos.setY(v, pos.getY(v) - ruido[i % SEG] * .3); }
    geo.computeVertexNormals(); const m = new T.Mesh(geo, mat); m.castShadow = true; g.add(m);
  }
  return g;
}
