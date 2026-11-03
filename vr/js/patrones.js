/** Motivos de la marca (greca, rombos, zigzag, triángulos, sol en espiral) para dibujar en canvas. */
export const PAL = { verde: '#0c8c38', verdeOsc: '#075a25', rojo: '#d81828', amarillo: '#f39f07', crema: '#f0e6d0', tierra: '#2b1d12' };
/** Estilos de señal: color de fondo, color de los motivos y tipo de banda decorativa. */
export const ESTILOS = {
  verde: { fondo: PAL.verde, acento: PAL.amarillo, patron: 'greca' },
  rojo: { fondo: PAL.rojo, acento: PAL.crema, patron: 'triangulos' },
  amarillo: { fondo: PAL.amarillo, acento: PAL.verdeOsc, patron: 'rombos' },
  tierra: { fondo: PAL.tierra, acento: PAL.amarillo, patron: 'zigzag' },
};
export function zigzag(c, x, y, w, color, h = 16) { c.strokeStyle = color; c.lineWidth = 6; c.beginPath(); for (let i = 0, p = x; p <= x + w; i++, p += h) c.lineTo(p, y + (i % 2 ? 0 : h)); c.stroke(); }
export function triangulos(c, x, y, w, color, h = 24) { c.fillStyle = color; for (let p = x; p < x + w; p += h * 1.4) { c.beginPath(); c.moveTo(p, y + h); c.lineTo(p + h * .7, y); c.lineTo(p + h * 1.4, y + h); c.fill(); } }
export function rombos(c, x, y, w, color, h = 26) { c.fillStyle = color; for (let p = x; p < x + w; p += h * 1.2) { c.beginPath(); c.moveTo(p + h / 2, y); c.lineTo(p + h, y + h / 2); c.lineTo(p + h / 2, y + h); c.lineTo(p, y + h / 2); c.closePath(); c.fill(); } }
export function greca(c, x, y, w, color, h = 26) { c.strokeStyle = color; c.lineWidth = 5; c.beginPath(); for (let p = x; p + h * 2 <= x + w; p += h * 2) { c.moveTo(p, y + h); c.lineTo(p, y); c.lineTo(p + h, y); c.lineTo(p + h, y + h * .6); c.lineTo(p + h * .4, y + h * .6); c.lineTo(p + h * .4, y + h * .3); } c.stroke(); }
export const banda = (c, tipo, x, y, w, color) => ({ greca, triangulos, rombos, zigzag })[tipo](c, x, y, w, color);
/** Sol con rayos y espiral central, como los íconos de la paleta del manual. */
export function sol(c, cx, cy, r, color, centro = PAL.crema) {
  c.fillStyle = color; c.beginPath();
  for (let i = 0; i < 32; i++) { const a = i / 32 * Math.PI * 2, rr = i % 2 ? r : r * .72; c.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } c.fill();
  c.fillStyle = centro; c.beginPath(); c.arc(cx, cy, r * .5, 0, 7); c.fill();
  c.strokeStyle = color; c.lineWidth = Math.max(3, r * .09); c.beginPath(); for (let a = 0; a < 11; a += .2) c.lineTo(cx + Math.cos(a) * a * r * .04, cy + Math.sin(a) * a * r * .04); c.stroke();
}
export function fondoPatron(c, W, H, fondo, color) {
  c.fillStyle = fondo; c.fillRect(0, 0, W, H); c.globalAlpha = .18;
  for (let y = 40; y < H; y += 80) for (let x = (y / 80 % 2) * 40; x < W; x += 80) rombos(c, x, y, 40, color, 30);
  c.globalAlpha = 1;
}
