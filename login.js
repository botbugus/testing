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
let auth;
let firebaseInitialized = false;

try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth(); // <- TAMBAHKAN INI
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
//  FORM LOGIN HANDLER (dengan Firebase Auth)
// ============================================================
const form = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const btnText = document.getElementById('btnText');
const btnLoader = document.getElementById('btnLoader');
const statusMsg = document.getElementById('statusMsg');

// Simpan data login ke Firestore (untuk history)
async function saveLoginToFirestore(email, timestamp, uid) {
    if (!firebaseInitialized || !db) {
        console.warn('Firebase tidak aktif, data tidak tersimpan.');
        return false;
    }
    try {
        await db.collection('logins').add({
            email: email,
            timestamp: timestamp,
            uid: uid || 'unknown',
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

// Submit handler dengan Firebase Auth
if (form) {
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        hideStatus();

        if (!validateForm()) return;

        const email = emailInput.value.trim();
        const password = passInput.value.trim();

        // Disable button & show loader
        loginBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline';

        try {
            // 🔐 LOGIN DENGAN FIREBASE AUTH
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            console.log('✅ Login sukses:', user.email, 'UID:', user.uid);

            // Simpan history login ke Firestore
            const now = new Date().toISOString();
            await saveLoginToFirestore(email, now, user.uid);

            showStatus(`✅ Login berhasil! Selamat datang, ${email}`, 'success');
            
            // Redirect ke dashboard
            setTimeout(() => {
                window.location.href = `dashboard.html?email=${encodeURIComponent(email)}&uid=${user.uid}`;
            }, 1200);

        } catch (error) {
            console.error('❌ Login gagal:', error);
            
            // Handle error dari Firebase Auth
            let errorMessage = 'Login gagal. ';
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage += 'Email tidak terdaftar. Silakan daftar terlebih dahulu.';
                    break;
                case 'auth/wrong-password':
                    errorMessage += 'Password salah. Silakan coba lagi.';
                    break;
                case 'auth/invalid-email':
                    errorMessage += 'Format email tidak valid.';
                    break;
                case 'auth/user-disabled':
                    errorMessage += 'Akun ini telah dinonaktifkan.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage += 'Terlalu banyak percobaan. Coba lagi nanti.';
                    break;
                default:
                    errorMessage += error.message;
            }
            showStatus('❌ ' + errorMessage, 'error');
        }

        // Enable button & hide loader
        loginBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    });

    // Enter key handler
    passInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            form.dispatchEvent(new Event('submit'));
        }
    });
}

// ============================================================
//  CEK STATUS AUTH (jika sudah login, langsung redirect)
// ============================================================
if (auth) {
    auth.onAuthStateChanged(function(user) {
        if (user) {
            console.log('User sudah login:', user.email);
            // Jika sudah login, redirect ke dashboard
            window.location.href = `dashboard.html?email=${encodeURIComponent(user.email)}&uid=${user.uid}`;
        }
    });
}

console.log('UIX Login with Firebase Auth ready.');
