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
let index = 0;
let aciertos = 0;

// Cargar especialidades únicas al cargar la página
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
  // Reiniciar subespecialidades y temas
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
  // Reiniciar temas
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

// Eventos para actualizar filtros en cascada
document.addEventListener("DOMContentLoaded", () =>
