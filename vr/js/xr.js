import * as T from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
import { resolver } from './colision.js';

/** Soporte WebXR (visor VR): láser en los mandos, gatillo = tocar, agarre = siguiente estación, palanca izq. = caminar, der. = giro por pasos. */
export function initXR({ renderer, scene, camera, controls, hits, activar, siguiente, mount }) {
  renderer.xr.enabled = true; renderer.xr.setFoveation?.(1);
  const dolly = new T.Group(), ray = new T.Raycaster(), rot = new T.Matrix4(), v = new T.Vector3(), f = new T.Vector3();
  let panel = null, girando = false;
  const linea = new T.BufferGeometry().setFromPoints([new T.Vector3(), new T.Vector3(0, 0, -6)]);
  for (const i of [0, 1]) {
    const c = renderer.xr.getController(i); c.add(new T.Line(linea, new T.LineBasicMaterial({ color: 0xf39f07 })));
    c.addEventListener('selectstart', () => seleccionar(c));
    c.addEventListener('squeezestart', () => { cerrar(); siguiente(); });
    dolly.add(c);
    const grip = renderer.xr.getControllerGrip(i); grip.add(new XRControllerModelFactory().createControllerModel(grip)); dolly.add(grip); // modelo real del mando
  }
  function seleccionar(c) {
    if (panel) return cerrar();
    rot.identity().extractRotation(c.matrixWorld); ray.ray.origin.setFromMatrixPosition(c.matrixWorld); ray.ray.direction.set(0, 0, -1).applyMatrix4(rot);
    const d = ray.intersectObjects(hits, false)[0]?.object.userData.data; if (d) activar(d);
  }
  /** Panel de texto flotante delante del usuario (el HTML no se ve dentro del visor). */
  function mostrar(titulo, texto) {
    cerrar();
    const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 640; const c = cv.getContext('2d');
    c.fillStyle = '#2b1a0e'; c.fillRect(0, 0, 1024, 640); c.strokeStyle = '#f39f07'; c.lineWidth = 10; c.strokeRect(5, 5, 1014, 630);
    c.fillStyle = '#f39f07'; c.font = '700 46px "Cormorant Garamond", Georgia, serif'; c.fillText(titulo, 40, 80, 944);
    c.fillStyle = '#f1e6d0'; c.font = '500 30px Montserrat, sans-serif';
    let y = 140, linea = '';
    for (const w of texto.replace(/\s+/g, ' ').trim().split(' ')) {
      if (c.measureText(linea + w).width > 940) { c.fillText(linea, 40, y); y += 40; linea = ''; if (y > 560) { linea = '…'; break; } }
      linea += w + ' ';
    }
    c.fillText(linea, 40, y); c.fillStyle = '#e8b86a'; c.font = '24px Montserrat, sans-serif'; c.fillText('Gatillo: cerrar · Agarre: siguiente estación', 40, 616);
    const tex = new T.CanvasTexture(cv); tex.colorSpace = T.SRGBColorSpace;
    panel = new T.Mesh(new T.PlaneGeometry(1.6, 1), new T.MeshBasicMaterial({ map: tex, side: T.DoubleSide }));
    camera.getWorldPosition(v); camera.getWorldDirection(f); f.y = 0; f.normalize();
    panel.position.copy(v).addScaledVector(f, 1.5); panel.position.y = v.y; panel.lookAt(v); scene.add(panel);
  }
  function cerrar() { if (!panel) return; scene.remove(panel); panel.material.map.dispose(); panel.material.dispose(); panel.geometry.dispose(); panel = null; }
  function irA(pos, look) { dolly.position.set(pos[0], 0, pos[2]); dolly.rotation.y = Math.atan2(-(look[0] - pos[0]), -(look[2] - pos[2])); }
  function update(dt) {
    for (const s of renderer.xr.getSession()?.inputSources ?? []) {
      const a = s.gamepad?.axes; if (!a) continue; const x = a[2] ?? 0, z = a[3] ?? 0;
      if (s.handedness === 'left' && Math.hypot(x, z) > .15) {
        camera.getWorldDirection(f); f.y = 0; f.normalize(); v.set(-f.z, 0, f.x);
        const k = 2.2 * dt, [nx, nz] = resolver(dolly.position.x + (f.x * -z + v.x * x) * k, dolly.position.z + (f.z * -z + v.z * x) * k); dolly.position.set(nx, 0, nz);
      }
      if (s.handedness === 'right') { if (Math.abs(x) > .7 && !girando) { girando = true; dolly.rotation.y -= Math.sign(x) * Math.PI / 6; } else if (Math.abs(x) < .3) girando = false; }
    }
  }
  renderer.xr.addEventListener('sessionstart', () => {
    const p = camera.position, yaw = camera.rotation.y; scene.add(dolly); dolly.position.set(p.x, 0, p.z); dolly.rotation.y = yaw;
    dolly.add(camera); camera.position.set(0, 0, 0); camera.rotation.set(0, 0, 0);
  });
  renderer.xr.addEventListener('sessionend', () => {
    const { x, z } = dolly.position, y = dolly.rotation.y; dolly.remove(camera); scene.remove(dolly); cerrar(); controls.place(x, z, y);
  });
  const boton = VRButton.createButton(renderer); boton.style.cssText = 'position:static;display:inline-block;margin:.5rem .75rem .5rem 0;padding:.6rem 1rem;width:auto;'; mount.prepend(boton);
  return { update, mostrar, irA, cerrar, get presentando() { return renderer.xr.isPresenting; } };
}
