// app.js
import {
  collection,
  addDoc,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const db = window.firestore;
const form = document.getElementById("registro-form");
const mensaje = document.getElementById("mensaje");
const cuposManiana = document.getElementById("cuposManiana");
const cuposTarde = document.getElementById("cuposTarde");
const MAX_CUPO = 12;

async function actualizarCupos() {
  const q = query(collection(db, "inscripciones"));
  const querySnapshot = await getDocs(q);

  let cuenta = { "Mañana": 0, "Tarde": 0 };
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.turno === "Mañana") cuenta["Mañana"]++;
    if (data.turno === "Tarde") cuenta["Tarde"]++;
  });

  cuposManiana.textContent = MAX_CUPO - cuenta["Mañana"];
  cuposTarde.textContent = MAX_CUPO - cuenta["Tarde"];
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  mensaje.textContent = "";

  const nombre = form.nombre.value.trim();
  const dni = form.dni.value.trim();
  const area = form.area.value.trim();
  const legajo = form.legajo.value.trim();
  const correo = form.correo.value.trim();
  const turno = form.turno.value;

  if (!nombre || !dni || !area || !legajo || !correo || !turno) {
    mensaje.textContent = "Por favor, completá todos los campos.";
    return;
  }

  try {
    // Verificar duplicado por DNI o legajo
    const q = query(
      collection(db, "inscripciones"),
      where("dni", "==", dni)
    );
    const q2 = query(
      collection(db, "inscripciones"),
      where("legajo", "==", legajo)
    );
    const [snap1, snap2] = await Promise.all([getDocs(q), getDocs(q2)]);

    if (!snap1.empty || !snap2.empty) {
      mensaje.textContent = "Ya estás registrado en este taller.";
      return;
    }

    // Verificar cupo
    const q3 = query(
      collection(db, "inscripciones"),
      where("turno", "==", turno)
    );
    const inscriptosTurno = await getDocs(q3);

    if (inscriptosTurno.size >= MAX_CUPO) {
      mensaje.textContent = `El cupo para el turno ${turno} está completo.`;
      return;
    }

    // Agregar a la base de datos
    await addDoc(collection(db, "inscripciones"), {
      nombre,
      dni,
      area,
      legajo,
      correo,
      turno,
      timestamp: new Date()
    });

    // Redirigir a página de agradecimiento
    window.location.href = "gracias.html";

  } catch (error) {
    console.error("Error al enviar:", error);
    mensaje.textContent = "Ocurrió un error. Intentá de nuevo más tarde.";
  }
});

// Al cargar la página
actualizarCupos();