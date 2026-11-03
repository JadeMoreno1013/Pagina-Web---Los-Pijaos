/** Ambiente en bucle con entrada suave, narración de bienvenida opcional y silenciar/activar. Se llama desde un clic para que el navegador permita el sonido. Si falta un archivo, no se rompe nada. */
export function startAudio({ ambiente, bienvenida }) {
  const amb = ambiente ? new Audio(ambiente) : null, voz = bienvenida ? new Audio(bienvenida) : null;
  let fade = null;
  if (amb) {
    amb.loop = true; amb.volume = 0;
    amb.play().then(() => { let v = 0; fade = setInterval(() => { v = Math.min(.35, v + .02); amb.volume = v; if (v >= .35) clearInterval(fade); }, 120); }).catch(() => {});
  }
  voz?.play().catch(() => {});
  const alVisibilidad = () => { if (!amb) return; if (document.hidden) amb.pause(); else if (!amb.muted) amb.play().catch(() => {}); };
  document.addEventListener('visibilitychange', alVisibilidad);
  return {
    /** Silencia o reactiva el sonido; devuelve true si queda sonando. */
    alternar() { const silencio = !(amb ?? voz)?.muted; [amb, voz].forEach((a) => { if (a) a.muted = silencio; }); return !silencio; },
    detener() { clearInterval(fade); document.removeEventListener('visibilitychange', alVisibilidad); [amb, voz].forEach((a) => a?.pause()); },
  };
}
