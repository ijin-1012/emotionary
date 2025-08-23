// Firebase 초기화
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// DOM 요소
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

// 상태
let currentDate = new Date();
let diaryData = {}; // { "YYYY-MM-DD": { emotion, weather, diary } }

// 로그인 이벤트
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

// 달력 렌더링
function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  calendarTitle.textContent = `${year}년 ${month + 1}월`;
  calendarGrid.innerHTML = "";

  for (let i = 0; i < firstDay; i++) calendarGrid.innerHTML += `<div></div>`;
  for (let d = 1; d <= lastDate; d++) {
    const dateKey = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    const hasDiary = diaryData[dateKey] ? "has-diary" : "";
    calendarGrid.innerHTML += `<div class="calendar-day ${hasDiary}" data-date="${dateKey}">${d}</div>`;
  }

  document.querySelectorAll(".calendar-day").forEach(day => {
    day.addEventListener("click", e => openModal(e.target.dataset.date));
  });
}

prevMonthBtn.addEventListener("click", () => { currentDate.setMonth(currentDate.getMonth()-1); renderCalendar(); });
nextMonthBtn.addEventListener("click", () => { currentDate.setMonth(currentDate.getMonth()+1); renderCalendar(); });

// 일기 저장
saveBtn.addEventListener("click", () => {
  const dateKey = new Date().toISOString().split("T")[0];
  diaryData[dateKey] = {
    emotion: emotionSelect.value,
    weather: weatherSelect.value,
    diary: diaryInput.value,
  };
  alert("저장되었습니다!");
  diaryInput.value = "";
  renderCalendar();
});

// 모달 생성
const modal = document.createElement("div");
modal.className = "modal hidden";
modal.innerHTML = `
  <div class="modal-content">
    <h2 id="modalDate"></h2>
    <p id="modalEmotion"></p>
    <p id="modalWeather"></p>
    <p id="modalDiary"></p>
  </div>
`;
document.body.appendChild(modal);

const modalDate = modal.querySelector("#modalDate");
const modalEmotion = modal.querySelector("#modalEmotion");
const modalWeather = modal.querySelector("#modalWeather");
const modalDiary = modal.querySelector("#modalDiary");

// 모달 열기
function openModal(date) {
  const data = diaryData[date];
  if (!data) { alert("저장된 일기가 없습니다."); return; }
  modalDate.textContent = date;
  modalEmotion.textContent = `감정: ${data.emotion}`;
  modalWeather.textContent = `날씨: ${data.weather}`;
  modalDiary.textContent = data.diary;
  modal.classList.remove("hidden");
}

// 모달 닫기: 배경 클릭 시
modal.addEventListener("click", e => {
  if (e.target === modal) modal.classList.add("hidden");
});

// 초기 달력
renderCalendar();
