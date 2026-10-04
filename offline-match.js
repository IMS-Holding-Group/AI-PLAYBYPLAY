let segments = [];
let currentIndex = 0;

// تحميل التحليل من السيرفر
async function fetchOfflineSummary(fixtureId, videoDuration) {
  try {
    const res = await fetch("http://127.0.0.1:5000/offline-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fixture_id: fixtureId,
        video_duration: videoDuration
      })
    });
    const data = await res.json();
    segments = data.segments || [];
  } catch (err) {
    console.error("❌ خطأ في تحميل التحليل:", err);
  }
}

// عرض الترجمة في الشاشة
function displaySegment(index) {
  const subtitleBox = document.getElementById("subtitleBox");
  const popupTranslation = document.getElementById("popupTranslation");

  if (segments[index]) {
    subtitleBox.innerText = segments[index];
    subtitleBox.style.display = "block";

    popupTranslation.innerText = segments[index];
    popupTranslation.style.display = "block";
  } else {
    subtitleBox.style.display = "none";
    popupTranslation.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const video = document.getElementById("matchVideo");

  const fixtureId = 1218540; // غيّر ID المباراة إذا احتجت
  const waitUntilReady = setInterval(() => {
    if (video.readyState >= 2) {
      clearInterval(waitUntilReady);
      const videoDuration = Math.floor(video.duration || 120);
      fetchOfflineSummary(fixtureId, videoDuration).then(() => {
        if (segments.length > 0) {
          displaySegment(0); // ✅ عرض الترجمة مباشرة
        }
      });
      
    }
  }, 500);

  // كل ثانية نتحقق من وقت الفيديو
  video.addEventListener("timeupdate", () => {
    const newIndex = Math.floor(video.currentTime / 10);
    if (newIndex !== currentIndex && segments.length > 0) {
      currentIndex = newIndex;
      displaySegment(currentIndex);
    }
  });

  // إخفاء الترجمة عند نهاية الفيديو
  video.addEventListener("ended", () => {
    document.getElementById("subtitleBox").style.display = "none";
    document.getElementById("popupTranslation").style.display = "none";
  });
});