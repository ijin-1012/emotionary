// ================== Firebase 초기화 (compat) ==================
const firebaseConfig = {
  apiKey: "AIzaSyDXyG5MIkGzUzAQH7_3JdGtysIUUanZkfg",
  authDomain: "emotionary-7eb12.firebaseapp.com",
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

// ================== DOM 요소 ==================
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

// ================== 상태 ==================
let currentDate = new Date();
let diaryData = {}; // { "YYYY-MM-DD": { emotion, weather, diary } }

// ================== 로그인 ==================
function showUser(user) {
  if (user) {
    loginScreen.style.display = "none";
    mainScreen.style.display = "block";
    userName.textContent = user.displayName;
    userPhoto.src = user.photoURL;
    userPhoto.style.display = "inline";
    logoutBtn.style.display = "inline";
  } else {
    loginScreen.style.display = "flex";
    mainScreen.style.display = "none";
    userPhoto.style.display = "none";
    userName.textContent = "";
    logoutBtn.style.display = "none";
  }
}

// 로그인 상태 유지
auth.onAuthStateChanged(showUser);

// 로그인 버튼
googleLoginBtn.addEventListener("click", () => {
  auth.signInWithPopup(provider)
    .then(result => showUser(result.user))
    .catch(error => console.error(error));
});

// 로그아웃 버튼
logoutBtn.addEventListener("click", () => {
  auth.signOut().then(() => showUser(null)).catch(error => console.error(error));
});

// ================== 달력 ==================
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

// ================== 일기 저장 ==================
saveBtn.addEventListener("click", () => {
  const dateKey = new Date().toISOString().split("T")[0];
  diaryData[dateKey] = {
    emotion: emotionSelect.value,
    weather: weatherSelect.value,
    diary: diaryInput.value
  };
  alert("저장되었습니다!");
  diaryInput.value = "";
  renderCalendar();
});

// ================== 모달 ==================
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

function openModal(date) {
  const data = diaryData[date];
  if (!data) { alert("저장된 일기가 없습니다."); return; }
  modalDate.textContent = date;
  modalEmotion.textContent = `감정: ${data.emotion}`;
  modalWeather.textContent = `날씨: ${data.weather}`;
  modalDiary.textContent = data.diary;
  modal.classList.remove("hidden");
}

// 배경 클릭 시 모달 닫기
modal.addEventListener("click", e => {
  if (e.target === modal) modal.classList.add("hidden");
});

// ================== 화면 전환 ==================
showHomeBtn.addEventListener("click", () => {
  calendarSection.style.display = "block";
  writeScreen.style.display = "none";
});
showWriteBtn.addEventListener("click", () => {
  calendarSection.style.display = "none";
  writeScreen.style.display = "block";
});

// ================== 초기 달력 ==================
renderCalendar();
