const WAJIB_LOGIN = true;          // ganti false kalau mau buka toko.html tanpa login
const KUNCI_USER = "kebunSegarUser";
const KUNCI_KERANJANG = "kebunSegarKeranjang";
const KUNCI_PROMO = "kebunSegarPromo";

const KODE_PROMO = "KEBUN20";
const DISKON_PERSEN = 20;          // diskon 20%
const GRATIS_ONGKIR_MIN = 100000;  // belanja minimal ini = gratis ongkir
const BIAYA_ONGKIR = 10000;

// ===== 2. AMBIL ELEMEN HTML =====
const sapaan = document.querySelector("#sapaan");
const tombolKeluar = document.querySelector("#tombol-keluar");
const badgeKeranjang = document.querySelector("#jumlah-keranjang");

const inputCari = document.querySelector("#cari");
const formFilter = document.querySelector("#form-filter");
const cekBuah = document.querySelector("#cek-buah");
const cekSayur = document.querySelector("#cek-sayur");
const pilihUrutan = document.querySelector("#urutkan");
const pesanKosong = document.querySelector("#produk-kosong");
const judulBuah = document.querySelector("#buah");
const judulSayur = document.querySelector("#sayur");
const gridBuah = document.querySelector("#grid-buah");
const gridSayur = document.querySelector("#grid-sayur");
const semuaKartu = document.querySelectorAll(".product-card");

const isiKeranjang = document.querySelector("#isi-keranjang");
const teksSubtotal = document.querySelector("#subtotal-teks");
const teksDiskon = document.querySelector("#diskon-teks");
const teksOngkir = document.querySelector("#ongkir-teks");
const teksTotal = document.querySelector("#total-teks");
const tombolKosongkan = document.querySelector("#tombol-kosongkan");

const formPromo = document.querySelector("#form-promo");
const inputPromo = document.querySelector("#kode-promo");
const pesanPromo = document.querySelector("#pesan-promo");

const progressPesanan = document.querySelector("#progress-pesanan");
const teksStatus = document.querySelector("#teks-status");

const formCheckout = document.querySelector("#form-checkout");
const pesanCheckout = document.querySelector("#pesan-checkout");
const inputTanggal = document.querySelector("#tanggal-kirim");
const toast = document.querySelector("#toast");

// ===== 3. CEK LOGIN =====
const dataUserTeks = localStorage.getItem(KUNCI_USER);

if (WAJIB_LOGIN && !dataUserTeks) {
  // Belum login -> tendang balik ke halaman login
  window.location.href = "login.html";
}

if (dataUserTeks) {
  const user = JSON.parse(dataUserTeks); // ubah teks kembali jadi objek
  sapaan.textContent = "Halo, " + user.nama + "!";
}

// Saat klik "Keluar", hapus data login
tombolKeluar.addEventListener("click", function () {
  localStorage.removeItem(KUNCI_USER);
});

// ===== 4. FUNGSI BANTU =====

// 25000 -> "Rp 25.000"
function formatRupiah(angka) {
  return "Rp " + angka.toLocaleString("id-ID");
}

// Notifikasi kecil yang muncul sebentar di bawah layar
let timerToast;
function tampilToast(teks) {
  toast.textContent = teks;
  toast.classList.add("tampil");
  clearTimeout(timerToast);
  timerToast = setTimeout(function () {
    toast.classList.remove("tampil");
  }, 2200);
}

// Pesan hijau/merah di bawah form
function tampilkanPesan(elemen, teks, berhasil) {
  elemen.textContent = teks;
  elemen.className = "text-sm " + (elemen === pesanCheckout ? "mt-4 " : "mt-2 ") + (berhasil ? "pesan-ok" : "pesan-error");
}

// Mengatur progress bar status pesanan
function setStatusPesanan(persen, teks) {
  progressPesanan.value = persen;
  progressPesanan.textContent = persen + "%";
  teksStatus.textContent = teks;
}

// ===== 5. KERANJANG =====
// Keranjang = array (daftar) berisi objek, contohnya:
// { id: "apel", nama: "Apel Merah", harga: 25000, satuan: "kg", jumlah: 2 }
let keranjang = [];
let promoAktif = false;
let biayaOngkir = BIAYA_ONGKIR; // nilainya diubah oleh api.js sesuai provinsi yang dipilih

function simpanData() {
  localStorage.setItem(KUNCI_KERANJANG, JSON.stringify(keranjang));
  localStorage.setItem(KUNCI_PROMO, JSON.stringify(promoAktif));
}

function muatData() {
  keranjang = JSON.parse(localStorage.getItem(KUNCI_KERANJANG)) || [];
  promoAktif = JSON.parse(localStorage.getItem(KUNCI_PROMO)) || false;
}

function cariItem(id) {
  return keranjang.find(function (item) {
    return item.id === id;
  });
}

function tambahKeKeranjang(produk, jumlah) {
  const itemAda = cariItem(produk.id);

  if (itemAda) {
    itemAda.jumlah = Math.min(itemAda.jumlah + jumlah, 99); // sudah ada -> tambah jumlahnya
  } else {
    keranjang.push({
      id: produk.id,
      nama: produk.nama,
      harga: produk.harga,
      satuan: produk.satuan,
      jumlah: jumlah
    });
  }

  simpanData();
  gambarKeranjang();
  tampilToast(jumlah + " " + produk.satuan + " " + produk.nama + " masuk keranjang");
}

function ubahJumlah(id, perubahan) {
  const item = cariItem(id);
  if (!item) return;

  item.jumlah += perubahan;
  if (item.jumlah <= 0) {
    hapusItem(id);
    return;
  }
  simpanData();
  gambarKeranjang();
}

function hapusItem(id) {
  // filter = simpan semua item KECUALI yang id-nya sama
  keranjang = keranjang.filter(function (item) {
    return item.id !== id;
  });
  simpanData();
  gambarKeranjang();
}

// Menghitung subtotal, diskon, ongkir, dan total
function hitungRingkasan() {
  let subtotal = 0;
  keranjang.forEach(function (item) {
    subtotal += item.harga * item.jumlah;
  });

  const diskon = promoAktif ? Math.round(subtotal * DISKON_PERSEN / 100) : 0;

  let ongkir = 0;
  if (subtotal > 0 && subtotal < GRATIS_ONGKIR_MIN) {
    ongkir = biayaOngkir;
  }

  return { subtotal: subtotal, diskon: diskon, ongkir: ongkir, total: subtotal - diskon + ongkir };
}

// Menggambar ulang tabel keranjang setiap ada perubahan
function gambarKeranjang() {
  isiKeranjang.innerHTML = "";

  if (keranjang.length === 0) {
    isiKeranjang.innerHTML =
      '<tr><td class="py-6 px-2 text-slate-500" colspan="5">Keranjang masih kosong. Yuk pilih buah dan sayur di atas!</td></tr>';
  }

  keranjang.forEach(function (item) {
    const baris = document.createElement("tr");
    baris.className = "border-b border-slate-200";
    baris.innerHTML =
      '<td class="py-3 px-2">' + item.nama + "</td>" +
      '<td class="py-3 px-2">' +
        '<button class="qty-btn" type="button" data-aksi="kurang" data-id="' + item.id + '" aria-label="Kurangi ' + item.nama + '">−</button> ' +
        '<span class="px-2">' + item.jumlah + " " + item.satuan + "</span> " +
        '<button class="qty-btn" type="button" data-aksi="tambah" data-id="' + item.id + '" aria-label="Tambah ' + item.nama + '">+</button>' +
      "</td>" +
      '<td class="py-3 px-2">' + formatRupiah(item.harga) + "</td>" +
      '<td class="py-3 px-2">' + formatRupiah(item.harga * item.jumlah) + "</td>" +
      '<td class="py-3 px-2"><button class="link-hapus" type="button" data-aksi="hapus" data-id="' + item.id + '">Hapus</button></td>';
    isiKeranjang.appendChild(baris);
  });

  const hasil = hitungRingkasan();
  teksSubtotal.textContent = formatRupiah(hasil.subtotal);
  teksDiskon.textContent = "- " + formatRupiah(hasil.diskon);
  teksOngkir.textContent = hasil.ongkir === 0 && hasil.subtotal > 0 ? "Gratis" : formatRupiah(hasil.ongkir);
  teksTotal.textContent = formatRupiah(hasil.total);

  // Angka merah kecil di samping tulisan "Keranjang" (header)
  let banyak = 0;
  keranjang.forEach(function (item) {
    banyak += item.jumlah;
  });
  badgeKeranjang.textContent = banyak;
}

// Klik tombol "+ Keranjang" di kartu produk.
// Pakai "event delegation": satu pendengar untuk semua tombol.
document.addEventListener("click", function (event) {
  const tombol = event.target.closest(".tombol-tambah");
  if (!tombol) return; // yang diklik bukan tombol tambah -> abaikan

  const kartu = tombol.closest(".product-card");
  const kolomJumlah = kartu.querySelector(".qty-input");

  let jumlah = parseInt(kolomJumlah.value);
  if (isNaN(jumlah) || jumlah < 1) jumlah = 1;
  if (jumlah > 20) jumlah = 20;

  tambahKeKeranjang({
    id: kartu.dataset.id,
    nama: kartu.dataset.nama,
    harga: Number(kartu.dataset.harga),
    satuan: kartu.dataset.satuan
  }, jumlah);

  kolomJumlah.value = 1; // kembalikan ke 1
});

// Klik tombol -, +, Hapus di dalam tabel keranjang
isiKeranjang.addEventListener("click", function (event) {
  const tombol = event.target.closest("button");
  if (!tombol) return;

  const id = tombol.dataset.id;
  const aksi = tombol.dataset.aksi;

  if (aksi === "tambah") ubahJumlah(id, 1);
  if (aksi === "kurang") ubahJumlah(id, -1);
  if (aksi === "hapus") hapusItem(id);
});

tombolKosongkan.addEventListener("click", function () {
  if (keranjang.length === 0) {
    tampilToast("Keranjang sudah kosong");
    return;
  }
  if (confirm("Kosongkan semua isi keranjang?")) {
    keranjang = [];
    promoAktif = false;
    simpanData();
    gambarKeranjang();
  }
});

// ===== 6. KODE PROMO =====
formPromo.addEventListener("submit", function (event) {
  event.preventDefault();
  const kode = inputPromo.value.trim().toUpperCase();

  if (kode === "") {
    tampilkanPesan(pesanPromo, "Ketik kode promonya dulu ya.", false);
  } else if (promoAktif) {
    tampilkanPesan(pesanPromo, "Kode promo sudah dipakai.", false);
  } else if (kode === KODE_PROMO) {
    promoAktif = true;
    simpanData();
    gambarKeranjang();
    tampilkanPesan(pesanPromo, "Kode berhasil dipakai! Diskon " + DISKON_PERSEN + "% aktif.", true);
  } else {
    tampilkanPesan(pesanPromo, "Kode promo tidak valid.", false);
  }
  inputPromo.value = "";
});

// ===== 7. CARI, FILTER & URUTKAN PRODUK =====

// Simpan urutan asli tiap kartu supaya "Terlaris" bisa dikembalikan
semuaKartu.forEach(function (kartu, nomor) {
  kartu.dataset.urutan = nomor;
});

function urutkanGrid(grid, cara) {
  const daftarKartu = Array.from(grid.children);

  daftarKartu.sort(function (a, b) {
    if (cara === "termurah") return Number(a.dataset.harga) - Number(b.dataset.harga);
    if (cara === "termahal") return Number(b.dataset.harga) - Number(a.dataset.harga);
    if (cara === "nama") return a.dataset.nama.localeCompare(b.dataset.nama);
    return Number(a.dataset.urutan) - Number(b.dataset.urutan); // terlaris = urutan asli
  });

  // appendChild memindahkan elemen -> hasilnya tersusun sesuai urutan baru
  daftarKartu.forEach(function (kartu) {
    grid.appendChild(kartu);
  });
}

function terapkanFilter() {
  const kataKunci = inputCari.value.trim().toLowerCase();
  const tampilBuah = cekBuah.checked;
  const tampilSayur = cekSayur.checked;

  // Sembunyikan / tampilkan seluruh bagian Buah dan Sayur
  judulBuah.classList.toggle("hidden", !tampilBuah);
  gridBuah.classList.toggle("hidden", !tampilBuah);
  judulSayur.classList.toggle("hidden", !tampilSayur);
  gridSayur.classList.toggle("hidden", !tampilSayur);

  // Urutkan
  urutkanGrid(gridBuah, pilihUrutan.value);
  urutkanGrid(gridSayur, pilihUrutan.value);

  // Cari berdasarkan nama
  let jumlahTampil = 0;
  semuaKartu.forEach(function (kartu) {
    const cocok = kartu.dataset.nama.toLowerCase().includes(kataKunci);
    kartu.classList.toggle("hidden", !cocok);

    const kategoriAktif = kartu.dataset.kategori === "buah" ? tampilBuah : tampilSayur;
    if (cocok && kategoriAktif) jumlahTampil++;
  });

  pesanKosong.classList.toggle("hidden", jumlahTampil > 0);
}

inputCari.addEventListener("input", terapkanFilter);   // setiap ketikan
formFilter.addEventListener("change", terapkanFilter); // setiap centang/pilihan berubah
formFilter.addEventListener("submit", function (event) {
  event.preventDefault();
  terapkanFilter();
});

// ===== 8. CHECKOUT =====
formCheckout.addEventListener("submit", function (event) {
  event.preventDefault();

  if (keranjang.length === 0) {
    tampilkanPesan(pesanCheckout, "Keranjangmu masih kosong. Pilih produk dulu ya!", false);
    return;
  }

  const namaPenerima = document.querySelector("#penerima").value.trim();
  const totalBayar = hitungRingkasan().total; // hitung SEBELUM keranjang dikosongkan

  // ambilTeksWilayah() ada di api.js (hasil pilihan provinsi/kota/kecamatan dari API)
  const tujuan = typeof ambilTeksWilayah === "function" ? ambilTeksWilayah() : "";
  let kalimat = "Terima kasih, " + namaPenerima + "! Pesanan senilai " + formatRupiah(totalBayar) + " sudah kami terima.";
  if (tujuan !== "") kalimat += " Dikirim ke " + tujuan + ".";
  tampilkanPesan(pesanCheckout, kalimat, true);

  // Reset keranjang & promo
  keranjang = [];
  promoAktif = false;
  simpanData();
  gambarKeranjang();
  formCheckout.reset();
  if (typeof resetWilayah === "function") resetWilayah(); // kosongkan pilihan wilayah

  setStatusPesanan(25, "Pesanan diterima, sedang diproses");
});

// ===== MULAI (dijalankan sekali saat halaman dibuka) =====
// Tanggal pengiriman tidak boleh sebelum hari ini
const sekarang = new Date();
const bulan = String(sekarang.getMonth() + 1).padStart(2, "0");
const tanggal = String(sekarang.getDate()).padStart(2, "0");
inputTanggal.min = sekarang.getFullYear() + "-" + bulan + "-" + tanggal;

muatData();
gambarKeranjang();
terapkanFilter();