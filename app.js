/* =========================================================
   CURRÍCULUM DE JUAN MANUEL IRIONDO ORTEGA
   JavaScript sencillo, sin librerías.

   1. Fecha local y año del pie
   2. Menú de móvil
   3. Cabecera al hacer scroll
   4. Aparición de bloques
   5. Contadores de las cifras
   6. Enlace activo del menú
   7. Progreso de la línea de tiempo
   8. Botón para volver arriba
   9. Retrato bajo el enlace "Formación"
   ========================================================= */

// Esta clase permite ocultar los bloques .revelar solo si JavaScript funciona.
document.documentElement.classList.add("js");

const movimientoReducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------------------------------------------------
   1. Fecha local y año del pie
   --------------------------------------------------------- */
// new Date() usa la zona horaria local del dispositivo, nunca UTC.
const hoy = new Date();

const formatoFecha = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "long",
  year: "numeric"
});

document.querySelectorAll("[data-fecha]").forEach(function (elemento) {
  elemento.textContent = formatoFecha.format(hoy);
});

document.querySelectorAll("[data-anio]").forEach(function (elemento) {
  elemento.textContent = hoy.getFullYear();
});

/* ---------------------------------------------------------
   2. Menú de móvil
   --------------------------------------------------------- */
const botonMenu = document.querySelector("[data-menu-boton]");
const menu = document.querySelector("[data-menu]");

function cerrarMenu() {
  if (!menu || !botonMenu) return;

  menu.classList.remove("esta-abierto");
  botonMenu.setAttribute("aria-expanded", "false");
  botonMenu.setAttribute("aria-label", "Abrir menú");
  document.body.classList.remove("menu-abierto");
}

if (botonMenu && menu) {
  botonMenu.addEventListener("click", function () {
    const estaAbierto = botonMenu.getAttribute("aria-expanded") === "true";

    if (estaAbierto) {
      cerrarMenu();
    } else {
      menu.classList.add("esta-abierto");
      botonMenu.setAttribute("aria-expanded", "true");
      botonMenu.setAttribute("aria-label", "Cerrar menú");
      document.body.classList.add("menu-abierto");
    }
  });

  menu.querySelectorAll("a").forEach(function (enlace) {
    enlace.addEventListener("click", cerrarMenu);
  });

  document.addEventListener("keydown", function (evento) {
    const estaAbierto = botonMenu.getAttribute("aria-expanded") === "true";

    if (evento.key === "Escape" && estaAbierto) {
      cerrarMenu();
      botonMenu.focus();
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 860) {
      cerrarMenu();
    }
  });
}

/* ---------------------------------------------------------
   3. Cabecera al hacer scroll
   --------------------------------------------------------- */
const cabecera = document.querySelector("[data-cabecera]");
const botonArriba = document.querySelector("[data-arriba]");
let scrollPendiente = false;

function alDesplazar() {
  const recorrido = window.scrollY;

  if (cabecera) {
    cabecera.classList.toggle("esta-fija", recorrido > 20);
  }

  if (botonArriba) {
    botonArriba.classList.toggle("visible", recorrido > 500);
  }

  actualizarLineaTiempo();
  scrollPendiente = false;
}

function pedirScroll() {
  if (!scrollPendiente) {
    scrollPendiente = true;
    window.requestAnimationFrame(alDesplazar);
  }
}

window.addEventListener("scroll", pedirScroll, { passive: true });

/* ---------------------------------------------------------
   4. Aparición de bloques
   --------------------------------------------------------- */
const elementosRevelar = document.querySelectorAll(".revelar");

// Retraso escalonado dentro de un mismo grupo (por ejemplo, las cifras).
document.querySelectorAll("[data-grupo]").forEach(function (grupo) {
  grupo.querySelectorAll(".revelar").forEach(function (elemento, indice) {
    elemento.style.setProperty("--retraso", indice * 90 + "ms");
  });
});

if (movimientoReducido || !("IntersectionObserver" in window)) {
  elementosRevelar.forEach(function (elemento) {
    elemento.classList.add("esta-visible");
  });
} else {
  const observador = new IntersectionObserver(
    function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("esta-visible");
          observador.unobserve(entrada.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  elementosRevelar.forEach(function (elemento) {
    observador.observe(elemento);
  });
}

/* ---------------------------------------------------------
   5. Contadores de las cifras
   --------------------------------------------------------- */
const contadores = document.querySelectorAll("[data-contador]");

function animarContador(elemento) {
  const objetivo = Number(elemento.dataset.contador);

  if (movimientoReducido) {
    elemento.textContent = objetivo;
    return;
  }

  const duracion = 1200;
  const inicio = performance.now();

  function paso(ahora) {
    const avance = Math.min((ahora - inicio) / duracion, 1);
    const suavizado = 1 - Math.pow(1 - avance, 3);

    elemento.textContent = Math.round(objetivo * suavizado);

    if (avance < 1) {
      window.requestAnimationFrame(paso);
    }
  }

  window.requestAnimationFrame(paso);
}

if ("IntersectionObserver" in window) {
  const observadorContadores = new IntersectionObserver(
    function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          animarContador(entrada.target);
          observadorContadores.unobserve(entrada.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  contadores.forEach(function (contador) {
    observadorContadores.observe(contador);
  });
} else {
  contadores.forEach(function (contador) {
    contador.textContent = contador.dataset.contador;
  });
}

/* ---------------------------------------------------------
   6. Enlace activo del menú
   --------------------------------------------------------- */
const enlacesNav = Array.from(document.querySelectorAll(".nav__enlace"));
const secciones = enlacesNav
  .map(function (enlace) {
    return document.querySelector(enlace.getAttribute("href"));
  })
  .filter(Boolean);

if ("IntersectionObserver" in window && secciones.length > 0) {
  const observadorSecciones = new IntersectionObserver(
    function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;

        enlacesNav.forEach(function (enlace) {
          const activo = enlace.getAttribute("href") === "#" + entrada.target.id;
          enlace.classList.toggle("activo", activo);
        });
      });
    },
    { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
  );

  secciones.forEach(function (seccion) {
    observadorSecciones.observe(seccion);
  });
}

/* ---------------------------------------------------------
   7. Progreso de la línea de tiempo
   --------------------------------------------------------- */
const lineaTiempo = document.querySelector("[data-linea-tiempo]");
const progresoLinea = document.querySelector("[data-progreso-linea]");

function actualizarLineaTiempo() {
  if (!lineaTiempo || !progresoLinea) return;

  if (movimientoReducido) {
    progresoLinea.style.setProperty("--progreso", "1");
    return;
  }

  const caja = lineaTiempo.getBoundingClientRect();
  const altoVentana = window.innerHeight;
  const total = caja.height;

  if (total === 0) return;

  // 0 cuando la línea empieza a entrar por abajo y 1 cuando termina de salir por arriba.
  const avance = (altoVentana - caja.top) / (total + altoVentana);
  const limitado = Math.min(Math.max(avance, 0), 1);

  progresoLinea.style.setProperty("--progreso", limitado.toFixed(3));
}

window.addEventListener("resize", actualizarLineaTiempo);
window.addEventListener("load", actualizarLineaTiempo);

/* ---------------------------------------------------------
   8. Botón para volver arriba
   --------------------------------------------------------- */
if (botonArriba) {
  botonArriba.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: movimientoReducido ? "auto" : "smooth"
    });
  });
}

// Primera pasada al cargar la página.
alDesplazar();

/* ---------------------------------------------------------
   9. Retrato bajo el enlace "Formación"
   --------------------------------------------------------- */
// Las anclas CSS no sirven aquí: la cabecera y el hero no comparten bloque
// contenedor. Se mide el enlace y se pasa el centro al CSS, que solo lo usa
// en escritorio y solo si este script llegó a ejecutarse.
const retrato = document.querySelector("[data-retrato]");
const enlaceFormacion = document.querySelector('[data-ancla="formacion"]');

function centrarRetrato() {
  if (!retrato || !enlaceFormacion || !retrato.parentElement) return;

  const contenedor = retrato.parentElement.getBoundingClientRect();
  const enlace = enlaceFormacion.getBoundingClientRect();

  // Con el menú de móvil cerrado el enlace no tiene ancho: nada que calcular.
  if (enlace.width === 0) return;

  const centro = enlace.left + enlace.width / 2 - contenedor.left;

  retrato.style.setProperty("--centro-formacion", centro.toFixed(2) + "px");
  retrato.setAttribute("data-anclado", "");
}

window.addEventListener("load", centrarRetrato);

// Al redimensionar, la cabecera fija puede medirse antes de recolocarse:
// se espera a dos frames para leer posiciones ya definitivas.
let medidaPendiente = false;

function pedirMedida() {
  if (medidaPendiente) return;

  medidaPendiente = true;

  window.requestAnimationFrame(function () {
    window.requestAnimationFrame(function () {
      medidaPendiente = false;
      centrarRetrato();
    });
  });
}

window.addEventListener("resize", pedirMedida);

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(centrarRetrato);
}

centrarRetrato();
