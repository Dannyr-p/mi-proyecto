
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

function mostrarEstado(msg) {
  document.getElementById("estado").innerText = msg || "";
}

/* ========== ESPECIALIDADES ========== */
let idEspecialidadEdit = null;

function agregarEspecialidad() {
  const nombre = document.getElementById("nuevaEspecialidad").value.trim();
  if (!nombre) return alert("Ingrese el nombre de la especialidad");
  if (idEspecialidadEdit) {
    db.collection("especialidades").doc(idEspecialidadEdit).update({ nombre }).then(() => {
      mostrarEstado("Especialidad actualizada.");
      document.getElementById("nuevaEspecialidad").value = "";
      document.getElementById("btnEspecialidad").innerText = "Agregar";
      idEspecialidadEdit = null;
    });
  } else {
    db.collection("especialidades").add({ nombre }).then(() => {
      mostrarEstado("Especialidad agregada.");
      document.getElementById("nuevaEspecialidad").value = "";
    });
  }
}

function editarEspecialidad(id, nombre) {
  document.getElementById("nuevaEspecialidad").value = nombre;
  document.getElementById("btnEspecialidad").innerText = "Actualizar";
  idEspecialidadEdit = id;
}

function eliminarEspecialidad(id) {
  if (!confirm("¿Eliminar esta especialidad? También se eliminarán todas sus subespecialidades y temas relacionados.")) return;
  // Elimina subespecialidades y temas relacionados
  db.collection("subespecialidades").where("especialidadId", "==", id).get().then(sss => {
    const batch = db.batch();
    sss.forEach(d => batch.delete(d.ref));
    db.collection("temas").where("especialidadId", "==", id).get().then(ts => {
      ts.forEach(d => batch.delete(d.ref));
      batch.delete(db.collection("especialidades").doc(id));
      batch.commit().then(() => mostrarEstado("Especialidad y elementos relacionados eliminados."));
    });
  });
}

function listarEspecialidades() {
  const cont = document.getElementById("listaEspecialidades");
  db.collection("especialidades").orderBy("nombre").get().then(snapshot => {
    let html = "<ul>";
    snapshot.forEach(doc => {
      const nombre = doc.data().nombre;
      html += `<li>
        ${nombre}
        <button onclick="editarEspecialidad('${doc.id}', '${nombre.replace(/'/g,"\\'")}')">Editar</button>
        <button onclick="eliminarEspecialidad('${doc.id}')">Eliminar</button>
      </li>`;
    });
    html += "</ul>";
    cont.innerHTML = html;
  });
}

/* ========== SUBESPECIALIDADES ========== */
let idSubespecialidadEdit = null;

function agregarSubespecialidad() {
  const nombre = document.getElementById("nuevaSubespecialidad").value.trim();
  const especialidadId = document.getElementById("relacionEspecialidad").value;
  if (!nombre || !especialidadId) return alert("Completa ambos campos");
  if (idSubespecialidadEdit) {
    db.collection("subespecialidades").doc(idSubespecialidadEdit).update({ nombre, especialidadId }).then(() => {
      mostrarEstado("Subespecialidad actualizada.");
      document.getElementById("nuevaSubespecialidad").value = "";
      document.getElementById("btnSubespecialidad").innerText = "Agregar";
      idSubespecialidadEdit = null;
    });
  } else {
    db.collection("subespecialidades").add({ nombre, especialidadId }).then(() => {
      mostrarEstado("Subespecialidad agregada.");
      document.getElementById("nuevaSubespecialidad").value = "";
    });
  }
}

function editarSubespecialidad(id, nombre, especialidadId) {
  document.getElementById("nuevaSubespecialidad").value = nombre;
  document.getElementById("relacionEspecialidad").value = especialidadId;
  document.getElementById("btnSubespecialidad").innerText = "Actualizar";
  idSubespecialidadEdit = id;
}

function eliminarSubespecialidad(id) {
  if (!confirm("¿Eliminar esta subespecialidad? También se eliminarán todos los temas relacionados.")) return;
  db.collection("temas").where("subespecialidadId", "==", id).get().then(ts => {
    const batch = db.batch();
    ts.forEach(d => batch.delete(d.ref));
    batch.delete(db.collection("subespecialidades").doc(id));
    batch.commit().then(() => mostrarEstado("Subespecialidad y temas relacionados eliminados."));
  });
}

function listarSubespecialidades() {
  const especialidadId = document.getElementById("relacionEspecialidad").value;
  const cont = document.getElementById("listaSubespecialidades");
  if (!especialidadId) { cont.innerHTML = ""; return; }
  db.collection("subespecialidades").where("especialidadId", "==", especialidadId).orderBy("nombre").get().then(snapshot => {
    let html = "<ul>";
    snapshot.forEach(doc => {
      const nombre = doc.data().nombre;
      html += `<li>
        ${nombre}
        <button onclick="editarSubespecialidad('${doc.id}', '${nombre.replace(/'/g,"\\'")}', '${especialidadId}')">Editar</button>
        <button onclick="eliminarSubespecialidad('${doc.id}')">Eliminar</button>
      </li>`;
    });
    html += "</ul>";
    cont.innerHTML = html;
  });
}

/* ========== TEMAS ========== */
let idTemaEdit = null;

function agregarTema() {
  const nombre = document.getElementById("nuevoTema").value.trim();
  const especialidadId = document.getElementById("temaEspecialidad").value;
  const subespecialidadId = document.getElementById("temaSubespecialidad").value;
  if (!nombre || !especialidadId) return alert("Completa el nombre del tema y la especialidad");
  if (idTemaEdit) {
    const tema = { nombre, especialidadId };
    if (subespecialidadId) tema.subespecialidadId = subespecialidadId;
    db.collection("temas").doc(idTemaEdit).update(tema).then(() => {
      mostrarEstado("Tema actualizado.");
      document.getElementById("nuevoTema").value = "";
      document.getElementById("btnTema").innerText = "Agregar";
      idTemaEdit = null;
    });
  } else {
    const tema = { nombre, especialidadId };
    if (subespecialidadId) tema.subespecialidadId = subespecialidadId;
    db.collection("temas").add(tema).then(() => {
      document.getElementById("nuevoTema").value = "";
      mostrarEstado("Tema agregado.");
    });
  }
}

function editarTema(id, nombre, especialidadId, subespecialidadId) {
  document.getElementById("nuevoTema").value = nombre;
  document.getElementById("temaEspecialidad").value = especialidadId;
  cargarSubespecialidadesParaTemas(() => {
    document.getElementById("temaSubespecialidad").value = subespecialidadId || "";
  });
  document.getElementById("btnTema").innerText = "Actualizar";
  idTemaEdit = id;
}

function eliminarTema(id) {
  if (!confirm("¿Eliminar este tema?")) return;
  db.collection("temas").doc(id).delete().then(() => {
    mostrarEstado("Tema eliminado.");
    listarTemas();
  });
}

function listarTemas() {
  const especialidadId = document.getElementById("temaEspecialidad").value;
  const subespecialidadId = document.getElementById("temaSubespecialidad").value;
  const cont = document.getElementById("listaTemas");
  if (!especialidadId) { cont.innerHTML = ""; return; }
  let query = db.collection("temas").where("especialidadId", "==", especialidadId);
  query.get().then(snapshot => {
    let html = "<ul>";
    snapshot.forEach(doc => {
      const tema = doc.data();
      if (
        (!subespecialidadId && !tema.subespecialidadId) ||
        (subespecialidadId && tema.subespecialidadId === subespecialidadId)
      ) {
        html += `<li>
          ${tema.nombre}
          <button onclick="editarTema('${doc.id}', '${tema.nombre.replace(/'/g,"\\'")}', '${tema.especialidadId}', '${tema.subespecialidadId || ""}')">Editar</button>
          <button onclick="eliminarTema('${doc.id}')">Eliminar</button>
          ${tema.subespecialidadId ? " (Subesp. ID: " + tema.subespecialidadId + ")" : ""}
        </li>`;
      }
    });
    html += "</ul>";
    cont.innerHTML = html;
  });
}

/* ========== CARGAS Y EVENTOS ========== */
function cargarEspecialidades() {
  const especialidadSelects = [
    document.getElementById("especialidad"),
    document.getElementById("relacionEspecialidad"),
    document.getElementById("temaEspecialidad")
  ];
  db.collection("especialidades").orderBy("nombre").onSnapshot((snapshot) => {
    especialidadSelects.forEach(select => select.innerHTML = "");
    if (snapshot.empty) {
      mostrarEstado("No hay especialidades registradas.");
      return;
    }
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
    mostrarEstado("");
  }, (err) => mostrarEstado("Error cargando especialidades: " + err));
}

function cargarSubespecialidades() {
  const especialidadId = document.getElementById("especialidad").value;
  const subespecialidadSelect = document.getElementById("subespecialidad");
  subespecialidadSelect.innerHTML = "<option value=''>Ninguna</option>";
  if (!especialidadId) return;
  db.collection("subespecialidades").where("especialidadId", "==", especialidadId).orderBy("nombre").onSnapshot((snapshot) => {
    snapshot.forEach((doc) => {
      const option = document.createElement("option");
      option.value = doc.id;
      option.text = doc.data().nombre;
      subespecialidadSelect.appendChild(option);
    });
    cargarTemas();
    listarSubespecialidades();
  }, (err) => mostrarEstado("Error cargando subespecialidades: " + err));
}

function cargarSubespecialidadesParaTemas(cb) {
  const especialidadId = document.getElementById("temaEspecialidad").value;
  const temaSubespecialidad = document.getElementById("temaSubespecialidad");
  temaSubespecialidad.innerHTML = "<option value=''>Ninguna</option>";
  if (!especialidadId) {
    if (cb) cb();
    return;
  }
  db.collection("subespecialidades").where("especialidadId", "==", especialidadId).orderBy("nombre").get().then(snapshot => {
    snapshot.forEach((doc) => {
      const option = document.createElement("option");
      option.value = doc.id;
      option.text = doc.data().nombre;
      temaSubespecialidad.appendChild(option);
    });
    if (cb) cb();
    listarTemas();
  });
}

function cargarTemas() {
  const especialidadId = document.getElementById("especialidad").value;
  const subespecialidadId = document.getElementById("subespecialidad").value;
  const temaSelect = document.getElementById("tema");
  temaSelect.innerHTML = "<option value=''>Seleccione tema</option>";
  if (!especialidadId) return;
  let query = db.collection("temas").where("especialidadId", "==", especialidadId);
  query.get().then(snapshot => {
    temaSelect.innerHTML = "<option value=''>Seleccione tema</option>";
    snapshot.forEach((doc) => {
      const tema = doc.data();
      if (
        (!subespecialidadId && !tema.subespecialidadId) ||
        (subespecialidadId && tema.subespecialidadId === subespecialidadId)
      ) {
        const option = document.createElement("option");
        option.value = doc.id;
        option.text = tema.nombre;
        temaSelect.appendChild(option);
      }
    });
  });
}

/* ========== PREGUNTAS ========== */
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
    mostrarEstado("¡Pregunta guardada!");
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
}

async function buscarPreguntas() {
  const buscador = document.getElementById("buscador").value.trim().toLowerCase();
  const lista = document.getElementById("listaPreguntas");
  let query = db.collection("preguntas").orderBy("creado", "desc");
  const snapshot = await query.get();

  // Obtén todos los IDs únicos de especialidad/subespecialidad/tema de las preguntas
  const especialidadIds = new Set();
  const subespecialidadIds = new Set();
  const temaIds = new Set();
  snapshot.forEach(doc => {
    const p = doc.data();
    if(p.especialidadId) especialidadIds.add(p.especialidadId);
    if(p.subespecialidadId) subespecialidadIds.add(p.subespecialidadId);
    if(p.temaId) temaIds.add(p.temaId);
  });

  // Firestore limita a 10 el "in", así que hay que trocear si hay más de 10
  async function fetchCollectionMap(col, idsSet) {
    if(!idsSet.size) return {};
    const idsArray = Array.from(idsSet);
    const map = {};
    for(let i = 0; i < idsArray.length; i += 10) {
      const idsChunk = idsArray.slice(i, i+10);
      const docs = await db.collection(col).where(firebase.firestore.FieldPath.documentId(), "in", idsChunk).get();
      docs.forEach(d => map[d.id] = d.data().nombre);
    }
    return map;
  }
  const [especialidadesMap, subespecialidadesMap, temasMap] = await Promise.all([
    fetchCollectionMap("especialidades", especialidadIds),
    fetchCollectionMap("subespecialidades", subespecialidadIds),
    fetchCollectionMap("temas", temaIds)
  ]);

  // Renderiza la lista
  let html = "<ul>";
  snapshot.forEach(doc => {
    const p = doc.data();
    if (buscador && !p.pregunta.toLowerCase().includes(buscador)) return;
    html += `<li>
      <b>${p.pregunta || "(Sin pregunta)"}</b><br/>
      Especialidad: ${especialidadesMap[p.especialidadId] || p.especialidadId || "-"}<br/>
      Subespecialidad: ${p.subespecialidadId ? (subespecialidadesMap[p.subespecialidadId] || p.subespecialidadId) : "-"}<br/>
      Tema: ${p.temaId ? (temasMap[p.temaId] || p.temaId) : "-"}<br/>
      Respuesta correcta: ${p.correcta || "-"}
    </li>`;
  });
  html += "</ul>";
  lista.innerHTML = html;
}

/* ========== EVENTOS & CARGA ========= */
document.getElementById("btnEspecialidad").onclick = agregarEspecialidad;
document.getElementById("btnSubespecialidad").onclick = agregarSubespecialidad;
document.getElementById("btnTema").onclick = agregarTema;

document.getElementById("especialidad").addEventListener("change", () => {
  cargarSubespecialidades();
  cargarTemas();
});
document.getElementById("subespecialidad").addEventListener("change", cargarTemas);
document.getElementById("relacionEspecialidad").addEventListener("change", listarSubespecialidades);
document.getElementById("temaEspecialidad").addEventListener("change", () => cargarSubespecialidadesParaTemas(listarTemas));
document.getElementById("temaSubespecialidad").addEventListener("change", listarTemas);

cargarEspecialidades();
buscarPreguntas();
