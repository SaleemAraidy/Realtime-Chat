import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
//import dotenv from "dotenv";

//dotenv.config();

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: "realtimechat-49149.firebaseapp.com",
  projectId: "realtimechat-49149",
  storageBucket: "realtimechat-49149.firebasestorage.app",
  messagingSenderId: "1023284661899",
  appId: "1:1023284661899:web:b2396d835cc3a103d5ce8e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();
