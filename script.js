const preguntas = [
  {
    texto: "¿Cuál es la capital de Francia?",
    opciones: ["Madrid", "París", "Berlín", "Roma"],
    respuestaCorrecta: 1,
    explicacion: "París es la capital de Francia."
  },
  {
    texto: "¿Cuántos huesos tiene el cuerpo humano adulto?",
    opciones: ["206", "201", "210", "198"],
    respuestaCorrecta: 0,
    explicacion: "El cuerpo humano tiene 206 huesos en total."
  }
];

let preguntaActual = 0;

const preguntaEl = document.getElementById("pregunta");
const opcionesEl = document.getElementById("opciones");
const btnSiguiente = document.getElementById("siguiente");
const explicacionEl = document.getElementById("explicacion");

function mostrarPregunta() {
  const p = preguntas[preguntaActual];
  preguntaEl.textContent = p.texto;
  opcionesEl.innerHTML = "";
  explicacionEl.style.display = "none";
  btnSiguiente.style.display = "none";

  p.opciones.forEach((opcion, index) => {
    const li = document.createElement("li");
    li.textContent = opcion;
    li.addEventListener("click", () => seleccionarRespuesta(index));
    opcionesEl.appendChild(li);
  });
}

function seleccionarRespuesta(indice) {
  const p = preguntas[preguntaActual];
  const opciones = opcionesEl.querySelectorAll("li");

  opciones.forEach((li, i) => {
    li.style.pointerEvents = "none";
    if (i === p.respuestaCorrecta) {
      li.classList.add("correcto");
    } else if (i === indice) {
      li.classList.add("incorrecto");
    }
  });

  explicacionEl.textContent = p.explicacion;
  explicacionEl.style.display = "block";
  btnSiguiente.style.display = "inline-block";
}

btnSiguiente.addEventListener("click", () => {
  preguntaActual++;
  if (preguntaActual < preguntas.length) {
    mostrarPregunta();
  } else {
    preguntaEl.textContent = "¡Has terminado el cuestionario!";
    opcionesEl.innerHTML = "";
    explicacionEl.style.display = "none";
    btnSiguiente.style.display = "none";
  }
});

mostrarPregunta();
