// Tema: sigue al sistema hasta que la persona elige uno con el botón.
const raiz = document.documentElement;
const botonTema = document.querySelector(".tema");

function temaActual() {
  if (raiz.dataset.tema) return raiz.dataset.tema;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "oscuro" : "claro";
}

botonTema?.addEventListener("click", () => {
  const nuevo = temaActual() === "oscuro" ? "claro" : "oscuro";
  raiz.dataset.tema = nuevo;
  try {
    localStorage.setItem("tema", nuevo);
  } catch {}
});

// Año actual.
const anio = String(new Date().getFullYear());
document.querySelectorAll("#year, #year-hero").forEach((el) => (el.textContent = anio));

// Filtros de la Vitrina: muestran sólo las cartas, las landings o las apps.
const filtros = document.querySelector(".filtros");
filtros?.addEventListener("click", (ev) => {
  const boton = ev.target.closest("[data-filtro]");
  if (!boton) return;
  const filtro = boton.dataset.filtro;
  filtros.querySelectorAll("[data-filtro]").forEach((b) => b.setAttribute("aria-pressed", String(b === boton)));
  document.querySelectorAll(".muestra").forEach((m) => {
    m.hidden = filtro !== "todos" && m.dataset.tipo !== filtro;
  });
});

// Aparición suave al hacer scroll (sin animación si se pidió reducir movimiento).
function revelar() {
  const objetivos = document.querySelectorAll(".caso-head, .vitrina, .caso-cuerpo, .muestras, .sobre");
  if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  objetivos.forEach((el) => el.classList.add("reveal"));
  const io = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  objetivos.forEach((el) => io.observe(el));
}

revelar();

// Recorrido: una bola cae por el riel a medida que bajás. Rebota en cada marca de
// proyecto y toma el color de la sección en la que estás. Con "reducir movimiento"
// sigue al scroll sin rebotes.
function recorrido() {
  const nav = document.querySelector(".recorrido");
  const lista = nav?.querySelector(".recorrido-marcas");
  const bola = nav?.querySelector(".bola");
  if (!nav || !lista || !bola) return;

  const casos = [...document.querySelectorAll("article.caso")];
  const sobre = document.getElementById("sobre-mi");
  const quieto = matchMedia("(prefers-reduced-motion: reduce)");

  lista.innerHTML = casos
    .map((c) => {
      const num = c.querySelector(".caso-num")?.textContent ?? "";
      const nombre = c.querySelector(".caso-titulo")?.textContent ?? "";
      const color = c.style.getPropertyValue("--acento");
      return `<li><a href="#${c.id}" style="--marca-color: ${color}" aria-label="Ir a ${nombre}"><span class="marca-num">${num}</span><span class="marca-nombre">${nombre}</span></a></li>`;
    })
    .join("");
  const marcas = [...lista.querySelectorAll("a")];

  // Tramos: cada proyecto con su color; antes del primero y desde "Sobre mí", el acento general.
  let alto = 0; // alto del riel en px
  let tramos = []; // { desde (0–1), color, marca }
  function medir() {
    alto = nav.clientHeight;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const pos = (el) => Math.min(1, Math.max(0, (el.getBoundingClientRect().top + scrollY - 80) / max));
    tramos = casos.map((c, i) => ({ desde: pos(c), color: c.style.getPropertyValue("--acento"), marca: marcas[i] }));
    if (sobre) tramos.push({ desde: pos(sobre), color: "var(--hi)", marca: null });
    tramos.forEach((t) => t.marca && (t.marca.style.top = `${t.desde * 100}%`));
  }

  let y = 0; // posición de la bola en px
  let v = 0; // velocidad
  let animando = false;
  let tramoActual = -2;

  function progreso() {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    return Math.min(1, Math.max(0, scrollY / max));
  }

  function pintar(estiramiento) {
    const s = 1 + estiramiento;
    bola.style.transform = `translate3d(0, ${y}px, 0) scale(${1 / Math.sqrt(s)}, ${s})`;
  }

  function colorear(p) {
    let i = -1;
    tramos.forEach((t, j) => p >= t.desde - 0.002 && (i = j));
    if (i === tramoActual) return;
    tramoActual = i;
    nav.style.setProperty("--bola-color", i < 0 ? "var(--hi)" : tramos[i].color);
    marcas.forEach((m) => m.setAttribute("aria-current", String(i >= 0 && tramos[i].marca === m)));
  }

  function paso() {
    const objetivo = progreso() * alto;
    if (quieto.matches) {
      y = objetivo;
      v = 0;
      pintar(0);
      animando = false;
      return;
    }
    const antes = y;
    v += (objetivo - y) * 0.06; // resorte hacia el scroll
    v *= 0.86; // rozamiento
    y += v;
    // Al pasar hacia abajo por una marca, la bola "pica" en el escalón y salta un poco.
    if (v > 1) {
      for (const t of tramos) {
        const ty = t.desde * alto;
        if (antes < ty && y >= ty) v *= -0.35;
      }
    }
    pintar(Math.min(0.45, Math.abs(v) / 30));
    if (Math.abs(v) < 0.02 && Math.abs(objetivo - y) < 0.3) {
      y = objetivo;
      pintar(0);
      animando = false;
      return;
    }
    requestAnimationFrame(paso);
  }

  function despertar() {
    colorear(progreso());
    if (!animando) {
      animando = true;
      requestAnimationFrame(paso);
    }
  }

  medir();
  y = progreso() * alto;
  pintar(0);
  colorear(progreso());
  addEventListener("scroll", despertar, { passive: true });
  addEventListener("resize", () => {
    medir();
    despertar();
  });
  // Las capturas cargan tarde y cambian el alto de la página.
  addEventListener("load", () => {
    medir();
    despertar();
  });
  if ("ResizeObserver" in window) new ResizeObserver(() => medir()).observe(document.body);
}

recorrido();

// Nombre que reacciona: las letras de la portada se levantan, crecen y se inclinan
// hacia el mouse (o el dedo) cuando pasa cerca, y vuelven a su lugar con suavidad.
function nombreVivo() {
  const h1 = document.querySelector(".hero-name");
  if (!h1 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Partir el texto en palabras y letras sin perder el <em> de "Marek".
  const letras = [];
  const partir = (nodo) => {
    [...nodo.childNodes].forEach((hijo) => {
      if (hijo.nodeType === Node.ELEMENT_NODE) return partir(hijo);
      const frag = document.createDocumentFragment();
      hijo.textContent.split(/(\s+)/).forEach((trozo) => {
        if (!trozo) return;
        if (/^\s+$/.test(trozo)) return frag.append(trozo);
        const palabra = document.createElement("span");
        palabra.className = "palabra";
        palabra.setAttribute("aria-hidden", "true");
        [...trozo].forEach((c) => {
          const l = document.createElement("span");
          l.className = "letra";
          l.textContent = c;
          palabra.append(l);
          letras.push({ el: l, x: 0, y: 0, ty: 0, rot: 0, esc: 1 });
        });
        frag.append(palabra);
      });
      hijo.replaceWith(frag);
    });
  };
  partir(h1);

  let px = -1e4;
  let py = -1e4;
  let animando = false;

  function medir() {
    letras.forEach((l) => {
      const r = l.el.getBoundingClientRect();
      l.x = r.left + r.width / 2 + scrollX;
      l.y = r.top + r.height / 2 + scrollY;
    });
  }

  function paso() {
    const tam = parseFloat(getComputedStyle(h1).fontSize);
    const radio = tam * 1.6;
    let quietas = true;
    letras.forEach((l) => {
      const dx = px - l.x;
      const dy = py - l.y;
      const f = Math.max(0, 1 - Math.hypot(dx, dy) / radio) ** 2;
      const objTy = -f * tam * 0.14;
      const objRot = Math.max(-1, Math.min(1, dx / radio)) * 9 * f;
      const objEsc = 1 + f * 0.08;
      l.ty += (objTy - l.ty) * 0.16;
      l.rot += (objRot - l.rot) * 0.16;
      l.esc += (objEsc - l.esc) * 0.16;
      if (Math.abs(objTy - l.ty) > 0.05 || Math.abs(objRot - l.rot) > 0.02 || Math.abs(objEsc - l.esc) > 0.001) quietas = false;
      l.el.style.transform = `translate3d(0, ${l.ty.toFixed(2)}px, 0) rotate(${l.rot.toFixed(2)}deg) scale(${l.esc.toFixed(3)})`;
    });
    if (quietas) {
      animando = false;
      return;
    }
    requestAnimationFrame(paso);
  }

  function mover(ev) {
    px = ev.clientX + scrollX;
    py = ev.clientY + scrollY;
    if (!animando) {
      animando = true;
      requestAnimationFrame(paso);
    }
  }

  medir();
  addEventListener("pointermove", mover, { passive: true });
  addEventListener("pointerdown", mover, { passive: true });
  // Al soltar el dedo, las letras vuelven a su lugar.
  addEventListener("pointerup", (ev) => ev.pointerType !== "mouse" && mover({ clientX: -1e4, clientY: -1e4 }));
  document.documentElement.addEventListener("pointerleave", () => mover({ clientX: -1e4, clientY: -1e4 }));
  addEventListener("resize", medir);
  addEventListener("load", medir);
  document.fonts?.ready.then(medir);
}

nombreVivo();

// Cursor: un punto que sigue al mouse con un poco de retraso y toma el color de la
// sección. Sobre un link es un anillo; sobre una captura se agranda y dice "Ver".
// Sólo con mouse y sin "reducir movimiento"; el puntero del sistema sigue visible.
function cursor() {
  const c = document.querySelector(".cursor");
  if (!c) return;
  const conMouse = matchMedia("(hover: hover) and (pointer: fine)");
  const quieto = matchMedia("(prefers-reduced-motion: reduce)");
  if (!conMouse.matches || quieto.matches) return;

  const capturas = ".navegador, .telefono, .muestra-vista";
  const clicables = "a, button, [role='button'], summary, label";
  let x = -100, y = -100, cx = -100, cy = -100;
  let animando = false;
  let seccion = null;

  function paso() {
    cx += (x - cx) * 0.2;
    cy += (y - cy) * 0.2;
    c.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
    if (Math.abs(x - cx) < 0.1 && Math.abs(y - cy) < 0.1) {
      animando = false;
      return;
    }
    requestAnimationFrame(paso);
  }

  addEventListener(
    "pointermove",
    (ev) => {
      if (ev.pointerType !== "mouse") return;
      x = ev.clientX;
      y = ev.clientY;
      c.classList.add("activo");
      const t = ev.target instanceof Element ? ev.target : null;
      const ver = !!t?.closest(capturas);
      c.classList.toggle("ver", ver);
      c.classList.toggle("anillo", !ver && !!t?.closest(clicables));
      // El color sale del proyecto bajo el mouse; fuera de los proyectos, el acento general.
      const caso = t?.closest("article.caso");
      if (caso !== seccion) {
        seccion = caso;
        c.style.setProperty("--cursor-color", caso?.style.getPropertyValue("--acento") || "var(--hi)");
      }
      if (!animando) {
        animando = true;
        requestAnimationFrame(paso);
      }
    },
    { passive: true }
  );
  document.documentElement.addEventListener("pointerleave", () => c.classList.remove("activo"));
}

cursor();
