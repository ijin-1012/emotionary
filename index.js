// index.js
document.addEventListener("DOMContentLoaded", () => {
  const loading = document.getElementById("loading");
  const mainContent = document.getElementById("mainContent");
  const userNameEl = document.getElementById("userName");
  const userPhotoEl = document.getElementById("userPhoto");
  const logoutBtn = document.getElementById("logoutBtn");

  // --- 1. 로그인 상태 확인 ---
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  if (isLoggedIn !== "true") {
    window.location.href = "login.html";
    return;
  }

  // --- 2. 사용자 정보 표시 ---
  userNameEl.textContent = localStorage.getItem("userName") || "사용자";
  userPhotoEl.src = localStorage.getItem("userPhoto") || "https://via.placeholder.com/50";

  // --- 3. 로딩 화면 숨기고 mainContent 표시 ---
  loading.style.display = "none";
  mainContent.style.display = "block";

  // --- 4. 로그아웃 기능 ---
  logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
  });

  // --- 5. 오늘 날짜 표시 ---
  const todayDateEl = document.getElementById("todayDate");
  const today = new Date();
  todayDateEl.textContent = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

  // --- 6. 캘린더 기본 렌더링 ---
  const calendarGrid = document.getElementById("calendarGrid");
  const calendarTitle = document.getElementById("calendarTitle");
  const prevMonthBtn = document.getElementById("prevMonthBtn");
  const nextMonthBtn = document.getElementById("nextMonthBtn");

  let currentDate = new Date(today.getFullYear(), today.getMonth(), 1);

  function renderCalendar() {
    calendarGrid.innerHTML = "";

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    calendarTitle.textContent = `${year}년 ${month + 1}월`;

    // 빈칸 채우기
    for (let i = 0; i < firstDay; i++) {
      const emptyCell = document.createElement("div");
      calendarGrid.appendChild(emptyCell);
    }

    // 날짜 채우기
    for (let d = 1; d <= lastDate; d++) {
      const dayCell = document.createElement("div");
      dayCell.textContent = d;
      dayCell.classList.add("calendar-day");
      dayCell.addEventListener("click", () => {
        alert(`${year}-${month+1}-${d} 클릭!`);
      });
      calendarGrid.appendChild(dayCell);
    }
  }

  renderCalendar();

  prevMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });

  nextMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });

  // --- 7. 일기 저장 기능 ---
  const saveBtn = document.getElementById("saveBtn");
  const diaryEl = document.getElementById("diary");
  const emotionEl = document.getElementById("emotion");
  const weatherEl = document.getElementById("weather");
  const photoEl = document.getElementById("photo");

  saveBtn.addEventListener("click", () => {
    const diaryText = diaryEl.value.trim();
    if (!diaryText) {
      alert("일기 내용을 입력해주세요!");
      return;
    }

    const diaryData = {
      date: `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`,
      emotion: emotionEl.value,
      weather: weatherEl.value,
      content: diaryText,
      photo: photoEl.files[0] ? URL.createObjectURL(photoEl.files[0]) : null
    };

    // 로컬스토리지 저장
    const savedDiaries = JSON.parse(localStorage.getItem("diaries") || "[]");
    savedDiaries.push(diaryData);
    localStorage.setItem("diaries", JSON.stringify(savedDiaries));

    alert("오늘의 일기가 저장되었습니다!");
    diaryEl.value = "";
    emotionEl.value = "happy";
    weatherEl.value = "sunny";
    photoEl.value = "";
  });
});
