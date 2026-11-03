// Contenido y recursos. Todo texto proviene del Manual de Marca «Los Pïjaos» (Grupo 6).
export const BRAND = { verde: 0x0c8c38, rojo: 0xd81828, amarillo: 0xf39f07, crema: 0xf0e6d0, tierra: 0x2b1d12 };

// Carpeta de recursos, relativa a la página que muestra el recorrido (virtual-reality.html).
export const BASE = 'vr/assets/';

// Rutas a recursos reales. null = se usa la versión generada con código.
export const ASSETS = {
  models: { palma: null, bohio: null, vivienda: null, vasija: `${BASE}models/jarra.glb`, cuescos: null, panela: null }, // palma: se usa la palma hecha con código
  images: Object.fromEntries(['mapa', 'pintura', 'retrato', 'tejidos', 'petroglifo', 'minga', 'comunidad', 'incendio', 'cuesco', 'productos', 'plato', 'bohio', 'casa'].map((k) => [k, `${BASE}img/${k}.jpg`])),
  audio: { bienvenida: null, ambiente: `${BASE}audio/ambiente.mp3` }, // bienvenida: null hasta tener la narración
};

// Texturas PBR en assets/textures/<nombre>/{color,normal,roughness}.jpg. tile = metros que cubre una repetición (ajustar a ojo).
export const TEXTURAS = { pasto: { tile: 5 }, tierra: { tile: 4 }, ladrillo: { tile: 2 }, madera: { tile: 1.2 }, piso: { tile: 2 }, bahareque: { tile: 2 }, zinc: { tile: 1 }, follaje: { tile: .4 }, corteza: { tile: .5 }, cal: { tile: 2 }, piedra: { tile: .8 }, paja: { tile: 1.5 }, tronco: { tile: .5 } };

// Enlaces de la sección «Participar» (completar con los reales)
export const LINKS = [ /* { texto: 'Artesanías', url: 'https://…' } */ ];

// id = ancla de la URL (virtual-reality.html#bohio abre el recorrido en esa estación).
export const STATIONS = [
  { id: 'umbral', nombre: 'El Umbral del Territorio', cam: [0, 1.7, 19], look: [0, 2.2, 11],
    html: '<p>Estás en el Tolima Grande. Al fondo está el Bohío, rodeado de viviendas tradicionales de bahareque con techos de palma o zinc. Toca los carteles para conocer la historia y avanza.</p>' },
  { id: 'bohio', nombre: 'El Corazón del Bohío', cam: [0, 1.9, 4.3], look: [0, .85, 0],
    html: '<p>El Bohío es la casa ceremonial: punto de encuentro comunitario y espiritual. La chicha de cuesco es símbolo de identidad y soberanía alimentaria. Sigue los 6 pasos sobre la mesa, de izquierda a derecha: el último es la vasija.</p>' },
  { id: 'galeria', nombre: 'Galería de Resistencia', cam: [0, 1.7, -1], look: [0, 2, -7],
    html: '<p>Ilustraciones, cultura y cuidado del territorio. Toca cada marco para ver su historia.</p>' },
];

// Viviendas tradicionales alrededor del Bohío: a = ángulo (° desde la entrada), r = distancia (m).
export const VIVIENDAS = [
  { a: -135, r: 24, techo: 'palma', s: 1 }, { a: -95, r: 27, techo: 'palma', s: 1.1 }, { a: -55, r: 25, techo: 'zinc', s: .95 },
  { a: 55, r: 25, techo: 'palma', s: 1 }, { a: 95, r: 27, techo: 'zinc', s: 1.1 }, { a: 135, r: 24, techo: 'palma', s: .95 }, { a: 180, r: 23, techo: 'palma', s: 1.05 },
];

// Fuentes citadas en las fichas
const F = {
  manual: 'Manual de marca «Los Pïjaos» (Grupo 6)',
  mincultura: 'Ministerio de Cultura de Colombia, «Caracterización del pueblo Pijao» (con base en Oliveros, 2000, y el censo DANE 2005)',
  palma: 'Bernal, Galeano et al. (2010), Ethnobotany Research and Applications; Galeano y Olivares, «Palma de vino (Attalea butyracea)»',
  calarca: 'Ficha básica municipal de Calarcá (Gobernación del Quindío)',
};
// Carteles del umbral y señales de la galería. estilo: verde | rojo | amarillo | tierra (motivos del manual). imgs: claves de ASSETS.images.
export const CARTELES = [
  { titulo: 'Bienvenidos', tipo: 'cartel', estilo: 'verde', etiqueta: 'Leer cartel', cta: 'Toca para leer', imgs: ['bohio'],
    txt: ['Estás en el Tolima Grande, entre el valle del río Magdalena y las cordilleras del Tolima.', 'Este recorrido te invita a conocer la historia real del pueblo Pijao, más allá del estigma colonial.', 'Camina hasta el Bohío y sigue la galería: allí encontrarás su historia, su cultura, su gastronomía y cómo apoyar.'], fuentes: [F.manual] },
  { titulo: 'Resistencia Pijao', tipo: 'cartel', estilo: 'rojo', etiqueta: 'Leer cartel', cta: 'Toca para leer', imgs: ['minga'],
    txt: ['Los Pijao lideraron una de las defensas territoriales más prolongadas frente a la conquista española durante los siglos XVI y XVII, encabezada por caciques como Calarcá.', 'Hoy mantienen una lucha constante por la autonomía territorial, la dignidad y la protección del agua.'], fuentes: [F.manual, F.calarca] },
];
export const GALERIA = [
  { titulo: 'Un pueblo del Tolima', estilo: 'verde', etiqueta: 'Quiénes son', imgs: ['mapa', 'retrato'],
    txt: ['Los Pijao fueron una federación de grupos con rasgos culturales y lingüísticos en común, ligados sobre todo a los pueblos Coyaima y Natagaima.', 'Su territorio se extendía desde Ibagué hacia el sur: el valle del río Magdalena y gran parte de las cordilleras Oriental y Central.', 'Hoy habita en resguardos de municipios como Coyaima, Natagaima y Ortega.', 'En el censo DANE de 2005, 58.810 personas se reconocieron como Coyaima Natagaima (Pijao); 9 de cada 10 vivían en el Tolima. La lengua pijao se considera extinta: solo se conservan listas de vocabulario del siglo XX.'],
    datos: ['Federación de grupos', 'Valle del Magdalena', 'Coyaima · Natagaima · Ortega', '58.810 personas (DANE 2005)', 'Lengua extinta'], fuentes: [F.mincultura, F.manual] },
  { titulo: 'Historia y resistencia', estilo: 'rojo', etiqueta: 'Su historia', imgs: ['minga'],
    txt: ['El pueblo Pijao ofreció una férrea resistencia a los españoles: lucharon por el control de sus cacicazgos y del río Magdalena, y solo fueron vencidos tras casi un siglo de enfrentamientos. Caciques como Calarcá encabezaron la defensa.', 'Desde 1591 se aliaron con los Nasa para enfrentar a los colonizadores.', 'Los mohanes, sus autoridades espirituales, fueron perseguidos; la tradición oral cuenta que se refugiaron en fuentes de agua salada y se convirtieron en espíritus protectores de las aguas.', 'Después, sus tierras fueron reducidas y arrebatadas, primero por los españoles y luego por colonos. A mediados del siglo XX perdieron casi todas.'],
    datos: ['Siglos XVI–XVII: resistencia', '1591: alianza con los Nasa', 'Siglo XX: pérdida de tierras', 'Hoy: recuperación y reetnización'], fuentes: [F.mincultura, F.manual, F.calarca] },
  { titulo: 'Cosmovisión', estilo: 'amarillo', etiqueta: 'Espiritualidad', imgs: ['pintura', 'retrato'],
    txt: ['Su espiritualidad guarda una relación sagrada con los ríos, los nevados y las montañas. Mantienen prácticas ceremoniales e identitarias como la pintura corporal con pigmentos naturales, como el achiote.', 'En su cosmogonía el mundo tiene siete capas, que suelen resumirse en cuatro: el agua salada, base que sostiene el mundo, donde viven los gigantes de origen; el agua dulce, morada de los antepasados y los mohanes; la capa seca o tierra, con las entradas al mundo de origen; y la de la luz, la fuerza y el calor, con el Sol, las estrellas, el trueno y el arcoíris.', 'Un mito de origen cuenta que el pueblo actual son los indígenas que se quedaron en su tierra y fueron convertidos en piedras con alma de indio; la piedra se agrietó, brotaron los espíritus y volvieron a reunirse a recordar su historia.'],
    datos: ['Ríos', 'Nevados', 'Montañas', 'Pintura corporal', 'Achiote', 'Mohanes', 'Siete capas del mundo'], fuentes: [F.manual, F.mincultura] },
  { titulo: 'Arte y oficios', estilo: 'tierra', etiqueta: 'Arte y oficios', imgs: ['tejidos', 'petroglifo'],
    txt: ['Sobresalen por su legado en la alfarería, la cerámica y la orfebrería de la cultura Tolima.', 'Destacan el trabajo en oro mediante la técnica de cera perdida, la piedra tallada y los tejidos.'],
    datos: ['Alfarería', 'Cerámica', 'Orfebrería en oro', 'Cera perdida', 'Piedra tallada', 'Tejidos'], fuentes: [F.manual] },
  { titulo: 'La casa y el Bohío', estilo: 'verde', etiqueta: 'Casa y Bohío', imgs: ['bohio', 'casa'],
    txt: ['El Bohío es la casa ceremonial: punto de encuentro comunitario y espiritual.', 'La vivienda tradicional se levanta cerca de fuentes de agua y de huertas familiares. Tiene paredes de bahareque, planta rectangular y techo de palmicha a cuatro aguas.', 'Dos rasgos la distinguen de la casa campesina común: las vertientes largas del techo forman voladizos sobre las cortas y, casi siempre, se construye sobre una plataforma. Hoy el zinc va reemplazando a la palma.'],
    datos: ['Bohío: casa ceremonial', 'Bahareque', 'Techo a cuatro aguas', 'Palmicha', 'Voladizos', 'Sobre plataforma', 'Zinc (hoy)'], fuentes: [F.mincultura, 'Descripción del Bohío: planteamiento del proyecto «Los Pïjaos»'] },
  { titulo: 'Gastronomía y chicha', estilo: 'amarillo', etiqueta: 'La chicha', imgs: ['cuesco', 'productos', 'plato'],
    txt: ['La alimentación se basa en el maíz, la yuca y el plátano, con arroz, verduras, pescado y huevos.', 'La chicha es una bebida tradicional de gran importancia, que se comparte en los espacios colectivos.', 'La palma de cuesco (Attalea butyracea), llamada también palma de vino o palma real, es solitaria y sin espinas. En el Tolima, con la pulpa de sus frutos se prepara chicha a escala doméstica.', 'En su Plan de Vida, el pueblo Pijao compara el modo de relacionarse con el territorio con el de preparar la chicha, y propone recuperar así el equilibrio con la naturaleza.'],
    datos: ['Maíz', 'Yuca', 'Plátano', 'Chicha de cuesco', 'Plan de Vida'], fuentes: [F.mincultura, F.palma, F.manual] },
  { titulo: 'Cuidar el territorio', tipo: 'territorio', estilo: 'rojo', etiqueta: 'Cómo apoyar', imgs: ['incendio', 'comunidad'],
    txt: ['El despojo territorial y la pérdida del ecosistema continúan. Mantienen una lucha constante por la autonomía territorial, la dignidad y la protección del agua.', 'Su Plan de Vida propone reconstruir el Gran Resguardo Ortega y Chaparral, cuidar los recursos naturales y fortalecer sus autoridades propias y su gobierno.', 'Puedes apoyar comprando a artesanos, visitando restaurantes que preparan la gastronomía tradicional y participando en la protección del territorio y la comunidad.'],
    datos: ['Gran Resguardo Ortega y Chaparral', 'Protección del agua', 'Artesanías', 'Gastronomía tradicional'], fuentes: [F.manual, F.mincultura] },
];

export const INGREDIENTES = ['Cuescos maduros (fruto de palma)', 'Panela tradicional', 'Agua (la necesaria para cocción y extracción del jugo)'];
// [título, detalle del manual, resumen en una línea, datos clave, ícono]
export const PASOS = [
  ['Selección y pelado', 'Se escogen los cuescos más maduros y sanos y se retira la cáscara dura con una piedra o cuchillo para dejar la pulpa carnosa.', 'Escoge los cuescos más maduros y quítales la cáscara dura.', ['Piedra o cuchillo'], 'pelar'],
  ['Pilado y maceración', 'Los frutos se machacan con fuerza en un pilón de madera o mortero de piedra hasta obtener una pulpa suave.', 'Machaca la pulpa hasta que quede suave.', ['Pilón de madera o mortero de piedra'], 'pilon'],
  ['Cocinado a fuego lento', 'La pulpa se hierve con agua a fuego medio de 45 a 60 minutos, revolviendo hasta que se deshaga y espese el caldo.', 'Hierve la pulpa con agua, revolviendo, hasta que espese.', ['45 a 60 minutos', 'Fuego medio', 'Olla de barro o aluminio pesado'], 'olla'],
  ['Incorporación de la panela', 'Con el caldo aún caliente y fuera del fuego, se agrega la panela rallada o troceada hasta disolverla y dar un tono acaramelado.', 'Fuera del fuego, disuelve la panela en el caldo caliente.', ['Panela rallada o troceada'], 'panela'],
  ['Colado y cernido', 'Se pasa la mezcla por un colador de lienzo o cedazo tupido para separar la chicha de las fibras duras y los residuos.', 'Cuela la mezcla para separar la chicha de las fibras.', ['Colador de lienzo o cedazo tupido'], 'colar'],
  ['Fermentación', 'Se vierte en una tinaja de barro, se tapa con un paño limpio y se deja en un rincón fresco y oscuro.', 'Déjala reposar tapada en un lugar fresco y oscuro.', ['1 a 2 días: dulce y suave', '3 días o más: fuerte y ácida'], 'tinaja'],
];

export const FICHA_PALMA = `<p><b>Palma de cuesco</b> (<i>Attalea butyracea</i>), también llamada palma de vino o palma real. Solitaria, de tronco liso y sin espinas.</p>
<p><b>Tronco:</b> de 8 a 25 m de alto y de 35 a 75 cm de diámetro. <b>Hojas:</b> gigantescas, en un penacho en la copa; de 4 a 12 m de largo y hasta 1,6 m de ancho.</p>
<p><b>Frutos:</b> ovoides, de 5 a 7 cm de largo por 3 a 4 cm de ancho: los cuescos. En el Tolima, su pulpa sirve para preparar chicha.</p>
<p class="nota">En esta escena los racimos se muestran ampliados para que se noten. Fuentes: datos del proyecto; Bernal, Galeano et al. (2010).</p>`;
