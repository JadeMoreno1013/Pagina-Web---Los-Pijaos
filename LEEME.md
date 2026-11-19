# Los Pïjaos · Grupo 6 (Framelab)

## Cómo abrirlo
El recorrido 3D usa módulos ES: **no funciona con doble clic** (`file://`). Opciones:
- Local: en esta carpeta, `python3 -m http.server 8000` y abrir http://localhost:8000
- Publicado: subir la carpeta a GitHub Pages / Netlify (HTTPS, necesario para WebXR).
Requiere internet (Three.js desde jsDelivr y tipografías de Google Fonts).

## Visor VR (WebXR)
Con un visor compatible (p. ej. Meta Quest, navegador del visor, HTTPS): botón «Entrar en VR».
Gatillo = tocar marcadores · palanca izq. = caminar · palanca der. = giro por pasos · agarre = siguiente estación.
Los textos se muestran en un panel flotante dentro del visor. Añade `?fps` a la URL de virtual-reality.html para ver los FPS.

## Antes de entregar
1. Cambiar `https://lospijaos.example` por la URL real: `sed -i 's#https://lospijaos.example#https://TU-URL#g' *.html`
2. Probar en visor real y medir FPS (`?fps`); anotar el resultado para la sustentación.
3. Revisar que el arquetipo y la paleta coincidan con el manual de marca (Cinzel Decorative, Cormorant Garamond, Montserrat; #d81828, #f39f07, #0c8c38).

## Uso de IA
Declarado en el pie de página (CSS y lógica JavaScript).
