// index.js

// ========== Firebase 초기화 ==========
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

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

// 모달 생성
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
    const hasDiary = diaryData[dateKey] ? "has-diary" : "";
    calendarGrid.innerHTML += `<div class="calendar-day ${hasDiary}" data-date="${dateKey}">${d}</div>`;
  }

  // 날짜 클릭 이벤트
  document.querySelectorAll(".calendar-day").forEach(day => {
    day.addEventListener("click", e => {
      const date = e.target.dataset.date;
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
  diaryData[dateKey] = {
    emotion: emotionSelect.value,
    weather: weatherSelect.value,
    diary: diaryInput.value,
  };

  alert("저장되었습니다!");
  diaryInput.value = "";
  renderCalendar();
});

function openModal(date) {
  const data = diaryData[date];
  if (!data) {
    alert("이 날짜에는 저장된 일기가 없습니다.");
    return;
  }

  modalDate.textContent = date;

  // 감정을 이모지로 표시
  let emotionEmoji = "";
  switch(data.emotion){
    case "happy": emotionEmoji = "😊"; break;
    case "sad": emotionEmoji = "😭"; break;
    case "angry": emotionEmoji = "😡"; break;
    case "tired": emotionEmoji = "😴"; break;
  }
  modalEmotion.textContent = `감정: ${emotionEmoji} ${data.emotion}`;

  // 날씨 이모지도 표시
  let weatherEmoji = "";
  switch(data.weather){
    case "sunny": weatherEmoji = "☀️"; break;
    case "cloudy": weatherEmoji = "☁️"; break;
    case "rainy": weatherEmoji = "☔"; break;
    case "snowy": weatherEmoji = "❄️"; break;
    case "windy": weatherEmoji = "💨"; break;
  }
  modalWeather.textContent = `날씨: ${weatherEmoji} ${data.weather}`;

  modalDiary.textContent = data.diary;
  modalImage.style.display = "none";

  modal.classList.remove("hidden");
}

// 모달 배경 클릭으로 닫기
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.add("hidden");
  }
});


// 초기 달력 표시
renderCalendar();
