console.log("✅ script.js del panel de administrador cargado correctamente");

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

// Cargar categorías
async function cargarCategorias() {
  const espSel = document.getElementById("especialidad");
  const subSel = document.getElementById("subespecialidad");
  const temaSel = document.getElementById("tema");
  const listaEsp = document.getElementById("listaEspecialidades");
  const listaSub = document.getElementById("listaSubespecialidades");
  const listaTemas = document.getElementById("listaTemas");
  const temaEspSel = document.getElementById("temaEspecialidad");
  const temaSubespSel = document.getElementById("temaSubespecialidad");

  espSel.innerHTML = "<option value=''>Selecciona una especialidad</option>";
  subSel.innerHTML = "<option value=''>—</option>";
  temaSel.innerHTML = "<option value=''>Selecciona un tema</option>";
  listaEsp.innerHTML = "";
  listaSub.innerHTML = "";
  listaTemas.innerHTML = "";
  temaEspSel.innerHTML = "<option value=''>Selecciona una especialidad</option>";
  temaSubespSel.innerHTML = "<option value=''>Selecciona una subespecialidad (opcional)</option>";
  temaSubespSel.disabled = true;

  // Cargar especialidades sin duplicados
  const espSnap = await db.collection("especialidades").get();
  const espSet = new Set();
  espSnap.forEach(doc => {
    const nombre = doc.data().nombre;
    if (!nombre) return;
    const key = nombre.trim().toLowerCase();
    if (espSet.has(key)) return;
    espSet.add(key);
    espSel.innerHTML += `<option value="${nombre}">${nombre}</option>`;
    document.getElementById("relacionEspecialidad").innerHTML += `<option value="${nombre}">${nombre}</option>`;
    temaEspSel.innerHTML += `<option value="${nombre}">${nombre}</option>`;
    listaEsp.innerHTML += `
      <div class="categoria-item">${nombre}
        <span class="acciones">
          <button onclick="editarCategoria('especialidades', '${nombre}')">✏️</button>
          <button onclick="eliminarEspecialidad('${nombre}')">🗑</button>
        </span>
      </div>`;
  });

  // Cargar subespecialidades sin duplicados
  const subSnap = await db.collection("subespecialidades").get();
  const subSet = new Set();
  subSnap.forEach(doc => {
    const nombre = doc.data().nombre;
    const especialidad = doc.data().especialidad || "❌ Sin especialidad";
    if (!nombre) return;
    const key = nombre.trim().toLowerCase() + "|" + especialidad.trim().toLowerCase();
    if (subSet.has(key)) return;
    subSet.add(key);
    listaSub.innerHTML += `
      <div class="categoria-item">${nombre} (${especialidad})
        <span class="acciones">
          <button onclick="editarCategoria('subespecialidades', '${nombre}')">✏️</button>
          <button onclick="eliminarSubespecialidad('${nombre}')">🗑</button>
        </span>
      </div>`;
  });

  // Cargar temas sin duplicados
  const temasSnap = await db.collection("temas").get();
  const temaSet = new Set();
  temasSnap.forEach(doc => {
    const nombre = doc.data().nombre;
    const subespecialidad = doc.data().subespecialidad || "";
    if (!nombre) return;
    const key = nombre.trim().toLowerCase() + "|" + subespecialidad.trim().toLowerCase();
    if (temaSet.has(key)) return;
    temaSet.add(key);
    listaTemas.innerHTML += `
      <div class="categoria-item">${nombre}${subespecialidad ? " (" + subespecialidad + ")" : ""}
        <span class="acciones">
          <button onclick="editarCategoria('temas', '${nombre}')">✏️</button>
          <button onclick="eliminarTema('${nombre}')">🗑</button>
        </span>
      </div>`;
  });
}

// Crear subespecialidad vinculada a especialidad
async function agregarSubespecialidad() {
  const nombre = document.getElementById("nuevaSubespecialidad").value;
  const especialidad = document.getElementById("relacionEspecialidad").value;

  if (nombre && especialidad) {
    await db.collection("subespecialidades").add({ nombre, especialidad });
    cargarCategorias();
    document.getElementById("nuevaSubespecialidad").value = "";
    document.getElementById("relacionEspecialidad").selectedIndex = 0;
  } else {
    alert("Debes ingresar un nombre y seleccionar una especialidad.");
  }
}

// Al cambiar especialidad en formulario de pregunta, cargar subespecialidades relacionadas sin duplicados
document.getElementById("especialidad").addEventListener("change", async function () {
  const especialidadSeleccionada = this.value;
  const subSel = document.getElementById("subespecialidad");
  subSel.innerHTML = "<option value=''>—</option>";

  const snap = await db.collection("subespecialidades")
    .where("especialidad", "==", especialidadSeleccionada)
    .get();

  // Normalización para evitar duplicados
  const nombresAgregados = new Set();
  snap.forEach(doc => {
    const nombre = doc.data().nombre;
    if (!nombre) return;
    const key = nombre.trim().toLowerCase();
    if (nombresAgregados.has(key)) return;
    nombresAgregados.add(key);
    subSel.innerHTML += `<option value="${nombre}">${nombre}</option>`;
  });
});

// Al cambiar especialidad en formulario de temas, cargar subespecialidades relacionadas sin duplicados
document.getElementById("temaEspecialidad").addEventListener("change", async function () {
  const especialidadSeleccionada = this.value;
  const subSel = document.getElementById("temaSubespecialidad");
  subSel.innerHTML = '<option value="">Selecciona una subespecialidad (opcional)</option>';

  if (!especialidadSeleccionada) {
    subSel.disabled = true;
    return;
  }

  const subSnap = await db.collection("subespecialidades")
    .where("especialidad", "==", especialidadSeleccionada)
    .get();

  let tieneSubesp = false;
  const nombresAgregados = new Set();
  subSnap.forEach(doc => {
    const nombre = doc.data().nombre;
    if (!nombre) return;
    const key = nombre.trim().toLowerCase();
    if (nombresAgregados.has(key)) return;
    nombresAgregados.add(key);
    subSel.innerHTML += `<option value="${nombre}">${nombre}</option>`;
    tieneSubesp = true;
  });

  subSel.disabled = !tieneSubesp;
});

// Inicializar al cargar
window.onload = () => {
  cargarCategorias();
  cargarPreguntas();
};

// Guardar nueva especialidad
async function agregarEspecialidad() {
  const nombre = document.getElementById("nuevaEspecialidad").value;
  if (nombre) {
    await db.collection("especialidades").add({ nombre });
    cargarCategorias();
    document.getElementById("nuevaEspecialidad").value = "";
  }
}

// Guardar nuevo tema con subespecialidad opcional
async function agregarTema() {
  const nombre = document.getElementById("nuevoTema").value;
  const especialidad = document.getElementById("temaEspecialidad").value;
  const subespecialidad = document.getElementById("temaSubespecialidad").value;

  if (nombre && especialidad) {
    await db.collection("temas").add({ 
      nombre, 
      especialidad, 
      subespecialidad: subespecialidad || "" 
    });
    cargarCategorias();
    document.getElementById("nuevoTema").value = "";
    document.getElementById("temaEspecialidad").selectedIndex = 0;
    document.getElementById("temaSubespecialidad").innerHTML = '<option value="">Selecciona una subespecialidad (opcional)</option>';
    document.getElementById("temaSubespecialidad").disabled = true;
  } else {
    alert("Debes ingresar un nombre y seleccionar una especialidad.");
  }
}

// Mostrar preguntas guardadas
async function cargarPreguntas() {
  const cont = document.getElementById("listaPreguntas");
  cont.innerHTML = "";
  const snap = await db.collection("preguntas").get();
  snap.forEach(doc => {
    const d = doc.data();
    cont.innerHTML += `
      <div class="pregunta">
        <b>${d.pregunta}</b><br>
        <small>${d.especialidad} / ${d.subespecialidad || "—"} | Tema: ${d.tema}</small><br>
        ✔ Respuesta correcta: ${d.correcta}
        <button class="edit" onclick="editarPregunta('${doc.id}')">Editar</button>
        <button onclick="eliminarPregunta('${doc.id}')">Eliminar</button>
      </div>
    `;
  });
}

// Guardar o editar pregunta
async function guardarPregunta() {
  const id = document.getElementById("idEditar").value;
  const data = {
    pregunta: document.getElementById("pregunta").value,
    especialidad: document.getElementById("especialidad").value,
    subespecialidad: document.getElementById("subespecialidad").value,
    tema: document.getElementById("tema").value,
    opciones: {
      A: document.getElementById("opA").value,
      B: document.getElementById("opB").value,
      C: document.getElementById("opC").value,
      D: document.getElementById("opD").value
    },
    explicacion: {
      A: document.getElementById("expA").value,
      B: document.getElementById("expB").value,
      C: document.getElementById("expC").value,
      D: document.getElementById("expD").value
    },
    correcta: document.getElementById("correcta").value
  };

  if (!data.tema) {
    alert("Selecciona un tema antes de guardar.");
    return;
  }

  if (id) {
    await db.collection("preguntas").doc(id).update(data);
    document.getElementById("estado").innerText = "✅ Pregunta actualizada.";
  } else {
    await db.collection("preguntas").add(data);
    document.getElementById("estado").innerText = "✅ Pregunta guardada.";
  }

  limpiarFormulario();
  cargarPreguntas();
}

function limpiarFormulario() {
  document.getElementById("idEditar").value = "";
  document.getElementById("pregunta").value = "";
  document.getElementById("especialidad").value = "";
  document.getElementById("subespecialidad").value = "";
  document.getElementById("tema").value = "";
  document.getElementById("opA").value = "";
  document.getElementById("opB").value = "";
  document.getElementById("opC").value = "";
  document.getElementById("opD").value = "";
  document.getElementById("expA").value = "";
  document.getElementById("expB").value = "";
  document.getElementById("expC").value = "";
  document.getElementById("expD").value = "";
  document.getElementById("correcta").value = "A";
}

// Eliminar pregunta
async function eliminarPregunta(id) {
  if (confirm("¿Eliminar esta pregunta?")) {
    await db.collection("preguntas").doc(id).delete();
    cargarPreguntas();
  }
}

// Editar pregunta
async function editarPregunta(id) {
  const doc = await db.collection("preguntas").doc(id).get();
  const d = doc.data();
  document.getElementById("idEditar").value = id;
  document.getElementById("pregunta").value = d.pregunta;
  document.getElementById("especialidad").value = d.especialidad;
  document.getElementById("subespecialidad").value = d.subespecialidad;
  document.getElementById("tema").value = d.tema;
  document.getElementById("opA").value = d.opciones.A;
  document.getElementById("opB").value = d.opciones.B;
  document.getElementById("opC").value = d.opciones.C;
  document.getElementById("opD").value = d.opciones.D;
  document.getElementById("expA").value = d.explicacion.A;
  document.getElementById("expB").value = d.explicacion.B;
  document.getElementById("expC").value = d.explicacion.C;
  document.getElementById("expD").value = d.explicacion.D;
  document.getElementById("correcta").value = d.correcta;
}

// Eliminar especialidad
async function eliminarEspecialidad(nombre) {
  if (confirm("¿Eliminar esta especialidad?")) {
    const snap = await db.collection("especialidades").where("nombre", "==", nombre).get();
    snap.forEach(async doc => await db.collection("especialidades").doc(doc.id).delete());
    cargarCategorias();
  }
}

// Eliminar subespecialidad
async function eliminarSubespecialidad(nombre) {
  if (confirm("¿Eliminar esta subespecialidad?")) {
    const snap = await db.collection("subespecialidades").where("nombre", "==", nombre).get();
    snap.forEach(async doc => await db.collection("subespecialidades").doc(doc.id).delete());
    cargarCategorias();
  }
}

// Eliminar tema
async function eliminarTema(nombre) {
  if (confirm("¿Eliminar este tema?")) {
    const snap = await db.collection("temas").where("nombre", "==", nombre).get();
    snap.forEach(async doc => await db.collection("temas").doc(doc.id).delete());
    cargarCategorias();
  }
}

// Editar categoría (especialidad, subespecialidad, tema)
async function editarCategoria(tipo, nombreActual) {
  const nuevoNombre = prompt("Nuevo nombre para " + tipo + ":", nombreActual);
  if (!nuevoNombre || nuevoNombre === nombreActual) return;

  const snap = await db.collection(tipo).where("nombre", "==", nombreActual).get();
  snap.forEach(async doc => {
    await db.collection(tipo).doc(doc.id).update({ nombre: nuevoNombre });
  });
  cargarCategorias();
}

// Filtrar temas por especialidad en el formulario de pregunta
document.getElementById("especialidad").addEventListener("change", async function () {
  const especialidadSeleccionada = this.value;
  const subSel = document.getElementById("subespecialidad");
  const temaSel = document.getElementById("tema");
  subSel.innerHTML = "<option value=''>—</option>";
  temaSel.innerHTML = "<option value=''>Selecciona un tema</option>";

  // Subespecialidades sin duplicados
  const subSnap = await db.collection("subespecialidades")
    .where("especialidad", "==", especialidadSeleccionada)
    .get();

  const nombresAgregados = new Set();
  subSnap.forEach(doc => {
    const nombre = doc.data().nombre;
    if (!nombre) return;
    const key = nombre.trim().toLowerCase();
    if (nombresAgregados.has(key)) return;
    nombresAgregados.add(key);
    subSel.innerHTML += `<option value="${nombre}">${nombre}</option>`;
  });

  // Temas
  const temaSnap = await db.collection("temas")
    .where("especialidad", "==", especialidadSeleccionada)
    .get();
  temaSnap.forEach(doc => {
    const nombre = doc.data().nombre;
    temaSel.innerHTML += `<option value="${nombre}">${nombre}</option>`;
  });
});
