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

// DOM 요소
const loginScreen = document.getElementById("loginScreen");
const mainScreen = document.getElementById("mainScreen");
const loginBtn = document.getElementById("googleLoginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userName = document.getElementById("userName");
const userPhoto = document.getElementById("userPhoto");
const todayDateDiv = document.getElementById("todayDate");

// 감정/날씨 지도
const emotionEmojiMap = { happy:'😊', sad:'😭', angry:'😡', tired:'😴' };
const weatherEmojiMap = { sunny:'☀️', cloudy:'☁️', rainy:'☔', snowy:'❄️', windy:'💨' };

// 로그인 상태 확인
auth.onAuthStateChanged((user) => {
  if (user) showMainScreen(user);
  else showLoginScreen();
});

// 로그인
loginBtn.addEventListener("click", () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(res => showMainScreen(res.user))
    .catch(err => alert("로그인 실패"));
});

// 로그아웃
logoutBtn.addEventListener("click", () => {
  auth.signOut().then(() => {
    localStorage.clear();
    showLoginScreen();
  });
});

// 화면 전환 함수
function showMainScreen(user) {
  loginScreen.style.display = "none";
  mainScreen.style.display = "block";
  userName.textContent = user.displayName;
  userPhoto.src = user.photoURL;
  userPhoto.style.display = "inline-block";
  logoutBtn.style.display = "inline-block";
  loginBtn.style.display = "none";

  todayDateDiv.textContent = new Date().toLocaleDateString('ko-KR');

  renderCalendar();
}

// 화면 전환 버튼
const calendarSection = document.getElementById('calendarSection');
const writeScreen = document.getElementById('writeScreen');
document.getElementById('showHomeBtn').addEventListener('click', () => {
  calendarSection.style.display = 'block';
  writeScreen.style.display = 'none';
});
document.getElementById('showWriteBtn').addEventListener('click', () => {
  calendarSection.style.display = 'none';
  writeScreen.style.display = 'block';
});

// 달력 렌더링
const calendarGrid = document.getElementById('calendarGrid');
const calendarTitle = document.getElementById('calendarTitle');
let currentDate = new Date();

function renderCalendar() {
  calendarGrid.innerHTML = "";
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  calendarTitle.textContent = `${year}년 ${month + 1}월`;

  for(let i=0;i<firstDay;i++) calendarGrid.appendChild(document.createElement('div'));
  for(let d=1;d<=lastDate;d++){
    const cell=document.createElement('div');
    const key=`diary-${year}-${month+1}-${d}`;
    const stored=localStorage.getItem(key);
    if(stored){ 
      const {emotion} = JSON.parse(stored);
      cell.innerHTML=`${d}<br>${emotionEmojiMap[emotion]||''}`;
    } else cell.textContent=d;
    cell.addEventListener('click',()=>stored?openModal(JSON.parse(stored)):alert('기록 없음 😱'));
    calendarGrid.appendChild(cell);
  }
}
document.getElementById('prevMonthBtn').addEventListener('click',()=>{ currentDate.setMonth(currentDate.getMonth()-1); renderCalendar(); });
document.getElementById('nextMonthBtn').addEventListener('click',()=>{ currentDate.setMonth(currentDate.getMonth()+1); renderCalendar(); });

// 모달
const diaryModal=document.getElementById('diaryModal');
const closeModalBtn=document.getElementById('closeModal');
function openModal(data){
  diaryModal.classList.remove('hidden');
  document.getElementById('modalDate').textContent=data.date;
  document.getElementById('modalEmotion').textContent=emotionEmojiMap[data.emotion]||'';
  document.getElementById('modalWeather').textContent=weatherEmojiMap[data.weather]||'';
  document.getElementById('modalDiary').textContent=data.diary;
  const imgEl=document.getElementById('modalImage');
  if(data.photo){ imgEl.src=data.photo; imgEl.style.display='block'; } 
  else imgEl.style.display='none';
}
closeModalBtn.addEventListener('click',()=>diaryModal.classList.add('hidden'));

// 일기 저장
document.getElementById('saveBtn').addEventListener('click',()=>{
  const diary=document.getElementById('diary').value.trim();
  if(!diary){ alert('내용을 입력해주세요'); return; }
  const emotion=document.getElementById('emotion').value;
  const weather=document.getElementById('weather').value;
  const photo=document.getElementById('photo').files[0];
  const todayStr=new Date().toLocaleDateString('ko-KR');
  const key=`diary-${todayStr}`;

  if(photo){
    const reader=new FileReader();
    reader.onload=(e)=>{ localStorage.setItem(key,JSON.stringify({date:todayStr,emotion,weather,diary,photo:e.target.result})); alert('저장 완료!'); renderCalendar(); };
    reader.readAsDataURL(photo);
  } else{
    localStorage.setItem(key,JSON.stringify({date:todayStr,emotion,weather,diary,photo:null}));
    alert('저장 완료!'); renderCalendar();
  }
});
