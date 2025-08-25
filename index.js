// Firebase 관련 모듈 임포트
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

// Firebase 초기화
const firebaseConfig = {
  apiKey: "AIzaSyDXyG5MIkGzUzAQH7_3JdGtysIUUanZkfg", // Firebase 프로젝트의 apiKey
  authDomain: "emotionary-7eb12.firebaseapp.com", // 인증 도메인
  projectId: "emotionary-7eb12", // Firebase 프로젝트 ID
  storageBucket: "emotionary-7eb12.appspot.com", // 스토리지 버킷
  messagingSenderId: "811615110413", // 메시징 발신자 ID
  appId: "1:811615110413:web:6bf3ffe8c9105081ac9c44", // 앱 ID
};
const app = initializeApp(firebaseConfig); // Firebase 앱 초기화
const auth = getAuth(app); // 인증 객체 초기화
const provider = new GoogleAuthProvider(); // Google 로그인 제공자 초기화
const db = getFirestore(app); // Firestore 데이터베이스 초기화
const storage = getStorage(app); // Firebase Storage 초기화

// 상태 변수
let diaryData = {}; // 다이어리 데이터를 저장하는 객체 (날짜를 key로 하여 감정, 날씨, 텍스트, 사진 URL을 저장)

// DOM 요소들
const loginScreen = document.getElementById("loginScreen"); // 로그인 화면
const mainScreen = document.getElementById("mainScreen"); // 메인 화면
const googleLoginBtn = document.getElementById("googleLoginBtn"); // 구글 로그인 버튼
const logoutBtn = document.getElementById("logoutBtn"); // 로그아웃 버튼
const userPhoto = document.getElementById("userPhoto"); // 사용자 프로필 사진
const userName = document.getElementById("userName"); // 사용자 이름
const calendarSection = document.getElementById("calendarSection"); // 달력 섹션
const writeScreen = document.getElementById("writeScreen"); // 일기 작성 화면
const showHomeBtn = document.getElementById("showHomeBtn"); // 홈 버튼
const showWriteBtn = document.getElementById("showWriteBtn"); // 작성 화면 전환 버튼
const calendarGrid = document.getElementById("calendarGrid"); // 달력 그리드
const calendarTitle = document.getElementById("calendarTitle"); // 달력 제목
const prevMonthBtn = document.getElementById("prevMonthBtn"); // 이전 달 버튼
const nextMonthBtn = document.getElementById("nextMonthBtn"); // 다음 달 버튼
const emotionSelect = document.getElementById("emotion"); // 감정 선택 드롭다운
const weatherSelect = document.getElementById("weather"); // 날씨 선택 드롭다운
const diaryInput = document.getElementById("diary"); // 일기 입력 필드
const photoInput = document.getElementById("photo"); // 사진 입력 필드
const photoIcon = document.getElementById("photoIcon"); // 사진 아이콘
const saveBtn = document.getElementById("saveBtn"); // 저장 버튼
const modal = document.getElementById("diaryModal"); // 일기 모달
const closeModal = document.getElementById("closeModal"); // 모달 닫기 버튼
const modalDate = document.getElementById("modalDate"); // 모달 날짜
const modalEmotion = document.getElementById("modalEmotion"); // 모달 감정
const modalDiary = document.getElementById("modalDiary"); // 모달 다이어리 텍스트
const modalImage = document.getElementById("modalImage"); // 모달 이미지

// 세션 유지 설정
setPersistence(auth, browserLocalPersistence).catch(console.error); // 브라우저 로컬 세션에 인증 상태 유지

// 구글 로그인 처리
googleLoginBtn.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider); // Google 로그인 팝업
  } catch (err) {
    console.error("로그인 실패:", err); // 로그인 실패 시 에러 출력
  }
});

// 로그아웃 처리
logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth); // 로그아웃
  } catch (err) {
    console.error("로그아웃 실패:", err); // 로그아웃 실패 시 에러 출력
  }
});

// Firestore에 일기 저장 함수
async function uploadPhoto(file) {
  if (!file) return null; // 파일이 없으면 null 반환
  const storageRef = ref(storage, `diaryPhotos/${auth.currentUser.uid}_${Date.now()}_${file.name}`); // 사진 파일 경로 설정
  await uploadBytes(storageRef, file); // Firebase Storage에 업로드
  return await getDownloadURL(storageRef); // 업로드 후 다운로드 URL 반환
}

// 다이어리 저장 함수
async function saveDiary(diaryText, emotion, weather, photoFile) {
  const photoURL = photoFile ? await uploadPhoto(photoFile) : null; // 사진이 있으면 업로드하고 URL 반환
  const docRef = await addDoc(collection(db, "diaries"), { // Firestore에 새로운 다이어리 추가
    userId: auth.currentUser.uid,
    date: new Date().toISOString().split("T")[0], // 현재 날짜
    text: diaryText,
    emotion,
    weather,
    photoURL,
    createdAt: Timestamp.now() // 생성 시간
  });
  console.log("일기 저장 ID:", docRef.id); // 저장된 일기의 ID 출력
  return { photoURL };
}

// Firestore에서 다이어리 데이터 로드 함수
async function loadDiaries() {
  const q = query(collection(db, "diaries"), where("userId", "==", auth.currentUser.uid)); // 사용자의 다이어리만 가져오기
  const snapshot = await getDocs(q); // 다이어리 문서 가져오기
  const diaries = {}; // 다이어리 데이터를 저장할 객체
  snapshot.forEach(doc => {
    const data = doc.data();
    diaries[data.date] = { text: data.text, emotion: data.emotion, weather: data.weather, photoURL: data.photoURL }; // 날짜별로 데이터 저장
  });
  return diaries; // 다이어리 데이터 반환
}

// 로그인 상태 변경 감지
onAuthStateChanged(auth, async (user) => {
  if (user) {
    loginScreen.style.display = "none"; // 로그인 화면 숨기기
    mainScreen.style.display = "block"; // 메인 화면 보이기
    userName.textContent = user.displayName; // 사용자 이름 표시
    userPhoto.src = user.photoURL; // 사용자 프로필 사진 표시
    userPhoto.style.display = "inline"; // 사진 표시
    logoutBtn.style.display = "inline"; // 로그아웃 버튼 보이기
    calendarSection.style.display = "block"; // 달력 섹션 보이기
    writeScreen.style.display = "none"; // 일기 작성 화면 숨기기

    diaryData = await loadDiaries(); // 다이어리 데이터 로드
    renderCalendar(); // 달력 렌더링
  } else {
    loginScreen.style.display = "flex"; // 로그인 화면 보이기
    mainScreen.style.display = "none"; // 메인 화면 숨기기
  }
});

// 화면 전환: 일기 작성 화면 보이기
showWriteBtn.addEventListener("click", () => {
  calendarSection.style.display = "none"; // 달력 섹션 숨기기
  writeScreen.style.display = "flex"; // 일기 작성 화면 보이기
});

// 화면 전환: 달력 화면 보이기
showHomeBtn.addEventListener("click", () => {
  writeScreen.style.display = "none"; // 일기 작성 화면 숨기기
  calendarSection.style.display = "block"; // 달력 화면 보이기
});

// 사진 선택 처리
photoIcon.addEventListener("click", () => photoInput.click()); // 사진 아이콘 클릭 시 파일 선택창 열기
photoInput.addEventListener("change", e => {
  if (e.target.files[0]) console.log("선택된 이미지:", e.target.files[0].name); // 선택된 이미지 파일 출력
});

// 모달 닫기
closeModal.addEventListener("click", () => modal.style.display = "none"); // 모달 닫기 버튼 클릭 시 모달 숨기기
modal.addEventListener("click", e => {
  if (e.target === modal) modal.style.display = "none"; // 모달 외부 클릭 시 모달 숨기기
});

// 달력 렌더링 함수
let currentDate = new Date(); // 현재 날짜
function renderCalendar() {
  const year = currentDate.getFullYear(); // 현재 연도
  const month = currentDate.getMonth(); // 현재 월
  const firstDay = new Date(year, month, 1).getDay(); // 해당 월의 첫 번째 날
  const lastDate = new Date(year, month + 1, 0).getDate(); // 해당 월의 마지막 날짜
  calendarTitle.textContent = `${year}년 ${month + 1}월`; // 달력 제목 설정
  calendarGrid.innerHTML = ""; // 달력 그리드 초기화

  const emotionColor = {
    happy: "#ffe066",
    sad: "#74c0fc",
    angry: "#ff6b6b",
    tired: "#c9a0dc",
    soso: "#a0dcb2ff"
  };

  // 빈 칸 채우기
  for (let i = 0; i < firstDay; i++) calendarGrid.innerHTML += "<div></div>"; // 첫 번째 날 전까지 빈 칸 채우기
  
  // 날짜 그리기
  for (let d = 1; d <= lastDate; d++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`; // 날짜 키 생성
    const cell = document.createElement("div"); // 날짜 셀 생성
    cell.className = "calendar-cell";
    cell.dataset.date = dateKey; // 날짜 데이터 설정
    cell.textContent = d;

    // 다이어리가 있는 날짜에 감정 표시
    if (diaryData[dateKey]) {
      const emotion = diaryData[dateKey].emotion;
      const color = emotionColor[emotion] || "#fff"; // 감정에 따른 색상 설정
      cell.style.border = `2px solid ${color}`; // 경계선 색상 설정
      cell.style.boxShadow = `0 0 8px ${color}`; // 그림자 효과 설정
      cell.style.transition = "0.3s"; // 부드러운 트랜지션 설정
    
      // 감정 이모지 추가
      const emotionEmoji = getEmotionEmoji(emotion);
      cell.innerHTML = `${d}<br>${emotionEmoji}`; // 날짜와 감정 이모지 표시
    }

    // 클릭 시 모달 띄우기
    cell.addEventListener("click", () => {
      const data = diaryData[dateKey];
      if (!data) {
        alert("이 날은 일기 안 썼어 . . 🥹"); // 일기가 없는 날 클릭 시 알림
        return;
      }
// 요일을 반환하는 함수
function getDayOfWeek(dateString) {
  const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];
  const date = new Date(dateString);
  return daysOfWeek[date.getDay()];
}

// 모달에 내용 채우기
modalDate.textContent = dateKey; // 날짜 표시

// 요일 계산 및 표시
const modalDayElement = document.getElementById('modalDay'); // 요일을 표시할 요소
modalDayElement.textContent = getDayOfWeek(dateKey); // 요일 표시

// 날씨 이모지를 별도의 요소에 표시
const weatherEmojiElement = document.getElementById('weatherEmoji'); // 날씨 이모지 표시할 요소
weatherEmojiElement.innerHTML = getWeatherEmoji(data.weather); // 날씨 이모지 표시

// 감정 이모지를 별도의 요소에 표시
const emotionEmojiElement = document.getElementById('emotionEmoji'); // 감정 이모지 표시할 요소
emotionEmojiElement.innerHTML = getEmotionEmoji(data.emotion); // 감정 이모지 표시

modalDiary.textContent = data.text; // 일기 텍스트 표시

if (data.photoURL) {
  modalImage.src = data.photoURL; // 사진 표시
  modalImage.style.display = "block";
} else {
  modalImage.style.display = "none"; // 사진이 없으면 숨기기
}

modal.style.display = "flex"; // 모달 표시
});

calendarGrid.appendChild(cell); // 달력 그리드에 날짜 셀 추가
  }
}

// 감정 이모지 함수
function getEmotionEmoji(emotion) {
  const emojis = {
    happy: "😊", // 행복
    sad: "😭", // 슬픔
    angry: "😡", // 화남
    tired: "😴", // 피곤
    soso: "😌" // 그냥
  };
  return emojis[emotion] || "🙂"; // 감정 이모지가 없으면 기본 이모지 반환
}

// 날씨 이모지 함수
function getWeatherEmoji(weather) {
  const emojis = {
    sunny: "☀️", // 맑음
    cloudy: "☁️", // 흐림
    rainy: "☔", // 비
    snowy: "❄️", // 눈
    windy: "💨" // 바람
  };
  return emojis[weather] || "🌤️"; // 날씨 이모지가 없으면 기본 날씨 이모지 반환
}

// 이전/다음 월 버튼 처리
prevMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1); // 이전 월로 이동
  renderCalendar(); // 달력 렌더링
});

nextMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1); // 다음 월로 이동
  renderCalendar(); // 달력 렌더링
});

// 일기 저장 처리
saveBtn.addEventListener("click", async () => {
  const diaryText = diaryInput.value; // 일기 텍스트 가져오기
  const emotion = emotionSelect.value; // 선택된 감정 가져오기
  const weather = weatherSelect.value; // 선택된 날씨 가져오기
  const photoFile = photoInput.files[0]; // 선택된 사진 파일 가져오기
  const { photoURL } = await saveDiary(diaryText, emotion, weather, photoFile); // 일기 저장

  const dateKey = new Date().toISOString().split("T")[0]; // 오늘 날짜를 키로 사용
  diaryData[dateKey] = { emotion, weather, text: diaryText, photoURL }; // diaryData 객체에 저장

  diaryInput.value = ""; // 일기 입력 필드 초기화
  photoInput.value = ""; // 사진 입력 필드 초기화
  writeScreen.style.display = "none"; // 일기 작성 화면 숨기기
  calendarSection.style.display = "block"; // 달력 화면 보이기
  renderCalendar(); // 달력 다시 렌더링

  // 감정별 랜덤 메시지 표시
  const messages = {
    happy: [
      "행복이란 만들어지는 게 아니라, 만들어 가는 거라구 ! 🐸", 
      "오늘은 어떤 하루가 될까 ? 특별한 일은 없어도 작은 행복을 느끼는 날이 되면 좋겠어 , 그렇다고 ! 🐹",
      "앞으로 살아가다가 힘들 때 이 풍경을 떠올리면 용기가 날 것 같거든 🐭", 
      "행복, 쟁취하지 말고 받자 2 1 세기 평화주의 🤖", 
      "과일을 먹으면 너가 생각나 아삭아삭 맛있게 먹던 그 소리 🍏", 
      "청춘은 참 좋구나 ~ 나도 섞이고 싶어 🐘", 
      "그러다 어느 날 알게 된 거야 ! 일부러 그렇게 하지 않아도 난 살 가치가 있다는 걸 🦜"],
    sad: [
      "다들 각자의 스타일이 있는 법이지 ! 그러니까 너도 니 방식대로 지내면 돼 ! 그게 제일이야 ! 🐴",
      "속이 비어 있는 것이 더 좋을 때도 있죠 예를 들면 마카로니나 도너츠같이 🦏 ", 
      "어디선가 읽었는데에 훌륭한 어른이 되려면 이별과 만남을 모두 겪어봐야 한대 ~ 🐣", 
      "아무것도 하지 않고 후회하는 것보단 해보고 후회하는 편이 홀가분하거든 🐱",
      "뭐든지 술술 잘 풀리는 인생은 애시당초 없는 기다 🦫", 
      "상처 받고 기죽더라도 해는 다시 뜰 거야 힘내 🐸"],
    angry: [
      "인생에도 리셋 버튼이 있으면 을매나 좋겠노 ! ! 🦫",
      "의미가 있을 것 같지만 대부분은 의미가 없다 너무 깊이 생각하지 마 🤖",
      "지고 싶지 않다면 이길 때까지 계속 하면 된다 🦭", 
      "아무튼 눈에 띄는 모든 것이 맘에 안 들어 ! 🦩 ", 
      "비켜 ! 땡 ! 난 지금 누구의 얼굴도 보고 싶지 않아 ! 🐘",
      "자꾸 그카면 참말로 리셋해 🦫"],
    tired: [
      "누군가가 나를 꼭 껴안아줬으면 좋겠다는 생각을 가끔 허기도 허지라 ... ⛄",
      "헤헷, 우렁찬 소리로 자주 외치면 근육도 자극되고 좋대 ! 🐊",
      "스스로 결단을 내리고, 인생을 개척해 왔기에 지금의 내가 있는 게 아니겠어 ? 그 결과가 어떻든 말이야... 🐸",
      "지금의 나는 마치 겨울에 놓고 간 분실물 같은 느낌이랑께요 ... ⛄",
      "이대로 가다간 바다의 갈매기 ... 아니 바닷속 갈매기 ... 🦤"],
    soso: [
      "사랑이란 이해할 수 없는 것을 이해하지 않은 채로 두는 일이다 🦭",
      "지금 이대로가 적당하지만 말이야아 ~ 🐱",
      "젖어서 감기 걸리지 않도록 조심하이소 🦔",
      "우산 든 소녀는 평소보다 두 배 예뻐보인다고 잡지에서 봤어 ! 🐱",
      "우선 이상과 현실을 정확히 구분하는 판단력을 키워 보세요 🐻",
      "그래 ~ ! 좋아, 나 결정했어 ~ 오늘 간식은 풀코스다아 ! 🐿️"]    
  };

  // 감정별 랜덤 메시지 중 하나를 선택해서 알림 표시
  const randomMsg = messages[emotion][Math.floor(Math.random() * messages[emotion].length)];
  alert(randomMsg); // 선택된 메시지 표시
});
