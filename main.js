// Para agregar un proyecto nuevo, sumá un objeto a esta lista.
// `art` es la clave de la ilustración SVG (ver ARTS más abajo).
const PROJECTS = [
  {
    name: "CineLab",
    tag: "Proyecto académico · UMET",
    description:
      "Sitio de reseñas de cine y series con catálogo, reseñas, artículos y ranking. Hecho para la materia Laboratorio de Medios Gráficos.",
    url: "https://cinelab-peach.vercel.app/#/",
    stack: ["JavaScript", "Supabase", "Vercel"],
    accent: "cine",
    art: "cine",
  },
  {
    name: "Abajo del Colchón",
    tag: "App de finanzas",
    description:
      "Controlador de gastos personal y multiusuario, con dashboard por categorías. Instalable como PWA y con datos en Supabase.",
    url: "https://marekk-delta.vercel.app/",
    stack: ["React", "Supabase", "PWA"],
    accent: "money",
    art: "money",
  },
  {
    name: "Paraíso Brazo Largo",
    tag: "Sitio institucional",
    description:
      "Página web para un camping: información del predio, servicios disponibles y contacto para reservas.",
    url: "https://paraisobrazolargo.netlify.app/",
    stack: ["HTML", "CSS", "Netlify"],
    accent: "camp",
    art: "camp",
  },
  {
    name: "Recetario",
    tag: "Buscador de recetas",
    description:
      "Recetas caseras y del mundo, con modo cocina para ir tildando ingredientes y pasos, y filtro por lo que tenés en la heladera.",
    url: "https://recetario-n3sscylrx-marekk1.vercel.app/",
    stack: ["JavaScript", "Supabase", "Vercel"],
    accent: "food",
    art: "food",
  },
];

// Ilustraciones simples en SVG. Usan currentColor + variables CSS para
// adaptarse al modo claro/oscuro.
const ARTS = {
  cine: `
    <svg viewBox="0 0 200 120" aria-hidden="true">
      <g class="art-float">
        <rect x="46" y="44" width="108" height="62" rx="6" fill="var(--ink)"/>
        <g transform="rotate(-12 46 44)">
          <rect x="46" y="26" width="108" height="18" rx="3" fill="var(--ink)"/>
          <path d="M60 26 72 44M84 26 96 44M108 26 120 44M132 26 144 44" stroke="var(--accent)" stroke-width="7"/>
        </g>
        <rect x="46" y="44" width="108" height="10" fill="var(--accent)" opacity=".9"/>
        <path d="M60 44 72 54M84 44 96 54M108 44 120 54M132 44 144 54" stroke="var(--ink)" stroke-width="7"/>
      </g>
      <g fill="var(--accent)">
        <path class="art-star" d="m28 70 3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/>
        <path class="art-star d2" d="m172 38 2 5 5 .5-4 3.5 1 5-4-2.5-4 2.5 1-5-4-3.5 5-.5z"/>
      </g>
    </svg>`,
  money: `
    <svg viewBox="0 0 200 120" aria-hidden="true">
      <g class="art-coins" fill="var(--accent)" stroke="var(--ink)" stroke-width="3">
        <ellipse cx="82" cy="46" rx="14" ry="5"/>
        <ellipse cx="82" cy="40" rx="14" ry="5"/>
        <ellipse cx="82" cy="34" rx="14" ry="5"/>
        <ellipse cx="116" cy="46" rx="14" ry="5"/>
        <ellipse cx="116" cy="40" rx="14" ry="5"/>
      </g>
      <g class="art-float">
        <rect x="30" y="52" width="140" height="34" rx="12" fill="var(--paper)" stroke="var(--ink)" stroke-width="4"/>
        <path d="M58 52v34M86 52v34M114 52v34M142 52v34" stroke="var(--ink)" stroke-width="2" stroke-dasharray="3 5"/>
        <path d="M38 86v12M162 86v12" stroke="var(--ink)" stroke-width="5" stroke-linecap="round"/>
      </g>
      <g fill="var(--ink)">
        <rect x="150" y="18" width="7" height="22" rx="2"/>
        <rect x="160" y="10" width="7" height="30" rx="2" fill="var(--accent)"/>
        <rect x="170" y="24" width="7" height="16" rx="2"/>
      </g>
    </svg>`,
  camp: `
    <svg viewBox="0 0 200 120" aria-hidden="true">
      <circle class="art-sun" cx="152" cy="30" r="13" fill="var(--accent)"/>
      <path d="M18 88 60 52l20 16 26-30 44 50" fill="none" stroke="var(--ink)" stroke-width="3" stroke-linejoin="round" opacity=".35"/>
      <g class="art-float">
        <path d="M62 94 100 40l38 54z" fill="var(--ink)"/>
        <path d="M100 58 88 94h24z" fill="var(--accent)"/>
        <path d="M100 40v-8" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/>
      </g>
      <path class="art-wave" d="M10 104q12-7 24 0t24 0 24 0 24 0 24 0 24 0 24 0 24 0" fill="none" stroke="var(--accent)" stroke-width="4" stroke-linecap="round"/>
      <path d="M150 94v-22m-8 10 8-10 8 10" stroke="var(--ink)" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`,
  food: `
    <svg viewBox="0 0 200 120" aria-hidden="true">
      <g class="art-steam" fill="none" stroke="var(--ink)" stroke-width="3" stroke-linecap="round" opacity=".5">
        <path d="M66 30q-6-8 0-16"/><path d="M82 32q-6-8 0-16"/><path d="M98 30q-6-8 0-16"/>
      </g>
      <g class="art-float">
        <path d="M40 44h84v30a22 22 0 0 1-22 22H62a22 22 0 0 1-22-22z" fill="var(--ink)"/>
        <rect x="34" y="38" width="96" height="9" rx="4" fill="var(--accent)"/>
        <path d="M130 50h14" stroke="var(--ink)" stroke-width="6" stroke-linecap="round"/>
      </g>
      <g class="art-list">
        <rect x="146" y="18" width="40" height="72" rx="5" fill="var(--paper)" stroke="var(--ink)" stroke-width="3"/>
        <path d="m153 34 4 4 7-8M153 54l4 4 7-8" fill="none" stroke="var(--accent)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="153" y="70" width="10" height="10" rx="2" fill="none" stroke="var(--ink)" stroke-width="2.5"/>
        <path d="M168 34h12M168 54h12M168 75h12" stroke="var(--ink)" stroke-width="3" stroke-linecap="round" opacity=".5"/>
      </g>
    </svg>`,
};

const escapeHTML = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function hostOf(url) {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

function renderProjects() {
  const grid = document.getElementById("project-grid");
  if (!grid) return;

  grid.innerHTML = PROJECTS.map((p, i) => {
    const num = String(i + 1).padStart(2, "0");
    return `
      <article class="card" data-accent="${p.accent}">
        <div class="card-art">${ARTS[p.art] || ""}</div>
        <div class="card-body">
          <div class="card-meta">
            <span class="card-num">${num}/${String(PROJECTS.length).padStart(2, "0")}</span>
            <span class="card-tag">${escapeHTML(p.tag)}</span>
          </div>
          <h3 class="card-title">${escapeHTML(p.name)}</h3>
          <p class="card-desc">${escapeHTML(p.description)}</p>
          <ul class="card-stack" aria-label="Tecnologías">
            ${p.stack.map((s) => `<li>${escapeHTML(s)}</li>`).join("")}
          </ul>
          <a class="card-link" href="${p.url}" target="_blank" rel="noopener noreferrer"
             aria-label="Ver sitio de ${escapeHTML(p.name)} (se abre en una pestaña nueva)">
            <span>Ver sitio</span>
            <span class="card-host">${escapeHTML(hostOf(p.url))}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg>
          </a>
        </div>
      </article>`;
  }).join("");
}

function revealOnScroll() {
  const targets = document.querySelectorAll(".card, .section-head, .about-body");
  if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }
  targets.forEach((el) => el.classList.add("reveal"));
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  targets.forEach((el) => io.observe(el));
}

document.getElementById("year").textContent = new Date().getFullYear();
renderProjects();
revealOnScroll();
