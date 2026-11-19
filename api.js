const SUMBER_API = [
  "https://www.emsifa.com/api-wilayah-indonesia/v2", //v2 baru
  "https://emsifa.github.io/api-wilayah-indonesia/api" //v1
];
let sumberAktif = SUMBER_API[0];

const ID_JATIM = "35";
const ONGKIR_JATIM = 10000;
const ONGKIR_LUAR_JATIM = 25000;

const pilihProvinsi = document.querySelector("#provinsi");
const pilihKota = document.querySelector("#kota");
const pilihKecamatan = document.querySelector("#kecamatan");
const infoWilayah = document.querySelector("#info-wilayah");

function aturInfo(teks, galat) {
  infoWilayah.textContent = teks;
  infoWilayah.className = "text-sm md:col-span-2 " + (galat ? "pesan-error" : "text-slate-500");
}

function judulKata(teks) {
  if (teks !== teks.toUpperCase()) return teks;
  return teks.toLowerCase().replace(/\b\w/g, function (huruf) {
    return huruf.toUpperCase();
  });
}

// Ambil data dari API.
// async/await
async function ambilData(base, alamat) {
  const respons = await fetch(base + alamat);
  if (!respons.ok) {
    throw new Error("status " + respons.status);
  }
  const isi = await respons.json();
  return Array.isArray(isi) ? isi : isi.data;
}

// Isi <select> dengan daftar dari API
function isiPilihan(select, daftar, teksAwal) {
  select.innerHTML = '<option value="">' + teksAwal + "</option>";

  daftar.forEach(function (item) {
    const opsi = document.createElement("option");
    opsi.value = item.id;
    opsi.textContent = judulKata(item.name);
    select.appendChild(opsi);
  });

  select.disabled = false;
}

function kosongkanPilihan(select, teks) {
  select.innerHTML = '<option value="">' + teks + "</option>";
  select.disabled = true;
}

function teksTerpilih(select) {
  return select.options[select.selectedIndex].text;
}

function ambilTeksWilayah() {
  if (pilihProvinsi.value === "" || pilihKota.value === "" || pilihKecamatan.value === "") {
    return "";
  }
  return "Kec. " + teksTerpilih(pilihKecamatan) + ", " + teksTerpilih(pilihKota) + ", " + teksTerpilih(pilihProvinsi);
}

function resetWilayah() {
  pilihProvinsi.value = "";
  kosongkanPilihan(pilihKota, "-- Pilih kota/kabupaten --");
  kosongkanPilihan(pilihKecamatan, "-- Pilih kecamatan --");
  biayaOngkir = BIAYA_ONGKIR;
  gambarKeranjang();
  aturInfo("", false);
}

async function muatProvinsi() {
  aturInfo("Memuat daftar provinsi...", false);
  let alasan = "";

  for (let i = 0; i < SUMBER_API.length; i++) {
    try {
      const data = await ambilData(SUMBER_API[i], "/provinces.json");
      sumberAktif = SUMBER_API[i];
      isiPilihan(pilihProvinsi, data, "-- Pilih provinsi --");
      aturInfo("", false);
      return;
    } catch (error) {
      console.error("Sumber API ke-" + (i + 1) + " gagal:", error);
      alasan = error.message;
    }
  }

  kosongkanPilihan(pilihProvinsi, "Gagal memuat");
  aturInfo("Gagal memuat data wilayah (" + alasan + "). Periksa koneksi internet lalu refresh halaman. Kamu tetap bisa isi alamat lengkap manual.", true);
}

pilihProvinsi.addEventListener("change", async function () {
  kosongkanPilihan(pilihKota, "-- Pilih kota/kabupaten --");
  kosongkanPilihan(pilihKecamatan, "-- Pilih kecamatan --");

  if (pilihProvinsi.value === "") {
    biayaOngkir = BIAYA_ONGKIR;
    gambarKeranjang();
    aturInfo("", false);
    return;
  }

  biayaOngkir = pilihProvinsi.value === ID_JATIM ? ONGKIR_JATIM : ONGKIR_LUAR_JATIM;
  gambarKeranjang();
  aturInfo("Ongkir ke wilayah ini " + formatRupiah(biayaOngkir) + " (gratis jika belanja minimal " + formatRupiah(GRATIS_ONGKIR_MIN) + ").", false);

  try {
    kosongkanPilihan(pilihKota, "Memuat...");
    const data = await ambilData(sumberAktif, "/regencies/" + pilihProvinsi.value + ".json");
    isiPilihan(pilihKota, data, "-- Pilih kota/kabupaten --");
  } catch (error) {
    console.error(error);
    kosongkanPilihan(pilihKota, "Gagal memuat");
    aturInfo("Gagal memuat daftar kota (" + error.message + "). Coba pilih provinsi lagi.", true);
  }
});

pilihKota.addEventListener("change", async function () {
  kosongkanPilihan(pilihKecamatan, "-- Pilih kecamatan --");
  if (pilihKota.value === "") return;

  try {
    kosongkanPilihan(pilihKecamatan, "Memuat...");
    const data = await ambilData(sumberAktif, "/districts/" + pilihKota.value + ".json");
    isiPilihan(pilihKecamatan, data, "-- Pilih kecamatan --");
  } catch (error) {
    console.error(error);
    kosongkanPilihan(pilihKecamatan, "Gagal memuat");
    aturInfo("Gagal memuat daftar kecamatan (" + error.message + "). Coba pilih kota lagi.", true);
  }
});

muatProvinsi();