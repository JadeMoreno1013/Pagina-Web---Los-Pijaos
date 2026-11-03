import * as T from 'three';
import { procedural } from './textures.js';
import { materialPBR } from './materials.js';
import { buildViviendas } from './viviendas.js';
import { buildPalmas } from './palmas.js';
import { buildVegetacion } from './vegetacion.js';
import { addCirculo } from './colision.js';
const mat = (c, o = {}) => new T.MeshStandardMaterial({ color: c, roughness: .9, ...o });
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const flat = (geo, m, y) => { const o = new T.Mesh(geo, m); o.rotation.x = -Math.PI / 2; o.position.y = y; o.receiveShadow = true; return o; };

export async function buildWorld(scene) {
  scene.add(flat(new T.CircleGeometry(95, 64), materialPBR('pasto', 190, 190, { respaldo: procedural({ base: '#3f8f45', speck: 120, repeat: [30, 30] }) }), 0)); // pasto PBR (Poliigon)
  const tierra = (w, h) => materialPBR('tierra', w, h, { respaldo: procedural({ base: '#a67c4e', speck: 140, repeat: [6, 6] }) });
  scene.add(flat(new T.CircleGeometry(15, 48), tierra(30, 30), .01));          // plaza de tierra alrededor del Bohío
  const camino = flat(new T.PlaneGeometry(4, 60), tierra(4, 60), .012); camino.position.z = 40; scene.add(camino); // camino de entrada
  await Promise.all([buildViviendas(scene), buildPalmas(scene)]);
  buildVegetacion(scene); // después de registrar casas y palmas, para no superponerse
}
