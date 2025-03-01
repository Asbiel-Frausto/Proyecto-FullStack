  // Obtener referencias a los enlaces y secciones
  const showRegisterLink = document.getElementById('show-register');
  const showLoginLink = document.getElementById('show-login');
  const loginSection = document.getElementById('login-section');
  const registerSection = document.getElementById('register-section');

  // Mostrar la sección de registro y ocultar la de inicio de sesión
  showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault(); // Evitar que el enlace recargue la página
    loginSection.style.display = 'none';
    registerSection.style.display = 'block';
  });

  // Mostrar la sección de inicio de sesión y ocultar la de registro
  showLoginLink.addEventListener('click', (e) => {
    e.preventDefault(); // Evitar que el enlace recargue la página
    registerSection.style.display = 'none';
    loginSection.style.display = 'block';
  });


// Importación correcta de Firebase con la versión 10.7.1
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  sendEmailVerification,
  getAuth,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut, // Se añadió signOut para manejar el cierre de sesión correctamente
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Configuración correcta de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDQnm26chDep3exS44pLZ7xQKRi5B0REZY",
  authDomain: "happy-tails-cbb79.firebaseapp.com",
  projectId: "happy-tails-cbb79",
  storageBucket: "happy-tails-cbb79.appspot.com",
  messagingSenderId: "868647766575",
  appId: "1:868647766575:web:3d7bcd02545bf9621814da",
};

// Inicialización de Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Se asegura que el código se ejecute solo cuando el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
  // Obtención correcta de los elementos HTML para evitar errores si aún no existen
  const registroBtn = document.getElementById("Registro");
  const inicioSesionBtn = document.getElementById("InicioSesion");

  // Evento para registrar usuario
  registroBtn?.addEventListener("click", (event) => {
    event.preventDefault(); // ✅ Evita que el formulario se envíe y la página se recargue
    console.log("Botón de registro clickeado"); // ✅ Añadido para depuración

    const nombre = document.getElementById("nombreReg").value;
    const email = document.getElementById("emailReg").value;
    const password = document.getElementById("passwordReg").value;
    const verPassword = document.getElementById("verPasswordReg").value;

    if (password !== verPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user; // Se usa userCredential.user en lugar de auth.currentUser
        alert("Usuario creado");

        sendEmailVerification(user).then(() => {
          alert("Se ha enviado un correo de verificación");
        });
      })
      .catch((error) => {
        const errorCode = error.code;

        if (errorCode === "auth/email-already-in-use")
          alert("El correo ya está en uso");
        else if (errorCode === "auth/invalid-email")
          alert("El correo no es válido");
        else if (errorCode === "auth/weak-password")
          alert("La contraseña debe tener al menos 6 caracteres");
        else
          console.error("Error desconocido:", error); // Añadido para capturar errores inesperados
      });
  });

  // Evento para iniciar sesión
inicioSesionBtn?.addEventListener("click", (event) => {
    event.preventDefault(); // Evita que el formulario se envíe y la página se recargue
    console.log("Botón de inicio de sesión clickeado"); // Añadido para depuración
  
    const email = document.getElementById("emailLogIn").value;
    const password = document.getElementById("passwordLogIn").value;
  
    // Validaciones antes de enviar a Firebase
    if (!email || !password) {
      alert("Por favor, completa todos los campos.");
      return;
    }
  
    // Verifica el formato del correo electrónico
    if (!email.includes("@") || !email.includes(".")) {
      alert("Por favor, ingresa un correo electrónico válido.");
      return;
    }
  
    // Iniciar sesión con Firebase
    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        await user.reload();
        console.log("Usuario activo:", user); // Añadido para depuración
  
        if (!user.emailVerified) {
          alert("Por favor, verifica tu correo antes de acceder.");
          await signOut(auth); // Se usa signOut para cerrar sesión si el correo no está verificado
        } else {
          window.location.href = "Profile.html"; // Redirige solo si el correo está verificado
        }
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message; // Captura el mensaje de error de Firebase
  
        console.error("Código de error:", errorCode); // Muestra el código de error en la consola
        console.error("Mensaje de error:", errorMessage); // Muestra el mensaje de error en la consola
  
        if (errorCode === "auth/invalid-credential") {
          alert("Credenciales inválidas. Verifica tu correo y contraseña.");
        } else if (errorCode === "auth/user-not-found") {
          alert("El usuario no existe. Regístrate primero.");
        } else if (errorCode === "auth/wrong-password") {
          alert("Contraseña incorrecta.");
        } else if (errorCode === "auth/invalid-email") {
          alert("El correo electrónico no tiene registrada una cuenta.");
        } else if (errorCode === "auth/user-disabled") {
          alert("El usuario ha sido deshabilitado.");
        } else {
          alert("Ocurrió un error inesperado. Inténtalo de nuevo."); // Mensaje genérico para errores desconocidos
        }
      });
  });

  // Verificar el estado del usuario y redirigir si es necesario
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("Usuario activo:", user); // Añadido para depuración

      if (user.emailVerified) {
        window.location.href = "Profile.html"; // Redirige si el correo está verificado
      } else {
        signOut(auth) // Se usa signOut para cerrar sesión si el correo no está verificado
          .then(() => {
            alert("Por favor, verifica tu correo antes de acceder.");
          })
          .catch((error) => {
            console.error("Error al cerrar sesión:", error); // Añadido para manejar errores al cerrar sesión
          });
      }
    } else {
      console.log("Usuario inactivo"); // Añadido para depuración
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const CerrarSesion = document.getElementById("CerrarSesion");
  
  if (CerrarSesion) {
      CerrarSesion.addEventListener("click", (event) => {
          signOut(auth)
              .then(() => {
                  alert("Sesión cerrada correctamente.");
                  window.location.href = "index.html"; 
              })
              .catch((error) => {
                  console.error("Error al cerrar sesión:", error);
                  alert("Hubo un problema al cerrar sesión. Inténtalo de nuevo.");
              });
      });
  }
});
