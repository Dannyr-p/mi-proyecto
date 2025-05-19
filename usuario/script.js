const firebaseConfig = {
  apiKey: "AIzaSyCKI_M2XezuI45BsBh1UwRhaor5YbZvypQ",
  authDomain: "medifocus-edc4b.firebaseapp.com",
  projectId: "medifocus-edc4b",
  storageBucket: "medifocus-edc4b.appspot.com",
  messagingSenderId: "13156485482",
  appId: "1:13156485482:web:e368315f65ab4237f07d13"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let preguntas = [];
let preguntasOriginales = [];
let index = 0;
let aciertos = 0;

// Mezclar un array (Fisher-Yates)
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Cargar especialidades al inicio
async function cargarEspecialidades() {
  const snapshot = await db.collection("preguntas").get();
  const especialidades = new Set();
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.especialidad) especialidades.add(data.especialidad);
  });
  const select = document.getElementById("especialidad");
  select.innerHTML = `<option value="">Todas</option>`;
  especialidades.forEach(esp => {
    select.innerHTML += `<option value="${esp}">${esp}</option>`;
  });
  cargarSubespecialidades();
  cargarTemas();
}

async function cargarSubespecialidades() {
  const especialidad = document.getElementById("especialidad").value;
  let snapshot;
  if (especialidad) {
    snapshot = await db.collection("preguntas").where("especialidad", "==", especialidad).get();
  } else {
    snapshot = await db.collection("preguntas").get();
  }
  const subespecialidades = new Set();
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.subespecialidad) subespecialidades.add(data.subespecialidad);
  });
  const select = document.getElementById("subespecialidad");
  select.innerHTML = `<option value="">Todas</option>`;
  subespecialidades.forEach(sub => {
    select.innerHTML += `<option value="${sub}">${sub}</option>`;
  });
  cargarTemas();
}

async function cargarTemas() {
  const especialidad = document.getElementById("especialidad").value;
  const subespecialidad = document.getElementById("subespecialidad").value;
  let query = db.collection("preguntas");
  if (especialidad) query = query.where("especialidad", "==", especialidad);
  if (subespecialidad) query = query.where("subespecialidad", "==", subespecialidad);
  const snapshot = await query.get();
  const temas = new Set();
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.tema) temas.add(data.tema);
  });
  const select = document.getElementById("tema");
  select.innerHTML = `<option value="">Todos</option>`;
  temas.forEach(t => {
    select.innerHTML += `<option value="${t}">${t}</option>`;
  });
}

// Conectar eventos
document.addEventListener("DOMContentLoaded", () => {
  cargarEspecialidades();
  document.getElementById("especialidad").addEventListener("change", cargarSubespecialidades);
  document.getElementById("subespecialidad").addEventListener("change", cargarTemas);
});

async function cargarPreguntas() {
  const especialidad = document.getElementById("especialidad").value;
  const subespecialidad = document.getElementById("subespecialidad").value;
  const tema = document.getElementById("tema").value;
  let cantidad = parseInt(document.getElementById("cantidad").value);
  if (isNaN(cantidad) || cantidad <= 0) cantidad = 100;

  let query = db.collection("preguntas");
  if (especialidad) query = query.where("especialidad", "==", especialidad);
  if (subespecialidad) query = query.where("subespecialidad", "==", subespecialidad);
  if (tema) query = query.where("tema", "==", tema);

  const snapshot = await query.get();
  preguntas = [];
  snapshot.forEach(doc => preguntas.push(doc.data()));

  if (preguntas.length === 0) {
    alert("No hay preguntas disponibles para esa selección.");
    return;
  }

  preguntas.sort(() => Math.random() - 0.5);
  preguntas = preguntas.slice(0, cantidad);
  // Guardamos el set original para volver a intentar sin recargar ni filtrar de nuevo
  preguntasOriginales = preguntas.map(p => JSON.parse(JSON.stringify(p)));
  index = 0;
  aciertos = 0;

  document.getElementById("filtro").style.display = "none";
  document.getElementById("quiz").style.display = "block";
  cargarPregunta();
}

function cargarPregunta() {
  const q = preguntas[index];
  document.getElementById("pregunta").innerText = q.pregunta;
  document.getElementById("contador").innerText = `Pregunta ${index + 1} de ${preguntas.length}`;
  document.getElementById("aciertos").innerText = `✔️ ${aciertos} aciertos`;
  document.getElementById("progreso").style.width = ((index) / preguntas.length) * 100 + "%";

  const opciones = document.getElementById("opciones");
  opciones.innerHTML = "";

  // Mezcla las opciones y las asigna a letras a, b, c, d, e
  const letras = ['a', 'b', 'c', 'd', 'e'];
  const arrOpciones = Object.entries(q.opciones);
  shuffle(arrOpciones);

  // Guardar la nueva relación para saber cuál es la correcta
  q._letraCorrecta = undefined;
  q._mapOpciones = {};

  arrOpciones.forEach(([letraOriginal, texto], i) => {
    const letraNueva = letras[i];
    if (letraOriginal === q.correcta) q._letraCorrecta = letraNueva;
    q._mapOpciones[letraNueva] = { texto, letraOriginal };
    const label = document.createElement("label");
    label.innerHTML = `<input type="radio" name="respuesta" value="${letraNueva}"> <span class="letra">${letraNueva}.</span> ${texto}`;
    opciones.appendChild(label);
  });

  document.getElementById("feedback").style.display = "none";
  document.getElementById("btnSiguiente").style.display = "none";
  document.getElementById("btnVerificar").style.display = "inline-block";
}

function verificar() {
  const seleccionada = document.querySelector('input[name="respuesta"]:checked');
  if (!seleccionada) return alert("Selecciona una respuesta.");
  const q = preguntas[index];
  const correcta = q._letraCorrecta;
  const user = seleccionada.value;

  if (user === correcta) aciertos++;

  let html = "";
  const letras = ['a', 'b', 'c', 'd', 'e'];
  letras.forEach(letra => {
    if (q._mapOpciones[letra]) {
      const letraOriginal = q._mapOpciones[letra].letraOriginal;
      const icono = letra === correcta ? "✅" : (letra === user ? "❌" : "•");
      html += `<div class="feedback-opcion"><strong>${icono} ${letra}:</strong> ${q.explicacion && q.explicacion[letraOriginal] ? q.explicacion[letraOriginal] : ''}</div>`;
    }
  });

  document.getElementById("feedback").innerHTML = html;
  document.getElementById("feedback").style.display = "block";

  document.querySelectorAll('#opciones input[name="respuesta"]').forEach(input => {
    const label = input.closest("label");
    if (input.value === correcta) {
      label.classList.add("correcta");
    } else if (input.checked && input.value !== correcta) {
      label.classList.add("incorrecta");
    }
  });

  document.getElementById("btnVerificar").style.display = "none";
  document.getElementById("btnSiguiente").style.display = "inline-block";
  document.getElementById("aciertos").innerText = `✔️ ${aciertos} aciertos`;
}

function siguiente() {
  index++;
  if (index >= preguntas.length) {
    mostrarResultados();
  } else {
    cargarPregunta();
  }
}

function mostrarResultados() {
  const total = preguntas.length;
  const porcentaje = Math.round((aciertos / total) * 100);
  let rango = "";

  if (porcentaje >= 90) rango = "🔵 Excelente";
  else if (porcentaje >= 70) rango = "🟢 Bueno";
  else if (porcentaje >= 50) rango = "🟡 Regular";
  else rango = "🔴 Necesita mejorar";

  document.getElementById("quiz").innerHTML = `
    <div class="resultado-final">
      <h2>Resultados</h2>
      <p><strong>Puntuación:</strong> ${aciertos} / ${total}</p>
      <p><strong>Porcentaje de aciertos:</strong> ${porcentaje}%</p>
      <p><strong>Evaluación:</strong> ${rango}</p>
      <button onclick="volverAIntentar()" class="boton">Volver a intentar</button><br><br>
      <button onclick="window.location.href=window.location.href" class="boton secundario">Hacer otro quiz</button>
    </div>
  `;
}

// Esta función permite reiniciar el quiz de inmediato con las mismas preguntas pero en orden aleatorio nuevo
function volverAIntentar() {
  // Clona el arreglo de preguntas originales y lo mezcla
  preguntas = preguntasOriginales.map(p => JSON.parse(JSON.stringify(p)));
  preguntas.sort(() => Math.random() - 0.5);
  index = 0;
  aciertos = 0;
  document.getElementById("filtro").style.display = "none";
  document.getElementById("quiz").style.display = "block";
  document.getElementById("quiz").innerHTML = `
    <div class="barra-progreso">
      <div id="progreso" class="progreso-fill"></div>
    </div>
    <div class="topbar">
      <span id="contador">Pregunta 1</span>
      <span id="aciertos">✔️ 0 aciertos</span>
    </div>
    <h2 id="pregunta"></h2>
    <form id="opciones" class="opciones"></form>
    <div id="feedback" class="feedback" style="display:none;"></div>
    <button id="btnVerificar" onclick="verificar();return false;" class="boton">Verificar</button>
    <button id="btnSiguiente" onclick="siguiente();return false;" class="boton secundario" style="display:none;">Siguiente pregunta</button>
  `;
  cargarPregunta();
}
