# Plan de `index.html` — Gotham Archive

> Hoja de ruta para armar la home con `css/estilos.css`. Las clases que figuran acá ya existen en el CSS, y el HTML de cada pieza se puede copiar de `referencias/guia-estilos.html`.

---

## 1. Imágenes que necesitamos

### Para la home (prioridad)

| Archivo | Qué buscar | Tamaño / formato | Dónde se usa | Estado |
|---|---|---|---|---|
| `img/penguin-logo.svg` | Logo oficial | — | Hero (h1) | ✅ Ya está |
| `img/the-penguin-poster.jpg` | Póster oficial | 1000×1250 (4:5) | "El caso", como foto de evidencia | ✅ Ya está |
| `img/hero-gotham.jpg` | **Gotham City de noche**: skyline, lluvia o calles inundadas. Que el lado izquierdo sea oscuro o sin detalle, porque ahí va el texto. Sin personas en primer plano. | Horizontal, **1920×1080** mínimo, JPG ~300 KB | Fondo del hero | ⬜ Falta |
| `img/episodios/ep01.jpg` … `ep08.jpg` | **Un still por episodio** (8 en total). Preferiblemente un plano reconocible del episodio, sin spoilers fuertes. | Horizontal **16:10**, 1280×800 (mín. 800×500) | Carpetas de episodios (y después, cabecera de cada informe) | ⬜ Faltan 8 |
| `img/personajes/oz-cobb.jpg` | Retrato de Oz (Colin Farrell) | **Cuadrado 800×800**, cara en el tercio superior | Tarjeta en la home + polaroid en personajes.html | ⬜ Falta |
| `img/personajes/sofia-falcone.jpg` | Retrato de Sofia (Cristin Milioti) | Ídem | Ídem | ⬜ Falta |
| `img/personajes/victor-aguilar.jpg` | Retrato de Victor (Rhenzy Feliz) | Ídem | Ídem | ⬜ Falta |
| `img/personajes/salvatore-maroni.jpg` | Retrato de Salvatore Maroni (Clancy Brown) | Ídem | Ídem | ⬜ Falta |

**¿Por qué cuadrados los retratos?** En la home la tarjeta los recorta a 4:3 desde arriba, y en personajes.html el polaroid los muestra cuadrados. Con una sola foto cuadrada, con la cara arriba, sirve para los dos lugares.

### Opcionales (suman, pero no bloquean)

| Archivo | Para qué |
|---|---|
| `img/og-gotham-archive.jpg` (1200×630) | Vista previa al compartir el link en redes o WhatsApp. Puede ser el hero con el logo encima. |
| `img/favicon.svg` | Ícono de la pestaña. Lo puedo generar yo: una "P" roja o un sello. |

### Para después (otras páginas, así ya las vas juntando)

- **Más personajes** (`img/personajes/`): `francis-cobb.jpg`, `alberto-falcone.jpg`, `carmine-falcone.jpg`, `johnny-viti.jpg`, `eve-karlo.jpg`.
- **Evidencias por episodio** (`img/episodios/`): 2 o 3 stills extra por capítulo, por ejemplo `ep03-a.jpg`, `ep03-b.jpg`, `ep03-c.jpg`.
- **Galería** (`img/galeria/`): 8 a 12 fotos de cualquier proporción, porque la galería se adapta sola.

### Reglas para nombrar y preparar las imágenes

- Todo en minúsculas, con guiones, sin espacios, tildes ni ñ: `salvatore-maroni.jpg`, no `Salvatore Maroni.JPG`.
- JPG o WebP con calidad entre 75 y 80. Ninguna debería pesar más de ~400 KB.
- Los stills oficiales de prensa de HBO (buscá "The Penguin press stills" o "stills oficiales") suelen tener la mejor calidad.
- En el pie de página vamos a sumar el crédito: *"Imágenes © HBO / Warner Bros. Discovery. Fan site sin fines de lucro."*

---

## 2. Estructura de la home (de arriba hacia abajo)

```
<head>            metadatos, título, estilos, script
.saltar           enlace de accesibilidad
.cabecera         logo de texto + menú (Index activo)
.nivel-agua       barra fija del agua
<main>
  1. .hero        Gotham + logo + lema + bajada + botón
  2. .ticker      franja roja con texto en movimiento
  3. #caso        "El caso Cobblepot" + póster como evidencia
  ── .marca-agua  ▼ marca de inundación (mitad de la página)
  4. #episodios   8 carpetas            (.zona-agua--orilla)
  5. #personajes  4 tarjetas            (.zona-agua--honda)
</main>
.pie--sumergido   "Gotham no se salva." + links + créditos
```

### 0 · `<head>`
- `lang="es"` y `<title>Gotham Archive · El Pingüino (2024) — Fan page</title>`.
- `meta description`: *"Archivo fan de El Pingüino (HBO, 2024): los 8 episodios como expedientes, los personajes y el submundo criminal de Gotham."*
- Open Graph (`og:title`, `og:description`, `og:image` → `img/og-gotham-archive.jpg`).
- `<link rel="stylesheet" href="css/estilos.css">`.
- `<script src="js/script.js" defer></script>`.

### 1 · Cabecera
- Marca: `GOTHAM ARCHIVE` + `EXP. N.º 2024-OZ`.
- Menú: Index (`aria-current="page"`) · Episodios (con submenú de los 8) · Personajes · Galería · Contacto.
- Botón hamburguesa para mobile.

### 2 · Hero `.hero`
- Capas: skyline SVG de respaldo (ya está hecho y se copia de la guía) + `.hero__foto` (hero-gotham.jpg).
- Sello `Expediente 001` + meta `Gotham City · Post-inundación`.
- `<h1>` con el logo (`alt="El Pingüino"`).
- Lema: **La ciudad será suya**.
- Bajada: *"Carmine Falcone está muerto, el dique colapsó y el trono del bajo mundo está vacío. Este archivo documenta cómo **[Oz Cobb]** lo tomó, episodio por episodio."* Lo que está entre corchetes va con `.censura`.
- Botón `Abrir expediente →` que baja a `#episodios`.

### 3 · Ticker `.ticker`
El texto va duplicado adentro para que el loop no se corte. Borrador:
`◆ 8 episodios archivados ◆ Familia Falcone: en disputa ◆ Familia Maroni: dirigida desde Blackgate ◆ Droga "Bliss" en circulación ◆ Sofia Falcone: liberada de Arkham ◆`

### 4 · El caso `#caso` (`.caso` + `.prosa` + `.evidencia`)
- Título: **El caso Cobblepot**.
- Tres párrafos cortos, estilo fan page, sin spoilers:
  1. Qué es la serie: miniserie de 8 episodios, secuela directa de *The Batman*, con **Colin Farrell** como **Oz Cobb**.
  2. El conflicto: Gotham tras el colapso del dique, el vacío que dejó **Carmine Falcone** y la promesa de Oz a su madre **Francis**.
  3. Los rivales: **Sofia Falcone**, la **familia Maroni**, y un link al [índice de episodios](episodios.html).
- Recordatorio de énfasis: `<b>` (oro) para nombres y lugares, y `<strong>` una sola vez en los dos términos clave (Oz Cobb, Sofia Falcone).
- Póster con cinta, pie *"Prueba A — Sujeto 'Pingüino'"* y sello `Clasificado`.

### ── Marca de inundación
`▼ Marca de inundación · colapso del dique`. Desde acá empieza el agua.

### 5 · Episodios `#episodios` (`.zona-agua--orilla`)
- Título **Expedientes por episodio** + link `Ver índice completo →` (a episodios.html).
- 8 `.carpeta` que llevan a `episodios/episodio-0X.html`. Cada una lleva un still, el título y una línea corta sin spoilers (**borrador, hay que validarlo**):

| EP | Título | Línea (borrador) | Emisión (verificar) |
|---|---|---|---|
| 01 | After Hours | Una noche en el club que lo cambia todo. | 19.09.2024 |
| 02 | Inside Man | Oz necesita a alguien adentro. | 29.09.2024 |
| 03 | Bliss | La droga que todos quieren controlar. | 06.10.2024 |
| 04 | Cent'Anni | El pasado de Sofia sale de Arkham. | 13.10.2024 |
| 05 | Homecoming | Un regreso que nadie esperaba. | 20.10.2024 |
| 06 | Gold Coast | Negocios en la costa de los ricos. | 27.10.2024 |
| 07 | Top Hat | El pasado de Oz, al descubierto. | 03.11.2024 |
| 08 | A Great or Little Thing | El último movimiento de la partida. | 10.11.2024 |

### 6 · Personajes `#personajes` (`.zona-agua--honda`)
- Título **Conocé el bajo mundo**.
- 4 `.tarjeta` que llevan a `personajes.html#oz-cobb`, etc.:
  - Oz Cobb — Colin Farrell
  - Sofia Falcone — Cristin Milioti
  - Victor Aguilar — Rhenzy Feliz
  - Salvatore Maroni — Clancy Brown

### 7 · Pie `.pie--sumergido`
- Frase: **Gotham no se salva.**
- Links a las 5 páginas.
- Créditos: *"Fan site no oficial · Proyecto Gotham Archive · Imágenes © HBO / Warner Bros. Discovery."*

### (Opcional, a decidir) Tráiler
Una sección "Metraje de archivo" entre *El caso* y la marca de inundación, con el tráiler oficial de YouTube embebido en un marco de evidencia. Suma dinamismo, pero hace la home más larga.

---

## 3. Lo que va a hacer `js/script.js` en la home

| Qué | Cómo |
|---|---|
| Activar animaciones | Poner `class="js"` en `<html>` |
| Menú mobile | Botón → alterna `.cabecera.is-open` y `aria-expanded` |
| Aparecer al scrollear | IntersectionObserver agrega `.is-visible` a `.revelar` (sellos incluidos, con efecto de golpe) |
| Spoilers | Clic o tap en `.censura` → `.is-revealed` |
| Nivel del agua | Porcentaje de scroll → `--nivel` en `:root` |
| Cerrar el menú | Al tocar un link o apretar `Esc` |

---

## 4. Checklist antes de dar la home por terminada

- [ ] Todas las imágenes tienen `alt` descriptivo, más `width` y `height` para que la página no salte al cargar.
- [ ] Un solo `<h1>` (el logo). Las secciones usan `<h2>`.
- [ ] Se puede navegar con teclado: menú, submenú, carpetas y spoilers (`tabindex="0"`).
- [ ] Se ve bien en 400 px, 768 px y 1280 px, sin scroll horizontal.
- [ ] Con "reducir movimiento" activado no hay lluvia, grano animado ni olas.
- [ ] Todos los links internos apuntan a archivos que existen, aunque por ahora sean páginas vacías.
