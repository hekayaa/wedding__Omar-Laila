// ========== إعدادات عامة ==========
const API_BASE = "";

// ========== شاشة الترحيب ==========
window.addEventListener("load", function () {
  const overlay = document.getElementById("introOverlay");
  const mainContent = document.querySelector(".main-content");

  if (mainContent) {
    setTimeout(() => {
      mainContent.style.opacity = "1";
      mainContent.classList.add("show");
    }, 300);
  }

  if (overlay) {
    setTimeout(function () {
      overlay.classList.add("hide");
      setTimeout(function () {
        overlay.style.display = "none";
      }, 1000);
    }, 1500);
  }
});

// ========== العد التنازلي ==========
const weddingDate = new Date("May 7, 2026 16:00:00").getTime();

function updateCountdown() {
  const now = new Date().getTime();
  const distance = weddingDate - now;

  if (distance < 0) {
    const countdownEl = document.querySelector(".countdown");
    if (countdownEl) {
      countdownEl.innerHTML =
        '<p style="font-size:1.2rem; font-style:italic;">We are Married! 🎉</p>';
    }
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");

  if (daysEl) daysEl.innerText = String(days).padStart(2, "0");
  if (hoursEl) hoursEl.innerText = String(hours).padStart(2, "0");
  if (minutesEl) minutesEl.innerText = String(minutes).padStart(2, "0");
  if (secondsEl) secondsEl.innerText = String(seconds).padStart(2, "0");
}

setInterval(updateCountdown, 1000);
updateCountdown();

// ========== مشغل الصوت ==========
const playBtn = document.getElementById("playBtn");
const waveform = document.getElementById("waveform");
const currentTimeEl = document.getElementById("currentTime");
let isPlaying = false;
let currentTime = 0;
const totalTime = 6 * 60 + 8; // 6:08 دقائق
let interval;

if (waveform) {
  for (let i = 0; i < 40; i++) {
    const bar = document.createElement("div");
    bar.className = "wave-bar";
    bar.style.height = Math.floor(Math.random() * 15 + 5) + "px";
    waveform.appendChild(bar);
  }
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return mins + ":" + String(secs).padStart(2, "0");
}

function updateWaveform() {
  if (!waveform) return;
  const bars = waveform.querySelectorAll(".wave-bar");
  const progress = currentTime / totalTime;
  const activeBars = Math.floor(bars.length * progress);

  bars.forEach(function (bar, index) {
    if (index < activeBars) {
      bar.classList.add("active");
    } else {
      bar.classList.remove("active");
    }
  });
}

if (playBtn) {
  playBtn.addEventListener("click", function () {
    isPlaying = !isPlaying;

    if (isPlaying) {
      playBtn.innerText = "⏸";
      playBtn.classList.add("playing");

      interval = setInterval(function () {
        if (currentTime >= totalTime) {
          clearInterval(interval);
          isPlaying = false;
          playBtn.innerText = "▶";
          playBtn.classList.remove("playing");
          currentTime = 0;
          if (currentTimeEl) currentTimeEl.innerText = "0:00";
          updateWaveform();
          return;
        }

        currentTime++;
        if (currentTimeEl) currentTimeEl.innerText = formatTime(currentTime);
        updateWaveform();
      }, 1000);
    } else {
      playBtn.innerText = "▶";
      playBtn.classList.remove("playing");
      clearInterval(interval);
    }
  });
}

// ========== نموذج RSVP (✅ تم الإصلاح - بيبعت الوقت بشكل صحيح) ==========
const rsvpForm = document.getElementById("rsvpForm");
if (rsvpForm) {
  rsvpForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const nameInput = this.querySelector('input[type="text"]');
    const attendInput = this.querySelector('input[name="attend"]:checked');
    const submitBtn = this.querySelector('button[type="submit"]');

    const name = nameInput?.value.trim();
    const attend = attendInput?.value;

    if (!name || !attend) {
      showAlert("⚠️ Please complete all fields", "error");
      return;
    }

    const originalBtnText = submitBtn?.textContent || "SUBMIT";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
    }

    try {
      // 🎯 إنشاء كائن البيانات مع الوقت (وقت القاهرة)
      const now = new Date();
      const cairoTime = now.toLocaleString("en-US", {
        timeZone: "Africa/Cairo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      const dataToSend = {
        name: name,
        attend: attend,
        time: cairoTime, // ✅ الوقت اللي هيظهر في جوجل شيت
        timestamp: now.toISOString(),
      };

      console.log("📤 Sending RSVP:", dataToSend);

      const response = await fetch(`${API_BASE}/api/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();
      console.log("📥 Response:", result);

      if (result.success) {
        showAlert(result.message, "success");
        this.reset();
        setTimeout(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
          }
        }, 1000);
      } else {
        showAlert("❌ " + (result.message || "Error occurred"), "error");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      }
    } catch (error) {
      console.error("RSVP Error:", error);
      showAlert("⚠️ Connection error. Please check your internet.", "error");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    }
  });
}

// ========== دالة عرض التنبيهات ==========
function showAlert(message, type = "info") {
  const existing = document.getElementById("customAlert");
  if (existing) existing.remove();

  const alertDiv = document.createElement("div");
  alertDiv.id = "customAlert";
  alertDiv.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 24px;
    border-radius: 50px;
    font-size: 0.95rem;
    font-weight: 500;
    z-index: 10000;
    animation: slideDown 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    background: ${type === "success" ? "#d4edda" : type === "error" ? "#f8d7da" : "#d1ecf1"};
    color: ${type === "success" ? "#155724" : type === "error" ? "#721c24" : "#0c5460"};
    border: 1px solid ${type === "success" ? "#c3e6cb" : type === "error" ? "#f5c6cb" : "#bee5eb"};
  `;
  alertDiv.textContent = message;
  document.body.appendChild(alertDiv);

  setTimeout(() => alertDiv.remove(), 3000);

  if (!document.getElementById("alertStyles")) {
    const style = document.createElement("style");
    style.id = "alertStyles";
    style.textContent = `
      @keyframes slideDown {
        from { top: -60px; opacity: 0; }
        to { top: 20px; opacity: 1; }
      }
      @keyframes fadeOut {
        from { opacity: 1; transform: translateX(-50%); }
        to { opacity: 0; transform: translateX(-50%); }
      }
    `;
    document.head.appendChild(style);
  }
}

// ========== زر الخريطة ==========
const mapBtn = document.querySelector(".btn-ghost");
if (mapBtn) {
  mapBtn.addEventListener("click", function () {
    window.open(
      "https://maps.google.com/?q=Four+Seasons+Hotel+Nile+Plaza+Cairo",
      "_blank",
    );
  });
}

// ========== QR Floating Button & Modal ==========
const qrFloatBtn = document.getElementById("qrFloatBtn");
const qrModal = document.getElementById("qrModal");
const qrModalClose = document.getElementById("qrModalClose");
const qrCodeImage = document.getElementById("qrCodeImage");

if (qrFloatBtn && qrModal) {
  qrFloatBtn.addEventListener("click", function () {
    qrModal.classList.add("show");
    document.body.style.overflow = "hidden";
  });
}

function closeQRModal() {
  if (qrModal) {
    qrModal.classList.remove("show");
    document.body.style.overflow = "";
  }
}

if (qrModalClose) {
  qrModalClose.addEventListener("click", closeQRModal);
}

if (qrModal) {
  qrModal.addEventListener("click", function (e) {
    if (e.target === qrModal) {
      closeQRModal();
    }
  });
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && qrModal && qrModal.classList.contains("show")) {
    closeQRModal();
  }
});

// ========== GSAP Animations ==========
document.addEventListener("DOMContentLoaded", function () {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    console.log("✨ Site loaded - animations skipped (GSAP not found)");
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    console.log("♿ Reduced motion enabled - skipping animations");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // أنيميشن للكروت
  gsap.utils.toArray(".section.card").forEach((section, i) => {
    gsap.fromTo(
      section,
      { opacity: 0.95, y: 25 },
      {
        opacity: 1,
        y: 0,
        duration: 1.4,
        ease: "power1.out",
        scrollTrigger: {
          trigger: section,
          start: "top 92%",
          toggleActions: "play none none reverse",
        },
        delay: i * 0.12,
      },
    );
  });

  // أنيميشن للعناوين
  gsap.utils.toArray(".cursive-title").forEach((title) => {
    gsap.fromTo(
      title,
      { y: 15, opacity: 0.9 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power1.out",
        scrollTrigger: {
          trigger: title,
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      },
    );
  });

  // أنيميشن للنصوص
  gsap.utils
    .toArray(".body-text, .top-quote, .bottom-quote, .caps-small, .caps-bold")
    .forEach((text) => {
      gsap.fromTo(
        text,
        { y: 10, opacity: 0.95 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power1.out",
          scrollTrigger: {
            trigger: text,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        },
      );
    });

  // أنيميشن للتقويم
  gsap.fromTo(
    ".calendar",
    { scale: 0.98, opacity: 0.95 },
    {
      scale: 1,
      opacity: 1,
      duration: 1,
      ease: "power1.out",
      scrollTrigger: {
        trigger: ".calendar",
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    },
  );

  // أنيميشن لصفوف الجدول
  gsap.utils.toArray(".t-row").forEach((row, i) => {
    const isRight = row.classList.contains("right");
    gsap.fromTo(
      row,
      { x: isRight ? 15 : -15, opacity: 0.95 },
      {
        x: 0,
        opacity: 1,
        duration: 0.9,
        ease: "power1.out",
        scrollTrigger: {
          trigger: row,
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
        delay: i * 0.1,
      },
    );
  });

  // أنيميشن لألوان البالت
  gsap.fromTo(
    ".palette .dot",
    { scale: 0.9, opacity: 0.9 },
    {
      scale: 1,
      opacity: 1,
      duration: 0.7,
      ease: "power1.out",
      stagger: 0.08,
      scrollTrigger: {
        trigger: ".palette",
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    },
  );

  // أنيميشن للعد التنازلي
  gsap.fromTo(
    ".c-circle",
    { scale: 0.95, opacity: 0.95 },
    {
      scale: 1,
      opacity: 1,
      duration: 0.8,
      ease: "power1.out",
      stagger: 0.08,
      scrollTrigger: {
        trigger: ".countdown",
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    },
  );

  // أنيميشن لنموذج RSVP
  gsap.fromTo(
    "#rsvpForm > *",
    { y: 12, opacity: 0.95 },
    {
      y: 0,
      opacity: 1,
      duration: 0.7,
      ease: "power1.out",
      stagger: 0.06,
      scrollTrigger: {
        trigger: "#rsvpForm",
        start: "top 90%",
        toggleActions: "play none none reverse",
      },
    },
  );

  // أنيميشن لمشغل الصوت
  gsap.fromTo(
    ".audio-player",
    { scale: 0.99, opacity: 0.95 },
    {
      scale: 1,
      opacity: 1,
      duration: 0.9,
      ease: "power1.out",
      scrollTrigger: {
        trigger: ".audio-player",
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    },
  );

  // أنيميشن للخاتمة
  gsap.fromTo(
    ".closing .hands-container, .closing .signature, .closing .date-loc",
    { y: 15, opacity: 0.9 },
    {
      y: 0,
      opacity: 1,
      duration: 1.1,
      ease: "power1.out",
      stagger: 0.15,
      scrollTrigger: {
        trigger: ".closing",
        start: "top 82%",
        toggleActions: "play none none reverse",
      },
    },
  );
});
