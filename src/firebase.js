import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD1Cf-xYjIa_EiCYLSOqd0v_2YhwHLyrbQ",
  authDomain: "management-425c0.firebaseapp.com",
  projectId: "management-425c0",
  storageBucket: "management-425c0.appspot.com",
  messagingSenderId: "477840666094",
  appId: "1:477840666094:web:32b447dcaad1522a01b2ff",
  measurementId: "G-B97X4RZKDX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, signInWithEmailAndPassword, signOut };
