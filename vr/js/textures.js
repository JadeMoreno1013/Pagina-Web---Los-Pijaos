import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';
/** Textura procedural (ruido + vetas) para dar realismo sin imágenes externas. */
export function procedural({ base = '#808080', speck = 60, stripes = 0, repeat = [1, 1], size = 256 } = {}) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const x = c.getContext('2d'); x.fillStyle = base; x.fillRect(0, 0, size, size);
  for (let i = 0; i < size * size / 6; i++) {
    x.fillStyle = `rgba(${Math.random() < .5 ? '0,0,0' : '255,255,255'},${Math.random() * speck / 500})`;
    x.fillRect(Math.random() * size, Math.random() * size, 2, 2);
  }
  for (let i = 0; i < stripes; i++) { x.fillStyle = `rgba(0,0,0,${.08 + Math.random() * .12})`; x.fillRect(Math.random() * size, 0, 1 + Math.random() * 2, size); }
  const t = new CanvasTexture(c); t.wrapS = t.wrapT = RepeatWrapping; t.repeat.set(...repeat); t.colorSpace = SRGBColorSpace; t.anisotropy = 4;
  return t;
}

const wrap = (c, repeat) => { const t = new CanvasTexture(c); t.wrapS = t.wrapT = RepeatWrapping; t.repeat.set(...repeat); t.colorSpace = SRGBColorSpace; t.anisotropy = 4; return t; };
const canvas = (s = 256) => { const c = document.createElement('canvas'); c.width = c.height = s; return [c, c.getContext('2d'), s]; };

/** Pared de bahareque: revoque de barro con parches que dejan ver el entramado de guadua. */
export function bahareque(repeat = [2, 1]) {
  const [c, x, s] = canvas(); x.fillStyle = '#b98a5b'; x.fillRect(0, 0, s, s);
  for (let i = 0; i < 2500; i++) { x.fillStyle = `rgba(${Math.random() < .5 ? '60,35,15' : '255,235,200'},${Math.random() * .12})`; x.fillRect(Math.random() * s, Math.random() * s, 3, 3); }
  for (const [px, py, w, h] of [[24, 200, 46, 26]]) {
    x.fillStyle = '#7d5128'; x.fillRect(px, py, w, h); x.strokeStyle = '#4a2c12'; x.lineWidth = 5;
    for (let i = 0; i < h; i += 14) { x.beginPath(); x.moveTo(px, py + i); x.lineTo(px + w, py + i); x.stroke(); }
    for (let i = 0; i < w; i += 22) { x.beginPath(); x.moveTo(px + i, py); x.lineTo(px + i, py + h); x.stroke(); }
  }
  return wrap(c, repeat);
}
/** Lámina de zinc acanalado con algo de óxido. */
export function zinc(repeat = [3, 3]) {
  const [c, x, s] = canvas(); x.fillStyle = '#a3a9ae'; x.fillRect(0, 0, s, s);
  for (let i = 0; i < s; i += 16) { const g = x.createLinearGradient(i, 0, i + 16, 0); g.addColorStop(0, 'rgba(255,255,255,.35)'); g.addColorStop(.5, 'rgba(0,0,0,.2)'); g.addColorStop(1, 'rgba(255,255,255,.35)'); x.fillStyle = g; x.fillRect(i, 0, 16, s); }
  for (let i = 0; i < 6; i++) { x.fillStyle = 'rgba(120,60,20,.18)'; x.beginPath(); x.ellipse(Math.random() * s, Math.random() * s, 20 + Math.random() * 30, 10 + Math.random() * 20, 0, 0, 6.3); x.fill(); }
  return wrap(c, repeat);
}

/** Paja de palma: fibras largas en tonos grises y pardos, con capas de manojos. */
export function paja(repeat = [44, 4]) {
  const [c, x, s] = canvas(512); x.fillStyle = '#7b6849'; x.fillRect(0, 0, s, s);
  const tones = ['#a18c66', '#5b4a31', '#8d7852', '#3f3322'];
  for (let i = 0; i < 3500; i++) {
    const px = Math.random() * s, py = Math.random() * s, l = 40 + Math.random() * 120;
    x.strokeStyle = tones[Math.random() * 4 | 0]; x.globalAlpha = .25 + Math.random() * .5; x.lineWidth = 1 + Math.random() * 1.5;
    x.beginPath(); x.moveTo(px, py); x.lineTo(px + (Math.random() - .5) * 6, py + l); x.stroke();
  }
  x.globalAlpha = 1;
  for (let y = 0; y < s; y += 64) { const g = x.createLinearGradient(0, y, 0, y + 14); g.addColorStop(0, 'rgba(0,0,0,.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, y, s, 14); }
  return wrap(c, repeat);
}
/** Ladrillo a soga con mortero (una baldosa = 2 ladrillos × 4 hiladas). */
export function ladrillo(repeat = [100, 2.75]) {
  const [c, x] = canvas(); x.fillStyle = '#b9b3a6'; x.fillRect(0, 0, 256, 256);
  for (let r = 0; r < 4; r++) for (let i = -1; i < 3; i++) { x.fillStyle = `hsl(${14 + Math.random() * 10},${50 + Math.random() * 15}%,${42 + Math.random() * 12}%)`; x.fillRect(i * 128 + (r % 2 ? 64 : 0) + 4, r * 64 + 6, 120, 52); }
  return wrap(c, repeat);
}

/** Estípite liso y gris claro (Attalea): anillos muy tenues, vetas verticales y algo de liquen. */
export function tronco(repeat = [1, 12]) {
  const [c, x, s] = canvas(); x.fillStyle = '#b3aa97'; x.fillRect(0, 0, s, s);
  for (let i = 0; i < 400; i++) { x.fillStyle = `rgba(${Math.random() < .5 ? '90,80,65' : '235,230,215'},${Math.random() * .18})`; x.fillRect(Math.random() * s, Math.random() * s, 1 + Math.random() * 2, 20 + Math.random() * 60); }
  for (let y = 0; y < s; y += 32) { x.fillStyle = 'rgba(80,70,55,.16)'; x.fillRect(0, y + Math.random() * 4, s, 2); }
  for (let i = 0; i < 6; i++) { x.fillStyle = 'rgba(110,130,80,.12)'; x.beginPath(); x.ellipse(Math.random() * s, Math.random() * s, 20 + Math.random() * 30, 8 + Math.random() * 20, 0, 0, 6.3); x.fill(); }
  return wrap(c, repeat);
}
/** Pared encalada con chorreaduras y salpicaduras de tierra en la base. */
export function cal(repeat = [.5, .5]) {
  const [c, x, s] = canvas(); x.fillStyle = '#ece6d6'; x.fillRect(0, 0, s, s);
  for (let i = 0; i < 3000; i++) { x.fillStyle = `rgba(${Math.random() < .5 ? '120,100,70' : '255,255,250'},${Math.random() * .1})`; x.fillRect(Math.random() * s, Math.random() * s, 2 + Math.random() * 4, 2 + Math.random() * 4); }
  for (let i = 0; i < 10; i++) { const g = x.createLinearGradient(0, 0, 0, 90 + Math.random() * 100); g.addColorStop(0, 'rgba(120,100,70,.12)'); g.addColorStop(1, 'rgba(120,100,70,0)'); x.fillStyle = g; x.fillRect(Math.random() * s, 0, 6 + Math.random() * 14, s); }
  const g = x.createLinearGradient(0, s, 0, s - 70); g.addColorStop(0, 'rgba(110,80,50,.45)'); g.addColorStop(1, 'rgba(110,80,50,0)'); x.fillStyle = g; x.fillRect(0, s - 70, s, 70);
  return wrap(c, repeat);
}
/** Muro de piedra de río con mortero. */
export function piedra(repeat = [1.25, 1.25]) {
  const [c, x] = canvas(); x.fillStyle = '#a9a398'; x.fillRect(0, 0, 256, 256);
  for (let r = 0; r < 4; r++) for (let i = 0; i < 4; i++) { x.fillStyle = `hsl(${30 + Math.random() * 20},${5 + Math.random() * 10}%,${22 + Math.random() * 28}%)`; x.beginPath(); x.ellipse(i * 64 + (r % 2) * 32 + 32 + (Math.random() - .5) * 8, r * 64 + 32 + (Math.random() - .5) * 8, 28 + Math.random() * 3, 24 + Math.random() * 4, Math.random() * .5, 0, 6.3); x.fill(); }
  return wrap(c, repeat);
}
/** Celosía de madera en rombos para ventanas. */
export function celosia() {
  const [c, x, s] = canvas(); x.fillStyle = '#2a1a0d'; x.fillRect(0, 0, s, s); x.strokeStyle = '#b98a50'; x.lineWidth = 9;
  for (let i = -s; i < s * 2; i += 43) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + s, s); x.stroke(); x.beginPath(); x.moveTo(i, s); x.lineTo(i + s, 0); x.stroke(); }
  return wrap(c, [1, 1]);
}

/** Flecos de paja: hebras finas de largo irregular colgando de una franja continua (con transparencia). */
export function flecos() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128; const x = c.getContext('2d'), tonos = ['#8a7048', '#6b5636', '#a58b5f', '#4f4029'];
  for (let i = 0; i < 170; i++) { const px = Math.random() * 512, l = 40 + Math.random() * 86, w = 1.5 + Math.random() * 2.5; x.fillStyle = tonos[Math.random() * 4 | 0]; x.beginPath(); x.moveTo(px - w, 0); x.lineTo(px + w, 0); x.lineTo(px + (Math.random() - .5) * 8, l); x.fill(); }
  x.fillStyle = '#6b5636'; x.fillRect(0, 0, 512, 14);
  const t = new CanvasTexture(c); t.wrapS = RepeatWrapping; t.colorSpace = SRGBColorSpace; t.anisotropy = 4; return t;
}
/** Follaje: cientos de hojas pequeñas en verdes variados sobre fondo oscuro. */
export function follaje(repeat = [4, 4]) {
  const [c, x, s] = canvas(); x.fillStyle = '#245f2a'; x.fillRect(0, 0, s, s);
  for (let i = 0; i < 1000; i++) { const l = 7 + Math.random() * 12; x.fillStyle = `rgba(${30 + Math.random() * 60 | 0},${95 + Math.random() * 100 | 0},${30 + Math.random() * 45 | 0},.9)`; x.beginPath(); x.ellipse(Math.random() * s, Math.random() * s, l, l * .38, Math.random() * 6.3, 0, 6.3); x.fill(); }
  for (let i = 0; i < 120; i++) { x.fillStyle = 'rgba(10,40,15,.3)'; x.fillRect(Math.random() * s, Math.random() * s, 3, 3); }
  return wrap(c, repeat);
}
/** Corteza de árbol de hoja ancha: surcos verticales oscuros y crestas claras. */
export function corteza(repeat = [1, 3]) {
  const [c, x, s] = canvas(); x.fillStyle = '#5e4631'; x.fillRect(0, 0, s, s); x.lineCap = 'round';
  for (let i = 0; i < 70; i++) { let px = Math.random() * s; x.strokeStyle = Math.random() < .6 ? 'rgba(30,20,10,.5)' : 'rgba(160,130,95,.28)'; x.lineWidth = 2 + Math.random() * 4; x.beginPath(); x.moveTo(px, 0); for (let y = 0; y <= s; y += 32) { px += (Math.random() - .5) * 8; x.lineTo(px, y); } x.stroke(); }
  return wrap(c, repeat);
}
/** Culmo de guadua: verde amarillento con nudos marcados. */
export function guadua(repeat = [1, 8]) {
  const [c, x, s] = canvas(); x.fillStyle = '#8aa63a'; x.fillRect(0, 0, s, s);
  for (let y = 0; y < s; y += 64) { x.fillStyle = 'rgba(55,65,20,.75)'; x.fillRect(0, y, s, 7); x.fillStyle = 'rgba(210,225,130,.35)'; x.fillRect(0, y + 8, s, 4); }
  return wrap(c, repeat);
}

/** Máscara de hojas (blanco sobre negro) para tarjetas de follaje con transparencia. */
export function cumuloHojas() {
  const [c, x, s] = canvas(); x.fillStyle = '#000'; x.fillRect(0, 0, s, s); x.fillStyle = '#fff';
  for (let i = 0; i < 46; i++) { const a = Math.random() * 6.283, r = Math.pow(Math.random(), .6) * 100, l = 20 + Math.random() * 26; x.beginPath(); x.ellipse(128 + Math.cos(a) * r, 128 + Math.sin(a) * r, l, l * .4, a + (Math.random() - .5), 0, 6.3); x.fill(); }
  const t = new CanvasTexture(c); t.anisotropy = 4; return t;
}
