import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, doc, getDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { app } from "./firebase.js"; // Importa la configuración de Firebase

const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
  const bookingForm = document.getElementById("bookingForm");

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      alert("Debes iniciar sesión.");
      window.location.href = "index.html"; // Redirigir si el usuario no está autenticado
      return;
    }

    console.log("✅ Usuario autenticado:", user.uid);

    bookingForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const petID = document.getElementById("petID")?.value.trim();
      const serviceType = document.getElementById("serviceType")?.value.trim();

      console.log("📤 Datos capturados:");
      console.log("petID:", petID);
      console.log("Servicio:", serviceType);

      if (!petID || !serviceType) {
        alert("❌ Debes seleccionar una mascota y un servicio.");
        return;
      }

      // Verificar si la mascota realmente existe
      const petRef = doc(db, "users", user.uid, "pets", petID);
      const petSnap = await getDoc(petRef);

      if (!petSnap.exists()) {
        alert("❌ La mascota seleccionada no existe.");
        return;
      }

      console.log("✅ Mascota encontrada en la base de datos:", petSnap.data());

      try {
        const bookingRef = collection(db, "users", user.uid, "bookings");
        await addDoc(bookingRef, {
          petID, // Asegurar que petID se guarde correctamente
          servicio: serviceType, // Guardar tipo de servicio
          estado: "pendiente", // Estado inicial
          fecha: serverTimestamp(), // Fecha actual
        });

        alert("✅ Reservación creada con éxito.");
        bookingForm.reset();
        window.location.href = "dashboard.html";
      } catch (error) {
        console.error("❌ Error al guardar la reservación:", error);
        alert("Hubo un error al guardar la reservación.");
      }
    });
  });
});
