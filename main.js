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

// Aparición suave al hacer scroll (sin animación si se pidió reducir movimiento).
function revelar() {
  const objetivos = document.querySelectorAll(".caso-head, .vitrina, .caso-cuerpo, .sobre");
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
