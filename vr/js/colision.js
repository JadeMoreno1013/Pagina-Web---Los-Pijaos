/** Colisiones simples en el plano: círculos (casas, palmas, árboles, mesa), muro del Bohío y límite del área. */
export const circulos = [];
export const AREA = 36, BOHIO = { r: 9.4, gap: .45 };
export const addCirculo = (x, z, r) => circulos.push({ x, z, r });
/** Devuelve la posición [x, z] corregida para que el jugador no atraviese nada. */
export function resolver(x, z) {
  const d0 = Math.hypot(x, z); if (d0 > AREA) { x *= AREA / d0; z *= AREA / d0; }
  for (const c of circulos) {
    const dx = x - c.x, dz = z - c.z, d = Math.hypot(dx, dz), m = c.r + .4;
    if (d < m && d > 1e-4) { x = c.x + dx / d * m; z = c.z + dz / d * m; }
  }
  const r = Math.hypot(x, z); // muro circular del Bohío; la entrada (frente, +z) queda abierta
  if (r > BOHIO.r - .5 && r < BOHIO.r + .5 && Math.abs(Math.atan2(x, z)) > BOHIO.gap + .1) {
    const t = r < BOHIO.r ? BOHIO.r - .5 : BOHIO.r + .5; x *= t / r; z *= t / r;
  }
  return [x, z];
}
