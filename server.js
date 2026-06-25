const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const multer = require("multer");
const path = require("path");
const { exec } = require("child_process");

const app = express();
app.use(express.json());

// ✅ STATIC PATH DÜZELTİLDİ (EN KRİTİK KISIM)
app.use(express.static(path.join(__dirname, "public")));

const db = new sqlite3.Database("database.db");

// ✅ UPLOAD PATH DÜZELTİLDİ
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "public/uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage: storage });

// TABLOLAR
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      description TEXT,
      price REAL,
      image TEXT,
      category TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      surname TEXT,
      email TEXT,
      password TEXT
    )
  `);

  // ADMIN HESABINI OTOMATIK OLUŞTUR
  db.get("SELECT * FROM users WHERE email = ?", ["admin@shine.com"], (err, row) => {
    if (!row) {
      db.run(
        "INSERT INTO users (name, surname, email, password) VALUES (?, ?, ?, ?)",
        ["Admin", "Panel", "admin@shine.com", "123"],
        () => console.log("✅ Admin hesabı oluşturuldu")
      );
    }
  });
});

// ÜRÜN EKLE
app.post("/add-product", upload.single("image"), (req, res) => {
  const { name, price, category, description } = req.body;

  const imagePath = "/uploads/" + req.file.filename;

  db.run(
    "INSERT INTO products (name, description, price, image, category) VALUES (?, ?, ?, ?, ?)",
    [name, description, price, imagePath, category],
    () => res.send("ok")
  );
});

// ÜRÜN SİL
app.delete("/delete-product/:id", (req, res) => {
  db.run("DELETE FROM products WHERE id = ?", [req.params.id], () => {
    res.send("silindi");
  });
});

// TÜM ÜRÜNLER
app.get("/products", (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    res.json(rows);
  });
});

// SEARCH
app.get("/search", (req, res) => {
  const q = req.query.q;
  db.all(
    "SELECT * FROM products WHERE name LIKE ?",
    [`%${q}%`],
    (err, rows) => res.json(rows)
  );
});

// CATEGORY
app.get("/category/:cat", (req, res) => {
  db.all(
    "SELECT * FROM products WHERE category = ?",
    [req.params.cat],
    (err, rows) => res.json(rows)
  );
});

// TEK ÜRÜN
app.get("/product/:id", (req, res) => {
  db.get(
    "SELECT * FROM products WHERE id = ?",
    [req.params.id],
    (err, row) => res.json(row)
  );
});

// REGISTER
app.post("/register", (req, res) => {
  const { name, surname, email, password } = req.body;

  db.run(
    "INSERT INTO users (name, surname, email, password) VALUES (?, ?, ?, ?)",
    [name, surname, email, password],
    () => res.send("ok")
  );
});

// LOGIN
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE email = ? AND password = ?",
    [email, password],
    (err, user) => {
      if (user) {
        res.json({ success: true, name: user.name });
      } else {
        res.json({ success: false });
      }
    }
  );
});

// PROFİL GETİR
app.get("/profile", (req, res) => {
  const email = req.query.email;
  db.get("SELECT name, surname, email FROM users WHERE email = ?", [email], (err, user) => {
    if (user) res.json(user);
    else res.json({});
  });
});

// PROFİL GÜNCELLE
app.post("/update-profile", (req, res) => {
  const { oldEmail, name, surname, email, currentPassword, newPassword } = req.body;

  db.get("SELECT * FROM users WHERE email = ?", [oldEmail], (err, user) => {
    if (!user) return res.json({ success: false, error: "Kullanıcı bulunamadı." });

    if (currentPassword && user.password !== currentPassword) {
      return res.json({ success: false, error: "Mevcut şifre hatalı." });
    }

    const updatedPassword = (currentPassword && newPassword) ? newPassword : user.password;

    db.run(
      "UPDATE users SET name = ?, surname = ?, email = ?, password = ? WHERE email = ?",
      [name, surname, email, updatedPassword, oldEmail],
      (err) => {
        if (err) return res.json({ success: false, error: "Güncelleme başarısız." });
        res.json({ success: true });
      }
    );
  });
});

// TÜM KULLANICILAR (ADMIN PANELI)
app.get("/admin/users", (req, res) => {
  db.all("SELECT id, name, surname, email FROM users", [], (err, rows) => {
    if (err) {
      res.json([]);
    } else {
      res.json(rows || []);
    }
  });
});

// SERVER BAŞLAT + OTOMATİK AÇ
app.listen(3000, () => {
  console.log("http://localhost:3000");

  exec("start http://localhost:3000");
});