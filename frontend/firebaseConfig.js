import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCWZfJmbn_YKjw5vdamY4EQC__wbn9z0UQ",
  authDomain: "onemorerep-4790f.firebaseapp.com",
  projectId: "onemorerep-4790f",
  storageBucket: "onemorerep-4790f.firebasestorage.app",
  messagingSenderId: "966928582965",
  appId: "1:966928582965:web:1b9c291358b277f92da47c",
  measurementId: "G-WVFNMNWQRT"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);