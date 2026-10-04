/* ------------ القائمة المنسدلة (⚙) ------------ */
function toggleMenu() {
  const menu = document.getElementById("dropdownMenu");
  menu.style.display = (menu.style.display === "block") ? "none" : "block";
}

function toggleSub(id) {
  const allSubMenus = document.querySelectorAll('.sub-options');
  allSubMenus.forEach(menu => {
    menu.style.display = (menu.id === id && menu.style.display !== "block") ? "block" : "none";
  });
}

window.addEventListener('click', function (event) {
  const dropdown = document.querySelector('.dropdown');
  if (!dropdown.contains(event.target)) {
    document.getElementById("dropdownMenu").style.display = "none";
    document.querySelectorAll('.sub-options').forEach(menu => {
      menu.style.display = "none";
    });
  }
});

/* ------------ تسجيل الصوت ------------ */
document.getElementById("recordIcon").addEventListener("click", function () {
  const mic = this;
  mic.classList.toggle("pulse");

  const beep = document.getElementById("beep-sound");
  beep.currentTime = 0;
  beep.play();
});

/* ------------ زر تشغيل صوت المعلق ------------ */
document.querySelectorAll('.play-button').forEach(button => {
  button.addEventListener('click', () => {
    button.classList.add('pulsing');
    setTimeout(() => {
      button.classList.remove('pulsing');
    }, 1000);
  });
});

/* ------------ عداد النتيجة ------------ */
function animateScore(id, target, duration = 1500) {
  const element = document.getElementById(id);
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const value = Math.floor(progress * target);
    element.textContent = value;

    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

window.addEventListener('DOMContentLoaded', () => {
  animateScore('score1', 2);
  animateScore('score2', 1);
});

/* ------------ تفعيل / إيقاف النطق ------------ */
let speechEnabled = false;

function toggleSpeech() {
  speechEnabled = !speechEnabled;
  const btn = document.getElementById("toggleSpeech");
  btn.innerText = speechEnabled ? "🔇 إيقاف النطق" : "🔊 تفعيل النطق";
}

function speakWithVolumeControl(text) {
  const video = document.getElementById("matchVideo");
  if (video) video.volume = 0.2;
  speechSynthesis.cancel();
  setTimeout(() => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.onend = () => {
      if (video) video.volume = 1.0;
    };
    speechSynthesis.speak(utterance);
  }, 100);
}

/* ------------ تحليل السؤال ------------ */
async function analyzeInput() {
  const question = document.getElementById("userInput").value;
  const resultElement = document.getElementById("predictionResult");

  if (!question.trim()) {
    alert("📝 من فضلك اكتب سؤالك أولاً");
    return;
  }

  resultElement.innerText = "⏳ جاري تحليل سؤالك...";

  try {
    const response = await fetch('http://127.0.0.1:5000/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });

    const data = await response.json();

    let cleanedReply = data.reply
      .replace(/\*\*/g, '')
      .replace(/[^\u0600-\u06FF\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const words = cleanedReply.split(/\s+/);
    if (words.length > 300) {
      cleanedReply = words.slice(0, 300).join(' ');
    }

    resultElement.innerText = cleanedReply || "لا يوجد رد حاليًا.";

    if (speechEnabled) {
      speechSynthesis.cancel();
      setTimeout(() => speakWithVolumeControl(cleanedReply), 100);
    }

  } catch (error) {
    console.error("❌ خطأ:", error);
    resultElement.innerText = "⚠️ حدث خطأ أثناء الاتصال بالخادم.";
  }
}

/* ------------ التعليق النصي ------------ */
document.querySelector('.text-comment-btn').addEventListener('click', () => {
  const box = document.getElementById('text-comment-box');
  box.style.display = (box.style.display === 'none') ? 'block' : 'none';
});

function submitTextComment() {
  const input = document.getElementById('text-comment-input');
  const comment = input.value.trim();

  if (comment) {
    input.value = '';
    const msg = document.createElement('div');
    msg.className = 'comment-sent-msg';
    msg.textContent = 'تم إرسال تعليقك';
    document.getElementById('text-comment-box').appendChild(msg);
    setTimeout(() => {
      msg.classList.add('fade-out');
      setTimeout(() => msg.remove(), 400);
    }, 2000);
  }
}

/* ------------ تعليقات المشاهدين ------------ */
function sendComment() {
  const input = document.getElementById('chat-input');
  const chatBox = document.getElementById('chat-box');

  if (input.value.trim() !== '') {
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.textContent = input.value;
    chatBox.appendChild(bubble);
    chatBox.scrollTop = chatBox.scrollHeight;

    const beep = new Audio('https://www.soundjay.com/buttons/sounds/button-3.mp3');
    beep.play();
    input.value = '';
  }
}

/* ------------ حفظ لقطة الفيديو ------------ */
function saveHighlight() {
  const video = document.getElementById("matchVideo");
  const currentTime = Math.floor(video.currentTime);
  let highlights = JSON.parse(localStorage.getItem("highlights")) || [];

  const alreadyExists = highlights.some(h => Math.floor(h.time) === currentTime);
  if (alreadyExists) {
    alert("❗ هذه اللقطة محفوظة بالفعل.");
    return;
  }

  highlights.push({ time: currentTime });
  localStorage.setItem("highlights", JSON.stringify(highlights));
  alert("✅ تم حفظ اللقطة! يمكنك مشاهدتها من صفحة البروفايل.");
}
/* ------------ 💬 عرض الملخص سطر بسطر تحت الفيديو ------------ */
let currentLineIndex = 0;
let allSummaries = [];
let showingStatsCard = false;
let userEnteredMinute = null;

async function loadLiveSummary() {
  try {
    const video = document.getElementById("matchVideo");

    // تحديد وقت دخول المستخدم بناءً على توقيت الفيديو
    if (userEnteredMinute === null) {
      userEnteredMinute = Math.max(1, Math.floor(video.currentTime / 60));
    }

    // طلب التحليلات من السيرفر لغاية الدقيقة اللي دخل فيها المستخدم
    const res = await fetch(`http://127.0.0.1:5000/live-summary?elapsed=${userEnteredMinute}`);
    const data = await res.json();

    // التحليلات اللحظية - توقف عند نقطة الدخول
    if (data.summary && data.summary.length > 0) {
      allSummaries = data.summary;
      currentLineIndex = 0;
      displayLineByLine();
    }

    // بطاقات التحليل اً ✅
    if (data.stats_card && data.stats_card.text && !showingStatsCard) {
      showingStatsCard = true;
      const cardBox = document.getElementById("floatingStatsCard");
      cardBox.innerHTML = `<h4>تحليل الدقيقة ${data.stats_card.minute}</h4><p>${data.stats_card.text}</p>`;
      cardBox.style.display = "block";
      setTimeout(() => {
        cardBox.style.display = "none";
        showingStatsCard = false;
      }, 10000); // عرض لمدة 10 ثواني فقط
    }

  } catch (err) {
    console.error("❌ فشل في تحميل الملخص:", err);
  }
}

function displayLineByLine() {
  const lineBox = document.getElementById("popupTranslation");
  if (currentLineIndex >= allSummaries.length) return;

  const line = allSummaries[currentLineIndex];
  lineBox.innerText = `⏱ ${line.range} - ${line.text}`;
  lineBox.classList.add("show");
  currentLineIndex++;

  setTimeout(() => {
    lineBox.classList.remove("show");
    setTimeout(displayLineByLine, 1500);
  }, 10000); // كل تحليل يعرض 10 ثواني
}

window.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("matchVideo");

  video.addEventListener("play", () => {
    loadLiveSummary(); // أول ما يشغّل الفيديو
    setInterval(loadLiveSummary, 60000); // نحافظ على التحديث كل دقيقة للبطاقات فقط ✅
  });
});


