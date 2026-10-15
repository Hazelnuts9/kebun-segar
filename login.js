const KUNCI_USER = "kebunSegarUser";
const formLogin = document.querySelector("#form-login");
const formDaftar = document.querySelector("#form-daftar");
const pesanLogin = document.querySelector("#pesan-login");
const pesanDaftar = document.querySelector("#pesan-daftar");

// Menampilkan pesan hijau (berhasil) atau merah (gagal)
function tampilkanPesan(elemen, teks, berhasil) {
  elemen.textContent = teks;
  elemen.className = "text-sm mb-4 " + (berhasil ? "pesan-ok" : "pesan-error");
}
function hurufBesarAwal(teks) {
  return teks.charAt(0).toUpperCase() + teks.slice(1);
}

// Simpan data pengguna, lalu pindah ke halaman toko
function masukKeToko(nama, email, elemenPesan) {
  const dataUser = { nama: nama, email: email };
  localStorage.setItem(KUNCI_USER, JSON.stringify(dataUser)); // objek harus diubah jadi teks dulu
  tampilkanPesan(elemenPesan, "Berhasil! Mengalihkan ke toko...", true);

  // setTimeout = "tunggu 800 milidetik, baru jalankan fungsi ini"
  setTimeout(function () {
    window.location.href = "toko.html";
  }, 800);
}

// 4) Form MASUK
formLogin.addEventListener("submit", function (event) {
  event.preventDefault();

  const email = document.querySelector("#login-email").value.trim();
  const sandi = document.querySelector("#login-password").value;

  if (sandi.length < 8) {
    tampilkanPesan(pesanLogin, "Kata sandi minimal 8 karakter ya.", false);
    return;
  }

  // Nama diambil dari bagian depan email: budi@mail.com -> Budi
  const nama = hurufBesarAwal(email.split("@")[0]);
  masukKeToko(nama, email, pesanLogin);
});

// 5) Form DAFTAR
formDaftar.addEventListener("submit", function (event) {
  event.preventDefault();

  const nama = document.querySelector("#reg-nama").value.trim();
  const email = document.querySelector("#reg-email").value.trim();
  const hp = document.querySelector("#reg-hp").value.trim();
  const sandi = document.querySelector("#reg-password").value;

  // /^[0-9]{10,14}$/ = "hanya angka, panjang 10 sampai 14"
  if (!/^[0-9]{10,14}$/.test(hp)) {
    tampilkanPesan(pesanDaftar, "Nomor HP harus 10-14 digit angka.", false);
    return;
  }
  if (sandi.length < 8) {
    tampilkanPesan(pesanDaftar, "Kata sandi minimal 8 karakter ya.", false);
    return;
  }

  masukKeToko(nama, email, pesanDaftar);
});

// 6) Centang "Tampilkan kata sandi"
function aturTampilSandi(idCentang, idInput) {
  const centang = document.querySelector(idCentang);
  const kolom = document.querySelector(idInput);

  centang.addEventListener("change", function () {
    kolom.type = centang.checked ? "text" : "password";
  });
}

aturTampilSandi("#tampil-sandi-login", "#login-password");
aturTampilSandi("#tampil-sandi-daftar", "#reg-password");