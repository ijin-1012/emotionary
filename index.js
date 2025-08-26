// Firebase 관련 라이브러리 불러오기
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getAuth, 
  signInWithRedirect, 
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  getRedirectResult, 
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
import { deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// === Firebase 설정 정보 ===
const firebaseConfig = {
  apiKey: "AIzaSyDXyG5MIkGzUzAQH7_3JdGtysIUUanZkfg",
  authDomain: "emotionary-7eb12.firebaseapp.com",
  projectId: "emotionary-7eb12",
  storageBucket: "emotionary-7eb12.appspot.com",
  messagingSenderId: "811615110413",
  appId: "1:811615110413:web:6bf3ffe8c9105081ac9c44",
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// === 상태 ===
let diaryData = {}; 
// { "YYYY-MM-DD": { emotion, weather, text } }

// === DOM 요소 참조 ===
const loginScreen = document.getElementById("loginScreen"); // 로그인 화면
const mainScreen = document.getElementById("mainScreen"); // 메인 화면 
const googleLoginBtn = document.getElementById("googleLoginBtn"); // 구글 로그인 버튼
const logoutBtn = document.getElementById("logoutBtn"); // 로그아웃 버튼
const userPhoto = document.getElementById("userPhoto"); // 사용자 프로필 사진
const userName = document.getElementById("userName"); // 사용자 이름
const calendarSection = document.getElementById("calendarSection"); // 달력 화면
const writeScreen = document.getElementById("writeScreen"); // 일기 작성 화면
const showHomeBtn = document.getElementById("showHomeBtn"); // 달력 보기 버튼
const showWriteBtn = document.getElementById("showWriteBtn"); // 일기 작성 화면 보기 버튼
const calendarGrid = document.getElementById("calendarGrid"); // 달력 날짜 그리드
const calendarTitle = document.getElementById("calendarTitle"); // 달력 제목 (month)
const prevMonthBtn = document.getElementById("prevMonthBtn"); // 이전 달 버튼
const nextMonthBtn = document.getElementById("nextMonthBtn"); // 다음 달 버튼
const emotionSelect = document.getElementById("emotion"); // 감정 선택 드롭다운
const weatherSelect = document.getElementById("weather"); // 날씨 선택 드롭다운
const diaryInput = document.getElementById("diary"); // 일기 작성 텍스트 영역
const saveBtn = document.getElementById("saveBtn"); // 저장 버튼
const modal = document.getElementById("diaryModal"); // 일기 모달
const closeModal = document.getElementById("closeModal"); // 모달 닫기 버튼
const modalDate = document.getElementById("modalDate"); // 모달 날짜
const modalEmotion = document.getElementById("modalEmotion"); // 모달 감정
const modalDiary = document.getElementById("modalDiary"); // 모달 일기 내용
const modalImage = document.getElementById("modalImage"); // 모달 이미지

// Firebase 인증의 로컬 세션을 브라우저에서 지속되도록 설정 (로그아웃하지 않으면 유지됨)
setPersistence(auth, browserLocalPersistence).catch(console.error);

// 로그인 후 리디렉션 결과 확인
getRedirectResult(auth).then((result) => {
  if (result) {
    const user = result.user;
    console.log("로그인 성공:", user);
  } else {
    console.log("로그인되지 않은 상태");
  }
}).catch((error) => {
  console.error("로그인 실패:", error);
});

// Google 로그인 버튼 클릭 이벤트 리스너
googleLoginBtn.addEventListener("click", async () => {
  try {
    await signInWithRedirect(auth, provider);
  } catch (err) {
    console.error("로그인 실패:", err);
  }
});

// 로그아웃 버튼 클릭 이벤트 리스너
logoutBtn.addEventListener("click", async () => {
  try { 
    await signOut(auth); 
  } catch(err){ 
    console.error("로그아웃 실패:", err); 
  }
});


// Firestore에 일기 저장 함수
async function saveDiary(diaryText, emotion, weather) {
  // Firestore에 데이터 저장
  const docRef = await addDoc(collection(db, "diaries"), {
    userId: auth.currentUser.uid, // 사용자 ID
    date: new Date().toISOString().split("T")[0], // 날짜 (YYYY-MM-DD 형식)
    text: diaryText, // 일기 텍스트
    emotion, // 감정
    weather, // 날씨
    createdAt: Timestamp.now() // 문서 생성 시간
  });
  console.log("일기 저장 ID:", docRef.id); // 저장된 문서의 ID를 로그로 출력
}

// Firestore에서 일기 로드 함수
async function loadDiaries(){
  // 현재 사용자의 일기들만 쿼리
  const q = query(collection(db,"diaries"), where("userId","==",auth.currentUser.uid));
  const snapshot = await getDocs(q);
  const diaries = {}; // 날짜를 키로 저장된 일기 데이터

  // 일기 데이터 순회하여 객체에 저장
  snapshot.forEach(doc => {
    const data = doc.data();
    diaries[data.date] = { text: data.text, emotion: data.emotion, weather: data.weather };
  });
  return diaries;
}

// === 로그인 상태 감지 ===
onAuthStateChanged(auth, async (user) => {
  if(user){
    console.log("로그인 성공:", user);

    // 로그인된 사용자가 있을 경우
    loginScreen.style.display="none"; // 로그인 화면 숨기기
    mainScreen.style.display="block"; // 메인 화면 보이기
    userName.textContent=user.displayName; // 사용자 이름 표시
    userPhoto.src=user.photoURL; // 사용사 사진 표시
    userPhoto.style.display="inline"; // 사진 보이기
    logoutBtn.style.display="inline"; // 로그아웃 버튼 보이기
    calendarSection.style.display="block"; // 달력 섹션 보이기
    writeScreen.style.display="none"; // 일기 작성 화면 숨기기
 
    // 일기 데이터 로드 후 달력 렌더링
    diaryData = await loadDiaries();
    renderCalendar();
  } else { 
    console.log("로그인되지 않은 상태");
    
    //로그인하지 않은 경우
    loginScreen.style.display="flex"; // 로그인 화면 보이기
    mainScreen.style.display="none"; // 메인 화면 숨기기
  }
});

// 로그인 후 리디렉션 결과 확인
getRedirectResult(auth).then((result) => {
  if (result) {
    const user = result.user;
    console.log("로그인 성공:", user);
    // 로그인 후 사용자 정보 처리
    // 로그인된 사용자 정보를 UI에 반영할 수 있습니다.
  } else {
    console.log("로그인되지 않은 상태");
  }
}).catch((error) => {
  console.error("로그인 실패:", error);
});

// === 화면 전환 ===
// '기록하기' 버튼 클릭 시 작성 화면 보이기
showWriteBtn.addEventListener("click",() => { 
  calendarSection.style.display="none"; 
  writeScreen.style.display="flex"; 
});
// '달력' 버튼 클릭 시 달력 화면 보이기
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
  const editButton = document.getElementById('editButton');
  const deleteButton = document.getElementById('deleteButton');

  modalDate.textContent = data.date; // 날짜 표시
  modalDayElement.textContent = getDayOfWeek(data.date); // 요일 표시
  weatherEmojiElement.innerHTML = getWeatherEmoji(data.weather); // 날씨 이모지 표시
  emotionEmojiElement.innerHTML = getEmotionEmoji(data.emotion); // 감정 이모지 표시
  modalDiary.textContent = data.text; // 일기 텍스트 표시

  // 삭제 버튼에 diaryId 설정 (삭제 버튼에 data-id 속성으로 일기 ID 저장)
  deleteButton.setAttribute('data-id', data.id);

  // 수정 버튼 클릭 시 수정 화면 열기
  editButton.addEventListener("click", () => {
    console.log("수정 버튼이 클릭되었습니다.");
    openEditScreen(data); // 수정 화면 열기
  });

  // 삭제 버튼 클릭 시 일기 삭제
  deleteButton.addEventListener("click", () => {
    const diaryId = deleteButton.getAttribute('data-id');
    if (diaryId) {
      deleteDiary(diaryId); // 삭제 작업 수행
    }
  });

  // 모달 표시
  modal.style.display = "flex"; 
  console.log("모달이 열렸습니다."); // 모달 열림 확인 로그

  // === 모달 닫기 ===
  const closeModal = document.getElementById('closeModal');
  closeModal.addEventListener("click", () => {
    modal.style.display = "none"; // 모달 닫기 
    console.log("모달이 닫혔습니다."); // 모달 닫힘 확인 로그
  });

  // 모달 외부 클릭 시 닫기
  modal.addEventListener("click", e => { 
    if (e.target === modal) {
      modal.style.display = "none"; 
      console.log("모달이 외부 클릭으로 닫혔습니다."); // 외부 클릭 시 모달 닫힘 확인
    }
  });
}

// === 일기 삭제 함수 ===
async function deleteDiary(diaryId) {
  const diaryRef = doc(db, "diaries", diaryId);

  try {
    await deleteDoc(diaryRef);
    console.log("일기가 삭제되었습니다.");

    // 모달 닫기
    document.getElementById('diaryModal').style.display = "none";

    // Firestore에서 데이터를 불러와 diaryData 업데이트
    diaryData = await loadDiaries();

    // 화면 초기화 및 달력 렌더링
    renderCalendar();

  } catch (error) {
    console.error("삭제 중 오류 발생: ", error);
  }
}

// === 수정 화면 열기 함수 ===
function openEditScreen(data) {
  const editScreen = document.getElementById('editScreen');
  const editDiaryText = document.getElementById('editDiaryText');
  
  // 수정할 일기 내용을 입력 필드에 설정
  editDiaryText.value = data.text;
  
  // 수정 화면 표시
  editScreen.style.display = 'block';  // 수정 화면 열기
}

// 수정 취소 버튼 클릭 시
document.getElementById('cancelEditBtn').addEventListener('click', () => {
  document.getElementById('editScreen').style.display = 'none'; // 수정 화면 닫기
});

// === 초기화 ===
let currentDate = new Date(); // 현재 날짜 초기화

// === 달력 렌더링 ===
function renderCalendar() {
  const year = currentDate.getFullYear(); // 현재 연도
  const month = currentDate.getMonth(); // 현재 월
  const firstDay = new Date(year, month, 1).getDay(); // 첫날의 요일
  const lastDate = new Date(year, month + 1, 0).getDate(); // 해당 월의 마지막 날
  const calendarTitle = document.getElementById('calendarTitle');
  const calendarGrid = document.getElementById('calendarGrid');
  calendarTitle.textContent = `${year}년 ${month + 1}월`; // 달력 제목에 연도와 월 표시
  calendarGrid.innerHTML = ""; // 기존 달력 그리드 내용 비우기

  const emotionColor = { // 각 감정에 맞는 색상 설정 
    happy: "#ffe066",  
    sad: "#74c0fc", 
    angry: "#ff6b6b", 
    tired: "#c9a0dc", 
    soso: "#a0dcb2ff"
  };

  // 빈 칸 채우기
  for (let i = 0; i < firstDay; i++) calendarGrid.innerHTML += "<div></div>";
  
  // 각 날짜별 셀 추가
  for (let d = 1; d <= lastDate; d++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const cell = document.createElement("div");
    cell.className = "calendar-cell";
    cell.dataset.date = dateKey; // 날짜 데이터 저장
    cell.textContent = d; // 날짜 표시

    // 해당 날짜에 일기가 있으면 감정 이모지와 색상 추가
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
      const data = diaryData[dateKey]; // 해당 날짜의 일기 데이터
      if (!data) {
        alert("이 날은 일기 안 썼어 . . 🥹"); // 일기 미작성 시 알림
        return;
      }
      console.log("모달을 여는 데이터:", data); // 데이터 확인을 위한 로그 추가
      openModal({
        date: dateKey,
        text: data.text,
        emotion: data.emotion,
        weather: data.weather,
        id: data.id // 일기 ID도 함께 전달
      });
    });

    calendarGrid.appendChild(cell);
  }
}

// === 감정 이모지 함수 ===
// 감정 값에 맞는 이모지를 반환
function getEmotionEmoji(emotion) {
  const emojis = {
    happy: "😊",
    sad: "😭",
    angry: "😡",
    tired: "😴",
    soso: "😌"
  };
  return emojis[emotion] || "🙂"; // 기본값은 '🙂'
}
// === 요일을 반환하는 함수 ===
// 주어진 날짜에 해당하는 요일을 반환
function getDayOfWeek(dateString) {
  const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];
  const date = new Date(dateString);
  return daysOfWeek[date.getDay()]; // 해당 날짜의 요일 반환
}

// === 날씨 이모지 함수 ===
// 날씨 값에 맞는 이모지를 반환
function getWeatherEmoji(weather) {
  const emojis = {
    sunny: "☀️",
    cloudy: "☁️",
    rainy: "☔",
    snowy: "❄️",
    windy: "💨"
  };
  return emojis[weather] || "🌤️"; // 기본값은 '🌤️'
}

// DOM이 완전히 로드된 후에 코드 실행
document.addEventListener('DOMContentLoaded', () => {
  renderCalendar();
});


// === 이전/다음 월 버튼 ===
// 이전 월로 이동
prevMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

// 다음 월로 이동
nextMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

// 일기 저장 이벤트 리스너
saveBtn.addEventListener("click", async () => {
  const diaryText = diaryInput.value; // 일기 내용
  const emotion = emotionSelect.value; // 선택된 감정
  const weather = weatherSelect.value; // 선택된 날씨

  // 일기 데이터를 Firestore에 저장
  await saveDiary(diaryText, emotion, weather);

  // Firestore에서 데이터를 불러와 diaryData 업데이트
  diaryData = await loadDiaries();

  // 화면 초기화 및 달력 렌더링
  diaryInput.value = ""; // 텍스트 영역 비우기
  writeScreen.style.display = "none"; // 일기 작성 화면 숨기기
  calendarSection.style.display = "block"; // 달력 화면 보이기
  renderCalendar(); // 달력 재렌더링


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
        "비켜 ! 땡 ! 난 지금 누구의 얼굴도 보고 싶지 않아 ! 🐘",
        "자꾸 그카면 참말로 리셋해 🦫"],
    tired: ["누군가가 나를 꼭 껴안아줬으면 좋겠다는 생각을 가끔 허기도 허지라 ... ⛄",
        "헤헷, 우렁찬 소리로 자주 외치면 근육도 자극되고 좋대 ! 🐊",
        "스스로 결단을 내리고, 인생을 개척해 왔기에 지금의 내가 있는 게 아니겠어 ? 그 결과가 어떻든 말이야... 🐸",
        "지금의 나는 마치 겨울에 놓고 간 분실물 같은 느낌이랑께요 ... ⛄",
        "이대로 가다간 바다의 갈매기 ... 아니 바닷속 갈매기 ... 🦤"],
        soso: ["사랑이란 이해할 수 없는 것을 이해하지 않은 채로 두는 일이다 🦭",
        "지금 이대로가 적당하지만 말이야아 ~ 🐱",
        "젖어서 감기 걸리지 않도록 조심하이소 🦔",
        "우산 든 소녀는 평소보다 두 배 예뻐보인다고 잡지에서 봤어 ! 🐱",
        "우선 이상과 현실을 정확히 구분하는 판단력을 키워 보세요 🐻",
        "그래 ~ ! 좋아, 나 결정했어 ~ 오늘 간식은 풀코스다아 ! 🐿️"]    
  };

  // 랜덤 메시지를 선택하여 알림창에 표시하는 코드
  const randomMsg = messages[emotion][Math.floor(Math.random() * messages[emotion].length)];
  // 'messages' 객체에서 감정에 해당하는 배열을 가져오고, 그 배열에서 랜덤으로 하나의 메시지를 선택
  alert(randomMsg); // 선택된 메시지를 알림창에 표시 
});
