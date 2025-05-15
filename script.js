import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCKI_M2XezuI45BsBh1UwRhaor5YbZvypQ",
  authDomain: "medifocus-edc4b.firebaseapp.com",
  projectId: "medifocus-edc4b",
  storageBucket: "medifocus-edc4b.firebasestorage.app",
  messagingSenderId: "13156485482",
  appId: "1:13156485482:web:e368315f65ab4237f07d13",
  measurementId: "G-N7KX1FBF55"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Clave de acceso simple
const CLAVE_ADMIN = "admin123";

window.validarClave = () => {
  const clave = document.getElementById("clave").value;
  if (clave === CLAVE_ADMIN) {
    document.getElementById("auth").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";
    cargarPreguntas();
  } else {
    alert("Clave incorrecta");
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formPregunta");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const pregunta = document.getElementById("pregunta").value;
      const correcta = document.getElementById("correcta").value;
      const opciones = {
        A: document.getElementById("opcionA").value,
        B: document.getElementById("opcionB").value,
        C: document.getElementById("opcionC").value,
        D: document.getElementById("opcionD").value
      };
      const explicacion = {
        A: document.getElementById("expA").value,
        B: document.getElementById("expB").value,
        C: document.getElementById("expC").value,
        D: document.getElementById("expD").value
      };

      await addDoc(collection(db, "preguntas"), {
        pregunta, opciones, explicacion, correcta
      });

      form.reset();
      cargarPreguntas();
    });
  }
});

async function cargarPreguntas() {
  const lista = document.getElementById("listaPreguntas");
  lista.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "preguntas"));
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const li = document.createElement("li");
    li.innerHTML = `<strong>${data.pregunta}</strong> <button onclick="eliminarPregunta('${docSnap.id}')">Eliminar</button>`;
    lista.appendChild(li);
  });
}

window.eliminarPregunta = async (id) => {
  await deleteDoc(doc(db, "preguntas", id));
  cargarPreguntas();
};


// Autoajuste dinámico de textareas
document.addEventListener("input", (e) => {
  if (e.target.tagName.toLowerCase() === "textarea") {
    e.target.style.height = "auto";
    e.target.style.height = (e.target.scrollHeight + 4) + "px";
  }
});
