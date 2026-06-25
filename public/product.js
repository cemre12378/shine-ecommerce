const params = new URLSearchParams(window.location.search);
const id = params.get("id");

let product = null;

fetch("/product/" + id)
  .then(res => res.json())
  .then(p => {
    product = p;

    document.getElementById("left").innerHTML = `
      <img src="${p.image}">
    `;

    document.getElementById("right").innerHTML = `
      <h2>${p.name}</h2>

      <p class="price">${p.price}₺</p>

      <button class="buy-btn" onclick="addToCart()">
        SEPETE EKLE
      </button>

      <div class="cargo">
        🚚 2000 TL üzeri ücretsiz kargo
      </div>

      <div class="return-policy">
        <span class="return-policy-icon">↩️</span>
        <span>14 Günlük İade Garantisi: 14 gün içinde ücretsiz iade</span>
      </div>

      <div class="desc-box">
        <h4>Ürün Açıklaması</h4>
        <p>${p.description || "Açıklama yok"}</p>
      </div>
    `;
  });

function addToCart() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  cart.push(product);

  localStorage.setItem("cart", JSON.stringify(cart));

  updateCartBadge();

  alert("Sepete eklendi");
}