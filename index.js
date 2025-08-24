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
const storage = getStorage(app);

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
const photoInput = document.getElementById("photo");
const photoIcon = document.getElementById("photoIcon");
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
  try { await signOut(auth); } catch(err){ console.error("로그아웃 실패:", err); }
});

// === Firestore 일기 저장 ===
async function uploadPhoto(file){
  if(!file) return null;
  const storageRef = ref(storage, `diaryPhotos/${auth.currentUser.uid}_${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

async function saveDiary(diaryText, emotion, weather, photoFile){
  const photoURL = photoFile ? await uploadPhoto(photoFile) : null;
  const docRef = await addDoc(collection(db,"diaries"),{
    userId: auth.currentUser.uid,
    date: new Date().toISOString().split("T")[0],
    text: diaryText,
    emotion,
    weather,
    photoURL,
    createdAt: Timestamp.now()
  });
  console.log("일기 저장 ID:", docRef.id);
  return { photoURL };
}

async function loadDiaries(){
  const q = query(collection(db,"diaries"), where("userId","==",auth.currentUser.uid));
  const snapshot = await getDocs(q);
  const diaries = {};
  snapshot.forEach(doc=>{
    const data = doc.data();
    diaries[data.date] = { text: data.text, emotion: data.emotion, weather: data.weather, photoURL: data.photoURL };
  });
  return diaries;
}

// === 로그인 상태 감지 ===
onAuthStateChanged(auth, async (user) => {
  if(user){
    loginScreen.style.display="none";
    mainScreen.style.display="block";
    userName.textContent=user.displayName;
    userPhoto.src=user.photoURL;
    userPhoto.style.display="inline";
    logoutBtn.style.display="inline";
    calendarSection.style.display="block";
    writeScreen.style.display="none";

    diaryData = await loadDiaries();
    renderCalendar();
  }else{
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

// === 사진 선택 ===
photoIcon.addEventListener("click",() => photoInput.click());
photoInput.addEventListener("change", e => { 
  if(e.target.files[0]) console.log("선택된 이미지:", e.target.files[0].name); 
});

// === 모달 닫기 ===
closeModal.addEventListener("click", () => modal.style.display="none");
modal.addEventListener("click", e => { 
  if(e.target === modal) modal.style.display="none"; 
});

// === 달력 렌더링 ===
let currentDate = new Date();
function renderCalendar(){
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  calendarTitle.textContent = `${year}년 ${month + 1}월`;
  calendarGrid.innerHTML = "";

  const emotionColor = { 
    happy: "#ffe066", 
    sad: "#74c0fc", 
    angry: "#ff6b6b", 
    tired: "#c9a0dc" 
  };

  // 빈 칸 채우기
  for(let i = 0; i < firstDay; i++) calendarGrid.innerHTML += "<div></div>";
  
  for(let d = 1; d <= lastDate; d++){
    const dateKey = `${year}-${String(month + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
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
        alert("아무것도 기록하지 않았습니다 !! 😱");
        return;
      }

  // 모달에 내용 채우기
      modalDate.textContent = dateKey;
      modalEmotion.innerHTML = `${getWeatherEmoji(data.weather)} ${getEmotionEmoji(data.emotion)}`;
      modalDiary.textContent = data.text;
      if (data.photoURL) {
        modalImage.src = data.photoURL;
        modalImage.style.display = "block";
      } else {
        modalImage.style.display = "none";
      }
      modal.style.display = "flex";
    });

    calendarGrid.appendChild(cell);
  }
}
// === 감정 이모지 함수 ===
function getEmotionEmoji(emotion) {
  const emojis = {
    happy: "😊",
    sad: "😭",
    angry: "😡",
    tired: "😴"
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
    windy: "💨"
  };
  return emojis[weather] || "🌤️";
}

// === 이전/다음 월 버튼 ===
prevMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

nextMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

// === 일기 저장 ===
saveBtn.addEventListener("click", async () => {
  const diaryText = diaryInput.value;
  const emotion = emotionSelect.value;
  const weather = weatherSelect.value;
  const photoFile = photoInput.files[0];
  const { photoURL } = await saveDiary(diaryText, emotion, weather, photoFile);

  const dateKey = new Date().toISOString().split("T")[0];
  diaryData[dateKey] = { emotion, weather, text: diaryText, photoURL };

  diaryInput.value = "";
  photoInput.value = "";
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
        "상처 받고 기죽더라도 해는 다시 뜰 거야 힘내 🐸"],
    angry: ["인생에도 리셋 버튼이 있으면 을매나 좋겠노 ! ! 🦫",
        "의미가 있을 것 같지만 대부분은 의미가 없다 너무 깊이 생각하지 마 🤖",
        "지고 싶지 않다면 이길 때까지 계속 하면 된다 🦭", 
        "아무튼 눈에 띄는 모든 것이 맘에 안 들어 ! 🦩 ", 
        "비켜 ! 땡 ! 난 지금 누구의 얼굴도 보고 싶지 않아 ! 🐘"],
    tired: ["누군가가 나를 꼭 껴안아줬으면 좋겠다는 생각을 가끔 허기도 허지라 ... ⛄",
        "스스로 결단을 내리고, 인생을 개척해 왔기에 지금의 내가 있는 게 아니겠어 ? 그 결과가 어떻든 말이야... 🐸",
        "지금의 나는 마치 겨울에 놓고 간 분실물 같은 느낌이랑께요 ... ⛄"]
  };
  const randomMsg = messages[emotion][Math.floor(Math.random() * messages[emotion].length)];
  alert(randomMsg);
});