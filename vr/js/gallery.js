import * as T from 'three';
import { ASSETS, CARTELES, GALERIA } from './config.js';
import { addHotspot } from './hotspots.js';
import { addCirculo } from './colision.js';
import { cargarImagen } from './loader.js';
import { maderaMat } from './materials.js';
import { PAL, ESTILOS, fondoPatron, banda, sol } from './patrones.js';
const marco = maderaMat(1, 1);

function titulo(c, texto, x, y, w, size) { // título en varias líneas, centrado verticalmente en y
  c.font = `700 ${size}px "Cinzel Decorative", serif`; c.textAlign = 'center'; const ls = []; let l = '';
  for (const p of texto.split(' ')) { const t = l ? `${l} ${p}` : p; if (c.measureText(t).width > w && l) { ls.push(l); l = p; } else l = t; } ls.push(l);
  ls.forEach((s, i) => c.fillText(s, x, y + (i - (ls.length - 1) / 2) * size * 1.2, w));
}
/** Señal 1024×640: fondo con patrón de la marca, bandas decorativas, panel crema, foto (si existe) y título grande. */
function rotulo(item) {
  const W = 1024, H = 640, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const c = cv.getContext('2d'), e = ESTILOS[item.estilo || 'verde'], tex = new T.CanvasTexture(cv); tex.colorSpace = T.SRGBColorSpace; tex.anisotropy = 8;
  let foto = null; const conFoto = !!item.imgs?.length, tx = conFoto ? 760 : W / 2, tw = conFoto ? 400 : W - 160;
  const dibujar = () => {
    fondoPatron(c, W, H, e.fondo, e.acento); banda(c, e.patron, 24, 20, W - 48, e.acento); banda(c, e.patron, 24, H - 48, W - 48, e.acento);
    c.fillStyle = PAL.crema; c.beginPath(); c.roundRect(40, 76, W - 80, H - 152, 26); c.fill(); c.strokeStyle = e.acento; c.lineWidth = 8; c.stroke();
    if (conFoto) {
      c.save(); c.beginPath(); c.roundRect(64, 100, 456, H - 200, 18); c.clip();
      if (foto) { const s = Math.max(456 / foto.width, (H - 200) / foto.height); c.drawImage(foto, 64 + (456 - foto.width * s) / 2, 100 + (H - 200 - foto.height * s) / 2, foto.width * s, foto.height * s); }
      else { c.fillStyle = e.fondo; c.fillRect(64, 100, 456, H - 200); sol(c, 292, 320, 110, e.acento); }
      c.restore(); c.strokeStyle = e.fondo; c.lineWidth = 6; c.beginPath(); c.roundRect(64, 100, 456, H - 200, 18); c.stroke();
    } else sol(c, W / 2, 205, 80, e.fondo);
    c.fillStyle = PAL.tierra; titulo(c, item.titulo, tx, conFoto ? 270 : 400, tw, conFoto ? 54 : 64);
    c.fillStyle = e.fondo === PAL.amarillo ? PAL.verdeOsc : e.fondo; c.font = '700 30px Montserrat, sans-serif'; c.textAlign = 'center'; c.fillText(item.cta || 'Toca para leer más', tx, H - 124, tw);
    tex.needsUpdate = true;
  };
  dibujar(); document.fonts?.ready.then(dibujar);
  if (conFoto) cargarImagen(ASSETS.images[item.imgs[0]]).then((i) => { foto = i; dibujar(); });
  return tex;
}
function frame(item, w = 2.6, h = 1.625) {
  const g = new T.Group(), back = new T.Mesh(new T.BoxGeometry(w + .24, h + .24, .12), marco); back.castShadow = true; g.add(back);
  const art = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: rotulo(item) })); art.position.z = .07; g.add(art);
  for (const s of [-1, 1]) { const leg = new T.Mesh(new T.BoxGeometry(.12, 1.1, .12), marco); leg.position.set(s * (w / 2 - .1), -h / 2 - .5, 0); g.add(leg); }
  addHotspot(g, item, [0, h / 2 + .55, 0]); return g;
}
export function buildGallery(scene) {
  GALERIA.forEach((item, i) => { // arco interior, lado opuesto a la entrada
    const a = (180 - (GALERIA.length - 1) * 11.5 + i * 23) * Math.PI / 180, f = frame(item);
    f.position.set(Math.sin(a) * 7, 1.9, Math.cos(a) * 7); f.lookAt(0, 1.9, 0); scene.add(f); addCirculo(f.position.x, f.position.z, .9);
  });
  CARTELES.forEach((item, i) => { // carteles del umbral
    const f = frame(item, 2.2, 1.375); f.position.set(i ? 3.4 : -3.4, 1.65, 12.5); f.lookAt(0, 1.65, 30); scene.add(f); addCirculo(f.position.x, f.position.z, .9);
  });
}
