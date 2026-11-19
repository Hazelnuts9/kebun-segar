const KUNCI_USER = "kebunSegarUser";
const formLogin = document.querySelector("#form-login");
const formDaftar = document.querySelector("#form-daftar");
const pesanLogin = document.querySelector("#pesan-login");
const pesanDaftar = document.querySelector("#pesan-daftar");

function tampilkanPesan(elemen, teks, berhasil) {
  elemen.textContent = teks;
  elemen.className = "text-sm mb-4 " + (berhasil ? "pesan-ok" : "pesan-error");
}
function hurufBesarAwal(teks) {
  return teks.charAt(0).toUpperCase() + teks.slice(1);
}

function masukKeToko(nama, email, elemenPesan) {
  const dataUser = { nama: nama, email: email };
  localStorage.setItem(KUNCI_USER, JSON.stringify(dataUser));
  tampilkanPesan(elemenPesan, "Berhasil! Mengalihkan ke toko...", true);

  setTimeout(function () {
    window.location.href = "toko.html";
  }, 800);
}

formLogin.addEventListener("submit", function (event) {
  event.preventDefault();

  const email = document.querySelector("#login-email").value.trim();
  const sandi = document.querySelector("#login-password").value;

  if (sandi.length < 8) {
    tampilkanPesan(pesanLogin, "Kata sandi minimal 8 karakter ya.", false);
    return;
  }

  masukKeToko(nama, email, pesanLogin);
});

formDaftar.addEventListener("submit", function (event) {
  event.preventDefault();

  const nama = document.querySelector("#reg-nama").value.trim();
  const email = document.querySelector("#reg-email").value.trim();
  const hp = document.querySelector("#reg-hp").value.trim();
  const sandi = document.querySelector("#reg-password").value;

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

function aturTampilSandi(idCentang, idInput) {
  const centang = document.querySelector(idCentang);
  const kolom = document.querySelector(idInput);

  centang.addEventListener("change", function () {
    kolom.type = centang.checked ? "text" : "password";
  });
}

aturTampilSandi("#tampil-sandi-login", "#login-password");
aturTampilSandi("#tampil-sandi-daftar", "#reg-password");