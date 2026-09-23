/* ==========================================================================
   GOTHAM ARCHIVE · script.js
   Un solo archivo para todo el sitio: cada bloque revisa si su elemento
   existe en la página antes de hacer algo.

   01. Activar animaciones (html.js)
   02. Menú mobile
   03. Aparecer al scrollear (.revelar)
   04. Spoilers (.censura)
   05. Nivel del agua (--nivel en .nivel-agua)
   06. Tráiler de YouTube (portada → iframe)
   07. Archivo de episodios (filtros y vistas)
   08. Informe de episodio (barra de lectura y spoilers)
   09. Visor de fotos de la galería: lightbox propio con <dialog> nativo
   10. Informe final: precinto y fichas de destino
   11. Galería: filtros por categoría
   12. Formulario de contacto (validación y señal enviada)
   13. Tablero de personajes (relaciones con hilos)
   ========================================================================== */

/* 01 · Con JS activo se habilitan las animaciones de entrada */
document.documentElement.classList.add('js');


/* 02 · MENÚ MOBILE ------------------------------------------------------ */
const cabecera = document.querySelector('.cabecera');
const botonMenu = document.querySelector('.nav__boton');

function cerrarMenu() {
  if (!cabecera) return;
  cabecera.classList.remove('is-open');
  botonMenu?.setAttribute('aria-expanded', 'false');
  botonMenu?.setAttribute('aria-label', 'Abrir menú');
}

if (cabecera && botonMenu) {
  botonMenu.addEventListener('click', () => {
    const abierto = cabecera.classList.toggle('is-open');
    botonMenu.setAttribute('aria-expanded', abierto);
    botonMenu.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
  });

  // Tocar un link del menú lo cierra
  cabecera.querySelectorAll('.nav a').forEach(link => link.addEventListener('click', cerrarMenu));

  // Esc lo cierra y devuelve el foco al botón
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && cabecera.classList.contains('is-open')) {
      cerrarMenu();
      botonMenu.focus();
    }
  });
}


// Redes del pie: todavía sin destino, evitamos el salto al tope de la página
document.querySelectorAll('.pie__red[href="#"]').forEach(link =>
  link.addEventListener('click', e => e.preventDefault())
);


/* 03 · APARECER AL SCROLLEAR ------------------------------------------- */
const revelables = document.querySelectorAll('.revelar');

if ('IntersectionObserver' in window) {
  const observador = new IntersectionObserver(entradas => {
    entradas.forEach(entrada => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('is-visible');
        observador.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revelables.forEach(el => observador.observe(el));
} else {
  revelables.forEach(el => el.classList.add('is-visible'));
}


/* 04 · SPOILERS (.censura) ---------------------------------------------- */
document.querySelectorAll('.censura').forEach(censura => {
  const alternar = () => censura.classList.toggle('is-revealed');
  censura.addEventListener('click', alternar);
  censura.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      alternar();
    }
  });
});


/* 05 · NIVEL DEL AGUA --------------------------------------------------- */
const barraAgua = document.querySelector('.nivel-agua');

if (barraAgua) {
  const raiz = document.documentElement;
  let pendiente = false;

  const medirNivel = () => {
    const recorrido = raiz.scrollHeight - raiz.clientHeight || 1;
    const nivel = Math.min(1, raiz.scrollTop / recorrido);
    // La variable va en la barra y no en <html>: así el navegador solo recalcula la barra
    barraAgua.style.setProperty('--nivel', nivel.toFixed(3));
    pendiente = false;
  };

  window.addEventListener('scroll', () => {
    if (!pendiente) {
      pendiente = true;
      requestAnimationFrame(medirNivel);
    }
  }, { passive: true });

  medirNivel();
}


/* 06 · TRÁILER DE YOUTUBE ----------------------------------------------
   La portada es un link a YouTube (funciona aunque no haya JS).
   Al tocarla se reemplaza por el iframe oficial con autoplay: así la
   página no carga el reproductor (~1 MB) hasta que alguien lo pide.

   Importante: YouTube necesita saber desde qué sitio se incrusta el video
   (lo lee del Referer). Si la página se abre con doble clic (file://)
   no hay origen y el reproductor muestra "Error 153". En ese caso dejamos
   que el link abra YouTube en otra pestaña y mostramos un aviso.
   ----------------------------------------------------------------------- */
const esArchivoLocal = location.protocol === 'file:';

document.querySelectorAll('.metraje__portada[data-video]').forEach(portada => {
  const metraje = portada.closest('.metraje');

  if (esArchivoLocal) {
    metraje?.classList.add('is-local');
    return;
  }

  portada.addEventListener('click', e => {
    e.preventDefault();

    const parametros = new URLSearchParams({
      autoplay: '1',     // arranca solo, porque el usuario ya hizo clic
      rel: '0',          // al terminar, sugiere videos del mismo canal
      playsinline: '1'   // en iPhone se reproduce dentro de la página
    });

    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${portada.dataset.video}?${parametros}`;
    iframe.title = portada.dataset.titulo || 'Reproductor de video de YouTube';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    iframe.allowFullscreen = true;

    portada.replaceWith(iframe);
    metraje?.classList.add('is-reproduciendo');
    iframe.focus();
  });
});


/* 07 · ARCHIVO DE EPISODIOS (episodios.html) ----------------------------
   - Filtro por sujeto: chips [data-filtro] → oculta li/tr sin ese sujeto
   - Vista: carpetas o registro (se recuerda en este navegador)
   ----------------------------------------------------------------------- */
const archivo = document.querySelector('.archivo');

if (archivo) {
  const botonesFiltro = archivo.querySelectorAll('[data-filtro]');
  const botonesVista = archivo.querySelectorAll('[data-vista]');
  const carpetas = archivo.querySelectorAll('.legajos > li');
  const filas = archivo.querySelectorAll('.registro tbody tr');
  const contador = archivo.querySelector('.archivo__contador');
  const vacio = archivo.querySelector('.archivo__vacio');
  const vistas = {
    carpetas: document.getElementById('vista-carpetas'),
    registro: document.getElementById('vista-registro')
  };

  // Filtrar
  function filtrar(sujeto) {
    let visibles = 0;

    carpetas.forEach(li => {
      const coincide = sujeto === 'todos' || li.dataset.sujetos.split(' ').includes(sujeto);
      const estabaOculta = li.hidden;
      li.hidden = !coincide;
      if (coincide) {
        visibles++;
        li.classList.add('is-visible'); // por si todavía no había aparecido con el scroll
        if (estabaOculta) {
          li.classList.remove('is-filtrada-entrando');
          void li.offsetWidth; // reinicia la animación
          li.classList.add('is-filtrada-entrando');
        }
      }
    });

    filas.forEach(tr => {
      tr.hidden = !(sujeto === 'todos' || tr.dataset.sujetos.split(' ').includes(sujeto));
    });

    botonesFiltro.forEach(b => b.setAttribute('aria-pressed', b.dataset.filtro === sujeto));
    contador.innerHTML = `Mostrando <b>${visibles}</b> de ${carpetas.length} informes`;
    vacio.hidden = visibles > 0;
  }

  botonesFiltro.forEach(b => b.addEventListener('click', () => filtrar(b.dataset.filtro)));

  // Cambiar de vista
  function mostrarVista(nombre) {
    if (!vistas[nombre]) nombre = 'carpetas';
    Object.entries(vistas).forEach(([clave, el]) => { el.hidden = clave !== nombre; });
    botonesVista.forEach(b => b.setAttribute('aria-pressed', b.dataset.vista === nombre));
    try { localStorage.setItem('gotham-vista', nombre); } catch (e) { /* sin almacenamiento: no pasa nada */ }
  }

  botonesVista.forEach(b => b.addEventListener('click', () => mostrarVista(b.dataset.vista)));

  let vistaGuardada = 'carpetas';
  try { vistaGuardada = localStorage.getItem('gotham-vista') || 'carpetas'; } catch (e) {}
  mostrarVista(vistaGuardada);
}


/* 08 · INFORME DE EPISODIO (episodios/episodio-0X.html) -----------------
   - Barra de lectura: porcentaje de scroll → --lectura (0–1, en la barra)
   - Botón "Revelar todos los spoilers" + contador de datos censurados
   ----------------------------------------------------------------------- */
const barraLectura = document.querySelector('.lectura');

if (barraLectura) {
  const raiz = document.documentElement;
  let pendienteLectura = false;

  const medirLectura = () => {
    const recorrido = raiz.scrollHeight - raiz.clientHeight || 1;
    const avance = Math.min(1, raiz.scrollTop / recorrido);
    barraLectura.style.setProperty('--lectura', avance.toFixed(3));
    pendienteLectura = false;
  };

  window.addEventListener('scroll', () => {
    if (!pendienteLectura) {
      pendienteLectura = true;
      requestAnimationFrame(medirLectura);
    }
  }, { passive: true });

  medirLectura();
}

const botonRevelar = document.querySelector('.informe__revelar');

if (botonRevelar) {
  const censuras = document.querySelectorAll('main .censura');
  const destinos = document.querySelectorAll('main .destino'); // solo en el EP. 08
  const cantidad = document.querySelector('[data-cantidad-spoilers]');
  if (cantidad) cantidad.textContent = censuras.length + destinos.length;

  botonRevelar.addEventListener('click', () => {
    const revelar = botonRevelar.getAttribute('aria-pressed') !== 'true';
    censuras.forEach(c => c.classList.toggle('is-revealed', revelar));
    destinos.forEach(d => {
      d.classList.toggle('is-abierto', revelar);
      d.setAttribute('aria-expanded', revelar);
    });
    botonRevelar.setAttribute('aria-pressed', revelar);
    botonRevelar.textContent = revelar ? 'Volver a censurar' : 'Revelar todos los spoilers';
  });
}


/* 09 · VISOR DE FOTOS (galeria.html) ---------------------------------------
   LIGHTBOX PROPIO — no usa ninguna librería externa.
   · Tipo: lightbox modal con navegación de galería (anterior / siguiente),
     leyenda y contador.
   · Tecnología: JavaScript nativo (vanilla JS, ES6+) sobre el elemento
     HTML nativo <dialog> y su método showModal(). El navegador ya aporta
     el fondo oscuro (::backdrop), el cierre con Esc, el bloqueo del resto
     de la página y la devolución del foco al cerrar.
     Referencia: https://developer.mozilla.org/es/docs/Web/HTML/Element/dialog
   · Alternativa evaluada y descartada: GLightbox (librería de lightbox),
     para no sumar dependencias ni pisar sus estilos.
   · Estilos: css/estilos.css, sección 20 (.modal, .modal--foto, .visor__*).
   · Compatibilidad: navegadores actuales (Chrome, Edge, Firefox, Safari 15.4+).
     Si el navegador no soporta <dialog>, el visor no se activa y las fotos
     se siguen viendo en la página.

   Un solo <dialog> creado por JS: no hace falta HTML extra en la galería.
   - Clic en una foto (.galeria__boton) → se abre en grande con su pie
   - Flechas ← → (botones o teclado) para pasar entre las fotos visibles
     (si hay un filtro activo, solo recorre las de esa categoría)
   - Esc, la ✕ o clic afuera para cerrar
   ----------------------------------------------------------------------- */
const fotosAmpliables = [...document.querySelectorAll('.galeria__boton')];

if (fotosAmpliables.length && typeof HTMLDialogElement === 'function') {
  const visor = document.createElement('dialog');
  visor.className = 'modal modal--foto visor';
  visor.setAttribute('aria-label', 'Visor de fotos');
  visor.innerHTML = `
    <button class="modal__cerrar" type="button" aria-label="Cerrar visor">✕</button>
    <figure>
      <img class="visor__img" alt="">
      <figcaption class="visor__pie"><span class="visor__texto"></span><span class="visor__contador"></span></figcaption>
    </figure>
    <button class="visor__nav visor__nav--ant" type="button" aria-label="Foto anterior">←</button>
    <button class="visor__nav visor__nav--sig" type="button" aria-label="Foto siguiente">→</button>`;
  document.body.append(visor);

  const imgVisor = visor.querySelector('.visor__img');
  const textoVisor = visor.querySelector('.visor__texto');
  const contadorVisor = visor.querySelector('.visor__contador');
  const botonesNav = visor.querySelectorAll('.visor__nav');
  let lista = [];   // fotos visibles cuando se abrió el visor (respeta el filtro)
  let actual = 0;

  function mostrar(indice) {
    const total = lista.length;
    actual = (indice + total) % total; // da la vuelta en los extremos
    const foto = lista[actual];
    const img = foto.querySelector('img');
    imgVisor.src = img.currentSrc || img.src;
    imgVisor.alt = img.alt;
    textoVisor.textContent = foto.querySelector('.galeria__pie')?.textContent.trim() || '';
    contadorVisor.textContent = total > 1 ? `${actual + 1} / ${total}` : '';
    botonesNav.forEach(b => { b.hidden = total < 2; });
  }

  fotosAmpliables.forEach(foto => {
    foto.addEventListener('click', () => {
      lista = fotosAmpliables.filter(f => !f.closest('[hidden]'));
      mostrar(lista.indexOf(foto));
      visor.showModal();
      document.documentElement.classList.add('has-visor');
    });
  });

  visor.querySelector('.visor__nav--ant').addEventListener('click', () => mostrar(actual - 1));
  visor.querySelector('.visor__nav--sig').addEventListener('click', () => mostrar(actual + 1));
  visor.querySelector('.modal__cerrar').addEventListener('click', () => visor.close());
  visor.addEventListener('click', e => { if (e.target === visor) visor.close(); }); // clic en el fondo
  visor.addEventListener('keydown', e => {
    if (lista.length < 2) return;
    if (e.key === 'ArrowLeft') mostrar(actual - 1);
    if (e.key === 'ArrowRight') mostrar(actual + 1);
  });
  visor.addEventListener('close', () => document.documentElement.classList.remove('has-visor'));
}


/* 10 · INFORME FINAL (episodios/episodio-08.html) ------------------------
   - Precinto: el informe arranca sellado; "Romper el sello" lo abre.
     (La clase .is-sellado está en el HTML, pero el CSS solo la aplica
     con html.js: sin JS, el informe se ve completo.)
   - Fichas de destino: cada .destino se abre o se cierra al tocarla.
   - "Por ahora.": enciende la señal en el cielo del fondo (html.is-senal)
     y muestra el anexo final.
   ----------------------------------------------------------------------- */
const expedienteFinal = document.querySelector('.final');

if (expedienteFinal) {
  const precinto = expedienteFinal.querySelector('.precinto');
  const informeFinal = expedienteFinal.querySelector('.informe');

  expedienteFinal.querySelector('.precinto__boton').addEventListener('click', () => {
    expedienteFinal.classList.remove('is-sellado');
    precinto.classList.add('is-rompiendo'); // dispara la animación de las cintas
    setTimeout(() => precinto.classList.remove('is-rompiendo'), 800);
    informeFinal.tabIndex = -1;
    informeFinal.focus({ preventScroll: true }); // el foco pasa al informe
  });
}

document.querySelectorAll('.destino').forEach(destino => {
  destino.addEventListener('click', () => {
    const abierto = destino.classList.toggle('is-abierto');
    destino.setAttribute('aria-expanded', abierto);
  });
});

const botonPorAhora = document.querySelector('.por-ahora');

if (botonPorAhora) {
  const anexo = document.getElementById(botonPorAhora.getAttribute('aria-controls'));
  botonPorAhora.addEventListener('click', () => {
    const encendida = document.documentElement.classList.toggle('is-senal');
    botonPorAhora.setAttribute('aria-expanded', encendida);
    anexo.hidden = !encendida;
  });
}


/* 11 · GALERÍA: FILTROS POR CATEGORÍA (galeria.html) ---------------------
   Chips [data-categoria-filtro] → ocultan las fotos de otras categorías.
   El visor (bloque 09) recorre solo las que quedan visibles.
   ----------------------------------------------------------------------- */
const muro = document.querySelector('.muro');

if (muro) {
  const chipsCategoria = muro.querySelectorAll('[data-categoria-filtro]');
  const fotosMuro = muro.querySelectorAll('.galeria__item');
  const contadorMuro = muro.querySelector('.muro__contador');

  chipsCategoria.forEach(chip => chip.addEventListener('click', () => {
    const categoria = chip.dataset.categoriaFiltro;
    let visibles = 0;

    fotosMuro.forEach(item => {
      const coincide = categoria === 'todas' || item.dataset.categoria === categoria;
      const estabaOculta = item.hidden;
      item.hidden = !coincide;
      if (coincide) {
        visibles++;
        item.classList.add('is-visible');
        if (estabaOculta) {
          item.classList.remove('is-filtrada-entrando');
          void item.offsetWidth; // reinicia la animación
          item.classList.add('is-filtrada-entrando');
        }
      }
    });

    chipsCategoria.forEach(c => c.setAttribute('aria-pressed', c === chip));
    contadorMuro.innerHTML = `Mostrando <b>${visibles}</b> de ${fotosMuro.length} fotos`;
  }));
}


/* 12 · FORMULARIO DE CONTACTO (contacto.html) -----------------------------
   - Valida nombre, correo y mensaje (el asunto es opcional) con mensajes
     propios, en español, debajo de cada campo.
   - Contador de caracteres del mensaje.
   - Al enviar: muestra "Señal enviada" y la señal del fondo titila.
   El sitio no tiene servidor: el mensaje no se manda a ningún lado. Para
   recibirlos de verdad habría que conectar un servicio de formularios.
   ----------------------------------------------------------------------- */
const formContacto = document.getElementById('formulario-contacto');

if (formContacto) {
  const seccionContacto = formContacto.closest('.contacto');
  const panelEnviado = formContacto.querySelector('.formulario__enviado');
  const mensaje = formContacto.querySelector('#mensaje');
  const contadorMensaje = formContacto.querySelector('#contador-mensaje');
  let intentoEnviar = false;

  const reglas = {
    nombre: campo => campo.value.trim().length >= 2 || 'Dejanos un nombre o alias (mínimo 2 letras).',
    correo: campo => {
      if (!campo.value.trim()) return 'Necesitamos un correo para poder responderte.';
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(campo.value.trim()) || 'Ese correo no parece válido. Revisalo.';
    },
    mensaje: campo => campo.value.trim().length >= 10 || 'El mensaje tiene que tener al menos 10 caracteres.'
  };

  function validar(campo) {
    const regla = reglas[campo.name];
    if (!regla) return true;
    const resultado = regla(campo);
    const valido = resultado === true;
    const error = document.getElementById('error-' + campo.name);
    campo.closest('.campo').classList.toggle('is-error', !valido);
    campo.setAttribute('aria-invalid', !valido);
    error.textContent = valido ? '' : resultado;
    return valido;
  }

  Object.keys(reglas).forEach(nombre => {
    const campo = formContacto.elements[nombre];
    campo.addEventListener('blur', () => { if (intentoEnviar || campo.value) validar(campo); });
    campo.addEventListener('input', () => { if (intentoEnviar) validar(campo); });
  });

  const actualizarContador = () => { contadorMensaje.textContent = `${mensaje.value.length} / ${mensaje.maxLength}`; };
  mensaje.addEventListener('input', actualizarContador);

  formContacto.addEventListener('submit', e => {
    e.preventDefault();
    intentoEnviar = true;
    const campos = Object.keys(reglas).map(n => formContacto.elements[n]);
    const invalidos = campos.filter(c => !validar(c));
    if (invalidos.length) {
      invalidos[0].focus();
      return;
    }
    formContacto.querySelector('[data-nombre-enviado]').textContent = formContacto.elements.nombre.value.trim();
    formContacto.classList.add('is-enviado');
    panelEnviado.hidden = false;
    panelEnviado.focus();
    seccionContacto.classList.remove('is-enviado');
    void seccionContacto.offsetWidth; // permite repetir el titileo
    seccionContacto.classList.add('is-enviado');
  });

  formContacto.querySelector('[data-otra-senal]').addEventListener('click', () => {
    formContacto.reset();
    intentoEnviar = false;
    actualizarContador();
    formContacto.querySelectorAll('.campo').forEach(c => c.classList.remove('is-error'));
    formContacto.querySelectorAll('[aria-invalid]').forEach(c => c.removeAttribute('aria-invalid'));
    formContacto.querySelectorAll('.campo__error').forEach(e => { e.textContent = ''; });
    formContacto.classList.remove('is-enviado');
    panelEnviado.hidden = true;
    formContacto.elements.nombre.focus();
  });
}


/* 13 · TABLERO DE PERSONAJES (personajes.html) ----------------------------
   Tocar una polaroid la marca como activa, resalta solo sus hilos
   (.tablero.is-filtrado, .hilo.is-activo) y muestra su panel con las
   relaciones y el link al expediente. Tocarla otra vez (o Esc) la suelta.
   ----------------------------------------------------------------------- */
const tablero = document.querySelector('.tablero');

if (tablero) {
  const polaroids = tablero.querySelectorAll('.polaroid[data-sujeto]');
  const hilos = tablero.querySelectorAll('.hilo');
  const paneles = document.querySelectorAll('.tablero__info');

  function seleccionar(id) {
    tablero.classList.toggle('is-filtrado', Boolean(id));
    polaroids.forEach(p => {
      const activa = p.dataset.sujeto === id;
      p.classList.toggle('is-activa', activa);
      p.setAttribute('aria-pressed', activa);
    });
    hilos.forEach(h => h.classList.toggle('is-activo', Boolean(id) && h.dataset.sujetos.split(' ').includes(id)));
    paneles.forEach(panel => { panel.hidden = panel.dataset.info !== (id || 'ninguno'); });
  }

  polaroids.forEach(p => p.addEventListener('click', () => {
    seleccionar(p.getAttribute('aria-pressed') === 'true' ? null : p.dataset.sujeto);
  }));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && tablero.classList.contains('is-filtrado')) seleccionar(null);
  });
}
