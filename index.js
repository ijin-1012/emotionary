// Firebase SDK 임포트 필요 (HTML에서)
// <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>

// =========================
// Firebase 초기화
// =========================
const firebaseConfig = {
  apiKey: "AIzaSyDXyG5MIkGzUzAQH7_3JdGtysIUUanZkfg",
  authDomain: "emotionary-7eb12.firebaseapp.com",
  projectId: "emotionary-7eb12",
  storageBucket: "emotionary-7eb12.appspot.com",
  messagingSenderId: "811615110413",
  appId: "1:811615110413:web:6bf3ffe8c9105081ac9c44",
  measurementId: "G-Q658W4MLGJ"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

// 화면 요소
const loginScreen = document.getElementById('loginScreen');
const calendarScreen = document.getElementById('calendarScreen');
const writeScreen = document.getElementById('writeScreen');
const saveBtn = document.getElementById('saveBtn');
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modalClose');
const writeBtn = document.getElementById('writeBtn');
const calendarBtn = document.getElementById('calendarBtn');
const monthYear = document.getElementById('monthYear');
const calendarGrid = document.querySelector('.calendar-grid');
const prevMonth = document.getElementById('prevMonth');
const nextMonth = document.getElementById('nextMonth');
const logoutBtn = document.getElementById('logoutBtn');
const userInfoImg = document.querySelector('.user-info img');
const userInfoName = document.querySelector('.user-info span');

// 현재 날짜
let currentDate = new Date();

// =========================
// 화면 전환 함수
// =========================
function showScreen(screen) {
  [loginScreen, calendarScreen, writeScreen].forEach(s => s.classList.add('hidden'));
  screen.classList.remove('hidden');
}

// =========================
// Firebase 로그인
// =========================
document.querySelector('.google-btn').addEventListener('click', () => {
  auth.signInWithPopup(provider)
    .then(result => {
      const user = result.user;
      // 로그인 성공 시만 메인 화면에 user-info 표시
      document.querySelector('.user-info img').src = user.photoURL;
      document.querySelector('.user-info span').textContent = user.displayName;
      showScreen(calendarScreen);
    })
    .catch(error => {
      console.error(error);
      alert('로그인에 실패했습니다.');
    });
});

// Firebase 로그아웃
logoutBtn.addEventListener('click', () => {
  auth.signOut().then(() => {
    showScreen(loginScreen);
  });
});

// =========================
// 일기 작성 & 달력 기능
// =========================

// 화면 전환: 달력 / 작성
writeBtn.addEventListener('click', () => showScreen(writeScreen));
calendarBtn.addEventListener('click', () => showScreen(calendarScreen));

// 모달 닫기
modalClose.addEventListener('click', () => modal.classList.add('hidden'));

// 달력 생성
function generateCalendar(date) {
  calendarGrid.innerHTML = '';
  const year = date.getFullYear();
  const month = date.getMonth();

  monthYear.textContent = `${month + 1}월 ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) calendarGrid.appendChild(document.createElement('div'));

  for (let day = 1; day <= lastDate; day++) {
    const cell = document.createElement('div');
    cell.classList.add('calendar-cell');
    cell.textContent = day;

    cell.addEventListener('click', () => showScreen(writeScreen));
    calendarGrid.appendChild(cell);
  }
}

// 이전/다음 달
prevMonth.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); generateCalendar(currentDate); });
nextMonth.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); generateCalendar(currentDate); });

// 일기 저장
saveBtn.addEventListener('click', () => {
  const textarea = writeScreen.querySelector('textarea');
  if (!textarea.value.trim()) {
    modal.querySelector('p').textContent = '일기를 작성해주세요!';
    modal.classList.remove('hidden');
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem(today, textarea.value.trim());

  modal.querySelector('p').textContent = '일기가 저장되었습니다!';
  modal.classList.remove('hidden');
  textarea.value = '';
});

// 초기 화면
showScreen(loginScreen);
generateCalendar(currentDate);
