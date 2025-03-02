// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDQnm26chDep3exS44pLZ7xQKRi5B0REZY",
  authDomain: "happy-tails-cbb79.firebaseapp.com",
  projectId: "happy-tails-cbb79",
  storageBucket: "happy-tails-cbb79.appspot.com",
  messagingSenderId: "868647766575",
  appId: "1:868647766575:web:3d7bcd02545bf9621814da",
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

document.addEventListener("DOMContentLoaded", () => {
  const petForm = document.getElementById("petForm");

  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      alert("Debes iniciar sesión.");
      window.location.href = "index.html"; // Redirigir a la página principal
      return;
    }

    petForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Obtener valores del formulario
      const petName = document.getElementById("petName").value.trim();
      const petAge = document.getElementById("petAge").value.trim();
      const petBreed = document.getElementById("petBreed").value.trim();
      const petDescription = document.getElementById("petDescription").value.trim();

      // Validar que todos los campos obligatorios estén llenos
      if (!petName || !petAge || !petBreed || !petDescription) {
        alert("Todos los campos son obligatorios.");
        return;
      }

      try {
        // Generar un ID único para la mascota
        const petID = crypto.randomUUID();

        // Guardar datos de la mascota en la subcolección 'pets' dentro del usuario
        await db.collection("users").doc(user.uid).collection("pets").doc(petID).set({
          IDpet: petID,
          descripcion: petDescription,
          edad: petAge,
          nombre: petName,
          raza: petBreed,
          ownerUID: user.uid, // ID del dueño de la mascota
        });

        alert("Mascota registrada con éxito.");
        petForm.reset(); // Limpiar el formulario
        window.location.href = "profile.html"; // Redirigir a la página de perfil
      } catch (error) {
        console.error("Error al registrar la mascota:", error);
        alert("Hubo un error al registrar la mascota.");
      }
    });
  });
});