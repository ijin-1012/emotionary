// index.js

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
// 로그인 버튼 클릭 (테스트용)
// =========================
document.querySelector('.google-btn').addEventListener('click', () => {
  showScreen(calendarScreen);
});

// 로그아웃 버튼
logoutBtn.addEventListener('click', () => {
  showScreen(loginScreen);
});

// 일기 작성 버튼
writeBtn.addEventListener('click', () => {
  showScreen(writeScreen);
});

// 달력 버튼
calendarBtn.addEventListener('click', () => {
  showScreen(calendarScreen);
});

// 모달 닫기
modalClose.addEventListener('click', () => {
  modal.classList.add('hidden');
});

// =========================
// 달력 생성
// =========================
function generateCalendar(date) {
  calendarGrid.innerHTML = '';
  const year = date.getFullYear();
  const month = date.getMonth();

  monthYear.textContent = `${month + 1}월 ${year}`;

  // 첫 날과 마지막 날
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  // 빈 칸 추가
  for (let i = 0; i < firstDay; i++) {
    const cell = document.createElement('div');
    calendarGrid.appendChild(cell);
  }

  // 날짜 추가
  for (let day = 1; day <= lastDate; day++) {
    const cell = document.createElement('div');
    cell.classList.add('calendar-cell');
    cell.textContent = day;

    // 클릭하면 일기 작성 화면으로 이동
    cell.addEventListener('click', () => {
      showScreen(writeScreen);
    });

    calendarGrid.appendChild(cell);
  }
}

// 이전/다음 달
prevMonth.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  generateCalendar(currentDate);
});
nextMonth.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  generateCalendar(currentDate);
});

// =========================
// 일기 저장
// =========================
saveBtn.addEventListener('click', () => {
  const textarea = writeScreen.querySelector('textarea');
  if (textarea.value.trim() === '') {
    modal.querySelector('p').textContent = '일기를 작성해주세요!';
    modal.classList.remove('hidden');
    return;
  }

  // localStorage에 저장 (날짜별)
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem(today, textarea.value.trim());

  modal.querySelector('p').textContent = '일기가 저장되었습니다!';
  modal.classList.remove('hidden');
  textarea.value = '';
});

// =========================
// 초기 화면 세팅
// =========================
showScreen(loginScreen);
generateCalendar(currentDate);
