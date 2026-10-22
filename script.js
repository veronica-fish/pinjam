import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, initializeFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBmbLud-MLYWIG8FFAFOkE4rud-iRSKR9w",
  authDomain: "uangku-9013e.firebaseapp.com",
  projectId: "uangku-9013e",
  storageBucket: "uangku-9013e.firebasestorage.app",
  messagingSenderId: "581367901171",
  appId: "1:581367901171:web:b4e67e5cda390998c58086"
};

const app = initializeApp(firebaseConfig);
let db;
try {
  db = initializeFirestore(app, { experimentalForceLongPolling: true });
} catch (e) {
  db = getFirestore(app);
}

const EMAILJS_SERVICE_ID = "service_tqdtjlq";
const EMAILJS_TEMPLATE_ID = "template_d1wdsoc";

let generatedOtp = "";
let hitungMundur;
let sisaWaktu = 60; 

let currentUser = localStorage.getItem('pinjamvercel_current_user');
let isKtpUploaded = localStorage.getItem('pinjamvercel_ktp_status') === 'true';
let isFaceVerified = false; 
let userFullName = ""; 
let listProvinsi = [];

// Timer Loading Variables
const TOTAL_DURASI = 60;
let sisaWaktuLoading = TOTAL_DURASI;
let intervalTimerLoading = null;

// Timer QRIS Variables
let intervalTimerQris = null;

// ==========================================
// FUNGSI MODAL POPUP PROFESIONAL
// ==========================================
window.showModal = function(title, message, iconType = "info") {
  document.getElementById('modal-title').innerText = title;
  document.getElementById('modal-message').innerText = message;
  
  const iconContainer = document.getElementById('modal-icon');
  if (iconType === "success") {
    iconContainer.innerHTML = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2eb85c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
  } else if (iconType === "error") {
    iconContainer.innerHTML = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f44336" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
  } else if (iconType === "warning") {
    iconContainer.innerHTML = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ff9800" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
  } else {
    iconContainer.innerHTML = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2eb85c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }
  
  const overlay = document.getElementById('custom-modal-overlay');
  overlay.classList.add('active');
  
  if (navigator.vibrate) navigator.vibrate(50);
}

window.closeModal = function() {
  document.getElementById('custom-modal-overlay').classList.remove('active');
}

// ==========================================
// FUNGSI NAVIGASI HALAMAN & INIT SELECT2
// ==========================================
window.switchPage = function(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  if (pageId === 'home') {
    document.getElementById('page-home').classList.add('active');
    updateTombolDashboard();
  } else if (pageId === 'auth') {
    document.getElementById('page-auth').classList.add('active');
  } else if (pageId === 'ktp') {
    document.getElementById('page-ktp').classList.add('active');
  } else if (pageId === 'ktp-info') {
    document.getElementById('page-ktp-info').classList.add('active');
  } else if (pageId === 'face') {
    document.getElementById('page-face').classList.add('active');
  } else if (pageId === 'rekening') {
    document.getElementById('page-rekening').classList.add('active');
    setTimeout(initSelect2, 100); 
  } else if (pageId === 'alamat') {
    document.getElementById('page-alamat').classList.add('active');
    if(listProvinsi.length === 0) loadSemuaWilayah();
    setTimeout(initSelect2, 100);
  } else if (pageId === 'pekerjaan') {
    document.getElementById('page-pekerjaan').classList.add('active');
    loadKotaPekerjaan();
    setTimeout(initSelect2, 100);
  } else if (pageId === 'loading') {
    document.getElementById('page-loading').classList.add('active');
  } else if (pageId === 'konfirmasi') { 
    document.getElementById('page-konfirmasi').classList.add('active');
    muatDataRekeningKonfirmasi(); 
  } else if (pageId === 'qris') { 
    document.getElementById('page-qris').classList.add('active');
  } else if (pageId === 'tagihan') { 
    document.getElementById('page-tagihan').classList.add('active');
  } else if (pageId === 'chat') {
    document.getElementById('page-chat').classList.add('active');
  } else if (pageId === 'history') { 
    document.getElementById('page-history').classList.add('active');
  } else if (pageId === 'setting') { 
    document.getElementById('page-setting').classList.add('active');
  } else if (pageId === 'saldo') {
    document.getElementById('page-saldo').classList.add('active');
    muatDataProfil();
  } else if (pageId === 'invite') {
    document.getElementById('page-invite').classList.add('active');
    muatDataProfil();
  } else if (pageId === 'withdraw') {
    document.getElementById('page-withdraw').classList.add('active');
    muatDataProfil();
  } else if (pageId === 'verifikasi-tarik') {
    document.getElementById('page-verifikasi-tarik').classList.add('active');
  } else if (pageId === 'profile') {
    document.getElementById('page-profile').classList.add('active');
    if(currentUser) {
        document.getElementById('profile-email').innerText = currentUser;
        muatDataProfil();
    } else {
        document.getElementById('profile-email').innerText = "Belum Login";
    }
  }

  document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
  if (pageId === 'home' || pageId === 'auth' || pageId === 'ktp' || pageId === 'ktp-info' || pageId === 'face' || pageId === 'rekening' || pageId === 'alamat' || pageId === 'pekerjaan' || pageId === 'loading' || pageId === 'konfirmasi' || pageId === 'qris' || pageId === 'chat') document.querySelectorAll('.nav-item')[0].classList.add('active');
  if (pageId === 'tagihan') document.querySelectorAll('.nav-item')[1].classList.add('active');
  if (pageId === 'profile' || pageId === 'history' || pageId === 'setting' || pageId === 'saldo' || pageId === 'invite' || pageId === 'withdraw' || pageId === 'verifikasi-tarik') document.querySelectorAll('.nav-item')[2].classList.add('active');

  window.scrollTo(0, 0);
};

// ==========================================
// FUNGSI UI & LOGIKA
// ==========================================
window.updateTombolDashboard = function() {
  let btnAction = document.getElementById('btn-action');
  let greeting = document.getElementById('user-greeting');
  let greetingEmail = document.getElementById('greeting-email');

  if (currentUser) {
    greeting.style.display = 'block'; 
    greetingEmail.innerText = currentUser;
    btnAction.innerText = isKtpUploaded ? "Ajukan Pinjaman" : "Cek Limit";
  } else {
    greeting.style.display = 'none';
    btnAction.innerText = "Cek Limit";
  }
};

window.handleTombolUtama = function() {
  if (!currentUser) {
    switchPage('auth');
  } else {
    switchPage('ktp'); 
  }
};

window.bukaAuth = function() {
  switchPage('auth');
  let savedEmail = localStorage.getItem('pinjamvercel_remember_email');
  let savedPass = localStorage.getItem('pinjamvercel_remember_pass');
  if (savedEmail && savedPass) {
    document.getElementById('login-email').value = savedEmail;
    document.getElementById('login-password').value = savedPass;
    document.getElementById('remember-me').checked = true;
  }
  switchTab('login');
};

window.switchTab = function(tab) {
  if (tab === 'login') {
    document.getElementById('tab-login').classList.add('active');
    document.getElementById('tab-daftar').classList.remove('active');
    document.getElementById('form-login').style.display = 'block';
    document.getElementById('form-daftar').style.display = 'none';
  } else {
    document.getElementById('tab-login').classList.remove('active');
    document.getElementById('tab-daftar').classList.add('active');
    document.getElementById('form-login').style.display = 'none';
    document.getElementById('form-daftar').style.display = 'block';
  }
};

// ==========================================
// LOGIKA DAFTAR & LOGIN
// ==========================================
window.kirimOtp = async function() {
  let email = document.getElementById('register-email').value;
  let btn = document.getElementById('btnKirimOtp');
  if (!email || !email.includes('@')) { showModal("Perhatian", "Masukkan email valid!", "warning"); return; }
  btn.innerText = "Cek Email..."; btn.disabled = true;
  try {
    const docSnap = await getDoc(doc(db, "users", email));
    if (docSnap.exists()) {
      showModal("Gagal", "Email sudah terdaftar.", "error"); 
      btn.innerText = "Kirim OTP"; btn.disabled = false; return;
    }
    generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, { to_email: email, otp_code: generatedOtp });
    showModal("Berhasil", "Kode OTP telah dikirim ke email Anda.", "success"); 
    mulaiHitungMundur(); 
  } catch (error) {
    showModal("Gagal", "Gagal mengirim OTP. Periksa koneksi Anda.", "error"); 
    btn.innerText = "Kirim OTP"; btn.disabled = false;
  }
};

function mulaiHitungMundur() {
  let btn = document.getElementById('btnKirimOtp'); btn.disabled = true; sisaWaktu = 60;
  hitungMundur = setInterval(function() {
    sisaWaktu--; btn.innerText = `Tunggu (${sisaWaktu}s)`;
    if (sisaWaktu <= 0) { clearInterval(hitungMundur); btn.innerText = "Kirim Ulang"; btn.disabled = false; }
  }, 1000);
}

window.prosesDaftar = async function() {
  let email = document.getElementById('register-email').value;
  let password = document.getElementById('register-password').value;
  let otp = document.getElementById('register-otp').value;
  let cb1 = document.getElementById('cb1').checked;
  let cb2 = document.getElementById('cb2').checked;
  let cb3 = document.getElementById('cb3').checked;
  let btn = document.getElementById('btnSubmitDaftar');

  if (!email || !password) { showModal("Perhatian", "Email & Password wajib diisi!", "warning"); return; }
  if (!cb1 || !cb2 || !cb3) { showModal("Perhatian", "Anda harus menyetujui semua syarat & ketentuan.", "warning"); return; }
  if (otp !== generatedOtp || generatedOtp === "") { showModal("Gagal", "Kode OTP salah atau kadaluarsa.", "error"); return; }

  btn.innerText = "Mendaftar..."; btn.disabled = true;
  try {
    await setDoc(doc(db, "users", email), { email: email, password: btoa(password), isKtpUploaded: false, isFaceVerified: false, createdAt: new Date().toISOString(), saldo: 0, referralCode: "", riwayatUndangan: [] });
    localStorage.setItem('pinjamvercel_current_user', email); localStorage.setItem('pinjamvercel_ktp_status', 'false');
    currentUser = email; isKtpUploaded = false;
    showModal("Berhasil", "Pendaftaran berhasil! Silakan lanjutkan.", "success"); 
    switchPage('home'); 
  } catch (error) { showModal("Gagal", "Terjadi kesalahan sistem: " + error.message, "error"); } 
  finally { btn.innerText = "Daftar Sekarang"; btn.disabled = false; }
};

window.prosesLogin = async function() {
  let email = document.getElementById('login-email').value;
  let password = document.getElementById('login-password').value;
  let remember = document.getElementById('remember-me').checked;
  let btn = document.getElementById('btnSubmitLogin');

  if (!email || !password) { showModal("Perhatian", "Email & Password wajib diisi!", "warning"); return; }
  btn.innerText = "Memproses..."; btn.disabled = true;

  try {
    const docSnap = await getDoc(doc(db, "users", email));
    if (docSnap.exists()) {
      let dataUser = docSnap.data();
      if (dataUser.password === btoa(password)) {
        if (remember) { localStorage.setItem('pinjamvercel_remember_email', email); localStorage.setItem('pinjamvercel_remember_pass', password); } 
        else { localStorage.removeItem('pinjamvercel_remember_email'); localStorage.removeItem('pinjamvercel_remember_pass'); }
        localStorage.setItem('pinjamvercel_current_user', email); localStorage.setItem('pinjamvercel_ktp_status', dataUser.isKtpUploaded || false);
        currentUser = email; isKtpUploaded = dataUser.isKtpUploaded || false;
        if (dataUser.ktpData && dataUser.ktpData.nama) { userFullName = dataUser.ktpData.nama; }
        showModal("Berhasil", "Login Berhasil! Selamat datang kembali.", "success"); 
        switchPage('home'); 
      } else { showModal("Gagal", "Password yang Anda masukkan salah.", "error"); }
    } else { showModal("Gagal", "Email belum terdaftar di sistem kami.", "error"); }
  } catch (error) { showModal("Error", "Terjadi kesalahan: " + error.message, "error"); } 
  finally { btn.innerText = "Masuk"; btn.disabled = false; }
};

// ==========================================
// LOGIKA UPLOAD KTP
// ==========================================
window.handleFileKtp = async function(event) {
  const file = event.target.files[0];
  if (!file) { showModal("Perhatian", "Anda belum mengambil foto KTP.", "warning"); return; }
  let btn = document.querySelector('.btn-photo'); let originalText = btn.innerText; btn.innerText = "Memproses..."; btn.disabled = true;
  try {
    showModal("Berhasil", "Foto KTP berhasil diambil! Silakan lengkapi data diri.", "success");
    switchPage('ktp-info'); 
  } catch (error) { showModal("Gagal", "Gagal memproses foto: " + error.message, "error"); } 
  finally { btn.innerText = originalText; btn.disabled = false; event.target.value = ''; }
};

window.submitKtpInfo = async function() {
  let nama = document.getElementById('info-nama').value;
  let nik = document.getElementById('info-nik').value;
  let tglLahir = document.getElementById('info-tgl-lahir').value;
  let namaIbu = document.getElementById('info-nama-ibu').value;
  let tempatLahir = document.getElementById('info-tempat-lahir').value;
  let btn = document.querySelector('.btn-submit-ktp');

  if (!nama || !nik || !tglLahir || !namaIbu || !tempatLahir) { showModal("Perhatian", "Harap lengkapi semua data KTP Anda.", "warning"); return; }
  userFullName = nama; btn.innerText = "Menyimpan..."; btn.disabled = true;

  try {
    await updateDoc(doc(db, "users", currentUser), { ktpData: { nama: nama, nik: nik, tanggalLahir: tglLahir, namaIbu: namaIbu, tempatLahir: tempatLahir }, ktpInfoSubmittedAt: new Date().toISOString() });
    switchPage('face');
  } catch (error) { showModal("Gagal", "Gagal menyimpan data: " + error.message, "error"); } 
  finally { btn.innerText = "Langkah Selanjutnya"; btn.disabled = false; }
};

// ==========================================
// LOGIKA VERIFIKASI WAJAH
// ==========================================
window.handleFileFace = async function(event) {
  const file = event.target.files[0];
  if (!file) { showModal("Perhatian", "Silakan Verifikasi Wajah terlebih dahulu.", "warning"); return; }
  let btn = document.querySelector('.btn-start'); let originalText = btn.innerText; btn.innerText = "Memverifikasi..."; btn.disabled = true;
  try {
    await updateDoc(doc(db, "users", currentUser), { isFaceVerified: true, faceVerifiedAt: new Date().toISOString() });
    isFaceVerified = true;
    showModal("Berhasil", "Verifikasi Wajah Berhasil! Silakan isi data rekening.", "success");
    switchPage('rekening');
  } catch (error) { showModal("Gagal", "Gagal menyimpan: " + error.message, "error"); } 
  finally { btn.innerText = originalText; btn.disabled = false; event.target.value = ''; }
};

// ==========================================
// LOGIKA REKENING
// ==========================================
window.switchTabRekening = function(tab) {
  if (tab === 'bank') {
    document.getElementById('tab-bank').classList.add('active'); document.getElementById('tab-ewallet').classList.remove('active');
    document.getElementById('content-bank').classList.add('active'); document.getElementById('content-ewallet').classList.remove('active');
  } else {
    document.getElementById('tab-bank').classList.remove('active'); document.getElementById('tab-ewallet').classList.add('active');
    document.getElementById('content-bank').classList.remove('active'); document.getElementById('content-ewallet').classList.add('active');
  }
};

window.submitRekening = async function(type) {
  let namaPemilik, namaBankAtauEwallet, nomorRekening, btn;
  if (type === 'bank') {
    namaPemilik = document.getElementById('bank-nama').value; namaBankAtauEwallet = document.getElementById('bank-pilihan').value; nomorRekening = document.getElementById('bank-nomor').value; btn = document.querySelector('#content-bank .btn-next-rek');
  } else {
    namaPemilik = document.getElementById('ewallet-nama').value; namaBankAtauEwallet = document.getElementById('ewallet-pilihan').value; nomorRekening = document.getElementById('ewallet-nomor').value; btn = document.querySelector('#content-ewallet .btn-next-rek');
  }

  if (!namaPemilik || !namaBankAtauEwallet || !nomorRekening) { showModal("Perhatian", "Lengkapi semua data rekening Anda.", "warning"); return; }
  if (!userFullName) { showModal("Error", "Nama Lengkap KTP tidak ditemukan. Ulangi proses KTP.", "error"); return; }
  if (namaPemilik.trim().toLowerCase() !== userFullName.trim().toLowerCase()) {
    showModal("Gagal", "Nama Pemilik Rekening harus sama persis dengan Nama di KTP!", "error"); return;
  }

  btn.innerText = "Menyimpan..."; btn.disabled = true;
  try {
    await updateDoc(doc(db, "users", currentUser), { rekeningData: { tipe: type, namaPemilik: namaPemilik, namaBankAtauEwallet: namaBankAtauEwallet, nomorRekening: nomorRekening, createdAt: new Date().toISOString() } });
    showModal("Berhasil", "Data Rekening berhasil disimpan! Lanjut ke Alamat.", "success"); 
    switchPage('alamat');
  } catch (error) { showModal("Gagal", "Gagal menyimpan: " + error.message, "error"); } 
  finally { btn.innerText = "Langkah Selanjutnya"; btn.disabled = false; }
};

// ==========================================
// LOGIKA ALAMAT (SEARCH API)
// ==========================================
async function loadSemuaWilayah() {
  const datalist = document.getElementById('hasil-alamat'); datalist.innerHTML = '<option value="">Memuat data...</option>';
  try {
    const response = await fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json');
    listProvinsi = await response.json();
    datalist.innerHTML = '';
    listProvinsi.forEach(prov => {
      let option = document.createElement('option'); option.value = prov.name; option.setAttribute('data-type', 'provinsi'); option.setAttribute('data-id', prov.id); datalist.appendChild(option);
    });
  } catch (error) { console.error("Gagal:", error); }
}

window.pilihAlamatDariList = async function() {
  let inputVal = document.getElementById('search-alamat').value;
  let datalist = document.getElementById('hasil-alamat');
  let selectedOption = Array.from(datalist.options).find(opt => opt.value === inputVal);
  if (!selectedOption) return;
  
  let tipe = selectedOption.getAttribute('data-type');
  let id = selectedOption.getAttribute('data-id');
  
  if (tipe === 'provinsi') {
    try {
      const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${id}.json`);
      const kabupatenData = await response.json();
      datalist.innerHTML = '';
      kabupatenData.forEach(kab => {
        let option = document.createElement('option'); option.value = `${kab.name}, ${inputVal}`; option.setAttribute('data-type', 'kabupaten'); option.setAttribute('data-id', kab.id); option.setAttribute('data-provinsi', inputVal); datalist.appendChild(option);
      });
      document.getElementById('search-alamat').value = ''; showModal("Informasi", "Silakan pilih Kota/Kabupaten.", "info");
    } catch (e) { console.log(e); }
  } 
  else if (tipe === 'kabupaten') {
    let provName = selectedOption.getAttribute('data-provinsi');
    try {
      const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${id}.json`);
      const kecamatanData = await response.json();
      datalist.innerHTML = '';
      kecamatanData.forEach(kec => {
        let option = document.createElement('option'); option.value = `${kec.name}, ${inputVal}`; option.setAttribute('data-type', 'kecamatan'); option.setAttribute('data-id', kec.id); option.setAttribute('data-kabupaten', inputVal); option.setAttribute('data-provinsi', provName); datalist.appendChild(option);
      });
      document.getElementById('search-alamat').value = ''; showModal("Informasi", "Silakan pilih Kecamatan.", "info");
    } catch (e) { console.log(e); }
  }
  else if (tipe === 'kecamatan') {
    let kabName = selectedOption.getAttribute('data-kabupaten'); let provName = selectedOption.getAttribute('data-provinsi');
    try {
      const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${id}.json`);
      const desaData = await response.json();
      datalist.innerHTML = '';
      desaData.forEach(des => {
        let option = document.createElement('option'); option.value = `${des.name}, ${inputVal}`; option.setAttribute('data-type', 'desa'); option.setAttribute('data-id', des.id); option.setAttribute('data-nama', des.name); option.setAttribute('data-kecamatan', inputVal); option.setAttribute('data-kabupaten', kabName); option.setAttribute('data-provinsi', provName); datalist.appendChild(option);
      });
      document.getElementById('search-alamat').value = ''; showModal("Informasi", "Silakan pilih Desa/Kelurahan.", "info");
    } catch (e) { console.log(e); }
  }
};

window.submitAlamat = async function() {
  let alamatSearch = document.getElementById('search-alamat').value;
  let alamatDetail = document.getElementById('alamat-detail').value;
  let emailPribadi = document.getElementById('alamat-email').value;
  let statusRumah = document.getElementById('status-rumah').value;
  let pendidikan = document.getElementById('pendidikan').value;
  let statusKawin = document.getElementById('status-kawin').value;
  let hubungan1 = document.getElementById('hubungan1').value; let namaKontak1 = document.getElementById('nama-kontak1').value; let telepon1 = document.getElementById('telepon1').value;
  let hubungan2 = document.getElementById('hubungan2').value; let namaKontak2 = document.getElementById('nama-kontak2').value; let telepon2 = document.getElementById('telepon2').value;
  let btn = document.querySelector('#page-alamat .btn-next-rek');

  if (!alamatSearch || !alamatDetail || !emailPribadi || !statusRumah || !pendidikan || !statusKawin || !hubungan1 || !namaKontak1 || !telepon1 || !hubungan2 || !namaKontak2 || !telepon2) { 
    showModal("Perhatian", "Harap lengkapi semua data alamat & kontak!", "warning"); return; 
  }
  if (!alamatSearch.includes(',')) { showModal("Perhatian", "Pilih alamat lengkap dari daftar pencarian.", "warning"); return; }

  btn.innerText = "Menyimpan..."; btn.disabled = true;
  try {
    await updateDoc(doc(db, "users", currentUser), { alamatData: { alamatLengkap: alamatSearch, alamatDetail: alamatDetail, emailPribadi: emailPribadi, statusRumah: statusRumah, pendidikan: pendidikan, statusKawin: statusKawin, kontakDarurat1: { hubungan: hubungan1, nama: namaKontak1, telepon: telepon1 }, kontakDarurat2: { hubungan: hubungan2, nama: namaKontak2, telepon: telepon2 }, createdAt: new Date().toISOString() } });
    showModal("Berhasil", "Data Alamat disimpan! Lanjut ke Info Pekerjaan.", "success");
    switchPage('pekerjaan');
  } catch (error) { showModal("Gagal", "Gagal menyimpan: " + error.message, "error"); } 
  finally { btn.innerText = "Langkah Selanjutnya"; btn.disabled = false; }
};

// ==========================================
// LOGIKA PEKERJAAN (KOTA) & TIMER PENGAJUAN
// ==========================================
async function loadKotaPekerjaan() {
  const selectKota = document.getElementById('pekerjaan-kota');
  if (selectKota.options.length > 1) return; 
  
  selectKota.innerHTML = '<option value="">Memuat data...</option>';
  try {
    let mockKota = ["Jakarta Selatan", "Jakarta Pusat", "Bandung", "Surabaya", "Medan", "Semarang", "Makassar", "Palembang"];
    selectKota.innerHTML = '<option value="">Pilih Kota Tempat Kerja</option>';
    mockKota.forEach(kota => {
      let option = document.createElement('option'); option.value = kota; option.text = kota; selectKota.appendChild(option);
    });
    let optionLain = document.createElement('option'); optionLain.value = "Lainnya"; optionLain.text = "Lainnya"; selectKota.appendChild(optionLain);
  } catch (error) { 
      selectKota.innerHTML = '<option value="">Gagal memuat</option>'; 
  }
}

window.mulaiProsesPengajuan = async function() {
  let bidang = document.getElementById('pekerjaan-bidang').value;
  let lama = document.getElementById('pekerjaan-lama').value;
  let sumber = document.getElementById('pekerjaan-sumber').value;
  let gajian = document.getElementById('pekerjaan-gajian').value;
  let penghasilan = document.getElementById('pekerjaan-penghasilan').value;
  let penggunaan = document.getElementById('pekerjaan-penggunaan').value;
  let statusPinjaman = document.getElementById('pekerjaan-status-pinjaman').value;
  let kota = document.getElementById('pekerjaan-kota').value;
  let alamatKantor = document.getElementById('pekerjaan-alamat').value;
  let teleponPerusahaan = document.getElementById('pekerjaan-telepon').value;
  
  let btn = document.querySelector('#page-pekerjaan .btn-next-rek');

  if (!bidang || !lama || !sumber || !gajian || !penghasilan || !penggunaan || !statusPinjaman || !kota || !alamatKantor) {
    showModal("Perhatian", "Harap lengkapi semua data pekerjaan Anda (kecuali telepon).", "warning"); return;
  }

  btn.innerText = "Menyimpan..."; btn.disabled = true;

  try {
    await updateDoc(doc(db, "users", currentUser), {
      pekerjaanData: {
        bidang: bidang,
        lamaBekerja: lama,
        sumberPenghasilan: sumber,
        tanggalGajian: gajian,
        penghasilanBulanan: penghasilan,
        penggunaanPinjaman: penggunaan,
        statusPinjamanLain: statusPinjaman,
        kotaTempatKerja: kota,
        alamatKantor: alamatKantor,
        teleponPerusahaan: teleponPerusahaan,
        createdAt: new Date().toISOString()
      }
    });

    isKtpUploaded = true;
    localStorage.setItem('pinjamvercel_ktp_status', 'true');
    
    switchPage('loading');
    jalankanTimerLoading();

  } catch (error) {
    console.error("Detail Error Firebase:", error);
    showModal("Gagal", "Gagal menyimpan data pekerjaan: " + error.message, "error");
  } finally {
    btn.innerText = "Langkah Selanjutnya";
    btn.disabled = false;
  }
};

// ==========================================
// LOGIKA TIMER LOADING (HITUNG MUNDUR)
// ==========================================
function jalankanTimerLoading() {
  const timerDisplay = document.getElementById('timer-display');
  const progressFill = document.getElementById('progress-fill');
  
  const dot1 = document.getElementById('dot-1');
  const dot2 = document.getElementById('dot-2');
  const dot3 = document.getElementById('dot-3');
  const check3 = document.getElementById('check-3');
  
  const label1 = document.getElementById('label-1');
  const label2 = document.getElementById('label-2');
  const label3 = document.getElementById('label-3');

  sisaWaktuLoading = TOTAL_DURASI;
  timerDisplay.textContent = "00:01:00";
  progressFill.style.width = "0%";
  dot1.className = "step-dot-app active";
  dot2.className = "step-dot-app";
  dot3.className = "step-dot-app";
  check3.classList.add('hidden');
  label1.className = "label-text-app active";
  label2.className = "label-text-app";
  label3.className = "label-text-app";

  if (intervalTimerLoading) clearInterval(intervalTimerLoading);

  intervalTimerLoading = setInterval(() => {
    sisaWaktuLoading--;

    let menit = Math.floor(sisaWaktuLoading / 60);
    let detik = sisaWaktuLoading % 60;
    timerDisplay.textContent = `00:${menit.toString().padStart(2, '0')}:${detik.toString().padStart(2, '0')}`;

    let persen = ((TOTAL_DURASI - sisaWaktuLoading) / TOTAL_DURASI) * 100;
    progressFill.style.width = persen + "%";

    if (sisaWaktuLoading > 40) {
      dot1.className = "step-dot-app active";
      label1.className = "label-text-app active";
    } 
    else if (sisaWaktuLoading <= 40 && sisaWaktuLoading > 20) {
      dot1.className = "step-dot-app completed";
      dot2.className = "step-dot-app active";
      label1.className = "label-text-app";
      label2.className = "label-text-app active";
    } 
    else if (sisaWaktuLoading <= 20 && sisaWaktuLoading > 0) {
      dot2.className = "step-dot-app completed";
      dot3.className = "step-dot-app active";
      check3.classList.remove('hidden');
      label2.className = "label-text-app";
      label3.className = "label-text-app active";
    }

    if (sisaWaktuLoading <= 0) {
      clearInterval(intervalTimerLoading);
      timerDisplay.textContent = "00:00:00";
      progressFill.style.width = "100%";
      dot1.className = "step-dot-app completed";
      dot2.className = "step-dot-app completed";
      
      setTimeout(() => {
        showModal("Berhasil", "Pengajuan Anda telah selesai ditinjau!", "success");
        switchPage('konfirmasi'); 
      }, 1500);
    }

  }, 1000);
}

// ==========================================
// LOGIKA HALAMAN KONFIRMASI PINJAMAN (AUTO-FILL)
// ==========================================
async function muatDataRekeningKonfirmasi() {
  if (!currentUser) return;
  
  try {
    const docSnap = await getDoc(doc(db, "users", currentUser));
    if (docSnap.exists()) {
      let dataUser = docSnap.data();
      
      if (dataUser.rekeningData) {
        let rek = dataUser.rekeningData;
        document.getElementById('konf-bank').innerText = rek.namaBankAtauEwallet || "-";
        document.getElementById('konf-no-rek').innerText = rek.nomorRekening || "-";
        document.getElementById('konf-nama-rek').innerText = rek.namaPemilik || "-";
      } else {
        document.getElementById('konf-bank').innerText = "Belum diisi";
        document.getElementById('konf-no-rek').innerText = "Belum diisi";
        document.getElementById('konf-nama-rek').innerText = "Belum diisi";
      }
    }
  } catch (error) {
    console.error("Gagal memuat data konfirmasi:", error);
  }
}

// ==========================================
// LOGIKA QRIS & TIMER PEMBAYARAN
// ==========================================
window.prosesKeQRIS = function() {
  switchPage('qris');
  mulaiTimerQRIS(3600); 
};

function mulaiTimerQRIS(durasiDetik) {
  const timerDisplay = document.getElementById('timer-qris');
  let sisaWaktuQris = durasiDetik;

  if (intervalTimerQris) clearInterval(intervalTimerQris);

  intervalTimerQris = setInterval(() => {
    sisaWaktuQris--;

    let jam = Math.floor(sisaWaktuQris / 3600);
    let menit = Math.floor((sisaWaktuQris % 3600) / 60);
    let detik = sisaWaktuQris % 60;

    timerDisplay.textContent = 
      `${jam.toString().padStart(2, '0')}:${menit.toString().padStart(2, '0')}:${detik.toString().padStart(2, '0')}`;

    if (sisaWaktuQris <= 0) {
      clearInterval(intervalTimerQris);
      timerDisplay.textContent = "00:00:00";
      showModal("Waktu Habis", "Waktu konfirmasi pembayaran telah habis.", "warning");
      switchPage('home');
    }

  }, 1000);
}

// ==========================================
// LOGIKA CEK DATA TERAKHIR (TOMBOL CEK PROFIL)
// ==========================================
window.cekDataTerakhir = function() {
  if (!currentUser) {
    showModal("Perhatian", "Silakan login terlebih dahulu.", "warning");
    switchPage('auth');
    return;
  }

  let statusKtp = localStorage.getItem('pinjamvercel_ktp_status') === 'true';
  
  if (!statusKtp) {
    showModal("Informasi", "Anda belum menyelesaikan proses KTP. Silakan lanjutkan.", "info");
    switchPage('ktp');
  } else {
    showModal("Informasi", "Mengarahkan ke data pengajuan terakhir Anda.", "info");
    switchPage('pekerjaan'); 
  }
};

// ==========================================
// LOGIKA GANTI PASSWORD
// ==========================================
window.prosesGantiPassword = async function() {
  let oldPass = document.getElementById('old-password').value;
  let newPass = document.getElementById('new-password').value;
  let confirmPass = document.getElementById('confirm-password').value;
  let btn = document.getElementById('btnGantiPass');

  if (!oldPass || !newPass || !confirmPass) {
    showModal("Perhatian", "Harap isi semua kolom password!", "warning"); return;
  }
  if (newPass !== confirmPass) {
    showModal("Gagal", "Konfirmasi password baru tidak cocok!", "error"); return;
  }
  if (newPass.length < 6) {
    showModal("Gagal", "Password baru minimal 6 karakter.", "warning"); return;
  }

  btn.innerText = "Menyimpan..."; btn.disabled = true;

  try {
    const docSnap = await getDoc(doc(db, "users", currentUser));
    if (docSnap.exists()) {
      let dataUser = docSnap.data();
      
      if (dataUser.password === btoa(oldPass)) {
        await updateDoc(doc(db, "users", currentUser), { password: btoa(newPass) });
        
        showModal("Berhasil", "Password berhasil diubah! Silakan gunakan password baru untuk login berikutnya.", "success");
        
        document.getElementById('old-password').value = "";
        document.getElementById('new-password').value = "";
        document.getElementById('confirm-password').value = "";
        
        switchPage('profile');
      } else {
        showModal("Gagal", "Password lama yang Anda masukkan salah.", "error");
      }
    }
  } catch (error) {
    showModal("Error", "Terjadi kesalahan sistem: " + error.message, "error");
  } finally {
    btn.innerText = "Simpan Perubahan"; btn.disabled = false;
  }
};

// ==========================================
// LOGIKA CHAT OTOMATIS (BOT) DENGAN TIPS
// ==========================================
let isBotTyping = false;

window.kirimPilihanChat = function(nomor) {
  tambahPesanUser(nomor);
  prosesResponBot(nomor);
};

window.handleChatEnter = function(event) {
  if (event.key === "Enter") {
    kirimPesanChatManual();
  }
};

window.kirimPesanChatManual = function() {
  const input = document.getElementById('chat-input');
  const pesan = input.value.trim();
  if (pesan === "") return;

  tambahPesanUser(pesan);
  input.value = "";

  if (["1", "2", "3", "4", "5"].includes(pesan)) {
    prosesResponBot(pesan);
  } else {
    prosesResponBot("default");
  }
};

function tambahPesanUser(teks) {
  const chatContainer = document.getElementById('chat-dynamic-messages');
  const pesanHTML = `
    <div class="chat-message user">
      <div class="chat-bubble" style="background: #dcf8c6; border-radius: 12px 0 12px 12px;">
        <p>${teks}</p>
      </div>
    </div>
  `;
  chatContainer.insertAdjacentHTML('beforeend', pesanHTML);
  scrollChatKeBawah();
}

function scrollChatKeBawah() {
  const container = document.querySelector('.chat-container');
  setTimeout(() => {
    container.scrollTop = container.scrollHeight;
  }, 100);
}

// Logika Respon Bot Otomatis dengan Tips
function prosesResponBot(input) {
  if (isBotTyping) return;
  isBotTyping = true;

  const chatContainer = document.getElementById('chat-dynamic-messages');
  const typingHTML = `
    <div class="chat-message bot" id="typing-indicator">
      <div class="chat-avatar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2eb85c" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
      </div>
      <div class="chat-bubble" style="color: #888; font-style: italic;">
        Sedang mengetik...
      </div>
    </div>
  `;
  chatContainer.insertAdjacentHTML('beforeend', typingHTML);
  scrollChatKeBawah();

  setTimeout(() => {
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();

    let balasan = "";
    let tips = "";

    if (input === "1") {
      balasan = "Konfirmasi pinjaman diperlukan untuk memastikan bahwa pengajuan yang Anda lakukan valid dan bukan tindakan penipuan. Ini juga sebagai bentuk verifikasi data sebelum dana dicairkan.";
      tips = "Pastikan Anda melakukan konfirmasi hanya melalui aplikasi resmi PinjamVercel. Jangan pernah mentransfer biaya konfirmasi ke rekening pribadi.";
    } else if (input === "2") {
      balasan = "Untuk mengecek tagihan, Anda bisa masuk ke menu 'Tagihan' di bagian bawah aplikasi. Pastikan Anda sudah login untuk melihat detail tagihan Anda.";
      tips = "Segera lakukan pembayaran sebelum tanggal jatuh tempo untuk menghindari denda keterlambatan dan menjaga skor kredit Anda tetap baik.";
    } else if (input === "3") {
      balasan = "Verifikasi email dilakukan saat Anda mendaftar. Anda akan menerima kode OTP melalui email yang harus dimasukkan ke dalam aplikasi. Jika belum menerima, silakan cek folder Spam atau kirim ulang OTP.";
      tips = "Gunakan email aktif yang sering Anda buka. Pastikan kapasitas inbox email Anda tidak penuh agar kode OTP bisa masuk.";
    } else if (input === "4") {
      balasan = "Agar pinjaman cepat disetujui, pastikan semua data yang Anda isi (KTP, Rekening, Alamat, Pekerjaan) valid dan sesuai dengan kondisi asli Anda. Foto KTP juga harus jelas.";
      tips = "Gunakan pencahayaan yang terang saat memfoto KTP dan pastikan seluruh bagian KTP terlihat tanpa terpotong. Data yang konsisten mempercepat proses verifikasi.";
    } else if (input === "5") {
      balasan = "Setelah pengajuan disetujui dan konfirmasi pembayaran dilakukan, pencairan dana biasanya memakan waktu 5-10 menit ke rekening yang terdaftar.";
      tips = "Pastikan nama pemilik rekening yang Anda daftarkan sama persis dengan nama di KTP. Perbedaan nama akan menyebabkan pencairan tertunda atau gagal.";
    } else {
      balasan = "Terima kasih atas pesan Anda. Mohon maaf, bot kami belum memahami pertanyaan tersebut. Silakan pilih nomor 1-5 dari menu di atas, atau hubungi customer service kami.";
      tips = "Anda dapat mengetik angka 1 sampai 5 pada kolom chat untuk mendapatkan jawaban cepat seputar layanan kami.";
    }

    const pesanHTML = `
      <div class="chat-message bot">
        <div class="chat-avatar">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2eb85c" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
        </div>
        <div class="chat-bubble">
          <div class="chat-sender">Layanan Online - PinjamVercel</div>
          <p>${balasan}</p>
          
          <div style="margin-top: 10px; padding: 10px; background-color: #fff8e1; border-left: 4px solid #ffca28; border-radius: 4px; font-size: 12px; color: #555;">
            <b style="color: #e65100; display: block; margin-bottom: 3px;">💡 Tips:</b>
            ${tips}
          </div>
        </div>
      </div>
    `;
    
    chatContainer.insertAdjacentHTML('beforeend', pesanHTML);
    scrollChatKeBawah();
    isBotTyping = false;
  }, 1500);
}

// ==========================================
// LOGIKA REFERRAL, SALDO & TARIK SALDO
// ==========================================

// Generate Kode Referral Unik (Simulasi)
function generateKodeReferral(email) {
  let prefix = email.substring(0, 4).toUpperCase();
  let randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${randomNum}`;
}

// Memuat Data Saldo & Referral Saat Halaman Profil Dibuka
window.muatDataProfil = async function() {
  if (!currentUser) return;

  try {
    const docSnap = await getDoc(doc(db, "users", currentUser));
    if (docSnap.exists()) {
      let dataUser = docSnap.data();
      
      // 1. Generate Kode Referral jika belum ada
      let kodeRef = dataUser.referralCode;
      if (!kodeRef) {
        kodeRef = generateKodeReferral(currentUser);
        await updateDoc(doc(db, "users", currentUser), { referralCode: kodeRef, saldo: 0, riwayatUndangan: [] });
      }

      // Tampilkan Kode Referral
      document.getElementById('kode-referral-user').innerText = kodeRef;

      // 2. Tampilkan Saldo
      let saldo = dataUser.saldo || 0;
      document.getElementById('profil-saldo').innerText = `Rp${saldo.toLocaleString('id-ID')}`;
      document.getElementById('saldo-tersedia').innerText = `Rp${saldo.toLocaleString('id-ID')}`;
      document.getElementById('saldo-tarik-tampil').innerText = `Rp${saldo.toLocaleString('id-ID')}`;

      // 3. Render Riwayat Undangan
      let riwayatList = document.getElementById('riwayat-undangan-list');
      if (dataUser.riwayatUndangan && dataUser.riwayatUndangan.length > 0) {
        riwayatList.innerHTML = '';
        dataUser.riwayatUndangan.forEach(item => {
          riwayatList.innerHTML += `
            <div style="background: white; padding: 15px; border-radius: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <p style="font-size: 14px; font-weight: bold; color: #111;">${item.email}</p>
                <p style="font-size: 12px; color: #888;">${item.tanggal}</p>
              </div>
              <div style="color: #2eb85c; font-weight: bold; font-size: 14px;">+ Rp20.000</div>
            </div>
          `;
        });
      } else {
        riwayatList.innerHTML = `<div style="text-align: center; padding: 20px; color: #888; font-size: 13px;">Belum ada riwayat undangan.</div>`;
      }
    }
  } catch (error) {
    console.error("Gagal memuat data profil:", error);
  }
};

// Fungsi Salin Kode
window.salinKodeReferral = function() {
  let kode = document.getElementById('kode-referral-user').innerText;
  navigator.clipboard.writeText(kode).then(() => {
    showModal("Berhasil", "Kode Referral berhasil disalin!", "success");
  });
};

// Fungsi Pakai Kode Undangan
window.gunakanKodeUndangan = async function() {
  let kodeInput = document.getElementById('input-kode-undangan').value.toUpperCase();
  
  if (!kodeInput) {
    showModal("Perhatian", "Masukkan kode undangan terlebih dahulu.", "warning"); return;
  }

  if (localStorage.getItem('pinjamvercel_used_referral') === 'true') {
    showModal("Gagal", "Setiap IP hanya dapat menggunakan 1 kode undangan.", "error"); return;
  }

  try {
    let kodeSendiri = document.getElementById('kode-referral-user').innerText;
    if (kodeInput === kodeSendiri) {
      showModal("Gagal", "Anda tidak bisa menggunakan kode undangan sendiri.", "error"); return;
    }

    // Simulasi berhasil
    localStorage.setItem('pinjamvercel_used_referral', 'true');
    showModal("Berhasil", "Kode undangan berhasil digunakan! Anda akan mendapatkan bonus.", "success");
    
  } catch (error) {
    showModal("Error", "Terjadi kesalahan: " + error.message, "error");
  }
};

// Fungsi Tarik Saldo
window.prosesTarikSaldo = async function() {
  if (!currentUser) return;

  let saldoText = document.getElementById('saldo-tarik-tampil').innerText;
  let saldoAngka = parseInt(saldoText.replace(/[^0-9]/g, ''));

  if (saldoAngka < 200000) {
    showModal("Saldo Tidak Cukup", "Minimal Tarik Saldo adalah Rp200.000. Saldo Anda saat ini belum mencukupi.", "warning");
    return;
  }

  try {
    const docSnap = await getDoc(doc(db, "users", currentUser));
    if (docSnap.exists()) {
      let dataUser = docSnap.data();
      
      if (!dataUser.rekeningData) {
        showModal("Perhatian", "Silakan tambahkan Rekening terlebih dahulu sebelum menarik saldo.", "warning");
        switchPage('rekening');
      } else {
        switchPage('verifikasi-tarik');
      }
    }
  } catch (error) {
    showModal("Error", "Terjadi kesalahan sistem: " + error.message, "error");
  }
};

// ==========================================
// INIT SELECT2 SAAT HALAMAN DIMUAT
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
  updateTombolDashboard();
  
  if (window.jQuery && $.fn.select2) {
    $('select').select2({
      placeholder: "Pilih opsi...",
      allowClear: true,
      width: '100%'
    });
  }
});