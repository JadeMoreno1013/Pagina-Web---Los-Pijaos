import * as T from 'three';
import { procedural } from './textures.js';
import { maderaMat } from './materials.js';
import { addHotspot } from './hotspots.js';
import { loadModel, ajustar } from './loader.js';
import { ASSETS } from './config.js';
import { addCirculo } from './colision.js';
import { PAL, banda } from './patrones.js';
const std = (c, o = {}) => new T.MeshStandardMaterial({ color: c, roughness: .8, ...o });
const lathe = (pts, mat, seg = 28) => { const m = new T.Mesh(new T.LatheGeometry(pts.map((p) => new T.Vector2(...p)), seg), mat); m.castShadow = m.receiveShadow = true; return m; };

// Mesa larga en el centro del Bohío: los 6 pasos de la receta van de izquierda a derecha, a 0,9 m entre sí.
const MESA = { largo: 5.6, ancho: 1, alto: .75 }, TOPE = MESA.alto + .04, X = (i) => -2.25 + i * .9;
const COLORES = [PAL.amarillo, PAL.verde, PAL.rojo, PAL.amarillo, PAL.verde, PAL.rojo];
const NOMBRES = ['1 · Cuescos', '2 · Pilón', '3 · Olla', '4 · Panela', '5 · Colador', '6 · Fermentar'];

/** Mesa de madera con travesaños y un camino de mesa con los motivos de la marca. */
function mesaLarga(scene) {
  const g = new T.Group(), mad = maderaMat(2.8, .5), { largo: L, ancho: A } = MESA;
  const tablero = new T.Mesh(new T.BoxGeometry(L, .08, A), mad); tablero.position.y = MESA.alto; tablero.castShadow = tablero.receiveShadow = true; g.add(tablero);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const p = new T.Mesh(new T.BoxGeometry(.11, MESA.alto, .11), mad); p.position.set(sx * (L / 2 - .25), MESA.alto / 2, sz * (A / 2 - .1)); p.castShadow = true; g.add(p); }
  for (const sz of [-1, 1]) { const t = new T.Mesh(new T.BoxGeometry(L - .5, .07, .08), mad); t.position.set(0, .3, sz * (A / 2 - .1)); g.add(t); }
  const c = document.createElement('canvas'); c.width = 1400; c.height = 140; const x = c.getContext('2d'); x.fillStyle = PAL.crema; x.fillRect(0, 0, 1400, 140);
  banda(x, 'greca', 10, 8, 1380, PAL.verde); banda(x, 'rombos', 10, 100, 1380, PAL.amarillo); x.fillStyle = PAL.rojo; x.fillRect(0, 0, 1400, 5); x.fillRect(0, 135, 1400, 5);
  const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace; tex.anisotropy = 8;
  const camino = new T.Mesh(new T.PlaneGeometry(L - .3, .5), new T.MeshStandardMaterial({ map: tex, roughness: 1 })); camino.rotation.x = -Math.PI / 2; camino.position.y = TOPE + .002; camino.receiveShadow = true; g.add(camino);
  scene.add(g); for (let x0 = -2.4; x0 <= 2.41; x0 += 1.2) addCirculo(x0, 0, .75);
}
/** Estación sobre la mesa: baldosa numerada de color al frente y marcador a la misma altura que las demás. */
function paso(scene, i) {
  const g = new T.Group(); g.position.set(X(i), TOPE, 0); scene.add(g);
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  for (const [r, col] of [[62, PAL.tierra], [56, PAL.crema], [48, COLORES[i]]]) { x.fillStyle = col; x.beginPath(); x.arc(64, 64, r, 0, 7); x.fill(); }
  x.fillStyle = PAL.crema; x.font = '700 58px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(i + 1, 64, 68);
  const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace;
  const tile = new T.Mesh(new T.CircleGeometry(.13, 32), new T.MeshBasicMaterial({ map: tex, transparent: true })); tile.rotation.x = -Math.PI / 2; tile.position.set(0, .006, .36); g.add(tile);
  addHotspot(g, { receta: i, etiqueta: NOMBRES[i] }, [0, 1.1, 0]);
  return g;
}
function texLlama() {
  const c = document.createElement('canvas'); c.width = 128; c.height = 192; const x = c.getContext('2d'), g = x.createRadialGradient(64, 150, 6, 64, 120, 86);
  g.addColorStop(0, 'rgba(255,245,180,1)'); g.addColorStop(.4, 'rgba(255,160,40,.9)'); g.addColorStop(1, 'rgba(255,60,0,0)');
  x.fillStyle = g; x.beginPath(); x.moveTo(64, 4); x.bezierCurveTo(112, 70, 122, 124, 64, 188); x.bezierCurveTo(6, 124, 16, 70, 64, 4); x.fill(); return new T.CanvasTexture(c);
}
function texVapor() {
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 2, 32, 32, 30);
  g.addColorStop(0, 'rgba(255,255,255,.7)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new T.CanvasTexture(c);
}
/** Paso 3: hornilla de barro con brasas, olla, llamas pequeñas y vapor. */
function hornilla(scene) {
  const g = paso(scene, 2), it = new T.Group(); it.scale.setScalar(.78); g.add(it);
  it.add(lathe([[0, 0], [.26, 0], [.34, .12], [.31, .32], [.37, .36], [.37, .42], [.31, .42], [.28, .34], [0, .34]], std(0x8a4a2c, { roughness: .9, side: T.DoubleSide })));
  const brasas = new T.Mesh(new T.CircleGeometry(.24, 24), new T.MeshBasicMaterial({ color: 0xff6a1a })); brasas.rotation.x = -Math.PI / 2; brasas.position.y = .345; it.add(brasas);
  const olla = lathe([[0, 0], [.2, 0], [.38, .18], [.46, .42], [.38, .62], [.3, .7], [.34, .76], [.27, .78]], std(0xa0482a, { roughness: .7, side: T.DoubleSide })); olla.position.y = .38; it.add(olla);
  const mk = (tex, add) => { const s = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: add ? T.AdditiveBlending : T.NormalBlending })); it.add(s); return s; };
  const lt = texLlama(), vt = texVapor(), pos = [[-.3, .5, .12], [0, .46, .32], [.3, .5, .12]];
  const llamas = pos.map((p) => { const s = mk(lt, true); s.position.set(...p); return s; }), vapor = [0, 1, 2].map(() => mk(vt, false));
  return (t) => {
    llamas.forEach((s, i) => s.scale.set(.3 * (1 + .1 * Math.sin(t * 11 + i)), .42 * (1 + .18 * Math.sin(t * 9 + i * 2) + .1 * Math.sin(t * 17 + i)), 1));
    vapor.forEach((s, i) => { const k = (t * .35 + i / 3) % 1; s.position.set(Math.sin(k * 6 + i) * .12, 1.25 + k * .8, 0); s.material.opacity = .45 * Math.sin(Math.PI * k); s.scale.setScalar(.4 + k * .6); });
  };
}
/** Mesa larga con los 6 pasos de la chicha: cuescos, pilón, olla en hornilla, panela, colador y vasija. */
export async function buildProps(scene) {
  mesaLarga(scene);
  const clay = std(0xffffff, { map: procedural({ base: '#b5532a', speck: 120 }) });
  const poner = (g, o, s = 1) => { o.scale.setScalar(s); g.add(o); return o; };

  // 1 · cuescos en una bandeja de barro
  const e1 = paso(scene, 0), cuescos = (await loadModel(ASSETS.models.cuescos)) || (() => {
    const g = new T.Group(), tray = new T.Mesh(new T.CylinderGeometry(.5, .4, .12, 24), clay); tray.position.y = .06; g.add(tray);
    for (let i = 0; i < 18; i++) { const f = new T.Mesh(new T.SphereGeometry(.13, 12, 10), std(0xf08a1a, { roughness: .45 })); const a = i * 2.4, r = .06 + (i % 5) * .07; f.position.set(Math.cos(a) * r, .17 + (i > 11 ? .12 : 0), Math.sin(a) * r); f.castShadow = true; g.add(f); }
    return g;
  })();
  poner(e1, cuescos, .8);

  // 2 · pilón de madera con su mano
  const e2 = paso(scene, 1), mad = maderaMat(1, 1); mad.side = T.DoubleSide; const pil = new T.Group();
  pil.add(lathe([[0, 0], [.26, 0], [.34, .15], [.31, .55], [.23, .6], [.2, .48], [0, .45]], mad));
  const maja = new T.Mesh(new T.CylinderGeometry(.05, .07, .95, 8), maderaMat(.3, 1)); maja.position.set(.08, .85, 0); maja.rotation.z = -.25; maja.castShadow = true; pil.add(maja); poner(e2, pil, .75);

  // 4 · panela sobre una tabla
  const e4 = paso(scene, 3), panela = (await loadModel(ASSETS.models.panela)) || (() => {
    const g = new T.Group(), tabla = new T.Mesh(new T.BoxGeometry(.7, .05, .45), maderaMat(.7, .45)); tabla.position.y = .025; g.add(tabla);
    for (let i = 0; i < 4; i++) { const b = new T.Mesh(new T.BoxGeometry(.3, .14, .2), std(0x6b3a12, { roughness: .6 })); b.position.set((i % 2 - .5) * .32, .12 + (i > 1 ? .14 : 0), (i > 1 ? .02 : 0)); b.rotation.y = i * .25 - .3; b.castShadow = true; g.add(b); }
    return g;
  })();
  poner(e4, panela, .85);

  // 5 · colador de lienzo sobre un trípode y una vasija
  const e5 = paso(scene, 4), col = new T.Group();
  for (let i = 0; i < 3; i++) { const a = i * 2.094, p = new T.Mesh(new T.CylinderGeometry(.025, .03, .85, 6), maderaMat(.2, 1)); p.position.set(Math.sin(a) * .3, .42, Math.cos(a) * .3); p.rotation.set(Math.cos(a) * .06, 0, -Math.sin(a) * .06); p.castShadow = true; col.add(p); }
  const aro = new T.Mesh(new T.TorusGeometry(.3, .025, 6, 24), maderaMat(.6, .1)); aro.rotation.x = Math.PI / 2; aro.position.y = .84; col.add(aro);
  const tela = new T.Mesh(new T.ConeGeometry(.3, .42, 16, 1, true), std(0xf0e6d0, { roughness: 1, side: T.DoubleSide })); tela.rotation.x = Math.PI; tela.position.y = .63; col.add(tela);
  const taza = lathe([[0, 0], [.14, 0], [.26, .1], [.3, .22], [.27, .24]], std(0xa0482a, { roughness: .7, side: T.DoubleSide })); taza.position.y = .14; col.add(taza); poner(e5, col, .78);

  // 6 · vasija (jarra.glb: se descarta su pose guardada y se endereza; su eje vertical es Z)
  const e6 = paso(scene, 5), raw = await loadModel(ASSETS.models.vasija);
  const vasija = raw ? ajustar(raw, { alto: .85, rotX: -Math.PI / 2, limpiar: true }) : (() => {
    const m = lathe([[0, 0], [.38, 0], [.6, .25], [.68, .55], [.55, .85], [.4, .98], [.45, 1.08], [.38, 1.1]], clay, 32); m.material.side = T.DoubleSide; m.scale.setScalar(.7); const w = new T.Group(); w.add(m); return w;
  })();
  e6.add(vasija);

  return hornilla(scene);
}
