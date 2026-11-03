import * as T from 'three';
import { cargarSkybox } from './sky.js';

/** Renderer, cámara y luces dentro del contenedor `root` (el escenario de la página); se adapta al tamaño del contenedor. */
export function createScene(root) {
  const renderer = new T.WebGLRenderer({ antialias: true }); // lanza error si el navegador no tiene WebGL
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  root.prepend(renderer.domElement);
  const scene = new T.Scene(), sky = new T.Color(0xf3dca0);
  scene.background = sky; scene.fog = new T.Fog(sky, 35, 120); cargarSkybox(scene);
  const camera = new T.PerspectiveCamera(65, 1, .1, 200);
  camera.rotation.order = 'YXZ'; camera.position.set(0, 1.7, 19);
  scene.add(new T.HemisphereLight(0xfff1cf, 0x4a6b3a, 1.3));
  // El sol viene del lado de la entrada (+z), como el brillo del skybox, a ~36° de altura. Su caja de sombras sigue al jugador.
  const SOL = new T.Vector3(.45, .8, 1).normalize().multiplyScalar(60), sun = new T.DirectionalLight(0xfff2d6, 2.4), mapa = matchMedia('(pointer:coarse)').matches ? 1024 : 2048;
  sun.castShadow = true; sun.shadow.mapSize.set(mapa, mapa); sun.shadow.bias = -.0004; sun.shadow.normalBias = .05;
  Object.assign(sun.shadow.camera, { left: -32, right: 32, top: 32, bottom: -32, near: 1, far: 140 }); sun.shadow.camera.updateProjectionMatrix();
  scene.add(sun, sun.target);
  const seguirSol = (p) => { const x = Math.round(p.x / 2) * 2, z = Math.round(p.z / 2) * 2; sun.target.position.set(x, 0, z); sun.position.set(x + SOL.x, SOL.y, z + SOL.z); }; // saltos de 2 m = múltiplo del texel: sin parpadeo
  seguirSol(camera.position);
  const resize = () => {
    const w = root.clientWidth || 1, h = root.clientHeight || 1;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(root); resize();
  return { renderer, scene, camera, seguirSol };
}
