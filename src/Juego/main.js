document.addEventListener("DOMContentLoaded", () => {
  // Elementos del DOM
  const btnNuevoJuego = document.getElementById("juego-nuevo");
  const btnTomarCarta = document.getElementById("tomar-carta");
  const btnParar = document.getElementById("parar");
  const cartasJugador = document.getElementById("cartas-jugador");
  const cartasPC = document.getElementById("cartas-pc");
  const puntuacionJugadorElement =
    document.getElementById("puntuacion-jugador");
  const puntuacionPCElement = document.getElementById("puntuacion-pc");

  // Variables del juego
  let baraja = [];
  let manoJugador = [];
  let manoPC = [];
  let puntuacionJugador = 0;
  let puntuacionPC = 0;
  let juegoEnCurso = false;

  // Inicializar el juego
  function inicializarJuego() {
    baraja = crearBaraja();
    manoJugador = [];
    manoPC = [];
    puntuacionJugador = 0;
    puntuacionPC = 0;
    juegoEnCurso = true;

    cartasJugador.innerHTML = "";
    cartasPC.innerHTML = "";
    puntuacionJugadorElement.textContent = "";
    puntuacionPCElement.textContent = "";

    btnTomarCarta.disabled = false;
    btnParar.disabled = false;
    btnNuevoJuego.disabled = true;

    // Repartir cartas iniciales
    repartirCartasIniciales();
  }

  // Crear una baraja de 52 cartas
  function crearBaraja() {
    const palos = ["hearts", "diamonds", "clubs", "spades"];
    const valores = [
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "J",
      "Q",
      "K",
      "A",
    ];
    const baraja = [];

    for (let palo of palos) {
      for (let valor of valores) {
        baraja.push({ palo, valor });
      }
    }

    return baraja.sort(() => Math.random() - 0.5); // Barajar
  }

  // Repartir cartas iniciales (2 al jugador, 1 al dealer)
  function repartirCartasIniciales() {
    // Jugador recibe 2 cartas
    tomarCartaJugador();
    tomarCartaJugador();

    // Dealer recibe 1 carta boca arriba
    tomarCartaPC(true);
  }

  // Jugador toma una carta
  function tomarCartaJugador() {
    if (!juegoEnCurso) return;

    const carta = baraja.pop();
    manoJugador.push(carta);
    puntuacionJugador = calcularPuntuacion(manoJugador);
    puntuacionJugadorElement.textContent = `Puntuación: ${puntuacionJugador}`;

    mostrarCarta(carta, cartasJugador);

    if (puntuacionJugador > 21) {
      finalizarJuego("¡Te pasaste de 21! Perdiste.");
    } else if (puntuacionJugador === 21) {
      finalizarJuego("¡Blackjack! Ganaste.");
    }
  }

  // Dealer toma una carta
  function tomarCartaPC(mostrar = true) {
    const carta = baraja.pop();
    manoPC.push(carta);
    puntuacionPC = calcularPuntuacion(manoPC);
    puntuacionJugadorElement.textContent = `Puntuación: ${puntuacionJugador}`;
    puntuacionPCElement.textContent = `Puntuación: ${puntuacionPC}`;

    if (mostrar) {
      mostrarCarta(carta, cartasPC);
    } else {
      mostrarCartaOculta(cartasPC);
    }
  }

  // Calcular puntuación
  function calcularPuntuacion(mano) {
    let puntuacion = 0;
    let ases = 0;

    for (let carta of mano) {
      if (["J", "Q", "K"].includes(carta.valor)) {
        puntuacion += 10;
      } else if (carta.valor === "A") {
        puntuacion += 11;
        ases++;
      } else {
        puntuacion += parseInt(carta.valor);
      }
    }

    // Ajustar valor de los ases si nos pasamos de 21
    while (puntuacion > 21 && ases > 0) {
      puntuacion -= 10;
      ases--;
    }

    return puntuacion;
  }

  // Mostrar carta
  function mostrarCarta(carta, contenedor) {
    const cartaElemento = document.createElement("div");
    cartaElemento.className = "d-inline-block mx-2";

    // Formato correcto para los nombres de archivo
    const paloFormateado =
      carta.palo === "clubs"
        ? "clubs"
        : carta.palo === "spades"
        ? "spades"
        : carta.palo === "hearts"
        ? "hearts"
        : "diamonds";

    cartaElemento.innerHTML = `
      <img src="/Cartas/${carta.valor}_of_${paloFormateado}.png" 
           alt="${carta.valor} of ${carta.palo}" 
           style="width: 120px; height: auto;">
    `;

    contenedor.appendChild(cartaElemento);
  }

  // Mostrar carta oculta (para el dealer)
  function mostrarCartaOculta(contenedor) {
    const cartaElemento = document.createElement("div");
    cartaElemento.className = "d-inline-block mx-2";

    cartaElemento.innerHTML = `
      <img src="src/Cartas/black_joker.png" 
           alt="Carta oculta" 
           style="width: 120px; height: auto;">
    `;

    contenedor.appendChild(cartaElemento);
  }

  // Lógica del turno del dealer
  function turnoDealer() {
    // Mostrar la carta oculta del dealer
    cartasPC.innerHTML = "";
    manoPC.forEach((carta) => mostrarCarta(carta, cartasPC));

    // El dealer sigue tomando cartas hasta llegar al menos a 17
    while (puntuacionPC < 17) {
      tomarCartaPC(true);
    }

    // Determinar el resultado
    let mensaje = "";
    if (puntuacionPC > 21) {
      mensaje = `Dealer se pasó (${puntuacionPC}). ¡Ganaste!`;
    } else if (puntuacionPC === puntuacionJugador) {
      mensaje = `Empate (${puntuacionJugador} a ${puntuacionPC})`;
    } else if (puntuacionPC > puntuacionJugador) {
      mensaje = `Perdiste (${puntuacionJugador} vs ${puntuacionPC})`;
    } else {
      mensaje = `¡Ganaste! (${puntuacionJugador} vs ${puntuacionPC})`;
    }

    finalizarJuego(mensaje);
  }

  // Finalizar el juego
  function finalizarJuego(mensaje) {
    juegoEnCurso = false;
    btnTomarCarta.disabled = true;
    btnParar.disabled = true;
    btnNuevoJuego.disabled = false;

    if (
      mensaje.includes("Perdiste") ||
      mensaje.includes("Ganaste") ||
      mensaje.includes("Empate")
    ) {
      // Si ya es un mensaje final, mostrarlo directamente
      setTimeout(() => alert(mensaje), 500);
    } else {
      // Si el jugador se planta, ejecutar turno del dealer
      setTimeout(() => {
        turnoDealer();
      }, 500);
    }
  }

  // Event listeners
  btnNuevoJuego.addEventListener("click", inicializarJuego);
  btnTomarCarta.addEventListener("click", tomarCartaJugador);
  btnParar.addEventListener("click", () => {
    if (!juegoEnCurso) return;
    finalizarJuego("Te plantaste. Turno del dealer...");
  });

  // Deshabilitar botones al inicio
  btnTomarCarta.disabled = true;
  btnParar.disabled = true;
});
