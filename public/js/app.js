let catalogoCompleto = {};
let cartaActual = null;
let vocesDisponibles = [];

const normalizarRuta = (ruta) => {
  if (!ruta) return '';
  return `./${String(ruta).replace(/^\/+/, '')}`;
};

const router = {
  home: () => {
    const catalogoView = document.getElementById('catalogo-view');
    const detalleView = document.getElementById('detalle-view');

    if (catalogoView) catalogoView.style.display = 'block';
    if (detalleView) detalleView.style.display = 'none';

    window.scrollTo(0, 0);
  },

  detalle: (categoria, id) => {
    const lista = catalogoCompleto[categoria];
    if (!Array.isArray(lista)) return;

    const tarjeta = lista.find(t => t.id === id);
    if (!tarjeta) return;

    cartaActual = tarjeta;

    const catalogoView = document.getElementById('catalogo-view');
    const detalleView = document.getElementById('detalle-view');
    const naipeImg = document.getElementById('naipe-img');

    if (catalogoView) catalogoView.style.display = 'none';
    if (detalleView) detalleView.style.display = 'flex';

    if (naipeImg) {
      naipeImg.src = encodeURI(normalizarRuta(tarjeta.img));
      naipeImg.alt = tarjeta.es || tarjeta.id || 'Tarjeta';
    }

    window.scrollTo(0, 0);
  }
};

function cargarVoces() {
  if (!('speechSynthesis' in window)) return [];
  vocesDisponibles = window.speechSynthesis.getVoices() || [];
  return vocesDisponibles;
}

function buscarVoz(idioma) {
  const voces = vocesDisponibles.length ? vocesDisponibles : cargarVoces();

  if (idioma === 'es') {
    return (
      voces.find(v => v.lang.toLowerCase() === 'es-cl') ||
      voces.find(v => v.lang.toLowerCase() === 'es-es') ||
      voces.find(v => v.lang.toLowerCase().startsWith('es')) ||
      null
    );
  }

  return (
    voces.find(v => v.lang.toLowerCase() === 'en-us') ||
    voces.find(v => v.lang.toLowerCase() === 'en-gb') ||
    voces.find(v => v.lang.toLowerCase().startsWith('en')) ||
    null
  );
}

function hablarTexto(texto, idioma) {
  if (!('speechSynthesis' in window)) return;

  const synth = window.speechSynthesis;
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(texto);
  utterance.lang = idioma === 'es' ? 'es-CL' : 'en-US';
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;

  const vozElegida = buscarVoz(idioma);
  if (vozElegida) {
    utterance.voice = vozElegida;
    utterance.lang = vozElegida.lang;
  }

  synth.speak(utterance);
}

function reproducirVoz(idioma) {
  if (!cartaActual) return;

  const texto = idioma === 'es' ? cartaActual.es : cartaActual.en;
  if (!texto) return;

  if (!vocesDisponibles.length) {
    cargarVoces();
  }

  if (vocesDisponibles.length) {
    hablarTexto(texto, idioma);
    return;
  }

  let intentos = 0;
  const maxIntentos = 10;

  const intervalo = setInterval(() => {
    intentos++;
    cargarVoces();

    if (vocesDisponibles.length) {
      clearInterval(intervalo);
      hablarTexto(texto, idioma);
      return;
    }

    if (intentos >= maxIntentos) {
      clearInterval(intervalo);
      hablarTexto(texto, idioma);
    }
  }, 300);
}

async function cargarDatos() {
  try {
    const respuesta = await fetch('./data/tarjetas.json');
    if (!respuesta.ok) throw new Error(`Error HTTP ${respuesta.status}`);

    catalogoCompleto = await respuesta.json();
    renderizarTablero();
  } catch (error) {
    console.error('Falló al cargar tarjetas:', error);
  }
}

function renderizarTablero() {
  Object.keys(catalogoCompleto).forEach(cat => {
    const grid = document.getElementById(`grid-${cat.toLowerCase()}`);
    if (!grid) return;

    grid.innerHTML = '';

    catalogoCompleto[cat].forEach(tarjeta => {
      const div = document.createElement('div');
      div.className = 'item-lupa';

      const img = document.createElement('img');
      img.src = encodeURI(normalizarRuta(tarjeta.img));
      img.alt = tarjeta.es || tarjeta.id || 'Tarjeta';
      img.loading = 'lazy';

      div.appendChild(img);
      div.addEventListener('click', () => router.detalle(cat, tarjeta.id));

      grid.appendChild(div);
    });
  });
}

window.addEventListener('DOMContentLoaded', () => {
  cargarVoces();
  cargarDatos();
});

if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cargarVoces();
  };
}