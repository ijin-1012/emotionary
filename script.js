// index.html의 스크립트
window.onload = () => {
  const displayName = localStorage.getItem('displayName');
  const photoURL = localStorage.getItem('photoURL');

  if (displayName && photoURL) {
    document.getElementById('userName').textContent = displayName + ' 님';
    document.getElementById('userPhoto').src = photoURL;
  } else {
    window.location.href = "login.html";
  }

  document.getElementById('logoutBtn').addEventListener('click', () => {
    firebase.auth().signOut().then(() => {
      localStorage.clear();
      window.location.href = "login.html";
    });
  });
};

const emotionEmojiMap = {
  happy: '😊',
  sad: '😭',
  angry: '😡',
  tired: '😴'
};

const weatherEmojiMap = {
  sunny: '☀️',
  cloudy: '☁️',
  rainy: '☔',
  snowy: '❄️',
  windy: '💨'
};

const calendarSection = document.getElementById('calendarSection');
const writeScreen = document.getElementById('writeScreen');
const showHomeBtn = document.getElementById('showHomeBtn');
const showWriteBtn = document.getElementById('showWriteBtn');
const todayDateDiv = document.getElementById('todayDate');
const calendarGrid = document.getElementById('calendarGrid');
const calendarTitle = document.getElementById('calendarTitle');
const emotionSelect = document.getElementById('emotion');

let currentDate = new Date();
window.editingKey = null;

// 초기화
window.addEventListener('DOMContentLoaded', () => {
  showTodayDate();
  showCalendar();
});

// 오늘 날짜 표시
function showTodayDate() {
  const today = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
  todayDateDiv.textContent = today.toLocaleDateString('ko-KR', options);
}

// 화면 전환 함수
function showCalendar() {
  calendarSection.style.display = 'block';
  writeScreen.style.display = 'none';
  todayDateDiv.style.display = 'none';
  renderCalendar();
}

function showWrite() {
  calendarSection.style.display = 'none';
  writeScreen.style.display = 'block';
  todayDateDiv.style.display = 'block';
  clearWriteForm();
}

// 감정 선택 시 테마 변경
emotionSelect.addEventListener('change', () => {
  const selected = emotionSelect.value; // happy, sad, angry, tired
  writeScreen.className = ''; // 기존 클래스 제거
  writeScreen.classList.add(`${selected}-theme`);
});


// 작성 폼 초기화
function clearWriteForm() {
  document.getElementById('diary').value = '';
  document.getElementById('emotion').value = 'happy';
  document.getElementById('weather').value = 'sunny';
  document.getElementById('photo').value = '';
  window.editingKey = null;
    // 테마도 초기화
  writeScreen.className = writeScreen.className
    .split(' ')
    .filter(cls => !cls.endsWith('-theme'))
    .join(' ');
  writeScreen.classList.add('happy-theme');
}
// 초기화
window.addEventListener('DOMContentLoaded', () => {
  showTodayDate();
  showCalendar();
});

// 오늘 날짜 표시
function showTodayDate() {
  const today = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
  todayDateDiv.textContent = today.toLocaleDateString('ko-KR', options);
}

// 화면 전환 함수
function showCalendar() {
  calendarSection.style.display = 'block';
  writeScreen.style.display = 'none';
  todayDateDiv.style.display = 'none';
  renderCalendar();
}

function showWrite() {
  calendarSection.style.display = 'none';
  writeScreen.style.display = 'block';
  todayDateDiv.style.display = 'block';
  clearWriteForm();
}

// 작성 폼 초기화
function clearWriteForm() {
  document.getElementById('diary').value = '';
  document.getElementById('emotion').value = 'happy';
  document.getElementById('weather').value = 'sunny';
  document.getElementById('photo').value = '';
  window.editingKey = null;

  // 테마도 초기화
  writeScreen.className = writeScreen.className
    .split(' ')
    .filter(cls => !cls.endsWith('-theme'))
    .join(' ');
  writeScreen.classList.add('happy-theme');
}
// 달력 렌더링
function renderCalendar() {
  calendarGrid.innerHTML = '';

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  calendarTitle.textContent = `${year}년 ${month + 1}월`;

  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  weekdays.forEach(day => {
    const dayEl = document.createElement('div');
    dayEl.textContent = day;
    dayEl.style.textAlign = 'center';
    dayEl.style.fontWeight = 'bold';
    dayEl.style.color = '#ddd';
    dayEl.style.padding = '8px 0';
    dayEl.style.borderBottom = '1px solid #444';
    calendarGrid.appendChild(dayEl);
  });

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    calendarGrid.appendChild(empty);
  }

  for (let date = 1; date <= lastDate; date++) {
    const cell = document.createElement('div');
    const fullDate = new Date(year, month, date);
    const key = `diary-${fullDate.toLocaleDateString('ko-KR')}`;
    const stored = localStorage.getItem(key);

    if (stored) {
      const { emotion, weather } = JSON.parse(stored);
      cell.innerHTML = `${date}<br>${emotionEmojiMap[emotion] || ''}`;
if (emotion) {
  cell.classList.add('calendar-cell', emotion); // 감정별 클래스 추가
}

    } else {
      cell.textContent = date;
    }

    cell.style.cursor = 'pointer';

    cell.addEventListener('click', () => {
      if (stored) {
        const { date, emotion, weather, diary, photo } = JSON.parse(stored);
        openModal(date, emotion, weather, diary, photo);
      } else {
        alert("이 날짜에는 기록된 일기가 없습니다 ! ! 😱");
      }
    });

    calendarGrid.appendChild(cell);
  }
}

// 모달 열기
const diaryModal = document.getElementById('diaryModal');
const modalDate = document.getElementById('modalDate');
const modalEmotion = document.getElementById('modalEmotion');
const modalWeather = document.getElementById('modalWeather');
const modalDiary = document.getElementById('modalDiary');
const modalImage = document.getElementById('modalImage');
const closeModalBtn = document.getElementById('closeModal');

function openModal(date, emotion, weather, diary, photo) {
  const weatherIcon = weatherEmojiMap[weather] || '';
  modalDate.textContent = `${date} ${weatherIcon}`; 
  modalEmotion.textContent = emotionEmojiMap[emotion] || '';
  modalDiary.textContent = diary;

  if (photo) {
    modalImage.src = photo;
    modalImage.style.display = 'block';
  } else {
    modalImage.style.display = 'none';
  }

  diaryModal.classList.remove('hidden');
}

closeModalBtn.addEventListener('click', () => {
  diaryModal.classList.add('hidden');
});

// 이전/다음 달 이동
document.getElementById('prevMonthBtn').addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

document.getElementById('nextMonthBtn').addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

// 내비게이션
showHomeBtn.addEventListener('click', showCalendar);
showWriteBtn.addEventListener('click', showWrite);

// 저장 버튼
document.getElementById('saveBtn').addEventListener('click', () => {
  const emotion = document.getElementById('emotion').value;
  const weather = document.getElementById('weather').value;
  const diary = document.getElementById('diary').value.trim();
  const photoInput = document.getElementById('photo');
  const todayStr = new Date().toLocaleDateString('ko-KR');

  if (diary === '') {
    alert('내용을 작성해주세요!');
    return;
  }

  const key = window.editingKey || `diary-${todayStr}`;

  const saveEntry = (photoDataUrl = null) => {
    const entry = { date: todayStr, emotion, weather, diary, photo: photoDataUrl };
    localStorage.setItem(key, JSON.stringify(entry));

  // 감정별 응원 문구
  const emotionMessages = {
    happy: [
      "행복이란 만들어지는 게 아니라, 만들어 가는 거라구 ! 🐸",
      "오늘은 어떤 하루가 될까 ? 특별한 일은 없어도 작은 행복을 느끼는 날이 되면 좋겠어 , 그렇다고 ! 🐹",
      "앞으로 살아가다가 힘들 때 이 풍경을 떠올리면 용기가 날 것 같거든 🐭",
      "행복, 쟁취하지 말고 받자 2 1 세기 평화주의 🤖",
      "과일을 먹으면 너가 생각나 아삭아삭 맛있게 먹던 그 소리 🍏",
      "청춘은 참 좋구나 ~ 나도 섞이고 싶어 🐘",
      "그러다 어느 날 알게 된 거야 ! 일부러 그렇게 하지 않아도 난 살 가치가 있다는 걸 🦜"
    ],
    sad: [
      "다들 각자의 스타일이 있는 법이지 ! 그러니까 너도 니 방식대로 지내면 돼 ! 그게 제일이야 ! 🐴",
      "속이 비어 있는 것이 더 좋을 때도 있죠 예를 들면 마카로니나 도너츠같이 🦏 ",
      "어디선가 읽었는데에 훌륭한 어른이 되려면 이별과 만남을 모두 겪어봐야 한대 ~ 🐣",
      "아무것도 하지 않고 후회하는 것보단 해보고 후회하는 편이 홀가분하거든 🐱",
      "뭐든지 술술 잘 풀리는 인생은 애시당초 없는 기다 🦫",
      "상처 받고 기죽더라도 해는 다시 뜰 거야 힘내 🐸",
      "인생은 단 한 번뿐 대충 살아서는 행복할 수 없어 내 힘으로 해쳐 나가자 🐸",
      "힘들 때 힘들다고 말하는 용기 의지하는 것을 두려워 말자 🤖 ",
      "긍적적 마인드 그것은 완전무결한 작전 긍적적으로 G O ! 🤖",
      "나중에 후회하지 않게 진짜 신나는 추억을 만들자 ! 🐰",
      "이런걸 두고 청춘이라고 한다지? 달콤쌉싸름 ! ! 🐥 ",
      "있지, 울고 싶을 땐 참지 말고 마음껏 우는 게 좋대 ~ 봐봐 🐥",
      "울지마라 꿈이 무너진대도 시간이 다 해결할 거야 🐸",
      "실컷 울고 나면 우중충한 기분도 풀려서 날씨도 활짝 맑아질걸 ~ 🐻"
    ],
    angry: [
      "인생에도 리셋 버튼이 있으면 을매나 좋겠노 ! ! 🦫",
      "의미가 있을 것 같지만 대부분은 의미가 없다 너무 깊이 생각하지 마 🤖",
      "지고 싶지 않다면 이길 때까지 계속 하면 된다 🦭",
      "아무튼 눈에 띄는 모든 것이 맘에 안 들어 ! 🦩 ",
      "비켜 ! 땡 ! 난 지금 누구의 얼굴도 보고 싶지 않아 ! 🐘",
      "자꾸 그카면 참말로 리셋해 🦫",
      "젠장 ... 내가 우나 봐라 ! 씨 ~ 🐘"

    ],
    tired: [
      "누군가가 나를 꼭 껴안아줬으면 좋겠다는 생각을 가끔 허기도 허지라 ... ⛄",
      "스스로 결단을 내리고, 인생을 개척해 왔기에 지금의 내가 있는 게 아니겠어 ? 그 결과가 어떻든 말이야... 🐸",
      "지금의 나는 마치 겨울에 놓고 간 분실물 같은 느낌이랑께요 ... ⛄",
      "실수 투성이인 내 인생에 건배 ~ ! 🐔",
      "재능이 꽃을 피울 테니 초조해하지 말고 한걸음 한걸음 나아가길 ! 🌻",
      "네잎클로버를 찾았다 ! 좋은 일이 생기려나 ? 🍀",
      "넓은 하늘을 올려다보면서 심호흡을 하면 자잘한 고민 따윈 전부 날려버릴 수 있거든 그래서 가끔 하늘을 올려다보곤 해!🪽",
      "아무리 바쁜 나날 속에서도 한 송이 꽃을 사랑해줄 브레이크 타임은 잊어선 안 된다고 말이야 🐰",
      "기록에는 남지 않더라도 기억에 남는 존재가 되고 싶어 ... 🐹",
      "밤이 되면 사소한 것도 두 배로 즐겁게 느껴지는 것 같아 왜, 밤에 먹는 라면이 맛있고 그러잖냐 ! 🐺",
      "원래부터 있는 끝은 없다 끝이라고 정했기에 끝이 있는 것이다 🦭",
      "매일이 엄청시럽게 힘들지만서도 좋아하는 일을 하고 있는 거니까 감사하는 마음을 가져야겠지예 🦔",
      "안녕히 주무세요 내일 다시 만나요 🏠",
      "앞으로 많 ~ 이 많이 놀고 같이 낮잠도 자고 그러자아 ~ 🐥"
    ],
  };

  const messages = emotionMessages[emotion] || ["오늘 하루도 고생했어요! 🤗"];
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    alert(randomMsg);

    clearWriteForm();
    showCalendar();
    renderCalendar();
  };

  if (photoInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = function (e) {
      saveEntry(e.target.result); // Base64 저장
    };
    reader.readAsDataURL(photoInput.files[0]);
  } else {
    saveEntry(null);
  }
});