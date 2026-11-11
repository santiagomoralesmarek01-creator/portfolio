# Portfolio — Santiago Morales Marek

Sitio estático (HTML + CSS + JS, sin build ni backend) con mis proyectos web,
presentados como casos de estudio: A Mano, Miti-Miti, Pedidos Interactivos y Abajo del Colchón,
más la colección **Vitrina** con 20 ejemplos de diseño (cartas, landings y apps).

## Estructura

- `index.html` — portada, un `<article class="caso">` por proyecto, sobre mí y contacto.
- `styles.css` — estilos (mobile-first, modo claro/oscuro automático con botón para cambiarlo).
  Los colores están en variables al principio; cada proyecto tiene su acento (`--amano`, `--miti`, `--carta`, `--colchon`, `--vitrina`).
- `main.js` — botón de tema (se recuerda en el dispositivo), año, filtros de la Vitrina, aparición al hacer scroll
  y el **recorrido**: una bola que cae por un riel a medida que bajás, rebota en la marca de cada proyecto y toma
  su color. Las marcas se arman solas a partir de los `<article class="caso">` (número, título y `--acento`),
  así que un proyecto nuevo aparece en el riel sin tocar nada. Con "reducir movimiento" sigue al scroll sin rebotes.
- `bola3d.js` — dibuja esa bola en 3D con three.js (esfera mate con luz suave que rueda, se estira, deja un anillo al
  picar en cada proyecto y toma su color). Se carga cuando la página ya terminó; si no hay WebGL queda la bola plana.
  `vendor/three.min.js` es three.js recortado a lo que se usa (r186, ~135 KB comprimido): para regenerarlo, armá con
  esbuild un archivo que reexporte esas clases desde `three` (`--bundle --minify --format=esm`).
- **Entrada:** la primera vez de cada visita aparece "MrK" y `intro3d.js` arma una escena 3D con three.js: una esfera
  mate (con la misma luz suave que la bola del recorrido) cae sobre la línea del texto con su sombra, pica dejando anillos en el piso,
  se aplasta en cada golpe y queda como el punto de "MrK.". Después la página se abre en un círculo que nace en la
  esfera y la esfera viaja por un arco hasta su lugar en el riel del recorrido. Si three.js no llega en 1,5 s o no hay
  WebGL, corre la versión CSS (`.intro-lista`). La arranca `entrada()` en `main.js`; se saltea con un clic o una
  tecla y no se muestra con "reducir movimiento".
- `img/` — capturas de cada proyecto en `.webp`: una de escritorio (1600 px) y una de celular (600 px).
- `og.png` — vista previa al compartir el link (1200×630).
- `robots.txt` y `sitemap.xml` — para buscadores. Cuando cambies algo grande, actualizá `<lastmod>` en el sitemap.
  En `index.html` hay datos estructurados (JSON-LD) con tu nombre, profesión y perfiles: si sumás una red, agregala en `sameAs`.

## Editar

- **Agregar un proyecto:** copiá uno de los `<article class="caso">` de `index.html`, cambiá el `id`,
  el número, los textos y las capturas, y definí su color en `styles.css` (modo claro y oscuro).
  Sumalo también al índice de la portada (`.indice`).
- **Capturas:** sacalas a 1280×800 (escritorio) y 390×844 (celular) con zoom 2× y convertilas a `.webp`.
- **Vitrina:** cada ejemplo es un `<li class="muestra">` dentro de la sección `#vitrina`, con `data-tipo` (`carta`, `landing` o `app`)
  para los filtros. Las capturas de página completa están en `img/vitrina/` (vienen de `public/previews/` del repo `vitrina`).
  Si sumás uno, actualizá también el número de cada filtro.
- **Clips en acción:** las vistas con armador de pedidos (las dos de Pedidos Interactivos y las cartas con armador de la
  Vitrina) llevan un `<video class="clip">` encima de la captura: al pasar el mouse se ve el pedido armándose, y en el
  celular se reproduce solo cuando queda a la vista. Están en `img/clips/` (`.webm` y `.mp4`, ~8 s, sin audio); se graban
  con Playwright haciendo clic en el armador de cada sitio. Con "reducir movimiento" no se muestran.
- **Links de redes:** están en el footer de `index.html`.
- **Dominio:** <https://www.santiagomoralesmarek.com.ar> (el dominio sin `www` redirige ahí). Si cambia, actualizá
  `og:url`, `og:image`, `twitter:image` y `canonical` en `index.html`.

## Ver en local

```bash
python3 -m http.server     # o: npx serve .
```

## Deploy en Vercel

1. En Vercel: **Add New → Project**, elegí este repo.
2. Framework preset: **Other**. Sin build command. Output directory: `.` (por defecto).
3. Cada push a `main` redespliega; cada rama tiene su propia vista previa.
