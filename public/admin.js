// SAYFA YÜKLENMESINDE KONTROL ET
window.onload = function() {
  const user = localStorage.getItem("user");
  const ua = document.getElementById("userArea");

  // Admin kontrolü
  if (user !== "admin") {
    window.location.href = "index.html";
    return;
  }

  ua.innerHTML = `<span style="font-weight:700; color:#e74c3c;">👤 Admin Paneli</span>`;

  // Verileri yükle
  loadOrders();
  loadUsers();
};

// ============= TAB DEĞIŞTIRME =============
function switchTab(tab) {
  // Tüm content section'ları gizle
  const sections = document.querySelectorAll(".content-section");
  sections.forEach(s => s.classList.remove("active"));

  // Tüm menu item'ları pasif yap
  const items = document.querySelectorAll(".admin-menu-item");
  items.forEach(i => i.classList.remove("active"));

  // Seçilen tab'ı göster
  document.getElementById(tab + "-tab").classList.add("active");

  // Seçilen menu item'ı aktif yap
  event.target.classList.add("active");
}

// ============= ÜRÜN EKLEME =============
function addProduct() {
  const name = document.getElementById("name").value.trim();
  const price = document.getElementById("price").value.trim();
  const category = document.getElementById("category").value;
  const description = document.getElementById("description").value.trim();
  const imageFile = document.getElementById("image").files[0];

  // Validasyon
  if (!name) {
    alert("Ürün adı gereklidir");
    return;
  }
  if (!price) {
    alert("Fiyat gereklidir");
    return;
  }
  if (!category) {
    alert("Kategori seçiniz");
    return;
  }
  if (!imageFile) {
    alert("Resim seçiniz");
    return;
  }

  // FormData oluştur
  const formData = new FormData();
  formData.append("name", name);
  formData.append("price", parseFloat(price));
  formData.append("category", category);
  formData.append("description", description);
  formData.append("image", imageFile);

  // Gönder
  fetch("/add-product", {
    method: "POST",
    body: formData
  })
  .then(res => res.text())
  .then(data => {
    // Başarı mesajını göster
    const msgEl = document.getElementById("addProductMsg");
    msgEl.style.display = "block";
    
    // Formu temizle
    document.getElementById("name").value = "";
    document.getElementById("price").value = "";
    document.getElementById("category").value = "";
    document.getElementById("description").value = "";
    document.getElementById("image").value = "";

    // 3 saniye sonra mesajı gizle
    setTimeout(() => {
      msgEl.style.display = "none";
    }, 3000);
  })
  .catch(err => {
    alert("Hata: " + err);
  });
}

// ============= SİPARİŞLERİ YÜKLEME =============
function loadOrders() {
  const orders = JSON.parse(localStorage.getItem("orders") || "[]");
  const container = document.getElementById("ordersList");

  // İstatistikleri güncelle
  document.getElementById("totalOrders").textContent = orders.length;
  
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  document.getElementById("totalRevenue").textContent = totalRevenue.toFixed(2) + "₺";

  // Siparişleri tersten sırala (en yenisi önce)
  const sortedOrders = [...orders].reverse();

  if (sortedOrders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <p>Henüz sipariş yok</p>
      </div>
    `;
    return;
  }

  let html = "";
  sortedOrders.forEach((order, i) => {
    const itemsHTML = order.items.map(item => `
      <div class="order-item-row">
        <span>${item.name} x${item.qty || 1}</span>
        <span>${(item.price * (item.qty || 1)).toFixed(2)} ₺</span>
      </div>
    `).join("");

    const paymentInfo = order.paymentMethod 
      ? `<br><small style="color:#999;">Ödeme: ${order.paymentMethod} (•••• ${order.cardLast4})</small>`
      : '';

    html += `
      <div>
        <div class="order-header" onclick="toggleOrderDetails(this)">
          <div class="order-info">
            <div class="order-id">Sipariş #${String(order.id).slice(-6)}</div>
            <div class="order-date">${order.date}</div>
            <div class="order-total">${order.total.toFixed(2)} ₺</div>
          </div>
          <span class="chevron">▼</span>
        </div>
        <div class="order-items">
          ${itemsHTML}
          ${paymentInfo}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// Sipariş detaylarını toggle et
function toggleOrderDetails(header) {
  header.classList.toggle("open");
}

// ============= KULLANICILAR YÜKLEME =============
function loadUsers() {
  // Önce localStorage'dan çek
  let allUsers = JSON.parse(localStorage.getItem("users") || "[]");

  // Sonra database'den de çek (fallback)
  fetch("/admin/users")
    .then(res => res.json())
    .then(dbUsers => {
      // Database kullanıcılarını localStorage'dakilere ekle
      dbUsers.forEach(dbUser => {
        const exists = allUsers.find(u => u.email === dbUser.email);
        if (!exists) {
          allUsers.push(dbUser);
        }
      });

      displayUsers(allUsers);
    })
    .catch(err => {
      // Database başarısız olursa sadece localStorage kullan
      console.log("Database'den çekme başarısız, localStorage kullanılıyor");
      displayUsers(allUsers);
    });
}

function displayUsers(users) {
  const container = document.getElementById("usersList");

  // İstatistikleri güncelle
  document.getElementById("totalUsers").textContent = users.length;

  if (users.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="3" style="text-align:center; color:#999; padding:40px;">
          📭 Henüz kullanıcı yok
        </td>
      </tr>
    `;
    return;
  }

  // Kullanıcıları sırala (adı)
  users.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  const html = users.map(user => `
    <tr>
      <td class="user-name">${user.name || "-"}</td>
      <td>${user.surname || "-"}</td>
      <td class="user-email">${user.email}</td>
    </tr>
  `).join("");

  container.innerHTML = html;
}

// ============= LOGOUT =============
function logout() {
  localStorage.removeItem("user");
  window.location.href = "index.html";
}