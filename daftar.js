// ============================================================
//  FIREBASE KONFIGURASI
// ============================================================
const firebaseConfig = {
    apiKey: "AIzaSyDnBXxA1OB5ycvZconZZsAyLJOPMmjeh2Y",
    authDomain: "fireassist-x6z4a.firebaseapp.com",
    databaseURL: "https://fireassist-x6z4a-default-rtdb.firebaseio.com",
    projectId: "fireassist-x6z4a",
    storageBucket: "fireassist-x6z4a.firebasestorage.app",
    messagingSenderId: "63835497426",
    appId: "1:63835497426:web:49356023d59f9514cfde0b"
};

// Inisialisasi Firebase
let db;
let firebaseInitialized = false;

try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    firebase.firestore().enablePersistence()
        .then(() => console.log('✅ Firestore persistence enabled'))
        .catch(err => console.warn('Persistence error:', err));
    firebaseInitialized = true;
    console.log('✅ Firebase terhubung.');
} catch (err) {
    console.error('❌ Firebase init error:', err);
    const msg = document.getElementById('statusMsg');
    if (msg) {
        msg.className = 'status-msg show error';
        msg.textContent = '⚠️ Gagal terhubung ke Firebase. Periksa konfigurasi.';
    }
}

// ============================================================
//  FORM REGISTRASI HANDLER
// ============================================================
const form = document.getElementById('daftarForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passInput = document.getElementById('password');
const confirmPassInput = document.getElementById('confirmPassword');
const daftarBtn = document.getElementById('daftarBtn');
const btnText = document.getElementById('btnText');
const btnLoader = document.getElementById('btnLoader');
const statusMsg = document.getElementById('statusMsg');

// Simpan data registrasi ke Firestore
async function saveRegistrationToFirestore(nama, email, timestamp) {
    if (!firebaseInitialized || !db) {
        console.warn('Firebase tidak aktif, data tidak tersimpan.');
        return false;
    }
    try {
        await db.collection('users').add({
            nama: nama,
            email: email,
            timestamp: timestamp,
            userAgent: navigator.userAgent || 'unknown',
            source: 'register_form_uix'
        });
        console.log('✅ Registrasi record tersimpan di Firestore.');
        return true;
    } catch (err) {
        console.error('❌ Gagal simpan ke Firestore:', err);
        return false;
    }
}

function validateForm() {
    const nama = nameInput.value.trim();
    const email = emailInput.value.trim();
    const pass = passInput.value.trim();
    const confirmPass = confirmPassInput.value.trim();

    if (!nama || nama.length < 2) {
        showStatus('Nama minimal 2 karakter.', 'error');
        nameInput.focus();
        return false;
    }

    if (!email) {
        showStatus('Masukkan alamat email.', 'error');
        emailInput.focus();
        return false;
    }
    if (!email.includes('@') || !email.includes('.')) {
        showStatus('Format email tidak valid.', 'error');
        emailInput.focus();
        return false;
    }

    if (!pass || pass.length < 6) {
        showStatus('Password minimal 6 karakter.', 'error');
        passInput.focus();
        return false;
    }

    if (pass !== confirmPass) {
        showStatus('Password dan konfirmasi password tidak sama.', 'error');
        confirmPassInput.focus();
        return false;
    }

    return true;
}

function showStatus(msg, type = 'info') {
    statusMsg.textContent = msg;
    statusMsg.className = 'status-msg show ' + type;
}

function hideStatus() {
    statusMsg.className = 'status-msg';
    statusMsg.textContent = '';
}

// Submit handler
if (form) {
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        hideStatus();

        if (!validateForm()) return;

        const nama = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passInput.value.trim();

        daftarBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline';

        await new Promise(resolve => setTimeout(resolve, 900));

        const now = new Date().toISOString();
        const saved = await saveRegistrationToFirestore(nama, email, now);

        daftarBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';

        if (saved) {
            showStatus(`✅ Registrasi berhasil! Selamat datang, ${nama}`, 'success');
            console.log('Registrasi sukses:', email, 'waktu:', now);
            // Reset form
            form.reset();
            // Redirect ke login setelah 2 detik
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            showStatus('⚠️ Registrasi berhasil, tetapi gagal menyimpan data ke server.', 'error');
        }
    });

    confirmPassInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            form.dispatchEvent(new Event('submit'));
        }
    });
}

// ============================================================
//  CEK KONEKSI FIREBASE
// ============================================================
if (firebaseInitialized && db) {
    db.collection('users').limit(1).get()
        .then(() => console.log('✅ Firestore read test OK'))
        .catch(err => console.warn('⚠️ Firestore read test gagal:', err));
}

console.log('UIX Register ready.');
