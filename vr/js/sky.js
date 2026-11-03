import * as T from 'three';
import { BASE } from './config.js';
/** Skybox de 6 caras (assets/Skybox/px,nx,py,ny,pz,nz.png). La niebla toma el color promedio del horizonte. */
export function cargarSkybox(scene, ruta = `${BASE}Skybox/`) {
  new T.CubeTextureLoader().load(['px', 'nx', 'py', 'ny', 'pz', 'nz'].map((n) => `${ruta}${n}.png`), (cube) => {
    cube.colorSpace = T.SRGBColorSpace; scene.background = cube;
    const c = document.createElement('canvas'); c.width = c.height = 1; const x = c.getContext('2d'); let r = 0, g = 0, b = 0;
    for (const i of [0, 1, 4, 5]) { const im = cube.image[i]; x.drawImage(im, 0, im.height * .45, im.width, im.height * .1, 0, 0, 1, 1); const d = x.getImageData(0, 0, 1, 1).data; r += d[0]; g += d[1]; b += d[2]; }
    scene.fog.color.setRGB(r / 1020, g / 1020, b / 1020, T.SRGBColorSpace).lerp(new T.Color(0xf3e6c4), .25);
  }, undefined, () => {}); // si faltan los archivos se conserva el color de fondo
}
