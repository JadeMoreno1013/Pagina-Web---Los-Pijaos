import * as T from 'three';
import { TEXTURAS, BASE } from './config.js';
import { procedural } from './textures.js';
const loader = new T.TextureLoader();
const cargar = async (urls, srgb, rep) => { // prueba .jpg y luego .png
  for (const u of urls) {
    const t = await loader.loadAsync(u).catch(() => null);
    if (t) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(...rep); t.anisotropy = 8; if (srgb) t.colorSpace = T.SRGBColorSpace; return t; }
  }
  return null;
};
/**
 * Material PBR desde assets/textures/<nombre>/{color,normal,roughness}.jpg (el normal también puede ser .png).
 * ancho × alto = tamaño en metros de la superficie (con UV de 0 a 1); si la geometría ya tiene UV en metros, usar 1 × 1.
 * El mosaico usa TEXTURAS[nombre].tile (metros por repetición). Mientras carga, o si faltan archivos, se muestra `respaldo`;
 * si falta la carpeta `nombre` y se indicó `alterno`, se usa la de `alterno`.
 */
export function materialPBR(nombre, ancho, alto, { respaldo = null, alterno = null, ...opciones } = {}) {
  const mat = new T.MeshStandardMaterial({ map: respaldo, roughness: .9, ...opciones });
  const intentar = (n) => {
    const tile = TEXTURAS[n]?.tile ?? 1, rep = [ancho / tile, alto / tile], base = `${BASE}textures/${n}/`;
    return Promise.all([['color', true], ['normal', false], ['roughness', false]].map(([k, s]) => cargar([`${base}${k}.jpg`, `${base}${k}.png`], s, rep)));
  };
  intentar(nombre).then((r) => (r[0] || !alterno ? r : intentar(alterno))).then(([c, n, r]) => {
    if (!c) return; mat.map = c; mat.normalMap = n; mat.roughnessMap = r; mat.roughness = r ? 1 : .9; mat.needsUpdate = true;
  });
  return mat;
}
/** Madera PBR (assets/textures/madera) con respaldo procedural. */
export const maderaMat = (ancho = 1, alto = 1) => materialPBR('madera', ancho, alto, { respaldo: procedural({ base: '#4a2f18', stripes: 20, repeat: [1, 2] }), roughness: .9 });
