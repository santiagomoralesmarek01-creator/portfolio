# Portfolio — Santiago Morales Marek

Sitio estático (HTML + CSS + JS, sin build ni backend) con mis proyectos web,
presentados como casos de estudio: A Mano, Carta Local y Abajo del Colchón.

## Estructura

- `index.html` — portada, un `<article class="caso">` por proyecto, sobre mí y contacto.
- `styles.css` — estilos (mobile-first, modo claro/oscuro automático con botón para cambiarlo).
  Los colores están en variables al principio; cada proyecto tiene su acento (`--amano`, `--carta`, `--colchon`).
- `main.js` — botón de tema (se recuerda en el dispositivo), año y aparición al hacer scroll.
- `img/` — capturas de cada proyecto en `.webp`: una de escritorio (1600 px) y una de celular (600 px).
- `og.png` — vista previa al compartir el link (1200×630).

## Editar

- **Agregar un proyecto:** copiá uno de los `<article class="caso">` de `index.html`, cambiá el `id`,
  el número, los textos y las capturas, y definí su color en `styles.css` (modo claro y oscuro).
  Sumalo también al índice de la portada (`.indice`).
- **Capturas:** sacalas a 1280×800 (escritorio) y 390×844 (celular) con zoom 2× y convertilas a `.webp`.
- **Links de redes:** están en el footer de `index.html`.
- **Vista previa al compartir:** cuando tengas el dominio fijo, poné la URL absoluta en `og:image`.

## Ver en local

```bash
python3 -m http.server     # o: npx serve .
```

## Deploy en Vercel

1. En Vercel: **Add New → Project**, elegí este repo.
2. Framework preset: **Other**. Sin build command. Output directory: `.` (por defecto).
3. Cada push a `main` redespliega; cada rama tiene su propia vista previa.
