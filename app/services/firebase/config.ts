import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDpbVnvmiepKw_WsucdEDgsUGgQdc5_2fs",
  authDomain: "react-native-backend-2025.firebaseapp.com",
  projectId: "react-native-backend-2025",
  storageBucket: "react-native-backend-2025.firebasestorage.com",
  messagingSenderId: "343318031157",
  appId: "1:343318031157:web:7852f344a50b2c6f0d3a7c",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
