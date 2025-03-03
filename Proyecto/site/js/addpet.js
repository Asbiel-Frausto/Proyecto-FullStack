// Importa los módulos de Firebase y la configuración desde firebaseConfig.js
import { auth, db } from "./firebaseConfig.js";  // Asegúrate de que la ruta sea correcta
import { doc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"; // 👈 Importa onAuthStateChanged correctamente

// Obtener el formulario
const petForm = document.getElementById("petForm");

// Escuchar el evento de envío del formulario
petForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Obtener los valores del formulario
  const petName = document.getElementById("petName").value;
  const petAge = document.getElementById("petAge").value;
  const petBreed = document.getElementById("petBreed").value;
  const petDescription = document.getElementById("petDescription").value;

  // Obtener el usuario autenticado
  const user = auth.currentUser;

  if (!user) {
    alert("Debes iniciar sesión para agregar una mascota.");
    window.location.href = "login.html"; // Redirigir al usuario a la página de inicio de sesión
    return;
  }

  try {
    // Crear un nuevo documento en la colección "pets"
    const petId = `${user.uid}_${Date.now()}`; // Generar un ID único para la mascota
    const petRef = doc(db, "pets", petId); // Referencia al documento con el ID generado

    // Guardar los datos de la mascota en Firestore
    await setDoc(petRef, {
      IDpet: petId, // ID único de la mascota
      nombre: petName, // Nombre de la mascota
      edad: petAge, // Edad de la mascota
      raza: petBreed, // Raza de la mascota
      descripcion: petDescription, // Descripción de la mascota
      ownerUID: user.uid, // UID del dueño de la mascota
    });

    console.log(`Mascota ${petName} agregada correctamente con ID: ${petId}`);
    alert("Mascota agregada correctamente.");
    
    petForm.reset(); // Limpiar el formulario

    // Redirigir al usuario a su perfil
    window.location.href = "profile.html";
  } catch (error) {
    console.error("Error al agregar la mascota:", error);
    alert("Hubo un problema al agregar la mascota. Inténtalo de nuevo.");
  }
});

import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Obtener el contenedor de las mascotas
const petsGrid = document.querySelector(".pets-grid");

// Función para cargar las mascotas del usuario
async function loadPets() {
  const user = auth.currentUser;

  if (!user) {
    alert("Debes iniciar sesión para ver tus mascotas.");
    window.location.href = "login.html"; // Redirigir al usuario a la página de inicio de sesión
    return;
  }

  try {
    // Consultar las mascotas del usuario actual
    const petsRef = collection(db, "pets");
    const q = query(petsRef, where("ownerUID", "==", user.uid));
    const querySnapshot = await getDocs(q);

    // Limpiar el contenedor de mascotas
    petsGrid.innerHTML = "";

    // Verificar si hay mascotas
    if (querySnapshot.empty) {
      // Mostrar solo el botón "Agregar Mascota" si no hay mascotas
      petsGrid.innerHTML = `
        <div class="add-pet">
          <button class="btn btn-primary" id="add-pet"><i class="fas fa-plus"></i> Agregar Mascota</button>
        </div>
      `;
    } else {
      // Generar tarjetas para cada mascota
      querySnapshot.forEach((doc) => {
        const petData = doc.data();

        // Crear la estructura de la tarjeta
        const petCard = document.createElement("div");
        petCard.classList.add("pet-card");

        petCard.innerHTML = `
          <div class="pet-card-header">
            <div class="pet-image-container">
              <img src="images/DogProfile.jpeg" alt="Pet Image" class="pet-image">
            </div>
            <h6 class="pet-name">${petData.nombre}</h6>
            <div class="pet-actions">
              <!-- Solo mostrar el botón de eliminar -->
              <button class="btn-icon delete-pet" data-pet-id="${doc.id}"><i class="fas fa-trash"></i></button>
            </div>
          </div>
          <div class="pet-card-details">
            <p><strong>Raza:</strong> <span>${petData.raza}</span></p>
            <p><strong>Edad:</strong> <span>${petData.edad} años</span></p>
            <p><strong>Comportamiento:</strong> <span>${petData.descripcion}</span></p>
          </div>
        `;

        // Agregar evento para expandir/cerrar detalles
        petCard.addEventListener("click", function () {
          const details = this.querySelector(".pet-card-details");
          details.style.display = details.style.display === "block" ? "none" : "block";
        });

        // Agregar la tarjeta al contenedor
        petsGrid.appendChild(petCard);
      });

      // Agregar el botón "Agregar Mascota" al final
      const addPetContainer = document.createElement("div");
      addPetContainer.classList.add("add-pet");
      addPetContainer.innerHTML = `
        <button class="btn btn-primary" id="add-pet"><i class="fas fa-plus"></i> Agregar Mascota</button>
      `;
      petsGrid.appendChild(addPetContainer);
    }
  } catch (error) {
    console.error("Error al cargar las mascotas:", error);
    alert("Hubo un problema al cargar las mascotas. Inténtalo de nuevo.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Solo cargar mascotas si estamos en profile.html
      if (window.location.pathname.includes("profile.html")) {
        loadPets();
      }
    } else {
      window.location.href = "login.html"; // Redirigir al usuario a la página de inicio de sesión
    }
  });

  // Delegación de eventos para el botón "Agregar Mascota"
  document.addEventListener("click", (event) => {
    if (event.target && event.target.id === "add-pet") {
      window.location.href = "addpet.html"; // Redirigir a la página de agregar mascota
    }
  });

  // Delegación de eventos para borrar mascotas
  petsGrid.addEventListener("click", async (event) => {
    if (event.target && event.target.classList.contains("delete-pet")) {
      event.stopPropagation();  // Evita que el clic en el botón de borrar dispare el evento de expansión de detalles
      const petId = event.target.getAttribute("data-pet-id");
      try {
        // Eliminar la mascota de Firestore usando el ID
        const petRef = doc(db, "pets", petId); // Referencia al documento de la mascota
        await deleteDoc(petRef);  // Eliminar el documento
        alert('Mascota eliminada correctamente.');
        loadPets(); // Recargar las mascotas después de eliminar
      } catch (error) {
        console.error("Error al eliminar la mascota:", error);
        alert("Hubo un problema al eliminar la mascota.");
      }
    }
  });
});
