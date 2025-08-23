// index.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  setPersistence, 
  browserLocalPersistence,
  onAuthStateChanged
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
const provider = new GoogleAuthProvider();

// === DOM 요소 ===
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

const photoIcon = document.getElementById("photoIcon"); // 화면에 보여줄 📸 아이콘

photoIcon.addEventListener("click", () => {
  photoInput.click(); // 숨겨진 파일 input을 클릭
});


// === 모달 생성 ===
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

modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.add("hidden");
});

// === 상태 ===
let currentDate = new Date();
let diaryData = {}; // { "YYYY-MM-DD": { emotion, weather, diary, imgURL } }

// === 세션 지속성 ===
setPersistence(auth, browserLocalPersistence)
  .then(() => console.log("세션 로컬 저장 완료"))
  .catch(err => console.error(err));

// === 로그인/로그아웃 ===
googleLoginBtn.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    console.error("로그인 실패:", err);
  }
});

logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
  } catch (err) {
    console.error("로그아웃 실패:", err);
  }
});

// === 로그인 상태 감지 ===
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginScreen.style.display = "none";
    mainScreen.style.display = "block";
    userName.textContent = user.displayName;
    userPhoto.src = user.photoURL;
    userPhoto.style.display = "inline";
    logoutBtn.style.display = "inline";

    // 초기 화면 설정
    calendarSection.style.display = "block";
    writeScreen.style.display = "none";

  } else {
    mainScreen.style.display = "none";
    loginScreen.style.display = "flex";
  }
});

// === 화면 전환 버튼 이벤트 ===
showWriteBtn.addEventListener("click", () => {
  calendarSection.style.display = "none";
  writeScreen.style.display = "flex";  // flex로 해야 중앙 정렬 유지
  writeScreen.classList.remove("happy-theme","sad-theme","angry-theme","tired-theme");
});

showHomeBtn.addEventListener("click", () => {
  writeScreen.style.display = "none";
  calendarSection.style.display = "block"; // block으로 원래 달력 스타일 유지
});


// === 달력 렌더링 ===
function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  calendarTitle.textContent = `${year}년 ${month + 1}월`;
  calendarGrid.innerHTML = "";

  for (let i = 0; i < firstDay; i++) calendarGrid.innerHTML += `<div></div>`;
  for (let d = 1; d <= lastDate; d++) {
    const dateKey = `${year}-${String(month + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    const hasDiaryClass = diaryData[dateKey] ? "has-diary" : "";
    calendarGrid.innerHTML += `
      <div class="calendar-cell ${hasDiaryClass}" data-date="${dateKey}">
        <div class="day">${d}</div>
      </div>`;
  }

  document.querySelectorAll(".calendar-cell").forEach(cell => {
    cell.addEventListener("click", () => {
      const date = cell.dataset.date;
      const data = diaryData[date];
      if (!data) {
        alert("이 날짜에는 저장된 일기가 없습니다.");
        return;
      }
      modalDate.textContent = date;
      modalEmotion.textContent = `감정: ${data.emotion}`;
      modalWeather.textContent = `날씨: ${data.weather}`;
      modalDiary.textContent = data.diary;
      if (data.imgURL) {
        modalImage.src = data.imgURL;
        modalImage.style.display = "block";
      } else modalImage.style.display = "none";
      modal.classList.remove("hidden");
    });
  });
}

prevMonthBtn.addEventListener("click", () => { currentDate.setMonth(currentDate.getMonth()-1); renderCalendar(); });
nextMonthBtn.addEventListener("click", () => { currentDate.setMonth(currentDate.getMonth()+1); renderCalendar(); });

// === 일기 저장 ===
saveBtn.addEventListener("click", () => {
  const dateKey = new Date().toISOString().split("T")[0];
  let imgURL = null;

  if (photoInput.files && photoInput.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imgURL = e.target.result;
      diaryData[dateKey] = {
        emotion: emotionSelect.value,
        weather: weatherSelect.value,
        diary: diaryInput.value,
        imgURL
      };
      updateUIAfterSave();
    };
    reader.readAsDataURL(photoInput.files[0]);
  } else {
    diaryData[dateKey] = {
      emotion: emotionSelect.value,
      weather: weatherSelect.value,
      diary: diaryInput.value,
      imgURL
    };
    updateUIAfterSave();
  }
});

function updateUIAfterSave() {
  writeScreen.classList.remove("happy-theme","sad-theme","angry-theme","tired-theme");
  writeScreen.classList.add(emotionSelect.value + "-theme");
  alert("저장되었습니다!");
  diaryInput.value = "";
  photoInput.value = "";
  renderCalendar();
}

// === 초기 렌더링 ===
renderCalendar();
