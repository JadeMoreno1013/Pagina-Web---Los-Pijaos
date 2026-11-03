import { STATIONS, PASOS, INGREDIENTES, LINKS, ASSETS } from './config.js';
import { ICONOS } from './iconos.js';
const $ = (id) => document.getElementById(id);

export function initUI({ onGo, root = document }) {
  let cur = 0, min = false;
  const plegar = (m) => { min = m; $('card').classList.toggle('min', m); $('plegar').textContent = m ? '＋' : '–'; $('plegar').setAttribute('aria-label', m ? 'Mostrar texto' : 'Ocultar texto'); };
  $('plegar').onclick = () => plegar(!min);
  root.addEventListener('keydown', (e) => { if (e.key === 'h' || e.key === 'H') plegar(!min); });
  STATIONS.forEach((_, i) => { const b = document.createElement('button'); b.className = 'd'; b.textContent = ['I', 'II', 'III'][i]; b.onclick = () => onGo(i); $('dots').append(b); });
  $('prev').onclick = () => onGo((cur + STATIONS.length - 1) % STATIONS.length);
  $('next').onclick = () => onGo((cur + 1) % STATIONS.length);
  $('cerrar').onclick = cerrar; $('modal').onclick = (e) => e.target.id === 'modal' && cerrar();
  root.addEventListener('keydown', (e) => {
    if (!$('modal').hidden) { // con una ficha abierta: Esc solo la cierra (sin salir de pantalla completa) y las flechas no cambian de estación
      if (e.key === 'Escape') { cerrar(); e.stopPropagation(); }
      return;
    }
    if (e.key === 'ArrowRight') { e.preventDefault(); $('next').click(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); $('prev').click(); }
  });
  $('narrar').onclick = () => { try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(`${$('titulo').textContent}. ${$('texto').innerText}`); u.lang = 'es-CO'; speechSynthesis.speak(u); } catch { /* sin voz disponible */ } };
  return {
    /** Ficha en el cuadro inferior (p. ej. la palma), con botón para volver a la estación. */
    ficha({ tag, titulo, html }, onVolver) { plegar(false); $('tag').textContent = tag; $('titulo').textContent = titulo; $('texto').innerHTML = `${html}<button id="volver">↩ Volver al recorrido</button>`; $('volver').onclick = onVolver; },
    show(i) {
      cur = i; const s = STATIONS[i];
      $('tag').textContent = `${i + 1} / ${STATIONS.length}`; $('titulo').textContent = s.nombre; $('texto').innerHTML = s.html;
      [...$('dots').children].forEach((b, j) => b.classList.toggle('on', j === i));
    },
  };
}
function cerrar() { $('modal').hidden = true; }
function abrir(titulo, html, estilo = 'verde') {
  $('m-titulo').textContent = titulo; $('m-cuerpo').innerHTML = html; $('modal').querySelector('.box').className = `box e-${estilo}`; $('modal').hidden = false; $('modal').querySelector('.box').scrollTop = 0;
}
const chips = (a) => a?.length ? `<div class="chips">${a.map((c) => `<span>${c}</span>`).join('')}</div>` : '';

/** Ficha informativa: fotos grandes, párrafos cortos y datos clave en etiquetas. */
export function openInfo(d) {
  const fotos = (d.imgs || []).map((k) => `<img src="${ASSETS.images[k]}" alt="${d.titulo}" loading="lazy" onerror="this.remove()">`).join('');
  const txt = (Array.isArray(d.txt) ? d.txt : [d.txt]).map((p) => `<p>${p}</p>`).join('');
  const links = d.tipo === 'territorio' && LINKS.length ? '<p>' + LINKS.map((l) => `<a class="btn" href="${l.url}" target="_blank" rel="noopener">${l.texto}</a>`).join('') + '</p>' : '';
  const fuentes = d.fuentes?.length ? `<p class="fuentes">Fuentes: ${d.fuentes.join(' · ')}</p>` : '';
  abrir(d.titulo, `${fotos ? `<div class="fotos n${d.imgs.length}">${fotos}</div>` : ''}${txt}${chips(d.datos)}${links}${fuentes}`, d.estilo);
}
/** Receta guiada: foto del fruto, ingredientes, barra de 6 pasos y una ilustración grande por paso. */
export function openReceta(n) {
  const draw = () => {
    const [titulo, detalle, resumen, datos, icono] = PASOS[n];
    const pasos = PASOS.map((p, i) => `<button class="dot${i === n ? ' on' : i < n ? ' hecho' : ''}" data-i="${i}" aria-label="Paso ${i + 1}: ${p[0]}">${i + 1}</button>`).join('<i></i>');
    abrir('Chicha de cuesco', `
      <div class="hero"><img src="${ASSETS.images.cuesco}" alt="Racimo de cuescos" onerror="this.remove()"><div><b>Ingredientes</b>${chips(INGREDIENTES)}</div></div>
      <div class="pasos">${pasos}</div>
      <div class="paso-grande"><div class="ico">${ICONOS[icono]}</div><div><span class="kicker">Paso ${n + 1} de ${PASOS.length}</span><h4>${titulo}</h4><p class="resumen">${resumen}</p><p>${detalle}</p>${chips(datos)}</div></div>
      <div class="acciones"><button id="rp"${n ? '' : ' disabled'}>◀ Anterior</button><button id="rn"${n < PASOS.length - 1 ? '' : ' disabled'}>Siguiente ▶</button></div>`, 'amarillo');
    document.querySelectorAll('.pasos .dot').forEach((b) => { b.onclick = () => { n = +b.dataset.i; draw(); }; });
    $('rp').onclick = () => { n--; draw(); }; $('rn').onclick = () => { n++; draw(); };
  };
  draw();
}
