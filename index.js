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

// Firestore import 추가
import { getFirestore, collection, addDoc, Timestamp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js";

// === Firebase 설정 ===
const firebaseConfig = {
  apiKey: "AIzaSyDXyG5MIkGzUzAQH7_3JdGtysIUUanZkfg",
  authDomain: "emotionary-7eb12.firebaseapp.com",
  projectId: "emotionary-7eb12",
  storageBucket: "emotionary-7eb12.appspot.com",
  messagingSenderId: "811615110413",
  appId: "1:811615110413:web:6bf3ffe8c9105081ac9c44",
};

// == 초기화 ==
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

// 사진 업로드 함수
async function uploadPhoto(file) {
  if (!file) return "";
  const storageRef = ref(storage, `diaryPhotos/${auth.currentUser.uid}_${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return url;
}

// 일기 저장 함수
async function saveDiary(diaryText, emotion, weather, photoFile) {
  try {
    const photoUrl = await uploadPhoto(photoFile);

    const docRef = await addDoc(collection(db, "diaries"), {
      text: diaryText,
      emotion: emotion,
      weather: weather,
      photo: photoUrl,
      createdAt: Timestamp.now(),
      userId: auth.currentUser ? auth.currentUser.uid : null
    });

    console.log("일기 저장 성공:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("일기 저장 실패:", error);
  }
}

// save 버튼 클릭 이벤트
document.getElementById("saveBtn").addEventListener("click", async () => {
  const diaryText = document.getElementById("diary").value;
  const emotion = document.getElementById("emotion").value;
  const weather = document.getElementById("weather").value;
  const photoFile = document.getElementById("photo").files[0]; // 파일 가져오기

// === 일기 저장 및 랜덤 메시지 + 화면 전환 ===
saveBtn.addEventListener("click", async () => {
  const diaryText = diaryInput.value;
  const emotion = emotionSelect.value;
  const weather = weatherSelect.value;
  const photoFile = photoInput.files[0];

  // Firestore 저장
  await saveDiary(diaryText, emotion, weather, photoFile);

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

  const randomMessage = messages[emotion][Math.floor(Math.random() * messages[emotion].length)];
  alert(randomMessage);

  // 입력창 초기화
  diaryInput.value = "";
  photoInput.value = "";

  // 메인 화면으로 전환
  writeScreen.style.display = "none";
  calendarSection.style.display = "block";

  // 테마 초기화
  writeScreen.classList.remove("happy-theme","sad-theme","angry-theme","tired-theme");

  // 달력 새로 렌더링
  renderCalendar();
});

  
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


// DOM 로드 후 이벤트 연결
document.addEventListener("DOMContentLoaded", () => {
  const photoInput = document.getElementById("photo");
  const photoIcon = document.getElementById("photoIcon");

  // 아이콘 클릭 → 파일 선택창 열기
  photoIcon.addEventListener("click", () => {
    photoInput.click();
  });

  // 파일 선택 후 처리 (미리보기, 저장 등)
  photoInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return; // 파일 없으면 종료
    const reader = new FileReader();
    reader.onload = (event) => {
      console.log("선택된 이미지 URL:", event.target.result);
      // 여기서 diaryData에 저장하거나 미리보기 img src 적용 가능
    };
    reader.readAsDataURL(file);
  });
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
