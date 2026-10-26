// Entrada en 3D: una esfera cae sobre la línea de "MrK", pica con su sombra y anillos en el
// piso, y queda como el punto. Después la página se abre en círculo desde la esfera, que
// viaja hasta su lugar en el riel del recorrido. main.js la arranca; devuelve false si no hay WebGL.
import * as T from "./vendor/three.min.js";

const raiz = document.documentElement;
const suave = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2); // ease in-out cúbica
const sale = (t) => 1 - (1 - t) ** 3; // ease out cúbica
const limitar = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

// Textura de sombra suave: un degradé radial que se apoya en el piso.
function texturaSombra() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  const d = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  d.addColorStop(0, "rgba(0,0,0,.55)");
  d.addColorStop(0.45, "rgba(0,0,0,.22)");
  d.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = d;
  g.fillRect(0, 0, 128, 128);
  return new T.CanvasTexture(c);
}

export function correr(intro, { alSalir, alAbrir, alTerminar }) {
  const punto = intro.querySelector(".intro-punto");
  const fondo = intro.querySelector(".intro-fondo");
  let renderer;
  try {
    renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch {
    return false;
  }
  raiz.classList.add("intro-3d");

  const W = innerWidth;
  const H = innerHeight;
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setSize(W, H, false);
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.className = "intro-lienzo";
  intro.append(renderer.domElement);

  const escena = new T.Scene();
  const pmrem = new T.PMREMGenerator(renderer);
  const ambiente = pmrem.fromScene(new T.RoomEnvironment(), 0.04).texture;
  escena.environment = ambiente;
  const luz = new T.DirectionalLight(0xffffff, 1.6);
  luz.position.set(-3, 5, 4);
  escena.add(luz);

  // Cámara apenas por encima del piso: los anillos se ven como elipses.
  const camara = new T.PerspectiveCamera(26, W / H, 0.1, 200);
  camara.position.set(0, 3.2, 16);
  camara.lookAt(0, 0, 0);
  camara.updateMatrixWorld();
  const altoVisible = 2 * camara.position.length() * Math.tan((13 * Math.PI) / 180);
  const porPixel = altoVisible / H; // unidades por px a la distancia del texto

  // Pasa un punto de la pantalla a la escena, sobre un plano dado.
  const rayo = new T.Raycaster();
  const ndc = new T.Vector2();
  function enPlano(x, y, plano) {
    ndc.set((x / W) * 2 - 1, -(y / H) * 2 + 1);
    rayo.setFromCamera(ndc, camara);
    const p = new T.Vector3();
    return rayo.ray.intersectPlane(plano, p) ?? p;
  }

  // Dónde termina la esfera: el centro del punto de "MrK.".
  const caja = punto.getBoundingClientRect();
  const px = caja.left + caja.width / 2;
  const py = caja.top + caja.height / 2;
  const radioPx = caja.width / 2;
  const r = radioPx * porPixel;
  // El piso es horizontal y pasa justo por debajo del punto: ahí se apoya la esfera.
  const planoFrente = new T.Plane(new T.Vector3(0, 0, 1), 0);
  const reposo = enPlano(px, py, planoFrente);
  const piso = reposo.y - r;

  const color = new T.Color(getComputedStyle(raiz).getPropertyValue("--hi").trim() || "#c8401f");
  const material = new T.MeshPhysicalMaterial({
    color,
    roughness: 0.2,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.1,
  });
  const cuerpo = new T.Group();
  const esfera = new T.Mesh(new T.SphereGeometry(1, 96, 64), material);
  esfera.position.y = 1; // el grupo se escala desde la base: se aplasta contra el piso
  cuerpo.add(esfera);
  escena.add(cuerpo);

  const sombra = new T.Mesh(
    new T.PlaneGeometry(1, 1),
    new T.MeshBasicMaterial({ map: texturaSombra(), transparent: true, depthWrite: false, opacity: 0 })
  );
  sombra.rotation.x = -Math.PI / 2;
  sombra.position.set(reposo.x, piso + 0.001, reposo.z);
  escena.add(sombra);

  const anillos = Array.from({ length: 4 }, () => {
    const m = new T.Mesh(
      new T.RingGeometry(0.94, 1, 128),
      new T.MeshBasicMaterial({ color, transparent: true, opacity: 0, side: T.DoubleSide, depthWrite: false })
    );
    m.rotation.x = -Math.PI / 2;
    m.position.set(reposo.x, piso + 0.002, reposo.z);
    m.visible = false;
    escena.add(m);
    return { m, desde: 0, fuerza: 0 };
  });
  function onda(t, fuerza) {
    const a = anillos.find((x) => !x.m.visible) ?? anillos[0];
    a.m.visible = true;
    a.desde = t;
    a.fuerza = fuerza;
  }

  // Caída: arranca arriba de la pantalla, tarda ~0,6 s en llegar y pica hasta quedarse.
  // y es la altura del centro sobre el piso.
  const alto0 = enPlano(px, 0, planoFrente).y - piso + 3 * r;
  const g = (2 * (alto0 - r)) / 0.62 ** 2;
  let y = alto0;
  let v = 0;
  let aplaste = 0; // 0..1, se recupera con un resorte
  let vAplaste = 0;
  let quieta = false;
  let tQuieta = 0;
  const vMax = Math.sqrt(2 * g * (alto0 - r));

  // Salida: hacia el riel del recorrido (o la esquina de arriba si no está).
  const nav = document.querySelector(".recorrido");
  const riel = nav?.getBoundingClientRect();
  const destino = riel
    ? { x: riel.left, y: riel.top + (nav.estadoBola?.y ?? 0), r: innerWidth >= 1360 ? 10 : innerWidth >= 720 ? 8 : 5 }
    : { x: W - 24, y: 24, r: 6 };
  const radioHueco = Math.hypot(Math.max(px, W - px), Math.max(py, H - py)) + 60;
  const ESPERA = 280; // ms quieta antes de abrir
  const SALIDA = 1100; // ms de viaje y apertura

  let t0 = 0;
  let tAnterior = 0;
  let tSalida = 0;
  let cerrada = false;

  function limpiar() {
    if (cerrada) return;
    cerrada = true;
    renderer.setAnimationLoop(null);
    renderer.domElement.remove();
    ambiente.dispose();
    pmrem.dispose();
    renderer.dispose();
    raiz.classList.remove("intro-3d");
  }

  function cuadro(ahora) {
    // Si la persona la salteó, main.js ya sacó .con-intro.
    if (!raiz.classList.contains("con-intro")) return limpiar();
    if (!t0) t0 = tAnterior = ahora;
    const dt = Math.min(0.05, (ahora - tAnterior) / 1000);
    tAnterior = ahora;

    if (!tSalida) {
      // Física con pasos chicos para que los piques sean prolijos.
      const pasos = 4;
      for (let i = 0; i < pasos && !quieta; i++) {
        const h = dt / pasos;
        v -= g * h;
        y += v * h;
        if (y <= r) {
          y = r;
          const impacto = -v;
          v = impacto * 0.48;
          const f = limitar(impacto / vMax);
          aplaste = Math.max(aplaste, 0.38 * f);
          vAplaste = 0;
          if (f > 0.12) onda(ahora, f);
          if (v < vMax * 0.05) {
            v = 0;
            quieta = true;
            tQuieta = ahora;
          }
        }
      }
      // Resorte del aplaste (vuelve a la forma con un rebote leve).
      vAplaste += (-aplaste * 900 - vAplaste * 26) * dt;
      aplaste = limitar(aplaste + vAplaste * dt, -0.12, 0.45);

      const estira = quieta ? 0 : Math.min(0.16, (Math.abs(v) / vMax) * 0.16);
      const sy = (1 - aplaste) * (1 + estira);
      const sx = 1 / Math.sqrt(Math.max(0.3, sy));
      cuerpo.position.set(reposo.x, piso + y - r, reposo.z);
      cuerpo.scale.set(r * sx, r * sy, r * sx);

      const altura = y - r;
      const cerca = 1 - limitar(altura / (10 * r));
      sombra.scale.setScalar(r * (2.2 + 2.4 * (1 - cerca)));
      sombra.material.opacity = 0.6 * cerca * cerca;

      if (quieta && ahora - tQuieta > ESPERA) {
        tSalida = ahora;
        alSalir();
        alAbrir();
      }
    } else {
      // Viaje al riel por un arco, achicándose, mientras se abre la página.
      const p = limitar((ahora - tSalida) / SALIDA);
      const e = suave(p);
      const cx = (px + destino.x) / 2 + (destino.x - px) * 0.1;
      const cy = Math.min(py, destino.y) - H * 0.18;
      const sx = (1 - e) ** 2 * px + 2 * (1 - e) * e * cx + e * e * destino.x;
      const sy = (1 - e) ** 2 * py + 2 * (1 - e) * e * cy + e * e * destino.y;
      const rp = radioPx + (destino.r - radioPx) * e;
      const c = enPlano(sx, sy, planoFrente);
      const rr = rp * porPixel;
      cuerpo.position.set(c.x, c.y - rr, c.z);
      cuerpo.scale.setScalar(rr);
      esfera.rotation.z = -e * Math.PI * 1.5;

      sombra.material.opacity *= 0.82;
      // La página se abre en un círculo de borde suave que nace en la esfera.
      const hueco = radioHueco * suave(limitar((ahora - tSalida) / (SALIDA * 0.9)));
      const mascara = `radial-gradient(circle at ${px}px ${py}px, transparent ${hueco}px, #000 ${hueco + 48}px)`;
      fondo.style.maskImage = fondo.style.webkitMaskImage = mascara;

      if (p >= 1) {
        renderer.render(escena, camara);
        alTerminar();
        return limpiar();
      }
    }

    for (const a of anillos) {
      if (!a.m.visible) continue;
      const q = limitar((ahora - a.desde) / 900);
      a.m.scale.setScalar(r * (1.1 + 5 * a.fuerza * sale(q)));
      a.m.material.opacity = 0.55 * a.fuerza * (1 - q) * (tSalida ? 0.6 : 1);
      if (q >= 1) a.m.visible = false;
    }

    renderer.render(escena, camara);
  }

  renderer.setAnimationLoop(cuadro);
  return true;
}
