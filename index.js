// index.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  setPersistence, 
  browserLocalPersistence 
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// === Firebase 설정 ===
const firebaseConfig = {
 apiKey: "AIzaSyDXyG5MIkGzUzAQH7_3JdGtysIUUanZkfg",
  authDomain: "emotionary-7eb12.firebaseapp.com",
  projectId: "emotionary-7eb12",
  storageBucket: "emotionary-7eb12.appspot.com",
  messagingSenderId: "811615110413",
  appId: "1:811615110413:web:6bf3ffe8c9105081ac9c44",
};

// === 초기화 ===
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 세션 지속성 설정 (브라우저 로컬 스토리지)
setPersistence(auth, browserLocalPersistence)
  .then(() => console.log("로그인 세션이 로컬에 저장됩니다."))
  .catch((error) => console.error("Persistence 설정 실패:", error));

const provider = new GoogleAuthProvider();

// === 로그인 버튼 클릭 시 ===
document.getElementById("loginBtn").addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("로그인 성공:", result.user.displayName);
  } catch (error) {
    console.error("로그인 실패:", error);
  }
});

// === 로그아웃 버튼 클릭 시 ===
document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    await signOut(auth);
    console.log("로그아웃 성공");
  } catch (error) {
    console.error("로그아웃 실패:", error);
  }
});
// ========== DOM 요소 ==========
const loginScreen = document.getElementById("loginScreen");
const mainScreen = document.getElementById("mainScreen");
const googleLoginBtn = document.getElementById("googleLoginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userPhoto = document.getElementById("userPhoto");
const userName = document.getElementById("userName");
const calendarGrid = document.getElementById("calendarGrid");
const calendarTitle = document.getElementById("calendarTitle");
const prevMonthBtn = document.getElementById("prevMonthBtn");
const nextMonthBtn = document.getElementById("nextMonthBtn");

const showHomeBtn = document.getElementById("showHomeBtn");
const showWriteBtn = document.getElementById("showWriteBtn");
const calendarSection = document.getElementById("calendarSection");
const writeScreen = document.getElementById("writeScreen");

const saveBtn = document.getElementById("saveBtn");
const emotionSelect = document.getElementById("emotion");
const weatherSelect = document.getElementById("weather");
const diaryInput = document.getElementById("diary");
const photoInput = document.getElementById("photo");

// ========== 모달 ==========
const modal = document.createElement("div");
modal.id = "diaryModal";
modal.classList.add("modal", "hidden");
modal.innerHTML = `
  <div class="modal-content">
    <h2 id="modalDate"></h2>
    <p id="modalEmotion"></p>
    <p id="modalWeather"></p>
    <p id="modalDiary"></p>
    <img id="modalImage" style="max-width:100%; margin-top:15px; border-radius:10px; display:none;">
  </div>
`;
document.body.appendChild(modal);

const modalDate = modal.querySelector("#modalDate");
const modalEmotion = modal.querySelector("#modalEmotion");
const modalWeather = modal.querySelector("#modalWeather");
const modalDiary = modal.querySelector("#modalDiary");
const modalImage = modal.querySelector("#modalImage");

// 배경 클릭으로 모달 닫기
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.add("hidden");
  }
});

// ========== 상태 ==========
let currentDate = new Date();
let diaryData = {}; // { "YYYY-MM-DD": { emotion, weather, diary, imgURL } }

// ========== 로그인 ==========
googleLoginBtn.addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    loginScreen.style.display = "none";
    mainScreen.style.display = "block";
    userName.textContent = user.displayName;
    userPhoto.src = user.photoURL;
    userPhoto.style.display = "inline";
    logoutBtn.style.display = "inline";
  } catch (error) {
    console.error(error);
  }
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  mainScreen.style.display = "none";
  loginScreen.style.display = "flex";
});

// ========== 달력 표시 ==========
function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  calendarTitle.textContent = `${year}년 ${month + 1}월`;
  calendarGrid.innerHTML = "";

  // 빈 칸
  for (let i = 0; i < firstDay; i++) {
    calendarGrid.innerHTML += `<div></div>`;
  }

  // 날짜
  for (let d = 1; d <= lastDate; d++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const hasDiaryClass = diaryData[dateKey] ? "has-diary" : "";
    calendarGrid.innerHTML += `<div class="calendar-cell ${hasDiaryClass}" data-date="${dateKey}"><div class="day">${d}</div></div>`;
  }

  // 날짜 클릭 이벤트
  document.querySelectorAll(".calendar-cell").forEach(day => {
    day.addEventListener("click", (e) => {
      const date = e.currentTarget.dataset.date;
      openModal(date);
    });
  });
}

prevMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

nextMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

// ========== 일기 저장 ==========
saveBtn.addEventListener("click", () => {
  const dateKey = new Date().toISOString().split("T")[0];

  // 데이터 저장
  diaryData[dateKey] = {
    emotion: emotionSelect.value,
    weather: weatherSelect.value,
    diary: diaryInput.value,
  };

  // 작성 화면 테두리/네온 효과 반영
  writeScreen.classList.remove("happy-theme","sad-theme","angry-theme","tired-theme");
  if (emotionSelect.value === "happy") writeScreen.classList.add("happy-theme");
  if (emotionSelect.value === "sad") writeScreen.classList.add("sad-theme");
  if (emotionSelect.value === "angry") writeScreen.classList.add("angry-theme");
  if (emotionSelect.value === "tired") writeScreen.classList.add("tired-theme");

  alert("저장되었습니다!");
  diaryInput.value = "";
  renderCalendar();
});

// ========== 모달 열기 ==========
function openModal(date) {
  const data = diaryData[date];
  if (!data) {
    alert("이 날짜에는 저장된 일기가 없습니다.");
    return;
  }

  modalDate.textContent = date;
  modalEmotion.textContent = `감정: ${data.emotion}`;
  modalWeather.textContent = `날씨: ${data.weather}`;
  modalDiary.textContent = data.diary;
  modalImage.style.display = "none";

  modal.classList.remove("hidden");
}

// 초기 달력 표시
renderCalendar();
