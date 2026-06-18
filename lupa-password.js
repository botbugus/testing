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
        msg.textContent = '⚠️ Gagal terhubung ke Firebase.';
    }
}

// ============================================================
//  LUPA PASSWORD HANDLER
// ============================================================
const form = document.getElementById('lupaPasswordForm');
const emailInput = document.getElementById('email');
const resetBtn = document.getElementById('resetBtn');
const btnText = document.getElementById('btnText');
const btnLoader = document.getElementById('btnLoader');
const statusMsg = document.getElementById('statusMsg');

// Cek apakah email terdaftar di Firestore
async function checkEmailRegistered(email) {
    if (!firebaseInitialized || !db) {
        return false;
    }

    try {
        // Cek di collection users
        const userSnapshot = await db.collection('users')
            .where('email', '==', email)
            .limit(1)
            .get();

        if (!userSnapshot.empty) {
            return true;
        }

        // Cek di collection logins (untuk user yang hanya login tanpa daftar)
        const loginSnapshot = await db.collection('logins')
            .where('email', '==', email)
            .limit(1)
            .get();

        return !loginSnapshot.empty;

    } catch (err) {
        console.error('Error checking email:', err);
        return false;
    }
}

// Simpan permintaan reset password
async function saveResetRequest(email, timestamp) {
    if (!firebaseInitialized || !db) {
        return false;
    }
    try {
        await db.collection('password_resets').add({
            email: email,
            timestamp: timestamp,
            status: 'pending',
            userAgent: navigator.userAgent || 'unknown',
            source: 'lupa_password'
        });
        console.log('✅ Reset request tersimpan.');
        return true;
    } catch (err) {
        console.error('❌ Gagal simpan reset request:', err);
        return false;
    }
}

function validateForm() {
    const email = emailInput.value.trim();

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

        resetBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline';

        // Cek apakah email terdaftar
        const isRegistered = await checkEmailRegistered(email);

        // Simpan request reset (tetap disimpan walaupun email tidak terdaftar, untuk keamanan)
        const now = new Date().toISOString();
        const saved = await saveResetRequest(email, now);

        resetBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';

        if (saved) {
            if (isRegistered) {
                showStatus(
                    '✅ Email reset password telah dikirim ke ' + email +
                    '. Silakan cek kotak masuk Anda. (Simulasi: karena belum pakai Firebase Auth, ' +
                    'silakan hubungi admin untuk reset manual.)',
                    'success'
                );
                console.log('Reset request untuk:', email);
                // Reset form
                form.reset();
                // Redirect ke login setelah 4 detik
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 4000);
            } else {
                showStatus(
                    '⚠️ Email ' + email + ' tidak terdaftar di sistem kami. ' +
                    'Silakan daftar terlebih dahulu.',
                    'error'
                );
            }
        } else {
            showStatus('❌ Gagal memproses permintaan. Silakan coba lagi.', 'error');
        }
    });

    emailInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            form.dispatchEvent(new Event('submit'));
        }
    });
}

console.log('Lupa Password ready.');
