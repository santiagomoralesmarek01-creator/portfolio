// Bola 3D del recorrido: la misma bola de main.js, dibujada con three.js.
// Rueda a medida que baja, se estira con la velocidad, deja un anillo al picar en
// cada proyecto y toma su color. Si no hay WebGL, queda la bola plana de siempre.

const nav = document.querySelector(".recorrido");

async function iniciar() {
  const THREE = await import("./vendor/three.min.js");

  const lienzo = document.createElement("canvas");
  lienzo.className = "bola-3d";
  lienzo.setAttribute("aria-hidden", "true");
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: lienzo, alpha: true, antialias: true });
  } catch {
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  nav.append(lienzo);

  // Para leer el color de la sección ya resuelto (las variables cambian con el tema).
  const muestra = document.createElement("span");
  muestra.style.cssText = "position:absolute;width:0;height:0;color:var(--bola-color)";
  nav.append(muestra);

  const ANCHO = 64; // px del lienzo, centrado en el riel
  const MARGEN = 28; // px arriba y abajo, para que la bola y los anillos no se corten
  const escena = new THREE.Scene();
  const camara = new THREE.OrthographicCamera(-ANCHO / 2, ANCHO / 2, 0, -100, -200, 200);

  escena.add(new THREE.HemisphereLight(0xffffff, 0x8a8478, 1.6));
  const luz = new THREE.DirectionalLight(0xffffff, 2.4);
  luz.position.set(-2, 3, 4);
  escena.add(luz);
  const contraluz = new THREE.DirectionalLight(0xffffff, 0.9);
  contraluz.position.set(3, -2, 1);
  escena.add(contraluz);

  // Textura blanca con una costura: multiplicada por el color, deja ver que la bola rueda.
  const tela = document.createElement("canvas");
  tela.width = 256;
  tela.height = 128;
  const c = tela.getContext("2d");
  c.fillStyle = "#fff";
  c.fillRect(0, 0, 256, 128);
  c.fillStyle = "rgba(0,0,0,.22)";
  c.fillRect(0, 61, 256, 6);
  const textura = new THREE.CanvasTexture(tela);
  textura.colorSpace = THREE.SRGBColorSpace;

  const colorDestino = new THREE.Color();
  const material = new THREE.MeshPhysicalMaterial({
    map: textura,
    roughness: 0.38,
    clearcoat: 0.8,
    clearcoatRoughness: 0.25,
  });
  const color = material.color; // se va acercando a colorDestino
  const cuerpo = new THREE.Group(); // se estira en vertical
  const esfera = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), material); // rueda
  cuerpo.add(esfera);
  escena.add(cuerpo);

  // Anillos que se abren al picar en una marca, vistos un poco desde arriba.
  const anillos = Array.from({ length: 3 }, () => {
    const m = new THREE.Mesh(
      new THREE.RingGeometry(0.86, 1, 64),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })
    );
    m.rotation.x = -Math.PI / 2 + 0.3;
    m.visible = false;
    escena.add(m);
    return { m, desde: 0 };
  });

  let radio = 10;
  function medir() {
    const alto = nav.clientHeight + MARGEN * 2;
    renderer.setSize(ANCHO, alto, false);
    camara.bottom = -alto;
    camara.updateProjectionMatrix();
    radio = innerWidth >= 1360 ? 10 : innerWidth >= 720 ? 8 : 5;
    pedir();
  }

  function leerColor() {
    colorDestino.setStyle(getComputedStyle(muestra).color);
    pedir();
  }

  let pedido = false;
  function pedir() {
    if (!pedido) {
      pedido = true;
      requestAnimationFrame(cuadro);
    }
  }

  function cuadro(t) {
    pedido = false;
    const { y = 0, estiramiento = 0 } = nav.estadoBola ?? {};
    const s = 1 + estiramiento;
    cuerpo.position.y = -(MARGEN + y);
    cuerpo.scale.set(radio / Math.sqrt(s), radio * s, radio / Math.sqrt(s));
    esfera.rotation.x = 0.6 + y / radio; // rodar: avanza su circunferencia

    color.lerp(colorDestino, 0.15);
    let seguir = Math.abs(color.r - colorDestino.r) + Math.abs(color.g - colorDestino.g) + Math.abs(color.b - colorDestino.b) > 0.003;
    if (!seguir) color.copy(colorDestino);

    for (const a of anillos) {
      if (!a.m.visible) continue;
      const p = Math.min(1, (t - a.desde) / 700);
      const e = 1 - (1 - p) ** 3;
      a.m.scale.setScalar(radio * (1.2 + 2.2 * e));
      a.m.material.opacity = 0.6 * (1 - p);
      a.m.material.color.copy(color);
      if (p >= 1) a.m.visible = false;
      else seguir = true;
    }

    renderer.render(escena, camara);
    if (seguir) pedir();
  }

  nav.addEventListener("bola", pedir);
  nav.addEventListener("color", leerColor);
  nav.addEventListener("bote", (ev) => {
    const a = anillos.find((x) => !x.m.visible) ?? anillos[0];
    a.m.position.y = -(MARGEN + ev.detail.y);
    a.m.visible = true;
    a.desde = performance.now();
    pedir();
  });
  // Cambio de tema: los colores de cada sección son otros.
  new MutationObserver(leerColor).observe(document.documentElement, { attributes: true, attributeFilter: ["data-tema"] });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", leerColor);
  new ResizeObserver(medir).observe(nav);

  medir();
  colorDestino.setStyle(getComputedStyle(muestra).color);
  color.copy(colorDestino);
  nav.classList.add("con-3d");
}

// Se carga cuando la página ya terminó, para no competir con las capturas.
if (nav) {
  const arrancar = () => (window.requestIdleCallback ?? setTimeout)(() => iniciar().catch(() => {}));
  if (document.readyState === "complete") arrancar();
  else addEventListener("load", arrancar, { once: true });
}
