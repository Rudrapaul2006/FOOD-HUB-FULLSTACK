// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "food-hub-9349e.firebaseapp.com",
  projectId: "food-hub-9349e",
  storageBucket: "food-hub-9349e.firebasestorage.app",
  messagingSenderId: "801546161478",
  appId: "1:801546161478:web:f3de9b63e5df5612cea947"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth , app }