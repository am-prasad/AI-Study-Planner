// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAPEoLeOl2h2e_7uuaaODkhXh0UkImo_5g",
  authDomain: "aiproject-26fb3.firebaseapp.com",
  databaseURL: "https://aiproject-26fb3-default-rtdb.firebaseio.com",
  projectId: "aiproject-26fb3",
  storageBucket: "aiproject-26fb3.firebasestorage.app",
  messagingSenderId: "1018390391850",
  appId: "1:1018390391850:web:a55733345dd14584936753",
  measurementId: "G-32LJF5G9RP"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
