// index.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js";

// === Firebase 초기화 ===
const firebaseConfig = {
  apiKey: "AIzaSyDXyG5MIkGzUzAQH7_3JdGtysIUUanZkfg",
  authDomain: "emotionary-7eb12.firebaseapp.com",
  projectId: "emotionary-7eb12",
  storageBucket: "emotionary-7eb12.appspot.com",
  messagingSenderId: "811615110413",
  appId: "1:811615110413:web:6bf3ffe8c9105081ac9c44",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

// === 상태 ===
let diaryData = {}; // { "YYYY-MM-DD": { emotion, weather, text, photoURL } }

// === DOM ===
const loginScreen = document.getElementById("loginScreen");
const mainScreen = document.getElementById("mainScreen");
const googleLoginBtn = document.getElementById("googleLoginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userPhoto = document.getElementById("userPhoto");
const userName = document.getElementById("userName");
const calendarSection = document.getElementById("calendarSection");
const writeScreen = document.getElementById("writeScreen");
const showHomeBtn = document.getElementById("showHomeBtn");
const showWriteBtn = document.getElementById("showWriteBtn");
const calendarGrid = document.getElementById("calendarGrid");
const calendarTitle = document.getElementById("calendarTitle");
const prevMonthBtn = document.getElementById("prevMonthBtn");
const nextMonthBtn = document.getElementById("nextMonthBtn");
const emotionSelect = document.getElementById("emotion");
const weatherSelect = document.getElementById("weather");
const diaryInput = document.getElementById("diary");
const saveBtn = document.getElementById("saveBtn");
const modal = document.getElementById("diaryModal");
const closeModal = document.getElementById("closeModal");
const modalDate = document.getElementById("modalDate");
const modalEmotion = document.getElementById("modalEmotion");
const modalDiary = document.getElementById("modalDiary");
const modalImage = document.getElementById("modalImage");

// === 세션 유지 ===
setPersistence(auth, browserLocalPersistence).catch(console.error);

// === 로그인/로그아웃 ===
googleLoginBtn.addEventListener("click", async () => {
  try { await signInWithPopup(auth, provider); } catch(err){ console.error("로그인 실패:", err); }
});
logoutBtn.addEventListener("click", async () => {
  try { await signOut(auth);
    console.log("로그아웃 성공");
   } catch(err){ console.error("로그아웃 실패:", err); 
   }
}); 

// Firestore에 일기 저장 함수
async function saveDiary(diaryText, emotion, weather) {
  // Firestore에 데이터 저장
  const docRef = await addDoc(collection(db, "diaries"), {
    userId: auth.currentUser.uid,
    date: new Date().toISOString().split("T")[0],
    text: diaryText,
    emotion,
    weather,
    createdAt: Timestamp.now()
  });
  console.log("일기 저장 ID:", docRef.id);
}

async function loadDiaries(){
  const q = query(collection(db,"diaries"), where("userId","==",auth.currentUser.uid));
  const snapshot = await getDocs(q);
  const diaries = {};
  snapshot.forEach(doc => {
    const data = doc.data();
    diaries[data.date] = { text: data.text, emotion: data.emotion, weather: data.weather };
  });
  return diaries;
}

// 로그인 상태 감지
onAuthStateChanged(auth, async (user) => {
  if(user) {
    console.log('로그인된 사용자:', user); // 사용자 정보 출력

    loginScreen.style.display="none";
    mainScreen.style.display="block";
    userName.textContent=user.displayName;  // 사용자 이름 업데이트
    userPhoto.src=user.photoURL;  // 사용자 사진 업데이트
    userPhoto.style.display="inline";  // 사용자 사진 표시
    logoutBtn.style.display="inline";  // 로그아웃 버튼 표시
    calendarSection.style.display="block";
    writeScreen.style.display="none";

    diaryData = await loadDiaries();
    renderCalendar();
  } else {
    loginScreen.style.display="flex";
    mainScreen.style.display="none";
  }
});

// === 화면 전환 ===
showWriteBtn.addEventListener("click",() => { 
  calendarSection.style.display="none"; 
  writeScreen.style.display="flex"; 
});
showHomeBtn.addEventListener("click",() => { 
  writeScreen.style.display="none"; 
  calendarSection.style.display="block"; 
});

// === 모달 열기 함수 ===
function openModal(data) {
  const modal = document.getElementById('diaryModal');
  const modalDate = document.getElementById('modalDate');
  const modalDayElement = document.getElementById('modalDay');
  const weatherEmojiElement = document.getElementById('weatherEmoji');
  const emotionEmojiElement = document.getElementById('emotionEmoji');
  const modalDiary = document.getElementById('modalDiary');

  modalDate.textContent = data.date; // 날짜 표시
  modalDayElement.textContent = getDayOfWeek(data.date); // 요일 표시
  weatherEmojiElement.innerHTML = getWeatherEmoji(data.weather); // 날씨 이모지 표시
  emotionEmojiElement.innerHTML = getEmotionEmoji(data.emotion); // 감정 이모지 표시
  modalDiary.textContent = data.text; // 일기 텍스트 표시
   
// 모달 표시
  modal.style.display = "flex"; 
  console.log("모달이 열렸습니다."); // 모달이 열리는지 로그 확인
}

// === 모달 닫기 ===
closeModal.addEventListener("click", () => {
  modal.style.display = "none";
  console.log("모달이 닫혔습니다."); // 모달이 닫히는지 로그 확인
});
modal.addEventListener("click", e => { 
  if (e.target === modal) {
    modal.style.display = "none"; 
    console.log("모달이 외부 클릭으로 닫혔습니다."); // 외부 클릭 시 모달 닫힘 확인
  }
});

// === 초기화 ===
let currentDate = new Date();

// === 요일을 반환하는 함수 ===
function getDayOfWeek(dateString) {
  const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];
  const date = new Date(dateString);
  return daysOfWeek[date.getDay()];
}

// === 감정 이모지 함수 ===
function getEmotionEmoji(emotion) {
  const emojis = {
    happy: "😊",
    sad: "😭",
    angry: "😡",
    tired: "😴",
    soso: "😌",
    full: "🤢"
  };
  return emojis[emotion] || "🙂";
}

// === 날씨 이모지 함수 ===
function getWeatherEmoji(weather) {
  const emojis = {
    sunny: "☀️",
    cloudy: "☁️",
    rainy: "☔",
    snowy: "❄️",
    windy: "💨",
    hot: "🥵",
    cold: "🥶"
  };
  return emojis[weather] || "🌤️";
}

// === 달력 렌더링 ===
function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const calendarTitle = document.getElementById('calendarTitle');
  const calendarGrid = document.getElementById('calendarGrid');
  calendarTitle.textContent = `${year}년 ${month + 1}월`;
  calendarGrid.innerHTML = "";

  const emotionColor = { 
    happy: "#ffe066", 
    sad: "#74c0fc", 
    angry: "#ff6b6b", 
    tired: "#c9a0dc", 
    soso: "#ff77b4",
    full: "#a0dcb2ff"
  };

  // 빈 칸 채우기
  for (let i = 0; i < firstDay; i++) calendarGrid.innerHTML += "<div></div>";
  
  for (let d = 1; d <= lastDate; d++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const cell = document.createElement("div");
    cell.className = "calendar-cell";
    cell.dataset.date = dateKey;
    cell.textContent = d;

    // 감정 이모지와 날짜만 표시
    if (diaryData[dateKey]) {
      const emotion = diaryData[dateKey].emotion;
      const color = emotionColor[emotion] || "#fff";
      cell.style.border = `2px solid ${color}`;
      cell.style.boxShadow = `0 0 8px ${color}`;
      cell.style.transition = "0.3s";
    
      // 감정 이모지 추가
      const emotionEmoji = getEmotionEmoji(emotion);
      cell.innerHTML = `${d}<br>${emotionEmoji}`;
    }

    // 클릭 시 모달 띄우기
    cell.addEventListener("click", () => {
      const data = diaryData[dateKey];
      if (!data) {
        alert("이 날은 일기 안 썼어 . . 🥹");
        return;
      }
      console.log("모달을 여는 데이터:", data); // 데이터 확인을 위한 로그 추가
      openModal({
        date: dateKey,
        text: data.text,
        emotion: data.emotion,
        weather: data.weather,
        photoURL: data.photoURL
      });
    });

    calendarGrid.appendChild(cell);
  }
}

// DOM이 완전히 로드된 후에 코드 실행
document.addEventListener('DOMContentLoaded', () => {
  renderCalendar();
});

// === 이전/다음 월 버튼 ===
prevMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

nextMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

// 일기 저장 이벤트 리스너
saveBtn.addEventListener("click", async () => {
  const diaryText = diaryInput.value;
  const emotion = emotionSelect.value;
  const weather = weatherSelect.value;

  // 일기 데이터를 Firestore에 저장
  await saveDiary(diaryText, emotion, weather);

  // Firestore에서 데이터를 불러와 diaryData 업데이트
  diaryData = await loadDiaries();

  // 화면 초기화 및 달력 렌더링
  diaryInput.value = "";
  writeScreen.style.display = "none";
  calendarSection.style.display = "block";
  renderCalendar();

  // 감정별 랜덤 메시지
  const messages = {
    happy: ["행복이란 만들어지는 게 아니라, 만들어 가는 거라구 ! 🐸", 
        "오늘은 어떤 하루가 될까 ? 특별한 일은 없어도 작은 행복을 느끼는 날이 되면 좋겠어 , 그렇다고 ! 🐹",
        "앞으로 살아가다가 힘들 때 이 풍경을 떠올리면 용기가 날 것 같거든 🐭", 
        "행복, 쟁취하지 말고 받자 2 1 세기 평화주의 🤖", 
        "과일을 먹으면 너가 생각나 아삭아삭 맛있게 먹던 그 소리 🍏", 
        "청춘은 참 좋구나 ~ 나도 섞이고 싶어 🐘", 
        "그러다 어느 날 알게 된 거야 ! 일부러 그렇게 하지 않아도 난 살 가치가 있다는 걸 🦜"],
    sad: ["다들 각자의 스타일이 있는 법이지 ! 그러니까 너도 니 방식대로 지내면 돼 ! 그게 제일이야 ! 🐴",
        "속이 비어 있는 것이 더 좋을 때도 있죠 예를 들면 마카로니나 도너츠같이 🦏 ", 
        "어디선가 읽었는데에 훌륭한 어른이 되려면 이별과 만남을 모두 겪어봐야 한대 ~ 🐣", 
        "아무것도 하지 않고 후회하는 것보단 해보고 후회하는 편이 홀가분하거든 🐱",
        "뭐든지 술술 잘 풀리는 인생은 애시당초 없는 기다 🦫", 
        "상처 받고 기죽더라도 해는 다시 뜰 거야 힘내 🐸",
        "리셋하고싶어구리 ? 🦡"],
    angry: ["인생에도 리셋 버튼이 있으면 을매나 좋겠노 ! ! 🦫",
        "의미가 있을 것 같지만 대부분은 의미가 없다 너무 깊이 생각하지 마 🤖",
        "지고 싶지 않다면 이길 때까지 계속 하면 된다 🦭", 
        "아무튼 눈에 띄는 모든 것이 맘에 안 들어 ! 🦩 ", 
        "비켜 ! 땡 ! 난 지금 누구의 얼굴도 보고 싶지 않아 ! 🐘",
        "자꾸 그카면 참말로 리셋해 🦫",
        "그리 ~ 말을 해도 못 알아듣겠드나 ~ ~ ! 🦫",
        "젠장 ... 내가 우나 봐라 ! 씨 ~ 🐘",
        "그래, 자유다, 니가 맞다 ! 내 졌다 ! 매번 화만 내고 말도 험하게 해서 죄송합니더 🦫"],
    tired: ["누군가가 나를 꼭 껴안아줬으면 좋겠다는 생각을 가끔 허기도 허지라 ... ⛄",
        "헤헷, 우렁찬 소리로 자주 외치면 근육도 자극되고 좋대 ! 🐊",
        "스스로 결단을 내리고, 인생을 개척해 왔기에 지금의 내가 있는 게 아니겠어 ? 그 결과가 어떻든 말이야... 🐸",
        "지금의 나는 마치 겨울에 놓고 간 분실물 같은 느낌이랑께요 ... ⛄",
        "일요일에도 일을 해야 하다니 이 마을 미친 거 아냐 ? (날 죽여 ~ !) 🦩",
        "사람은 시간의 속박에서 벗어나면 오히려 규칙을 찾아가는지도 모르지 그대도 만나보도록 해 ... 진정한 자신을 ! 🐸"],
    soso: ["사랑이란 이해할 수 없는 것을 이해하지 않은 채로 두는 일이다 🦭",
        "지금 이대로가 적당하지만 말이야아 ~ 🐱",
        "젖어서 감기 걸리지 않도록 조심하이소 🦔",
        "우산 든 소녀는 평소보다 두 배 예뻐보인다고 잡지에서 봤어 ! 🐱",
        "우선 이상과 현실을 정확히 구분하는 판단력을 키워 보세요 🐻",
        "그래 ~ ! 좋아, 나 결정했어 ~ 오늘 간식은 풀코스다아 ! 🐿️",
        "사랑스러운 천사의 등에는 맹수의 날개가 있다 🐸"],
    full: ["... 우씨 니가 그런 얘기를 하니까 갑자기 배고프잖아 ! 🐧",
        "블레스 유 ! 🐦‍⬛",
        "이대로 가다간 바다의 갈매기 ... 아니 바닷속 갈매기 ... 🦤",
        "여어 ! 변함없이 기운이 넘치네 ! 내참! 🐯",
        "... 자세히 보니 당신 돈을 전혀 안 갖고 계시잖습니까 ... 쳇 🦭",
        "뭐꼬 ? 니 내한테 볼일 있나 ? 🦫"]        
  };

  const randomMsg = messages[emotion][Math.floor(Math.random() * messages[emotion].length)];
  alert(randomMsg);
});