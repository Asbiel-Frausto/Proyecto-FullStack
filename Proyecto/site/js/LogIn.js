import { auth, db } from "./firebaseConfig.js";
import {
  sendEmailVerification,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Obtener referencias a los enlaces y secciones
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');

// Mostrar la sección de registro y ocultar la de inicio de sesión
showRegisterLink?.addEventListener('click', (e) => {
  e.preventDefault();
  loginSection.style.display = 'none';
  registerSection.style.display = 'block';
});

// Mostrar la sección de inicio de sesión y ocultar la de registro
showLoginLink?.addEventListener('click', (e) => {
  e.preventDefault();
  registerSection.style.display = 'none';
  loginSection.style.display = 'block';
});

// Se asegura que el código se ejecute solo cuando el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
  const registroBtn = document.getElementById("Registro");
  const inicioSesionBtn = document.getElementById("InicioSesion");

  // Evento para registrar usuario
  registroBtn?.addEventListener("click", async (event) => {
    event.preventDefault();
    const nombre = document.getElementById("nombreReg").value;
    const email = document.getElementById("emailReg").value;
    const password = document.getElementById("passwordReg").value;
    const verPassword = document.getElementById("verPasswordReg").value;

    if (password !== verPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await sendEmailVerification(user);
      alert("Usuario creado. Se ha enviado un correo de verificación");

      // Limpiar los campos del formulario
      document.getElementById("nombreReg").value = '';
      document.getElementById("emailReg").value = '';
      document.getElementById("passwordReg").value = '';
      document.getElementById("verPasswordReg").value = '';

      // Guardar el uid en Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        nombre: nombre,
        email: email,
        fotoPerfilUsuario: ""
      });

      console.log("Usuario guardado en Firestore correctamente.");

      // Redirigir al usuario a la página de inicio de sesión después del registro
      loginSection.style.display = 'block';
      registerSection.style.display = 'none';
    } catch (error) {
      console.error("Error al registrar el usuario:", error);

      // Manejo de errores específicos
      if (error.code === "auth/email-already-in-use") alert("El correo ya está en uso");
      else if (error.code === "auth/invalid-email") alert("El correo no es válido");
      else if (error.code === "auth/weak-password") alert("La contraseña debe tener al menos 6 caracteres");
      else alert("Ocurrió un error inesperado. Inténtalo de nuevo.");
    }
  });

  // Evento para iniciar sesión
  inicioSesionBtn?.addEventListener("click", async (event) => {
    event.preventDefault();
    const email = document.getElementById("emailLogIn").value;
    const password = document.getElementById("passwordLogIn").value;

    if (!email || !password) {
      alert("Por favor, completa todos los campos.");
      return;
    }
    if (!email.includes("@") || !email.includes(".")) {
      alert("Por favor, ingresa un correo electrónico válido.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verificar si el correo está verificado
      if (!user.emailVerified) {
        alert("Por favor, verifica tu correo antes de acceder.");
        await signOut(auth); // Cerrar sesión si el correo no está verificado
        window.location.href = "index.html"; // Redirigir a una página de verificación
        return;
      }

      // Redirigir al perfil solo si el correo está verificado
      window.location.href = "profile.html";
    } catch (error) {
      const errorCode = error.code;
      if (errorCode === "auth/invalid-credential") alert("Credenciales inválidas. Verifica tu correo y contraseña.");
      else if (errorCode === "auth/user-not-found") alert("El usuario no existe. Regístrate primero.");
      else if (errorCode === "auth/wrong-password") alert("Contraseña incorrecta.");
      else if (errorCode === "auth/invalid-email") alert("El correo electrónico no tiene registrada una cuenta.");
      else if (errorCode === "auth/user-disabled") alert("El usuario ha sido deshabilitado.");
      else alert("Ocurrió un error inesperado. Inténtalo de nuevo.");
    }
  });

  // Verificar el estado del usuario y evitar redirección automática en la página de inicio de sesión
  onAuthStateChanged(auth, (user) => {
    console.log("Estado de autenticación:", user);
    if (user) {
      if (user.emailVerified && !window.location.pathname.includes("profile.html")) {
        console.log("Redirigiendo a profile.html");
        window.location.href = "profile.html";
      } else {
        console.log("El usuario ya está en profile.html o no está verificado");
      }

      // Mostrar el correo del usuario en la página
      mostrarDatosPerfil(user.email);

      // Cargar el nombre del usuario desde Firestore
      loadUserName(user);
    } else {
      // Verifica si el usuario está en la página de inicio de sesión
      if (!window.location.pathname.includes("login.html")) {
        console.log("No hay usuario autenticado, redirigiendo a LogIn.html");
      }
    }
  });
});

// Función para mostrar el correo en la página
function mostrarDatosPerfil(email) {
  const EmailElement = document.getElementById("user-email");
  if (EmailElement) {
    EmailElement.textContent = `${email}`;
  }
}

// Función para obtener el nombre del usuario desde Firestore
async function loadUserName(user) {
  if (!user) return; // Si no hay usuario autenticado, salir

  try {
    const userRef = doc(db, "users", user.uid); // Referencia al documento del usuario
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userName = userSnap.data().nombre; // Obtener el nombre del usuario
      const nameElement = document.getElementById("user-name");

      if (nameElement) {
        nameElement.textContent = userName; // Actualizar el HTML
      } else {
        console.warn("Elemento con id 'user-name' no encontrado en el DOM.");
      }
    } else {
      console.log("No se encontró información del usuario en Firestore.");
    }
  } catch (error) {
    console.error("Error al obtener el nombre del usuario:", error);
  }
}

// Manejo de cierre de sesión
document.addEventListener("DOMContentLoaded", () => {
  const CerrarSesion = document.getElementById("logout-button");
  CerrarSesion?.addEventListener("click", async () => {
    try {
      await signOut(auth);
      alert("Sesión cerrada correctamente.");
      window.location.href = "index.html";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("Hubo un problema al cerrar sesión. Inténtalo de nuevo.");
    }
  });
});