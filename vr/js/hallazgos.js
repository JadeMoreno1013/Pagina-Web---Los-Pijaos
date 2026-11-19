import * as T from 'three';
import { addHotspot } from './hotspots.js';
import { addCirculo, circulos, AREA, BOHIO } from './colision.js';
const std = (c, o = {}) => new T.MeshStandardMaterial({ color: c, roughness: .7, ...o });
const FUENTES = ['Manual de marca «Los Pïjaos»', 'Ministerio de Cultura, caracterización del pueblo Pijao'];
/** Tres hallazgos escondidos en el territorio: cada uno revela una parte de la historia que no está en las estaciones. */
const HALLAZGOS = [
  { id: 'oro', tx: 17, tz: 4, color: 0xd9a21b, extra: { metalness: 1, roughness: .25 }, forma: () => new T.OctahedronGeometry(.28, 0),
    titulo: 'Hallazgo 1 · El oro que habla', etiqueta: 'Hallazgo', estilo: 'amarillo',
    txt: ['La orfebrería de la cultura Tolima es una de las huellas más conocidas de este territorio: figuras de oro trabajadas con la técnica de la cera perdida.', 'El orfebre modelaba la pieza en cera, la cubría de arcilla, derretía la cera y vertía el oro en el molde vacío. Cada figura es única.'], datos: ['Cera perdida', 'Cultura Tolima', 'Oro'] },
  { id: 'piedra', tx: -17, tz: -8, color: 0x7a6f66, extra: { roughness: 1 }, forma: () => new T.DodecahedronGeometry(.3, 0),
    titulo: 'Hallazgo 2 · La piedra que guarda signos', etiqueta: 'Hallazgo', estilo: 'tierra', imgs: ['petroglifo'],
    txt: ['La piedra tallada hace parte del legado artístico del pueblo Pijao. Los petroglifos son signos grabados en rocas del territorio.', 'Son memoria sin palabras escritas: recuerdan que este pueblo ya habitaba y nombraba el paisaje mucho antes de la conquista.'], datos: ['Piedra tallada', 'Petroglifos', 'Memoria'] },
  { id: 'agua', tx: 5, tz: -21, color: 0x3aa6c9, extra: { roughness: .15, transparent: true, opacity: .85 }, forma: () => new T.TorusGeometry(.22, .06, 12, 28),
    titulo: 'Hallazgo 3 · Los espíritus del agua', etiqueta: 'Hallazgo', estilo: 'verde',
    txt: ['Los mohanes, autoridades espirituales del pueblo Pijao, fueron perseguidos. La tradición oral cuenta que se refugiaron en fuentes de agua salada y se convirtieron en espíritus protectores de las aguas.', 'Por eso hoy la defensa del agua es también una defensa de su espiritualidad.'], datos: ['Mohanes', 'Tradición oral', 'Protección del agua'] },
];
const hallados = new Set();
/** Busca un punto libre cerca de (tx, tz): lejos del Bohío, de la entrada y de los carteles, y sin pisar casas, palmas ni árboles. */
function libre(tx, tz) {
  for (let k = 0; k < 400; k++) {
    const r = .9 * Math.sqrt(k), a = k * 2.39996, x = tx + r * Math.cos(a), z = tz + r * Math.sin(a), d = Math.hypot(x, z);
    if (d < BOHIO.r + 2 || d > AREA - 3 || (z > 7 && Math.abs(x) < 8)) continue;
    if (circulos.every((c) => Math.hypot(x - c.x, z - c.z) > c.r + 1.4)) return [x, z];
  }
  return [tx, tz];
}
export function buildHallazgos(scene) {
  for (const h of HALLAZGOS) {
    [h.x, h.z] = libre(h.tx, h.tz);
    const g = new T.Group(); g.position.set(h.x, 0, h.z);
    const base = new T.Mesh(new T.CylinderGeometry(.32, .4, .55, 16), std(0x6b5a48, { roughness: 1 })); base.position.y = .275; base.castShadow = base.receiveShadow = true; g.add(base);
    const obj = new T.Mesh(h.forma(), std(h.color, h.extra)); obj.position.y = .9; obj.castShadow = true; obj.userData.girar = true; g.add(obj);
    scene.add(g); addCirculo(h.x, h.z, .45);
    addHotspot(g, { ...h, tipo: 'info', fuentes: FUENTES, hallazgo: h.id }, [0, 1.5, 0]);
    g.userData.obj = obj; HALLAZGOS.mesh = (HALLAZGOS.mesh || []).concat(obj);
  }
  return (t) => HALLAZGOS.mesh.forEach((o, i) => { o.rotation.y = t * .8 + i; o.position.y = .9 + Math.sin(t * 2 + i) * .04; });
}
/** Registra el hallazgo y devuelve el aviso para el jugador. */
export function registrar(d) {
  if (!d.hallazgo) return null; hallados.add(d.hallazgo);
  return hallados.size === HALLAZGOS.length ? '¡Completaste los 3 hallazgos! Ahora conoces el oro, la piedra y el agua del pueblo Pijao.' : `Hallazgos: ${hallados.size} de ${HALLAZGOS.length}`;
}
