// عند تحميل الصفحة، نحاول استرجاع بيانات المستخدم من localStorage وعرضها
window.onload = () => {
  const userData = JSON.parse(localStorage.getItem("userData"));

  if (userData) {
    // عرض البيانات في الصفحة
    document.getElementById("name").innerText = userData.name || "أحمد التعييبي";
    document.getElementById("email").innerText = userData.email || "ahmed@example.com";
    document.getElementById("city").innerText = userData.city || "الرياض";
    document.getElementById("gender").innerText = userData.gender || "ذكر";
    document.getElementById("age").innerText = userData.age ? userData.age + " سنة" : "28 سنة";
  }
};

// فتح نموذج تعديل البيانات وتعبئة الحقول الحالية فيه
function openEditForm() {
  const userData = JSON.parse(localStorage.getItem("userData"));

  document.getElementById("editName").value = userData?.name || "";
  document.getElementById("editEmail").value = userData?.email || "";
  document.getElementById("editCity").value = userData?.city || "";
  document.getElementById("editGender").value = userData?.gender || "";
  document.getElementById("editAge").value = userData?.age || "";

  document.getElementById("editForm").style.display = "block";
}

// إغلاق نموذج التعديل
function closeEditForm() {
  document.getElementById("editForm").style.display = "none";
}

// حفظ التعديلات في localStorage وتحديث الصفحة
function saveEdits() {
  const updatedData = {
    name: document.getElementById("editName").value,
    email: document.getElementById("editEmail").value,
    city: document.getElementById("editCity").value,
    gender: document.getElementById("editGender").value,
    age: document.getElementById("editAge").value,
  };

  localStorage.setItem("userData", JSON.stringify(updatedData));
  location.reload(); // إعادة تحميل الصفحة لعرض التعديلات
}

// تسجيل الخروج بحذف البيانات والتوجيه لصفحة تسجيل الدخول
function confirmLogout() {
  const confirmed = confirm("هل أنت متأكد أنك تريد تسجيل الخروج؟");
  if (confirmed) {
    localStorage.removeItem("userData");
    window.location.href = "login.html";
  }
}

// تفعيل زر الإعجاب
function likeShot(button) {
  button.classList.toggle("liked");
  const likesSpan = button.nextElementSibling;
  let currentLikes = parseInt(likesSpan.textContent);
  if (button.classList.contains("liked")) {
    currentLikes++;
  } else {
    currentLikes--;
  }
  likesSpan.textContent = currentLikes;
}

// عرض اللقطات المحفوظة
window.addEventListener("DOMContentLoaded", function () {
  const shotsContainer = document.getElementById("shotsContainer");
  const savedHighlights = JSON.parse(localStorage.getItem("highlights")) || [];

  savedHighlights.forEach((highlight, index) => {
    const card = document.createElement("div");
    card.className = "shot-card";

    const video = document.createElement("video");
    video.src = "videos/your-video.mp4"; // ← غير المسار إذا عندك اسم ثاني
    video.controls = true;
    video.currentTime = highlight.time;

    const desc = document.createElement("p");
    desc.textContent = `لقطة محفوظة عند الدقيقة ${Math.floor(highlight.time / 60)}:${Math.floor(highlight.time % 60).toString().padStart(2, '0')}`;

    const actions = document.createElement("div");
    actions.className = "shot-actions";

    const likeBtn = document.createElement("button");
    likeBtn.className = "like-button";
    likeBtn.onclick = function () {
      const likeCount = this.nextElementSibling;
      likeCount.textContent = parseInt(likeCount.textContent) + 1;
    };

    const heart = document.createElement("span");
    heart.className = "heart";
    heart.innerHTML = "&#10084;";

    likeBtn.appendChild(heart);

    const likes = document.createElement("span");
    likes.className = "likes";
    likes.textContent = "0";

    actions.appendChild(likeBtn);
    actions.appendChild(likes);
    actions.append(" إعجابات");

    card.appendChild(video);
    card.appendChild(desc);
    card.appendChild(actions);

    shotsContainer.appendChild(card);
  });
});