// app.js
import {
  collection,
  addDoc,
  getDocs,
  query,
  where
} from "firebase/app";

const db = window.firestore;
const form = document.getElementById("registro-form");
const mensaje = document.getElementById("mensaje");
const MAX_CUPO = 15;

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  mensaje.textContent = "";

  const nombre = form.nombre.value.trim();
  const dni = form.dni.value.trim();
  const area = form.area.value.trim();
  const legajo = form.legajo.value.trim();
  const correo = form.correo.value.trim();
  const turno = form.turno.value;
  const telefono = form.telefono.value.trim(); // <-- nuevo campo (opcional)


  if (!nombre || !dni || !area || !legajo || !correo || !turno) {
    mensaje.textContent = "Por favor, completá todos los campos.";
    return;
  }

  try {
    // Verificar duplicado por DNI o legajo
    const dupDni = query(
      collection(db, "inscripciones"),
      where("dni", "==", dni)
    );
    const dupLegajo = query(
      collection(db, "inscripciones"),
      where("legajo", "==", legajo)
    );
    const [snap1, snap2] = await Promise.all([getDocs(dupDni), getDocs(dupLegajo)]);

    if (!snap1.empty || !snap2.empty) {
      mensaje.textContent = "Ya estás registrado en este taller.";
      return;
    }

    // Verificar cupo
    const turnoQ = query(
      collection(db, "inscripciones"),
      where("turno", "==", turno)
    );
    const turnoSnap = await getDocs(turnoQ);

    if (turnoSnap.size >= MAX_CUPO) {
      // Redirigir a página de cupo completo
      window.location.href = `cupo-completo.html?turno=${encodeURIComponent(turno)}`;
      return;
    }

    // Agregar a la base de datos
    await addDoc(collection(db, "inscripciones"), {
      nombre,
      dni,
      area,
      legajo,
      correo,
      telefono,
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