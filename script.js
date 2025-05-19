import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getFirestore, collection, getDocs
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCKI_M2XezuI45BsBh1UwRhaor5YbZvypQ",
  authDomain: "medifocus-edc4b.firebaseapp.com",
  projectId: "medifocus-edc4b",
  storageBucket: "medifocus-edc4b.appspot.com",
  messagingSenderId: "13156485482",
  appId: "1:13156485482:web:e368315f65ab4237f07d13"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let modo = "aleatorio";
let preguntas = [];

window.activarModo = function (m) {
  modo = m;
  const filtros = document.getElementById("filtros");
  if (modo === "filtrar") {
    filtros.style.display = "block";
  } else {
    filtros.style.display = "none";
    document.getElementById("especialidad").selectedIndex = -1;
    document.getElementById("subespecialidad").selectedIndex = -1;
    document.getElementById("tema").selectedIndex = -1;
  }
};

window.onload = async function () {
  const espSel = document.getElementById("especialidad");
  const subSel = document.getElementById("subespecialidad");
  const temaSel = document.getElementById("tema");

  const espSnap = await getDocs(collection(db, "especialidades"));
  espSel.innerHTML = "";
  espSnap.forEach(doc => {
    const nombre = doc.data().nombre;
    espSel.innerHTML += `<option value="${nombre}">${nombre}</option>`;
  });

  const subSnap = await getDocs(collection(db, "subespecialidades"));
  subSel.innerHTML = "";
  subSnap.forEach(doc => {
    const d = doc.data();
    const opt = document.createElement("option");
    opt.value = d.nombre;
    opt.textContent = d.nombre;
    opt.dataset.esp = d.especialidad;
    subSel.appendChild(opt);
  });

  const temaSnap = await getDocs(collection(db, "temas"));
  temaSel.innerHTML = "";
  temaSnap.forEach(doc => {
    const d = doc.data();
    const opt = document.createElement("option");
    opt.value = d.nombre;
    opt.textContent = `${d.nombre} (${d.especialidad})`;
    opt.dataset.esp = d.especialidad;
    temaSel.appendChild(opt);
  });

  espSel.addEventListener("change", () => {
    const seleccionadas = Array.from(espSel.selectedOptions).map(opt => opt.value);
    Array.from(subSel.options).forEach(opt => {
      opt.style.display = seleccionadas.includes(opt.dataset.esp) ? "block" : "none";
    });
    Array.from(temaSel.options).forEach(opt => {
      opt.style.display = seleccionadas.includes(opt.dataset.esp) ? "block" : "none";
    });
  });
};

window.comenzarCuestionario = async function () {
  const espSel = document.getElementById("especialidad");
  const subSel = document.getElementById("subespecialidad");
  const temaSel = document.getElementById("tema");
  const cantidad = parseInt(document.getElementById("cantidad").value) || 100;

  const seleccionadasEsp = Array.from(espSel.selectedOptions).map(opt => opt.value);
  const seleccionadasSub = Array.from(subSel.selectedOptions).map(opt => opt.value);
  const seleccionadasTema = Array.from(temaSel.selectedOptions).map(opt => opt.value);

  const snapshot = await getDocs(collection(db, "preguntas"));
  preguntas = [];

  snapshot.forEach(doc => {
    const d = doc.data();
    if (modo === "aleatorio") {
      preguntas.push(d);
    } else {
      const matchEsp = seleccionadasEsp.length === 0 || seleccionadasEsp.includes(d.especialidad);
      const matchSub = seleccionadasSub.length === 0 || !d.subespecialidad || seleccionadasSub.includes(d.subespecialidad);
      const matchTema = seleccionadasTema.length === 0 || seleccionadasTema.includes(d.tema);
      if (matchEsp && matchSub && matchTema) {
        preguntas.push(d);
      }
    }
  });

  preguntas.sort(() => Math.random() - 0.5);
  preguntas = preguntas.slice(0, cantidad);

  mostrarPreguntas();
};

function mostrarPreguntas() {
  const zona = document.getElementById("zonaPreguntas");
  zona.innerHTML = "";
  preguntas.forEach((p, i) => {
    zona.innerHTML += `
      <div class="pregunta-box">
        <b>${i + 1}. ${p.pregunta}</b><br><br>
        A) ${p.opciones.A}<br>
        B) ${p.opciones.B}<br>
        C) ${p.opciones.C}<br>
        D) ${p.opciones.D}<br><br>
        <small><b>Especialidad:</b> ${p.especialidad} | <b>Sub:</b> ${p.subespecialidad || "—"} | <b>Tema:</b> ${p.tema}</small>
      </div>
    `;
  });
}
