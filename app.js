document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registro-form");
  const turnoSelect = document.getElementById("turno");
  const mensaje = document.getElementById("mensaje");

  const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbxacGgfEVO-Kas5RsfXmAq-cC08c5BEQwqIXC-pjt_HjrRsTdcPVCAYkME0hHsJiFR6/exec";

  // ✅ Actualiza cupos al cargar
  fetch(`${URL_SCRIPT}?action=cupos`)
    .then(res => res.json())
    .then(data => {
      document.getElementById("cuposManiana").innerText = data["Turno Mañana"];
      document.getElementById("cuposTarde").innerText = data["Turno Tarde"];
    });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // 📦 Obtener datos del formulario
    const datos = {
      nombre: form.nombre.value.trim(),
      dni: form.dni.value.trim(),
      area: form.area.value.trim(),
      legajo: form.legajo.value.trim(),
      correo: form.correo.value.trim(),
      turno: form.turno.value
    };

    // 🚨 Validación rápida
    if (Object.values(datos).some(v => v === "")) {
      mensaje.innerText = "Por favor completá todos los campos.";
      mensaje.style.color = "red";
      return;
    }

    // ⏳ Enviar datos al Apps Script
    fetch(URL_SCRIPT, {
      method: "POST",
      body: JSON.stringify(datos),
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(res => res.json())
    .then(res => {
      mensaje.innerText = res.mensaje;
      mensaje.style.color = res.exito ? "green" : "red";
      if (res.exito) form.reset();

      // 🔁 Refrescar cupos
      return fetch(`${URL_SCRIPT}?action=cupos`);
    })
    .then(res => res.json())
    .then(data => {
      document.getElementById("cuposManiana").innerText = data["Turno Mañana"];
      document.getElementById("cuposTarde").innerText = data["Turno Tarde"];
    })
    .catch(() => {
      mensaje.innerText = "Ocurrió un error. Intente más tarde.";
      mensaje.style.color = "red";
    });
  });
});
