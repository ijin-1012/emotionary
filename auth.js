// auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// --- 1. Firebase 설정 ---
const firebaseConfig = {
  apiKey: "AIzaSyDXyG5MIkGzUzAQH7_3JdGtysIUUanZkfg",
  authDomain: "emotionary-7eb12.firebaseapp.com",
  projectId: "emotionary-7eb12",
  storageBucket: "emotionary-7eb12.firebasestorage.app",
  messagingSenderId: "811615110413",
  appId: "1:811615110413:web:6bf3ffe8c9105081ac9c44"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// --- 2. 구글 로그인 버튼 이벤트 ---
const googleLoginBtn = document.getElementById("googleLoginBtn");
googleLoginBtn.addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // --- 3. localStorage에 사용자 정보 저장 ---
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userName", user.displayName);
    localStorage.setItem("userEmail", user.email);
    localStorage.setItem("userPhoto", user.photoURL);

    // --- 4. main.html 이동 ---
    window.location.href = "index.html";
  } catch (error) {
    console.error("로그인 실패:", error);
    alert("로그인에 실패했습니다. 다시 시도해주세요.");
  }
});

// --- 5. 로그인 상태 유지 ---
window.addEventListener("DOMContentLoaded", () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  if (isLoggedIn === "true") {
    window.location.href = "index.html";
  }
});
