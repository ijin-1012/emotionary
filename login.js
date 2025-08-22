import { app } from "./firebaseInit.js";
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";

const auth = getAuth(app);

// 로그인된 상태면 바로 index로 이동
onAuthStateChanged(auth, user => {
  if (user) {
    console.log("이미 로그인됨 → index로 이동");
    window.location.href = "index.html";
  }
});

// 로그인 버튼
const googleLoginBtn = document.getElementById("googleLoginBtn");
googleLoginBtn.addEventListener("click", () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then(() => {
      window.location.href = "index.html";
    })
    .catch(err => {
      console.error("로그인 오류", err);
    });
});
