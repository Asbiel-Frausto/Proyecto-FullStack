// Importa los módulos de Firebase y la configuración desde firebaseConfig.js
import { auth, db } from "./firebaseConfig.js";  // Asegúrate de que la ruta sea correcta
import { collection, query, where, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"; 

// Obtener el contenedor de las reservaciones
const reservationsGrid = document.querySelector(".reservations-grid");

// Función para cargar las reservaciones del usuario
async function loadReservations() {
  const user = auth.currentUser;

  if (!user) {
    alert("Debes iniciar sesión para ver tus reservaciones.");
    window.location.href = "login.html"; // Redirigir al usuario a la página de inicio de sesión
    return;
  }

  try {
    // Consultar las reservaciones del usuario actual
    const reservationsRef = collection(db, "reservations");
    const q = query(reservationsRef, where("ownerUID", "==", user.uid));
    const querySnapshot = await getDocs(q);

    // Limpiar el contenedor de reservaciones
    reservationsGrid.innerHTML = "";

    // Verificar si hay reservaciones
    if (querySnapshot.empty) {
      // Mostrar solo el botón "Agregar Reservación" si no hay reservaciones
      reservationsGrid.innerHTML = `
        <div class="add-reservation">
          <button class="btn btn-primary" id="add-reservation"><i class="fas fa-plus"></i> Agregar Reservación</button>
        </div>
      `;
    } else {
      // Generar tarjetas para cada reservación
      querySnapshot.forEach((doc) => {
        const reservationData = doc.data();

        // Crear la estructura de la tarjeta
        const reservationCard = document.createElement("div");
        reservationCard.classList.add("reservation-card");

        reservationCard.innerHTML = `
          <div class="reservation-card-header">
            <h6 class="reservation-name">Reservación para: ${reservationData.petName}</h6>
            <div class="reservation-actions">
              <!-- Solo mostrar el botón de eliminar -->
              <button class="btn-icon delete-reservation" data-reservation-id="${doc.id}"><i class="fas fa-trash"></i></button>
            </div>
          </div>
          <div class="reservation-card-details">
            <p><strong>Fecha de inicio:</strong> <span>${reservationData.startDate}</span></p>
            <p><strong>Fecha de fin:</strong> <span>${reservationData.endDate}</span></p>
            <p><strong>Notas:</strong> <span>${reservationData.notes}</span></p>
          </div>
        `;

        // Agregar evento para expandir/cerrar detalles
        reservationCard.addEventListener("click", function () {
          const details = this.querySelector(".reservation-card-details");
          details.style.display = details.style.display === "block" ? "none" : "block";
        });

        // Agregar la tarjeta al contenedor
        reservationsGrid.appendChild(reservationCard);
      });

      // Agregar el botón "Agregar Reservación" al final
      const addReservationContainer = document.createElement("div");
      addReservationContainer.classList.add("add-reservation");
      addReservationContainer.innerHTML = `
        <button class="btn btn-primary" id="add-reservation"><i class="fas fa-plus"></i> Agregar Reservación</button>
      `;
      reservationsGrid.appendChild(addReservationContainer);
    }
  } catch (error) {
    console.error("Error al cargar las reservaciones:", error);
    alert("Hubo un problema al cargar las reservaciones. Inténtalo de nuevo.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Solo cargar reservaciones si estamos en reservations.html
      if (window.location.pathname.includes("reservations.html")) {
        loadReservations();
      }
    } else {
      window.location.href = "login.html"; // Redirigir al usuario a la página de inicio de sesión
    }
  });

  // Delegación de eventos para el botón "Agregar Reservación"
  document.addEventListener("click", (event) => {
    if (event.target && event.target.id === "add-reservation") {
      window.location.href = "addreservation.html"; // Redirigir a la página de agregar reservación
    }
  });

  // Delegación de eventos para borrar reservaciones
  reservationsGrid.addEventListener("click", async (event) => {
    if (event.target && event.target.classList.contains("delete-reservation")) {
      event.stopPropagation();  // Evita que el clic en el botón de borrar dispare el evento de expansión de detalles
      const reservationId = event.target.getAttribute("data-reservation-id");
      try {
        // Eliminar la reservación de Firestore usando el ID
        const reservationRef = doc(db, "reservations", reservationId); // Referencia al documento de la reservación
        await deleteDoc(reservationRef);  // Eliminar el documento
        alert('Reservación eliminada correctamente.');
        loadReservations(); // Recargar las reservaciones después de eliminar
      } catch (error) {
        console.error("Error al eliminar la reservación:", error);
        alert("Hubo un problema al eliminar la reservación.");
      }
    }
  });
});
