import { TextureLoader, SRGBColorSpace, Box3, Vector3, Group } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const gltf = new GLTFLoader(), tex = new TextureLoader();
/** Carga un .glb; devuelve null si no existe o está vacío (se usa el respaldo hecho con código). */
export const loadModel = (url) => url ? gltf.loadAsync(url).then((g) => { let n = 0; g.scene.traverse((o) => o.isMesh && n++); return n ? g.scene : null; }).catch(() => null) : Promise.resolve(null);
export const loadTexture = (url) => url ? tex.loadAsync(url).then((t) => ((t.colorSpace = SRGBColorSpace), t)).catch(() => null) : Promise.resolve(null);

/** Escala el modelo a `alto` metros, lo centra en X/Z y lo apoya en y = 0. `rotX` endereza modelos con eje Z hacia arriba. */
export function ajustar(obj, { alto = 1, rotX = 0, limpiar = false } = {}) {
  if (limpiar) obj.traverse((o) => { if (o !== obj) { o.position.set(0, 0, 0); o.quaternion.identity(); o.scale.set(1, 1, 1); } }); // descarta la pose guardada en el archivo (p. ej. de Sketchfab)
  const w = new Group(); w.add(obj); obj.rotation.x = rotX;
  const b = new Box3().setFromObject(w); obj.scale.multiplyScalar(alto / (b.max.y - b.min.y)); w.updateMatrixWorld(true);
  const c = new Box3().setFromObject(w), m = c.getCenter(new Vector3()); obj.position.set(-m.x, -c.min.y, -m.z);
  obj.traverse((o) => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });
  return w;
}

/** Imagen HTML (para dibujar en canvas); null si no existe. */
export const cargarImagen = (url) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = url; });
