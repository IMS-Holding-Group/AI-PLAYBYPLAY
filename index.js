console.log("js شغال");
/*✅ تحريك العناصر عند تحميل الصفحة (ظهور تدريجي + انزلاق)*/
$(document).ready(function () {
    $(".fade-in").css({ opacity: 0 }).animate({ opacity: 1 }, 1500);

    // تحريك العنصر للأعلى بشكل ناعم
    $(".slide-up").css({ position: "relative", top: "20px", opacity: 0 })
                 .animate({ top: "0", opacity: 1 }, 1000);

    // تأثير bounce عند التمرير على عناصر تحمل .bounce
    $(".bounce").hover(function () {
        $(this).effect("bounce", { times: 3 }, 300);
    });
});

/*✅ إخفاء/إظهار الهيدر حسب التمرير + إضافة ظل عند التمرير */
let lastScrollTop = 0;
const header = document.getElementById("main-header");

window.addEventListener("scroll", function () {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // إخفاء الهيدر عند التمرير لأسفل، وإظهاره عند الرجوع للأعلى
    if (scrollTop > lastScrollTop) {
        header.style.top = "-100px"; // Scroll Down
    } else {
        header.style.top = "0"; // Scroll Up
    }

    // إضافة تأثير ظل للهيدر عند التمرير
    if (scrollTop > 50) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }

    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});

/*✅ منيو منسدلة (Dropdown Menu) تعمل عند النقر*/
document.addEventListener("DOMContentLoaded", function () {
    const dropbtn = document.querySelector(".dropbtn"); // زر فتح المنيو
    const dropdownContent = document.querySelector(".dropdown-content"); // المحتوى المنسدل

    // إظهار/إخفاء المنيو عند الضغط على الزر
    if (dropbtn && dropdownContent) {
        dropbtn.addEventListener("click", function () {
            dropdownContent.classList.toggle("show");
        });

        window.addEventListener("click", function (event) {
            if (!event.target.matches('.dropbtn')) {
                if (dropdownContent.classList.contains("show")) {
                    dropdownContent.classList.remove("show");
                }
            }
        });
    }
});

/*✅ وضع الرؤية لذوي الهمم */
function toggleHighContrast() {
    const body = document.body;
    const isActive = body.classList.toggle("high-contrast");
    localStorage.setItem("highContrastEnabled", isActive ? "true" : "false");
}

document.addEventListener("DOMContentLoaded", function () {
    const isHighContrast = localStorage.getItem("highContrastEnabled");
    if (isHighContrast === "true") {
        document.body.classList.add("high-contrast");
    }

    // ✅ ربط التقويم بـ API-Football وجلب المباريات
    const API_KEY = "090f30ede667fc392255ad703176cb79";
    const days = document.querySelectorAll('.days li');
    const matchContainer = document.querySelector('.live-matches');
    const matchText = document.querySelector('.live-matches-container p');

    days.forEach(day => {
        day.addEventListener('click', () => {
            const selectedDay = day.getAttribute('data-day').padStart(2, '0');
            const fullDate = '2025-08-${selectedDay}';
            if (fullDate === "2025-08-24") {
                const fixtureIds = [1334270, 1336345, 1364729, 1372448, 1327043];
                matchText.textContent = "المباريات المباشرة:";
                matchContainer.innerHTML = "";
              
                fixtureIds.forEach(id => {
                  fetch(`https://v3.football.api-sports.io/fixtures?id=${id}`, {
                    method: "GET",
                    headers: {
                      "x-apisports-key": API_KEY
                    }
                  })
                  .then(res => res.json())
                  .then(data => {
                    const match = data.response[0];
                    const home = match.teams.home;
                    const away = match.teams.away;
                    const time = new Date(match.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const status = match.fixture.status.short;
              
                    const html = `
                      <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
ttom:10px;">
<img src="${home.logo}" alt="${home.name}" width="40">
                        <strong>${home.name}</strong>
                        <span>${status === "NS" ? " - " : `${match.goals.home} - ${match.goals.away}`}</span>
                        <strong>${away.name}</strong>
                        <img src="${away.logo}" alt="${away.name}" width="40">
                        <p style="margin-top:5px;">${time}</p>
                      </div>
                    `;
              
                    matchContainer.innerHTML += html;
                  });
                });
              
                return; // نوقف الكود هنا، ما نخليه يكمل التواريخ الثانية
              }

            // تمييز اليوم المختار
            days.forEach(d => d.classList.remove('active'));
            day.classList.add('active');

            fetch(`https://v3.football.api-sports.io/fixtures?date=${fullDate}`, {
                method: "GET",
                headers: {
                    "x-apisports-key": API_KEY
                }
            })
            .then(res => res.json())
            .then(data => {
                const matches = data.response;
                matchContainer.innerHTML = "";

                if (matches.length === 0) {
                    matchText.textContent = "لا توجد مباريات في هذا اليوم.";
                    return;
                }

                matchText.textContent = "المباريات المباشرة:";

                matches.forEach(match => {
                    const homeTeam = match.teams.home;
                    const awayTeam = match.teams.away;
                    const fixture = match.fixture;
                    const goals = match.goals;
const matchElement = document.createElement('div');
                    matchElement.innerHTML = `
                        <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
                            <img src="${homeTeam.logo}" alt="${homeTeam.name}" width="40">
                            <strong>${homeTeam.name}</strong>
                            <span>${goals.home} - ${goals.away}</span>
                            <strong>${awayTeam.name}</strong>
                            <img src="${awayTeam.logo}" alt="${awayTeam.name}" width="40">
                        </div>
                        <p>التوقيت: ${new Date(fixture.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    `;
                    matchContainer.appendChild(matchElement);
                });
            })
            .catch(err => {
                matchText.textContent = "حدث خطأ أثناء جلب البيانات.";
                console.error("API Error:", err);
            });
        });
    });
});





// ✅ تحميل المباريات الحالية تلقائيًا
function loadCurrentMatchesOrdered() {
  const container = document.getElementById("currentMatches");
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];

  fetch(`https://v3.football.api-sports.io/fixtures?date=${dateStr}`, {
    method: "GET",
    headers: {
      "x-apisports-key": "090f30ede667fc392255ad703176cb79"
    }
  })
  .then(res => res.json())
  .then(data => {
    const matches = data.response;

    const liveMatches = matches.filter(m => m.fixture.status.short === "1H" || m.fixture.status.short === "2H");
    const upcomingMatches = matches.filter(m => m.fixture.status.short === "NS");

    const renderMatches = (matchList, type) => {
      matchList.forEach(match => {
        const home = match.teams.home;
        const away = match.teams.away;
        const score = match.goals;
        const status = match.fixture.status.short;
        const time = new Date(match.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        let button = "";
        if (type === "live") {
          button = '<a href="live-match.html"><button class="live-score">اضفط لبدء البث المباشر</button></a>';
        } else if (type === "upcoming") {
          button = '<button class="upcoming-score">لم تعرض بعد</button>';
        }

        const matchHTML = `
          <div class="scoreboard">
            <div class="team">
              <img src="${home.logo}" alt="${home.name}">
              <p>${home.name}</p>
            </div>
            <div class="score">
              <p>${score.home} - ${score.away}</p>
              <p class="score-time">${time}</p>
              ${button}
            </div>
            <div class="team">
              <img src="${away.logo}" alt="${away.name}">
              <p>${away.name}</p>
            </div>
          </div>
        `;
        container.innerHTML += matchHTML;
      });
    };

    // عرض مباشر ثم القادمة ثم المسجلة
    renderMatches(liveMatches, "live");
    renderMatches(upcomingMatches, "upcoming");
    loadRecordedSaudiMatches(); // مسجلة
  })
  .catch(err => {
    console.error("فشل في جلب المباريات:", err);
  });
}

document.addEventListener("DOMContentLoaded", loadCurrentMatchesOrdered);

// ✅ شغّلها تلقائيًا عند فتح الصفحة
document.addEventListener("DOMContentLoaded", loadCurrentMatches);





document.addEventListener("DOMContentLoaded"), function () {
    const now = new Date();
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const monthBox = document.getElementById("calendar-month");
if (monthBox) {
  monthBox.innerHTML = `
    ${monthNames[now.getMonth()]}<br>
    <span style="font-size: 10px;">${now.getFullYear()}</span>
  `;
}
    console.log("تم تحميل JS وجاري إعداد التقويم...")
  const API_KEY = "090f30ede667fc392255ad703176cb79";
  const days = document.querySelectorAll(".days li");
  const matchContainer = document.querySelector(".live-matches");
  const matchText = document.querySelector(".live-matches-container p");
  console.log("عدد الأيام :", days.length) ;
  days.forEach(day => {
    day.addEventListener("click", () => {
      const selectedDay = day.getAttribute("data-day").padStart(2, "0");
      const fullDate = '2025-08-${selectedDay}';
      document.getElementById("selscted-date-text").textContent = 'التاريخ المختار: ${selsctedDay}';

      days.forEach(d => d.classList.remove("active"));
      day.classList.add("active");

      fetch(`https://v3.football.api-sports.io/fixtures?date=${fullDate}`, {
        method: "GET",
        headers: {
          "x-apisports-key": API_KEY
        }
      })
      .then(res => res.json())
      .then(data => {
        console.log("جاءت البيانات من API:", data); //اضف هذا
        const matches = data.response;
        matchContainer.innerHTML = "";

        if (matches.length === 0) {
          matchText.textContent = "لا توجد مباريات في هذا اليوم.";
          return;
        }

        matchText.textContent = "المباريات المباشرة:";
        matches.forEach(match => {
          const home = match.teams.home;
          const away = match.teams.away;
          const goals = match.goals;
          const time = new Date(match.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          matches.forEach(match => {
            const home = match.teams.home;
            const away = match.teams.away;
            const goals = match.goals;
            const time = new Date(match.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
            const matchHTML = `
              <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
                <img src="${home.logo}" alt="${home.name}" width="40">
                <strong>${home.name}</strong>
                <span>${goals.home} - ${goals.away}</span>
                <strong>${away.name}</strong>
                <img src="${away.logo}" alt="${away.name}" width="40">
                <p style="margin-top:5px;">${time}</p>
              </div>
            `;
          
            matchContainer.innerHTML += matchHTML;
          });
      })
      .catch(err => {
        matchText.textContent = "حدث خطأ أثناء جلب البيانات.";
        console.error(err);
      });
    });
  });
})}; 




function toggleHighContrast() {
    localStorage.setItem("userType", "disabled");
    const isActive =
document.body.classList.contains("high-contrast");
  
    if (isActive) {
      document.body.classList.remove("high-contrast");
      localStorage.setItem("highContrastMode", "off");
    } else {
      document.body.classList.add("high-contrast");
      localStorage.setItem("highContrastMode", "on");
    }
  }
  
  window.addEventListener("DOMContentLoaded", () => {
    const savedMode = localStorage.getItem("highContrastMode");
    if (savedMode === "on") {
      document.body.classList.add("high-contrast");
    }
  });

  function loadRecordedSaudiMatches() {
    const fixtureIds = [1218549, 1218540, 1330493, 1315401, 1315397];
    const container = document.getElementById("currentMatches");
  
    fixtureIds.forEach(id => {
      fetch(`https://v3.football.api-sports.io/fixtures?id=${id}`, {
        method: "GET",
        headers: {
          "x-apisports-key": "090f30ede667fc392255ad703176cb79"
        }
      })
      .then(res => res.json())
      .then(data => {
        const match = data.response[0];
        const home = match.teams.home;
        const away = match.teams.away;
        const score = match.goals;
        const date = match.fixture.date.slice(0, 10);
  
        const html = `
          <div class="scoreboard">
            <div class="team">
              <img src="${home.logo}" alt="${home.name}">
              <p>${home.name}</p>
            </div>
            <div class="score">
              <p>${score.home} - ${score.away}</p>
              <p class="score-time">${date}</p>
              <button class="finished-score">اضغط لعرض المباراة المسجلة</button>
            </div>
            <div class="team">
              <img src="${away.logo}" alt="${away.name}">
              <p>${away.name}</p>
            </div>
          </div>
        `;
        container.innerHTML += html;
      })
      .catch(err => {
        console.error("خطأ في جلب المباراة:", err);
      });
    });
  }
  
  // ✅ تشغيلها تلقائيًا
  document.addEventListener("DOMContentLoaded" .loadCurrentMatchesLimited);



