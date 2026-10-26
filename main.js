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

// Entrada: arranca cuando está la tipografía (o a los 700 ms), se saltea con un clic o una
// tecla y sólo se ve una vez por visita.
function entrada() {
  if (!raiz.classList.contains("con-intro")) return;
  try {
    sessionStorage.setItem("entrada", "1");
  } catch {}
  const intro = document.querySelector(".intro");
  const terminar = () => raiz.classList.remove("con-intro");
  const saltear = () => {
    raiz.classList.remove("entrada");
    terminar();
  };
  Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 700))]).then(() => {
    raiz.classList.add("intro-lista");
    setTimeout(terminar, 1900);
  });
  intro?.addEventListener("pointerdown", saltear, { once: true });
  addEventListener("keydown", saltear, { once: true });
}

entrada();

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

// Copiar el mail: para quien no usa Gmail ni tiene un programa de correo configurado.
document.querySelector(".copiar-mail")?.addEventListener("click", async (ev) => {
  const boton = ev.currentTarget;
  const aviso = document.querySelector(".copiar-aviso");
  const mail = boton.dataset.mail;
  try {
    await navigator.clipboard.writeText(mail);
    aviso.textContent = "Copiado";
  } catch {
    // Sin permiso para el portapapeles: se muestra el mail para copiarlo a mano.
    aviso.textContent = mail;
  }
  clearTimeout(boton._t);
  boton._t = setTimeout(() => (aviso.textContent = ""), 2500);
});

// Aparición suave al hacer scroll (sin animación si se pidió reducir movimiento).
function revelar() {
  const objetivos = document.querySelectorAll(".caso-head, .vitrina, .caso-cuerpo, .muestra, .sobre");
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

// Clips: en las vistas con armador de pedidos, al pasar el mouse se ve el pedido armándose.
// En el celular (sin mouse) se reproducen solos cuando quedan a la vista.
function clips() {
  const videos = [...document.querySelectorAll(".clip")];
  if (!videos.length || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const caja = (v) => v.closest(".muestra, .vitrina");
  const play = (v) => {
    v.currentTime = 0;
    v.play().then(() => caja(v).classList.add("en-accion")).catch(() => {});
  };
  const parar = (v) => {
    caja(v).classList.remove("en-accion");
    v.pause();
  };
  videos.forEach((v) => {
    caja(v).addEventListener("pointerenter", (e) => e.pointerType === "mouse" && play(v));
    caja(v).addEventListener("pointerleave", (e) => e.pointerType === "mouse" && parar(v));
  });
  if (matchMedia("(hover: hover)").matches || !("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver(
    (entradas) => entradas.forEach((e) => (e.isIntersecting ? play(e.target) : parar(e.target))),
    { threshold: 0.6 }
  );
  videos.forEach((v) => io.observe(v));
}

clips();

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
    // La bola 3D (bola3d.js) dibuja lo mismo con three.js.
    nav.estadoBola = { y, estiramiento };
    nav.dispatchEvent(new CustomEvent("bola"));
  }

  function colorear(p) {
    let i = -1;
    tramos.forEach((t, j) => p >= t.desde - 0.002 && (i = j));
    if (i === tramoActual) return;
    tramoActual = i;
    nav.style.setProperty("--bola-color", i < 0 ? "var(--hi)" : tramos[i].color);
    nav.dispatchEvent(new CustomEvent("color"));
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
        if (antes < ty && y >= ty) {
          v *= -0.35;
          nav.dispatchEvent(new CustomEvent("bote", { detail: { y: ty } }));
        }
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
