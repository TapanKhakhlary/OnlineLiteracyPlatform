// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDT_Sab4Url8nwpqtUMS1acS2_PLs0Eqrc",
  authDomain: "online-literacy-portal.firebaseapp.com",
  projectId: "online-literacy-portal",
  storageBucket: "online-literacy-portal.firebasestorage.app",
  messagingSenderId: "1031850416907",
  appId: "1:1031850416907:web:eea6fa11d321f05693a00e",
  measurementId: "G-6J29DKR0T3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);