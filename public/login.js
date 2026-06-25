// ==================== SECURITY CONFIG ====================
const MAX_ATTEMPTS = 3;
let loginAttempts = 3;
let lockoutTime = 0; // Saniye
let isLocked = false;
let lockoutDuration = 180; // 3 dakika = 180 saniye
let lockoutIncrement = 120; // Her başarısız denemede +2 dakika

// LocalStorage'dan attempt sayısını yükle
function loadLoginAttempts() {
  const lockoutEnd = localStorage.getItem("loginLockoutEnd");
  
  // Eğer lockout süresi BITMIŞSE, hak sayacını sıfırla
  if (lockoutEnd) {
    const now = Date.now();
    const endTime = parseInt(lockoutEnd);
    
    if (now < endTime) {
      // Lockout hala aktif
      isLocked = true;
      lockoutTime = Math.ceil((endTime - now) / 1000);
      startLockoutTimer();
      return;
    } else {
      // Lockout süresi bitti → Sıfırla
      localStorage.removeItem("loginLockoutEnd");
    }
  }
  
  // Lockout yoksa veya bitmişse → HER ZAMAN 3'TEN BAŞLA
  localStorage.setItem("loginAttempts", "3");
  loginAttempts = 3;
  isLocked = false;
  
  updateAttemptDisplay();
}

// UI'da attempt sayısını göster
function updateAttemptDisplay() {
  const attemptDiv = document.getElementById("attemptCounter");
  
  if (isLocked) {
    attemptDiv.textContent = "";
  } else if (loginAttempts > 0) {
    const warningColor = loginAttempts === 1 ? "#d32f2f" : (loginAttempts === 2 ? "#f57c00" : "#1976d2");
    attemptDiv.innerHTML = `
      <span style="color: ${warningColor}; font-weight: 600;">
        🔑 Kalan Giriş Hakkı: <span style="font-size: 16px;">${loginAttempts}</span>
      </span>
    `;
  }
}

// Lockout timer başlat
function startLockoutTimer() {
  const timerDiv = document.getElementById("lockoutTimer");
  const timerDisplay = document.getElementById("timerDisplay");
  const loginBtn = document.getElementById("loginBtn");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  
  timerDiv.style.display = "block";
  loginBtn.disabled = true;
  emailInput.disabled = true;
  passwordInput.disabled = true;
  
  const timerInterval = setInterval(() => {
    lockoutTime--;
    
    const minutes = Math.floor(lockoutTime / 60);
    const seconds = lockoutTime % 60;
    timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    if (lockoutTime <= 0) {
      clearInterval(timerInterval);
      
      // Lockout bitti
      isLocked = false;
      loginAttempts = 3;
      localStorage.setItem("loginAttempts", "3");
      localStorage.removeItem("loginLockoutEnd");
      
      timerDiv.style.display = "none";
      loginBtn.disabled = false;
      emailInput.disabled = false;
      passwordInput.disabled = false;
      
      updateAttemptDisplay();
      alert("🔓 Kilidi açıldı! Tekrar deneyin.");
    }
  }, 1000);
}

// Yanlış giriş işlemi
function recordFailedAttempt() {
  loginAttempts--;
  localStorage.setItem("loginAttempts", loginAttempts.toString());
  
  if (loginAttempts <= 0) {
    // Lockout başlat
    isLocked = true;
    lockoutTime = lockoutDuration;
    const now = Date.now();
    const endTime = now + (lockoutDuration * 1000);
    localStorage.setItem("loginLockoutEnd", endTime.toString());
    
    // Sonraki lockout için süreyi artır
    lockoutDuration += lockoutIncrement;
    localStorage.setItem("lockoutDuration", lockoutDuration.toString());
    
    startLockoutTimer();
  } else {
    updateAttemptDisplay();
  }
}

// ==================== LOGIN FUNCTION ====================
function login() {
  console.log("Login fonksiyonu çağrıldı");
  console.log("isLocked:", isLocked);
  console.log("loginAttempts:", loginAttempts);
  
  if (isLocked) {
    alert("❌ Hesabınız kilitli! Lütfen sayacı bitene kadar bekleyin.");
    return;
  }
  
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  
  if (!email || !password) {
    alert("Email ve şifre boş bırakılamaz!");
    return;
  }
  
  // Admin kontrolü
  if (email === "admin@shine.com" && password === "123") {
    localStorage.setItem("user", "admin");
    localStorage.setItem("userEmail", email);
    localStorage.setItem("loginAttempts", "3");
    localStorage.removeItem("loginLockoutEnd");
    alert("✅ Hoşgeldiniz Admin!");
    window.location.href = "admin.html";
    return;
  }
  
  // Normal kullanıcı kontrolü
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    // Başarılı giriş
    localStorage.setItem("user", user.name);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("loginAttempts", "3");
    localStorage.removeItem("loginLockoutEnd");
    
    alert(`✅ Hoşgeldiniz ${user.name}!`);
    window.location.href = "index.html";
  } else {
    // Yanlış giriş
    recordFailedAttempt();
    
    if (loginAttempts > 0) {
      alert(`❌ Email veya şifre yanlış!\n\nKalan giriş hakkı: ${loginAttempts}`);
    } else {
      alert("❌ Çok fazla yanlış giriş! Hesap kilitlendi.");
    }
    
    document.getElementById("password").value = "";
  }
}

// ==================== REGISTER NAVİGASYON ====================
function goRegister() {
  window.location.href = "register.html";
}

// ==================== SAYFA YÜKLEME ====================
// Hemen çalıştır
if (document.readyState === 'loading') {
  document.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded tetiklendi");
    loadLoginAttempts();
  });
} else {
  console.log("DOM hazır, hemen başlatılıyor");
  loadLoginAttempts();
}