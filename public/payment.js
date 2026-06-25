// ==================== SEPET YÜKLEMESİ ====================
function loadOrderSummary() {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const container = document.getElementById("orderItems");
  
  if (cart.length === 0) {
    container.innerHTML = `<p style="color:var(--text-tertiary);text-align:center;padding:20px">Sepetiniz boş</p>`;
    document.getElementById("totalAmount").textContent = "0 ₺";
    return;
  }
  
  let html = "";
  let subtotal = 0;
  
  cart.forEach(item => {
    const itemTotal = item.price * (item.qty || 1);
    subtotal += itemTotal;
    
    html += `
      <div class="order-item">
        <div class="item-detail">
          <div class="item-name">${item.name}</div>
          <div class="item-qty">x${item.qty || 1}</div>
        </div>
        <div class="item-price">${itemTotal.toFixed(2)} ₺</div>
      </div>
    `;
  });
  
  // Kargo ücreti hesaplaması
  const cargoFee = 50;
  let totalWithCargo = subtotal;
  
  if (subtotal < 2000) {
    // 2000 TL altı - kargo ücreti ekle
    totalWithCargo = subtotal + cargoFee;
    html += `
      <div class="order-item" style="border-bottom:1px solid var(--border-color);padding-top:14px;margin-top:14px">
        <div class="item-detail">
          <div class="item-name">🚚 Kargo Ücreti</div>
        </div>
        <div class="item-price">${cargoFee} ₺</div>
      </div>
    `;
  } else {
    // 2000 TL üzeri - ücretsiz kargo
    html += `
      <div class="order-item" style="border-bottom:1px solid var(--border-color);padding-top:14px;margin-top:14px">
        <div class="item-detail">
          <div class="item-name">🚚 Kargo Ücreti</div>
        </div>
        <div class="item-price" style="text-decoration:line-through;color:var(--text-tertiary)">50 ₺</div>
      </div>
      <div class="order-item" style="border-bottom:none;color:green;font-weight:600">
        <div>Ücretsiz Kargo</div>
      </div>
    `;
  }
  
  container.innerHTML = html;
  document.getElementById("totalAmount").textContent = totalWithCargo.toFixed(2) + " ₺";
  
  // Toplam fiyatı localStorage'a kaydet (sipariş tamamla için)
  localStorage.setItem("paymentTotal", totalWithCargo.toFixed(2));
}

// ==================== KART DOĞRULAMA ====================
function validateCardName() {
  const input = document.getElementById("cardName");
  const error = document.getElementById("cardNameError");
  
  if (input.value.trim().length < 3) {
    error.textContent = "⚠️ Geçerli bir ad girin";
    return false;
  }
  error.textContent = "";
  return true;
}

function validateCardNumber() {
  const input = document.getElementById("cardNumber");
  const error = document.getElementById("cardNumberError");
  const cleaned = input.value.replace(/\s/g, "");
  
  if (cleaned.length !== 16 || !/^\d+$/.test(cleaned)) {
    error.textContent = "⚠️ 16 haneli kart numarası girin";
    return false;
  }
  error.textContent = "";
  return true;
}

function validateExpiry() {
  const input = document.getElementById("cardExpiry");
  const error = document.getElementById("cardExpiryError");
  
  if (!/^\d{2}\/\d{2}$/.test(input.value)) {
    error.textContent = "⚠️ AA/YY formatında girin";
    return false;
  }
  error.textContent = "";
  return true;
}

function validateCVC() {
  const input = document.getElementById("cardCVC");
  const error = document.getElementById("cardCVCError");
  
  if (!/^\d{3}$/.test(input.value)) {
    error.textContent = "⚠️ 3 haneli CVC girin";
    return false;
  }
  error.textContent = "";
  return true;
}

// ==================== ÖDEME İŞLEMİ ====================
function processPayment() {
  // Validasyon
  const valid = validateCardName() && validateCardNumber() && validateExpiry() && validateCVC();
  
  if (!valid) {
    alert("❌ Lütfen tüm alanları doğru doldurun");
    return;
  }
  
  const loading = document.getElementById("loading");
  const successMsg = document.getElementById("successMsg");
  
  loading.style.display = "block";
  
  // Simule ödeme
  setTimeout(() => {
    loading.style.display = "none";
    successMsg.style.display = "block";
    
    // Sepeti boşalt
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const total = localStorage.getItem("paymentTotal") || "0";
    
    // Sipariş oluştur
    const order = {
      id: "ORD-" + Date.now(),
      date: new Date().toLocaleString("tr-TR"),
      items: cart,
      total: parseFloat(total),
      status: "Onaylandı"
    };
    
    let orders = JSON.parse(localStorage.getItem("orders") || "[]");
    orders.push(order);
    localStorage.setItem("orders", JSON.stringify(orders));
    
    localStorage.removeItem("cart");
    localStorage.setItem("lastOrderId", order.id);
    
    // 2 saniye sonra yönlendir
    setTimeout(() => {
      window.location.href = "order.html?id=" + order.id;
    }, 2000);
  }, 2000);
}

// ==================== GERİ DÖNÜŞ ====================
function goBack() {
  window.location.href = "cart.html";
}

// ==================== SAYFA YÜKLEME ====================
document.addEventListener("DOMContentLoaded", () => {
  loadOrderSummary();
  checkUser();
  updateCartBadge();
  updateFavoriteBadge();
});