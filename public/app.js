// ================== TEMA YÖNETİMİ ==================
function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  setTheme(savedTheme);
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);

  const toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.textContent = theme === "dark" ? "☀️" : "🌙";
    toggle.setAttribute("title", theme === "dark" ? "Açık Tema" : "Koyu Tema");
  }
}

function toggleTheme() {
  const currentTheme = localStorage.getItem("theme") || "light";
  const newTheme = currentTheme === "light" ? "dark" : "light";
  setTheme(newTheme);
}

// ================== USER & NAVBAR ==================
function checkUser() {
  const user = localStorage.getItem("user");
  const area = document.getElementById("userArea");

  if (!area) return;

  if (user === "admin") {
    area.innerHTML = `
      <a href="admin.html" style="text-decoration:none;color:#e74c3c;font-weight:600;">
        👑 Admin Panel
      </a>
    `;
  } 
  else if (user) {
    area.innerHTML = `
      <a href="profile.html" style="text-decoration:none;color:black;">
        👤 ${user}
      </a>
    `;
  } 
  else {
    area.innerHTML = `
      <a href="login.html">Giriş Yap / Kayıt Ol</a>
    `;
  }
}

// ================== LOGOUT ==================
function logout() {
  localStorage.removeItem("user");
  localStorage.removeItem("userEmail");
  window.location.href = "index.html";
}

// ================== CART BADGE ==================
function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const total = cart.reduce((s, i) => s + (i.qty || 1), 0);

  const el = document.getElementById("cartCount");
  if (el) el.textContent = total;
}

// ================== LOAD PRODUCTS ==================
function loadProducts() {
  currentCategory = null; // Kategoriyi sıfırla
  const container = document.getElementById("products");
  if (!container) return;

  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) sortSelect.value = "";

  fetch("/products")
    .then(res => res.json())
    .then(showProducts)
    .catch(() => {
      container.innerHTML = "<p>Ürünler yüklenemedi</p>";
    });
}

// ================== SHOW PRODUCTS ==================
let currentProducts = []; // Mevcut gösterilen ürünleri hafızada sakla

function showProducts(data) {
  const container = document.getElementById("products");
  if (!container) return;

  // Mevcut ürünleri hafızaya kaydet (sıralama için)
  currentProducts = data;

  container.innerHTML = "";

  const user = localStorage.getItem("user");

  data.forEach(p => {
    const div = document.createElement("div");
    div.className = "card";
    
    // Favori listesini kontrol et
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    const isFavorite = favorites.some(f => f.id === p.id);

    div.innerHTML = `
      <div class="card-image-container">
        <img src="${p.image}" onclick="goDetail(${p.id})">
        <button class="favorite-btn" onclick="toggleFavorite(${p.id}, '${p.name}', ${p.price}, '${p.image}')" title="Favorilere ekle">
          ${isFavorite ? '❤️' : '♡'}
        </button>
      </div>
      <h3>${p.name}</h3>
      <p>${p.price}₺</p>

      ${user === "admin" 
        ? `<button onclick="deleteProduct(${p.id})">Sil</button>` 
        : ""
      }
    `;

    container.appendChild(div);
  });
}

// ================== SEARCH ==================
function searchProduct() {
  const input = document.getElementById("searchInput");
  if (!input) return;

  const q = input.value.trim();

  if (q === "") {
    // Boş arama - kategoriyi koru
    if (currentCategory) {
      filterCategory(currentCategory);
    } else {
      loadProducts();
    }
    const sortSelect = document.getElementById("sortSelect");
    if (sortSelect) sortSelect.value = "";
    return;
  }

  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) sortSelect.value = "";

  // URL belirle: Kategori varsa o kategoride ara, yoksa genel ara
  let url;
  if (currentCategory) {
    url = `/category/${currentCategory}`;
  } else {
    url = "/search?q=" + encodeURIComponent(q);
  }

  fetch(url)
    .then(res => res.json())
    .then(data => {
      // Eğer kategori aktifse, arama sonucunu JS'de filtrele
      if (currentCategory) {
        data = data.filter(p => 
          p.name.toLowerCase().includes(q.toLowerCase())
        );
      }
      return data;
    })
    .then(showProducts);
}

// ================== CATEGORY ==================
let currentCategory = null; // Aktif kategoriyi takip et

function filterCategory(cat) {
  // Aktif kategoriyi kaydet
  currentCategory = cat;
  
  // Sıralama dropdown'unu sıfırla
  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) sortSelect.value = "";

  fetch("/category/" + cat)
    .then(res => res.json())
    .then(showProducts);
}

function goToCategory(cat) {
  // Ürün detay sayfasından ana sayfaya dön ve kategori filtrele
  window.location.href = "index.html?category=" + cat;
}

// ================== FIYATA GÖRE SIRALAMA ==================
function sortByPrice() {
  const sortSelect = document.getElementById("sortSelect");
  const sortType = sortSelect.value;

  // Mevcut ürünleri sırala (arama, kategori, her ne varsa)
  let sorted = [...currentProducts];

  if (sortType === "asc") {
    // Düşükten yükseğe
    sorted.sort((a, b) => a.price - b.price);
  } else if (sortType === "desc") {
    // Yüksekten düşüğe
    sorted.sort((a, b) => b.price - a.price);
  }

  showProducts(sorted);
}

// ================== DETAIL ==================
function goDetail(id) {
  window.location.href = "product.html?id=" + id;
}

// ================== ADD PRODUCT ==================
function addProduct() {
  const formData = new FormData();

  formData.append("name", document.getElementById("name").value);
  formData.append("price", document.getElementById("price").value);
  formData.append("category", document.getElementById("category").value);
  formData.append("image", document.getElementById("image").files[0]);
  formData.append("description", document.getElementById("description").value);

  fetch("/add-product", {
    method: "POST",
    body: formData
  })
  .then(() => {
    alert("Ürün eklendi");
    loadProducts();
  })
  .catch(() => alert("Hata oluştu"));
}

// ================== DELETE PRODUCT ==================
function deleteProduct(id) {
  if (!confirm("Silmek istediğine emin misin?")) return;

  fetch("/delete-product/" + id, {
    method: "DELETE"
  })
  .then(() => loadProducts())
  .catch(() => alert("Silme hatası"));
}

// ================== FAVORILEME ==================
function updateFavoriteBadge() {
  const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
  const el = document.getElementById("favoritesCount");
  if (el) el.textContent = favorites.length;
}

function toggleFavorite(id, name, price, image) {
  let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
  
  const index = favorites.findIndex(f => f.id === id);
  
  if (index > -1) {
    // Zaten favoride - kaldır
    favorites.splice(index, 1);
  } else {
    // Favorilere ekle
    favorites.push({ id, name, price, image });
  }
  
  localStorage.setItem("favorites", JSON.stringify(favorites));
  updateFavoriteBadge(); // Badge'i güncelle
  loadProducts(); // Kalp rengini güncellemek için
}

function viewFavorites() {
  window.location.href = "favorites.html";
}

// ================== INIT ==================
window.onload = () => {
  initTheme();
  checkUser();
  
  // URL'deki category parametresini kontrol et
  const params = new URLSearchParams(window.location.search);
  const categoryFromURL = params.get("category");
  
  if (categoryFromURL) {
    filterCategory(categoryFromURL);
  } else {
    loadProducts();
  }
  
  updateCartBadge();
  updateFavoriteBadge();

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", searchProduct);
  }
};