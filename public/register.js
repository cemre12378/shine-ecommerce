function register() {
  const name = document.getElementById("name").value;
  const surname = document.getElementById("surname").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Validasyon
  if (!name || !surname || !email || !password) {
    alert("Tüm alanları doldurunuz");
    return;
  }

  // Server'a gönder
  fetch("/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: name,
      surname: surname,
      email: email,
      password: password
    })
  })
  .then(() => {
    // localStorage'a da kaydet (admin paneli için)
    let users = JSON.parse(localStorage.getItem("users") || "[]");
    users.push({
      id: users.length + 1,
      name: name,
      surname: surname,
      email: email,
      password: password
    });
    localStorage.setItem("users", JSON.stringify(users));

    alert("Kayıt başarılı");
    window.location.href = "login.html";
  });
}

function continueWithoutLogin() {
  window.location.href = "index.html";
}