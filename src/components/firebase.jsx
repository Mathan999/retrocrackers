import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
 apiKey: "AIzaSyBJiZpVLdm7TGDBJj7GYlkZIKOaRPMvVa8",
  authDomain: "retrocrackersaanikuttam.firebaseapp.com",
  databaseURL: "https://retrocrackersaanikuttam-default-rtdb.firebaseio.com",
  projectId: "retrocrackersaanikuttam",
  storageBucket: "retrocrackersaanikuttam.firebasestorage.app",
  messagingSenderId: "399856657473",
  appId: "1:399856657473:web:b002ee8c63b9a95de052c0",
  measurementId: "G-TEVC4KM72Q"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const storage = getStorage(app);
const auth = getAuth(app); // Initialize Firebase Auth

export { app, database, storage, auth }; // Export auth for use in LoginForm