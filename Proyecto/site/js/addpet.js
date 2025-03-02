import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Inicializar Firebase
const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

document.addEventListener("DOMContentLoaded", () => {
  const petForm = document.getElementById("petForm");

  onAuthStateChanged(auth, async (user) => {
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
      const petImage = document.getElementById("petImage").files[0];

      if (!petName || !petAge || !petBreed || !petDescription) {
        alert("Todos los campos son obligatorios.");
        return;
      }

      try {
        // Generar un ID único para la mascota
        const petID = crypto.randomUUID();
        let petImageURL = "";

        // Si el usuario subió una imagen, guardarla en Firebase Storage
        if (petImage) {
          const imageRef = ref(storage, `users/${user.uid}/pets/${petID}`);
          await uploadBytes(imageRef, petImage);
          petImageURL = await getDownloadURL(imageRef);
        }

        // Guardar datos de la mascota en la subcolección 'pets' dentro del usuario
        await setDoc(doc(db, "users", user.uid, "pets", petID), {
          IDpet: petID,
          descripcion: petDescription,
          edad: petAge,
          nombre: petName,
          raza: petBreed,
          ownerUID: user.uid, // ID del dueño de la mascota
          fotoPerfilMascota: petImageURL, // URL de la imagen de la mascota
        });

        alert("Mascota registrada con éxito.");
        petForm.reset();
        window.location.href = "dashboard.html"; // Redirigir tras éxito
      } catch (error) {
        console.error("Error al registrar la mascota:", error);
        alert("Hubo un error al registrar la mascota.");
      }
    });
  });
});
