# Portfolio — Santiago Morales Marek

Sitio estático (HTML + CSS + JS, sin build ni backend) con mis proyectos web.

## Estructura

- `index.html` — hero, secciones y footer.
- `styles.css` — estilos (mobile-first, modo claro/oscuro automático).
- `main.js` — lista `PROJECTS` con los proyectos y las ilustraciones SVG de cada card.

## Editar

- **Agregar/cambiar un proyecto:** editá el array `PROJECTS` en `main.js`.
- **Links de redes:** están en `index.html` (sección `socials` y footer).
- **Vista previa al compartir:** `og.png` (1200×630). Cuando tengas el dominio fijo, poné la URL absoluta en `og:image` dentro de `index.html`.

## Ver en local

```bash
npx serve .      # o: python3 -m http.server
```

## Deploy en Vercel

1. Este repo ya está conectado a GitHub; cada push a `main` redespliega.
2. En Vercel: **Add New → Project**, elegí el repo.
3. Framework preset: **Other**. Sin build command. Output directory: `.` (por defecto).
