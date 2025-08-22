// firebaseInit.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyDXyG5MIkGzUzAQH7_3JdGtysIUUanZkfg",
  authDomain: "emotionary-7eb12.firebaseapp.com",
  projectId: "emotionary-7eb12",
  storageBucket: "emotionary-7eb12.appspot.com",
  messagingSenderId: "811615110413",
  appId: "1:811615110413:web:6bf3ffe8c9105081ac9c44",
  measurementId: "G-Q658W4MLGJ"
};

// Firebase 앱 초기화
export const app = initializeApp(firebaseConfig);
