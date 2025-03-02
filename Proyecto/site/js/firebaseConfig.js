// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
const auth = getAuth(app);
const db = getFirestore(app);

// Exportar para usar en otros archivos
export { app, auth, db };
