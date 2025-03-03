// Importa los módulos de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

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

// Inicializar Flatpickr (Calendario) solo si el elemento existe
if (document.getElementById('fechaLlegada')) {
    flatpickr("#fechaLlegada", { dateFormat: "Y-m-d" });
    flatpickr("#fechaSalida", { dateFormat: "Y-m-d" });
}

// Obtener y mostrar las mascotas del usuario
const mascotasList = document.getElementById('mascotas-list');

// Verificar la autenticación del usuario y cargar datos según la página
document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            if (window.location.pathname.includes('Reservaciones.html')) {
                // Código para Reservaciones.html
                cargarMascotas(user);
                configurarFormularioReservacion();
            } else if (window.location.pathname.includes('Profile.html')) {
                // Código para Profile.html
                cargarReservaciones(user);
            }
        } else {
            console.log("No hay usuario autenticado.");
            window.location.href = "login.html"; // Redirigir al login si no hay usuario autenticado
        }
    });
});

// Función para cargar las mascotas del usuario
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
                mascotasList.innerHTML += 
                    `<label>
                        <input type="checkbox" name="mascota" value="${mascota.nombre}" data-id="${doc.id}"> 
                        ${mascota.nombre} (${mascota.raza})
                    </label><br>`;
            });
        }
    } catch (error) {
        console.error("Error al cargar mascotas: ", error);
    }
}

// Función para cargar las reservaciones del usuario
async function cargarReservaciones(user) {
    const reservationsList = document.querySelector('.reservations-list');
    console.log("Cargando reservaciones para el usuario:", user.uid);

    if (!user) {
        alert("Debes iniciar sesión para ver tus reservaciones.");
        window.location.href = "login.html";
        return;
    }

    try {
        const q = query(collection(db, "reservaciones"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);

        reservationsList.innerHTML = ''; // Limpiar lista

        if (querySnapshot.empty) {
            reservationsList.innerHTML = "<p>No tienes reservaciones registradas.</p>";
        } else {
            querySnapshot.forEach((doc) => {
                const reservacion = doc.data();
                reservationsList.innerHTML += `
                    <div class="reservation-card">
                        <div class="reservation-header">
                            <h6>Reservación #${doc.id}</h6>
                            <div class="reservation-actions">
                                <button class="btn-icon edit-reservation"><i class="fas fa-edit"></i></button>
                                <button class="btn-icon cancel-reservation"><i class="fas fa-times"></i></button>
                            </div>
                        </div>
                        <div class="reservation-details">
                            <p><strong>Servicio:</strong> ${reservacion.servicio}</p>
                            <p><strong>Fechas:</strong> ${reservacion.fechaLlegada} - ${reservacion.fechaSalida}</p>
                            <p><strong>Mascotas:</strong> ${reservacion.mascotas.map(m => m.nombre).join(', ')}</p>
                            <p><strong>Total:</strong> $${reservacion.total}</p>
                        </div>
                    </div>`;
            });
        }

        // Agregar el botón "Nueva Reservación" al final
        reservationsList.innerHTML += `
            <div class="add-reservation">
                <button class="btn btn-primary" id="new-reservation"><i class="fas fa-plus"></i> Nueva Reservación</button>
            </div>`;
    } catch (error) {
        console.error("Error al cargar reservaciones: ", error);
    }
}

// Configurar eventos del formulario de reservación (solo para Reservaciones.html)
function configurarFormularioReservacion() {
    const servicioSelect = document.getElementById('servicio');
    const fechaLlegadaInput = document.getElementById('fechaLlegada');
    const fechaSalidaInput = document.getElementById('fechaSalida');
    const mascotasList = document.getElementById('mascotas-list');
    const registroForm = document.getElementById('registroForm');

    // Verificar si los elementos existen antes de agregar event listeners
    if (servicioSelect && fechaLlegadaInput && fechaSalidaInput && mascotasList && registroForm) {
        // Calcular el total a pagar
        function calcularTotal() {
            const servicio = servicioSelect.value;
            const fechaLlegada = new Date(fechaLlegadaInput.value);
            const fechaSalida = new Date(fechaSalidaInput.value);
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
        servicioSelect.addEventListener('change', calcularTotal);
        fechaLlegadaInput.addEventListener('change', calcularTotal);
        fechaSalidaInput.addEventListener('change', calcularTotal);
        mascotasList.addEventListener('change', calcularTotal);

        // Registrar reservación
        registroForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const user = auth.currentUser;
            if (!user) {
                alert("Debes iniciar sesión para registrar una reservación.");
                window.location.href = "login.html";
                return;
            }

            const servicio = servicioSelect.value;
            const fechaLlegada = fechaLlegadaInput.value;
            const fechaSalida = fechaSalidaInput.value;
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
    }
}