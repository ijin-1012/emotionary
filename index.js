// ====================
// Firebase 초기화
const firebaseConfig = {
  apiKey: "AIzaSyDXyG5MIkGzUzAQH7_3JdGtysIUUanZkfg",
  authDomain: "emotionary-7eb12.firebaseapp.com",
  projectId: "emotionary-7eb12",
  storageBucket: "emotionary-7eb12.appspot.com",
  messagingSenderId: "811615110413",
  appId: "1:811615110413:web:6bf3ffe8c9105081ac9c44"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// ====================
// DOM 요소
const loginScreen = document.getElementById("loginScreen");
const mainScreen = document.getElementById("mainScreen");
const loginBtn = document.getElementById("googleLoginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userName = document.getElementById("userName");
const userPhoto = document.getElementById("userPhoto");
const todayDateDiv = document.getElementById("todayDate");
const calendarGrid = document.getElementById("calendarGrid");
const calendarTitle = document.getElementById("calendarTitle");
const calendarSection = document.getElementById("calendarSection");
const writeScreen = document.getElementById("writeScreen");
const showHomeBtn = document.getElementById("showHomeBtn");
const showWriteBtn = document.getElementById("showWriteBtn");

// 모달 요소
const diaryModal = document.getElementById("diaryModal");
const modalDate = document.getElementById("modalDate");
const modalEmotion = document.getElementById("modalEmotion");
const modalWeather = document.getElementById("modalWeather");
const modalDiary = document.getElementById("modalDiary");
const modalImage = document.getElementById("modalImage");
const closeModalBtn = document.getElementById("closeModal");

// 감정/날씨 매핑
const emotionEmojiMap = { happy:'😊', sad:'😭', angry:'😡', tired:'😴' };
const weatherEmojiMap = { sunny:'☀️', cloudy:'☁️', rainy:'☔', snowy:'❄️', windy:'💨' };

// 감정별 응원 메시지
const emotionMessages = {
  happy: ["행복이란 만들어가는 거야! 🐸","작은 행복도 놓치지 말자! 🐹","오늘 하루도 즐겁게 보내자! 🐭"],
  sad: ["지금 힘들어도 괜찮아, 천천히 나아가자 🐴","슬플 때는 울어도 돼, 마음이 가벼워질 거야 🐱","조금만 힘내, 밝은 날이 올 거야 🐸"],
  angry: ["화가 날 땐 심호흡! 🦭","이 또한 지나갈 거야, 마음을 진정시키자 🐘","조금 쉬었다 가는 것도 좋아 🦫"],
  tired: ["오늘도 수고했어, 푹 쉬자 ⛄","조금 쉬어가도 돼, 내일을 위해 🐔","작은 휴식이 큰 힘이 돼 🌻"]
};

// ====================
// 전역 변수
let currentDate = new Date();
window.editingKey = null;

// ====================
// 날짜 key 포맷
function formatDateKey(date){
  const y = date.getFullYear();
  const m = String(date.getMonth()+1).padStart(2,'0');
  const d = String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}

// ====================
// 로그인/로그아웃
auth.onAuthStateChanged(user => {
  if(user) showMainScreen(user);
  else showLoginScreen();
});

loginBtn.addEventListener("click", ()=>{
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
      .then(res => showMainScreen(res.user))
      .catch(()=>alert("로그인 실패"));
});

logoutBtn.addEventListener("click", ()=>{
  auth.signOut().then(()=>{
    localStorage.clear();
    showLoginScreen();
  });
});

// ====================
// 화면 전환
function showLoginScreen(){
  loginScreen.style.display='flex';
  mainScreen.style.display='none';
}

function showMainScreen(user){
  loginScreen.style.display='none';
  mainScreen.style.display='block';
  userName.textContent = user.displayName;
  userPhoto.src = user.photoURL;
  userPhoto.style.display='inline-block';
  logoutBtn.style.display='inline-block';
  loginBtn.style.display='none';

  todayDateDiv.textContent = new Date().toLocaleDateString('ko-KR');
  renderCalendar();
}

// 내비게이션
showHomeBtn.addEventListener('click', ()=>{ showCalendar(); });
showWriteBtn.addEventListener('click', ()=>{ showWrite(); });

function showCalendar(){
  calendarSection.style.display='block';
  writeScreen.style.display='none';
  todayDateDiv.style.display='none';
  renderCalendar();
}

function showWrite(){
  calendarSection.style.display='none';
  writeScreen.style.display='block';
  todayDateDiv.style.display='block';
  clearWriteForm();
}

// ====================
// 작성 폼 초기화
function clearWriteForm(){
  document.getElementById('diary').value='';
  document.getElementById('emotion').value='happy';
  document.getElementById('weather').value='sunny';
  document.getElementById('photo').value='';
  window.editingKey=null;

  writeScreen.className = writeScreen.className
    .split(' ')
    .filter(cls=>!cls.endsWith('-theme'))
    .join(' ');
  writeScreen.classList.add('happy-theme');
}

// 감정 선택 시 테마 변경
document.getElementById('emotion').addEventListener('change', ()=>{
  const selected = document.getElementById('emotion').value;
  writeScreen.className = writeScreen.className
    .split(' ')
    .filter(cls=>!cls.endsWith('-theme'))
    .join(' ');
  writeScreen.classList.add(`${selected}-theme`);
});

// ========== 달력 렌더링 ========== //
function renderCalendar() {
  calendarGrid.innerHTML = ''; // 달력 초기화
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  calendarTitle.textContent = `${year}년 ${month + 1}월`;

  // 빈칸 채우기
  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.classList.add('calendar-cell');
    calendarGrid.appendChild(emptyCell);
  }

  for (let d = 1; d <= lastDate; d++) {
  const cell = document.createElement('div');
  cell.classList.add('calendar-cell');

  // 날짜 표시
  const dayDiv = document.createElement('div');
  dayDiv.classList.add('day');
  dayDiv.textContent = d;
  cell.appendChild(dayDiv);

  // 저장된 일기 가져오기
  const cellDate = new Date(year, month, d);
  const key = `diary-${formatDateKey(cellDate)}`;
  const stored = localStorage.getItem(key);

  if (stored) {
    const { emotion } = JSON.parse(stored);

    // 감정 표시 (이모지)
    const emotionDiv = document.createElement('div');
    emotionDiv.classList.add('emotion');
    emotionDiv.textContent = emotionEmojiMap[emotion];
    cell.appendChild(emotionDiv);

    // 테두리 강조 + 감정별 색상
    cell.classList.add('diary-border', emotion);
  }
// 클릭 시 모달 열기
cell.addEventListener('click', () => {
  const stored = localStorage.getItem(key); // 클릭할 때 다시 가져오기
  if(stored) {
    const entry = JSON.parse(stored);
    // 모달 열기
    openModal(entry.date, entry.emotion, entry.weather, entry.diary, entry.photo);
  } else {
    alert('저장된 일기가 없습니다 😱');
  }
});

  calendarGrid.appendChild(cell);
}
}
// 이전/다음 달 버튼
document.getElementById('prevMonthBtn').addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});
document.getElementById('nextMonthBtn').addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

// =========== 모달 ========= //
function openModal(date, emotion, weather, diary, photo){
  modalDate.textContent = `${date} ${weatherEmojiMap[weather] || ''}`;
  modalEmotion.textContent = emotionEmojiMap[emotion] || '';
  modalDiary.textContent = diary;

  if(photo){
    modalImage.src = photo;
    modalImage.style.display = 'block';
  } else {
    modalImage.style.display = 'none';
  }

  diaryModal.classList.remove('hidden'); // 모달 열기
}

closeModalBtn.addEventListener('click', () => {
  diaryModal.classList.add('hidden'); // 모달 닫기
});


// ====================  저장 버튼 =========== //
document.getElementById('saveBtn').addEventListener('click', ()=>{
  const diary = document.getElementById('diary').value.trim();
  if(!diary){ alert('내용을 작성해주세요!'); return; }

  const emotion = document.getElementById('emotion').value;
  const weather = document.getElementById('weather').value;
  const photoInput = document.getElementById('photo');

  const todayStr = formatDateKey(new Date());
  const key = `diary-${todayStr}`;

  const saveEntry = (photoDataUrl = null) => {
    const entry = { date: todayStr, emotion, weather, diary, photo: photoDataUrl };
    localStorage.setItem(key, JSON.stringify(entry));

    // 랜덤 응원 메시지
    const messages = emotionMessages[emotion] || ["오늘 하루도 수고했어요! 🤗"];
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    alert(randomMsg);

    clearWriteForm();
    renderCalendar();
  };

  if(photoInput.files.length > 0){
    const reader = new FileReader();
    reader.onload = (e) => saveEntry(e.target.result);
    reader.readAsDataURL(photoInput.files[0]);
  } else saveEntry(null);
});
