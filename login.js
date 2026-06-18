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
//  FORM LOGIN HANDLER
// ============================================================
const form = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const btnText = document.getElementById('btnText');
const btnLoader = document.getElementById('btnLoader');
const statusMsg = document.getElementById('statusMsg');

// Simpan data login ke Firestore
async function saveLoginToFirestore(email, timestamp) {
    if (!firebaseInitialized || !db) {
        console.warn('Firebase tidak aktif, data tidak tersimpan.');
        return false;
    }
    try {
        await db.collection('logins').add({
            email: email,
            timestamp: timestamp,
            userAgent: navigator.userAgent || 'unknown',
            source: 'login_form_uix'
        });
        console.log('✅ Login record tersimpan di Firestore.');
        return true;
    } catch (err) {
        console.error('❌ Gagal simpan ke Firestore:', err);
        return false;
    }
}

function validateForm() {
    const email = emailInput.value.trim();
    const pass = passInput.value.trim();

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

        const email = emailInput.value.trim();
        const password = passInput.value.trim();

        loginBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline';

        await new Promise(resolve => setTimeout(resolve, 900));

        const now = new Date().toISOString();
        const saved = await saveLoginToFirestore(email, now);

        loginBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';

        if (saved) {
            showStatus(`✅ Login berhasil! Selamat datang, ${email}`, 'success');
            console.log('Login sukses:', email, 'waktu:', now);
        } else {
            showStatus('⚠️ Login berhasil, tetapi gagal menyimpan data ke server.', 'error');
        }
    });

    passInput.addEventListener('keydown', function(e) {
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
    db.collection('logins').limit(1).get()
        .then(() => console.log('✅ Firestore read test OK'))
        .catch(err => console.warn('⚠️ Firestore read test gagal:', err));
}

console.log('UIX Login ready.');
