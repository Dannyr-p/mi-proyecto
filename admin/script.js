// --- CONFIGURACIÓN DE FIREBASE ---
// Reemplaza estos valores con los tuyos de Firebase
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- CARGA DE ESPECIALIDADES EN VARIOS SELECTS ---
function cargarEspecialidades() {
  const especialidadSelects = [
    document.getElementById("especialidad"),
    document.getElementById("relacionEspecialidad"),
    document.getElementById("temaEspecialidad")
  ];
  db.collection("especialidades").onSnapshot((snapshot) => {
    especialidadSelects.forEach(select => select.innerHTML = "");
    snapshot.forEach((doc) => {
      especialidadSelects.forEach(select => {
        const option = document.createElement("option");
        option.value = doc.id;
        option.text = doc.data().nombre;
        select.appendChild(option.cloneNode(true));
      });
    });
    cargarSubespecialidades();
    cargarSubespecialidadesParaTemas();
    cargarTemas();
    listarEspecialidades();
  });
}

// --- CARGA DE SUBESPECIALIDADES ---
function cargarSubespecialidades() {
  const especialidadId = document.getElementById("especialidad").value;
  const subespecialidadSelect = document.getElementById("subespecialidad");
  subespecialidadSelect.innerHTML = "<option value=''>Ninguna</option>";
  if (!especialidadId) return;
  db.collection("subespecialidades").where("especialidadId", "==", especialidadId).onSnapshot((snapshot) => {
    snapshot.forEach((doc) => {
      const option = document.createElement("option");
      option.value = doc.id;
      option.text = doc.data().nombre;
      subespecialidadSelect.appendChild(option);
    });
    cargarTemas();
    listarSubespecialidades();
  });
}

// --- CARGA DE SUBESPECIALIDADES PARA TEMAS ---
function cargarSubespecialidadesParaTemas() {
  const especialidadId = document.getElementById("temaEspecialidad").value;
  const temaSubespecialidad = document.getElementById("temaSubespecialidad");
  temaSubespecialidad.innerHTML = "<option value=''>Ninguna</option>";
  if (!especialidadId) return;
  db.collection("subespecialidades").where("especialidadId", "==", especialidadId).onSnapshot((snapshot) => {
    snapshot.forEach((doc) => {
      const option = document.createElement("option");
      option.value = doc.id;
      option.text = doc.data().nombre;
      temaSubespecialidad.appendChild(option);
    });
  });
}

// --- CARGA DE TEMAS SEGÚN ESPECIALIDAD y SUBESPECIALIDAD ---
function cargarTemas() {
  const especialidadId = document.getElementById("especialidad").value;
  const subespecialidadId = document.getElementById("subespecialidad").value;
  const temaSelect = document.getElementById("tema");
  temaSelect.innerHTML = "<option value=''>Seleccione tema</option>";
  if (!especialidadId) return;
  db.collection("temas").where("especialidadId", "==", especialidadId).onSnapshot((snapshot) => {
    temaSelect.innerHTML = "<option value=''>Seleccione tema</option>";
    snapshot.forEach((doc) => {
      const tema = doc.data();
      // Mostrar si es tema general o pertenece a la subespecialidad seleccionada
      if (!subespecialidadId || !tema.subespecialidadId || tema.subespecialidadId === subespecialidadId) {
        const option = document.createElement("option");
        option.value = doc.id;
        option.text = tema.nombre;
        temaSelect.appendChild(option);
      }
    });
    listarTemas();
  });
}

// --- AGREGAR ESPECIALIDAD ---
function agregarEspecialidad() {
  const nombre = document.getElementById("nuevaEspecialidad").value.trim();
  if (!nombre) return alert("Ingrese el nombre de la especialidad");
  db.collection("especialidades").add({ nombre }).then(() => {
    document.getElementById("nuevaEspecialidad").value = "";
  });
}

// --- AGREGAR SUBESPECIALIDAD ---
function agregarSubespecialidad() {
  const nombre = document.getElementById("nuevaSubespecialidad").value.trim();
  const especialidadId = document.getElementById("relacionEspecialidad").value;
  if (!nombre || !especialidadId) return alert("Completa ambos campos");
  db.collection("subespecialidades").add({ nombre, especialidadId }).then(() => {
    document.getElementById("nuevaSubespecialidad").value = "";
  });
}

// --- AGREGAR TEMA ---
function agregarTema() {
  const nombre = document.getElementById("nuevoTema").value.trim();
  const especialidadId = document.getElementById("temaEspecialidad").value;
  const subespecialidadId = document.getElementById("temaSubespecialidad").value;
  if (!nombre || !especialidadId) return alert("Completa al menos el nombre y especialidad");
  const tema = { nombre, especialidadId };
  if (subespecialidadId) tema.subespecialidadId = subespecialidadId;
  db.collection("temas").add(tema).then(() => {
    document.getElementById("nuevoTema").value = "";
  });
}

// --- LISTAR ESPECIALIDADES, SUBESPECIALIDADES Y TEMAS ---
function listarEspecialidades() {
  const cont = document.getElementById("listaEspecialidades");
  db.collection("especialidades").get().then(snapshot => {
    let html = "<ul>";
    snapshot.forEach(doc => {
      html += `<li>${doc.data().nombre}</li>`;
    });
    html += "</ul>";
    cont.innerHTML = html;
  });
}
function listarSubespecialidades() {
  const especialidadId = document.getElementById("relacionEspecialidad").value;
  const cont = document.getElementById("listaSubespecialidades");
  if (!especialidadId) { cont.innerHTML = ""; return; }
  db.collection("subespecialidades").where("especialidadId", "==", especialidadId).get().then(snapshot => {
    let html = "<ul>";
    snapshot.forEach(doc => {
      html += `<li>${doc.data().nombre}</li>`;
    });
    html += "</ul>";
    cont.innerHTML = html;
  });
}
function listarTemas() {
  const especialidadId = document.getElementById("temaEspecialidad").value;
  const subespecialidadId = document.getElementById("temaSubespecialidad").value;
  const cont = document.getElementById("listaTemas");
  if (!especialidadId) { cont.innerHTML = ""; return; }
  db.collection("temas").where("especialidadId", "==", especialidadId).get().then(snapshot => {
    let html = "<ul>";
    snapshot.forEach(doc => {
      const tema = doc.data();
      if (!subespecialidadId || !tema.subespecialidadId || tema.subespecialidadId === subespecialidadId) {
        html += `<li>${tema.nombre}${tema.subespecialidadId ? " (Subesp. ID: " + tema.subespecialidadId + ")" : ""}</li>`;
      }
    });
    html += "</ul>";
    cont.innerHTML = html;
  });
}

// --- GUARDAR PREGUNTA ---
function guardarPregunta() {
  const pregunta = document.getElementById("pregunta").value.trim();
  const especialidadId = document.getElementById("especialidad").value;
  const subespecialidadId = document.getElementById("subespecialidad").value;
  const temaId = document.getElementById("tema").value;
  const opA = document.getElementById("opA").value.trim();
  const expA = document.getElementById("expA").value.trim();
  const opB = document.getElementById("opB").value.trim();
  const expB = document.getElementById("expB").value.trim();
  const opC = document.getElementById("opC").value.trim();
  const expC = document.getElementById("expC").value.trim();
  const opD = document.getElementById("opD").value.trim();
  const expD = document.getElementById("expD").value.trim();
  const correcta = document.getElementById("correcta").value;
  if (!pregunta || !especialidadId || !temaId) {
    alert("Pregunta, especialidad y tema son obligatorios.");
    return;
  }
  db.collection("preguntas").add({
    pregunta,
    especialidadId,
    subespecialidadId: subespecialidadId || null,
    temaId,
    opciones: {
      A: { texto: opA, explicacion: expA },
      B: { texto: opB, explicacion: expB },
      C: { texto: opC, explicacion: expC },
      D: { texto: opD, explicacion: expD }
    },
    correcta,
    creado: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    alert("¡Pregunta guardada!");
    limpiarFormularioPregunta();
    buscarPreguntas();
  });
}

function limpiarFormularioPregunta() {
  document.getElementById("pregunta").value = "";
  document.getElementById("opA").value = "";
  document.getElementById("expA").value = "";
  document.getElementById("opB").value = "";
  document.getElementById("expB").value = "";
  document.getElementById("opC").value = "";
  document.getElementById("expC").value = "";
  document.getElementById("opD").value = "";
  document.getElementById("expD").value = "";
  document.getElementById("correcta").value = "A";
  // No limpiamos select para mantener la selección
}

// --- BUSCAR Y LISTAR PREGUNTAS ---
function buscarPreguntas() {
  const buscador = document.getElementById("buscador").value.trim().toLowerCase();
  const lista = document.getElementById("listaPreguntas");
  let query = db.collection("preguntas").orderBy("creado", "desc");
  query.get().then(snapshot => {
    let html = "<ul>";
    snapshot.forEach(doc => {
      const p = doc.data();
      if (buscador && !p.pregunta.toLowerCase().includes(buscador)) return;
      html += `<li>
        <b>${p.pregunta}</b><br/>
        Especialidad: ${p.especialidadId} | Subespecialidad: ${p.subespecialidadId || "-"} | Tema: ${p.temaId}<br/>
        Respuesta correcta: ${p.correcta}
      </li>`;
    });
    html += "</ul>";
    lista.innerHTML = html;
  });
}

// --- EVENTOS ---
document.getElementById("especialidad").addEventListener("change", () => {
  cargarSubespecialidades();
  cargarTemas();
});
document.getElementById("subespecialidad").addEventListener("change", cargarTemas);
document.getElementById("relacionEspecialidad").addEventListener("change", cargarSubespecialidadesParaTemas);
document.getElementById("temaEspecialidad").addEventListener("change", cargarSubespecialidadesParaTemas);

// --- INICIALIZACIÓN ---
cargarEspecialidades();
buscarPreguntas();
