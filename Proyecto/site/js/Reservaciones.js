// Importa los módulos de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Precios por día para cada servicio
const precios = {
    "hospedaje": 100,
    "visitas a hogar": 50,
    "paseos": 30
};

// Inicializar Flatpickr (Calendario)
flatpickr("#fechaLlegada", { dateFormat: "Y-m-d" });
flatpickr("#fechaSalida", { dateFormat: "Y-m-d" });

// Obtener y mostrar las mascotas del usuario
const mascotasList = document.getElementById('mascotas-list');

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            cargarMascotas(user);
        } else {
            console.log("No hay usuario autenticado.");
        }
    });
});


async function cargarMascotas(user) {
    console.log("Usuario autenticado:", user);

    if (!user) {
        alert("Debes iniciar sesión para ver tus mascotas.");
        window.location.href = "login.html";
        return;
    }

    try {
        const q = query(collection(db, "pets"), where("ownerUID", "==", user.uid));
        const querySnapshot = await getDocs(q);

        mascotasList.innerHTML = ''; // Limpiar lista

        if (querySnapshot.empty) {
            mascotasList.innerHTML = "<p>No tienes mascotas registradas.</p>";
        } else {
            querySnapshot.forEach((doc) => {
                const mascota = doc.data();
                mascotasList.innerHTML += `
                    <label>
                        <input type="checkbox" name="mascota" value="${mascota.nombre}" data-id="${doc.id}"> 
                        ${mascota.nombre} (${mascota.raza})
                    </label><br>
                `;
            });
        }
    } catch (error) {
        console.error("Error al cargar mascotas: ", error);
    }
}


// Calcular el total a pagar
function calcularTotal() {
    const servicio = document.getElementById('servicio').value;
    const fechaLlegada = new Date(document.getElementById('fechaLlegada').value);
    const fechaSalida = new Date(document.getElementById('fechaSalida').value);
    const mascotasSeleccionadas = document.querySelectorAll('input[name="mascota"]:checked').length;

    if (fechaLlegada && fechaSalida) {
        const diferenciaTiempo = fechaSalida - fechaLlegada;
        const diferenciaDias = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));
        const costoPorDia = precios[servicio];
        const total = diferenciaDias * costoPorDia * (mascotasSeleccionadas || 1); // Multiplicar por número de mascotas
        document.getElementById('totalPagar').textContent = total;
    }
}

// Eventos para calcular el total
document.getElementById('servicio')?.addEventListener('change', calcularTotal);
document.getElementById('fechaLlegada')?.addEventListener('change', calcularTotal);
document.getElementById('fechaSalida')?.addEventListener('change', calcularTotal);
document.getElementById('mascotas-list')?.addEventListener('change', calcularTotal);

// Registrar reservación
document.getElementById('registroForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
        alert("Debes iniciar sesión para registrar una reservación.");
        window.location.href = "login.html";
        return;
    }

    const servicio = document.getElementById('servicio').value;
    const fechaLlegada = document.getElementById('fechaLlegada').value;
    const fechaSalida = document.getElementById('fechaSalida').value;
    const mascotasSeleccionadas = Array.from(document.querySelectorAll('input[name="mascota"]:checked')).map(m => {
        return {
            nombre: m.value,
            id: m.getAttribute('data-id') // Guardar el ID de la mascota
        };
    });
    const total = parseInt(document.getElementById('totalPagar').textContent);

    try {
        await addDoc(collection(db, "reservaciones"), {
            userId: user.uid,
            servicio: servicio,
            fechaLlegada: fechaLlegada,
            fechaSalida: fechaSalida,
            mascotas: mascotasSeleccionadas, // Guardar nombre e ID de las mascotas
            total: total
        });
        alert('Reservación registrada exitosamente!');
        window.location.href = 'Profile.html'; // Redirigir al perfil del usuario
    } catch (error) {
        console.error("Error al registrar reservación: ", error);
    }
});

// Cargar datos al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('Reservaciones.html')) {
        cargarMascotas();
    } else if (window.location.pathname.includes('Profile.html')) {
        cargarMascotas();
    }
});