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
let auth;
let firebaseInitialized = false;

try {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    firebaseInitialized = true;
    console.log('✅ Firebase Auth terhubung.');
} catch (err) {
    console.error('❌ Firebase init error:', err);
    const msg = document.getElementById('statusMsg');
    if (msg) {
        msg.className = 'status-msg show error';
        msg.textContent = '⚠️ Gagal terhubung ke Firebase.';
    }
}

// ============================================================
//  LUPA PASSWORD HANDLER — REAL dengan Firebase Auth
// ============================================================
const form = document.getElementById('lupaPasswordForm');
const emailInput = document.getElementById('email');
const resetBtn = document.getElementById('resetBtn');
const btnText = document.getElementById('btnText');
const btnLoader = document.getElementById('btnLoader');
const statusMsg = document.getElementById('statusMsg');

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

// Submit handler — KIRIM EMAIL RESET PASSWORD
if (form) {
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        hideStatus();

        if (!validateForm()) return;

        const email = emailInput.value.trim();

        // Disable button & show loader
        resetBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline';

        try {
            // 🔐 KIRIM EMAIL RESET PASSWORD VIA FIREBASE AUTH
            await auth.sendPasswordResetEmail(email);
            
            console.log('✅ Email reset dikirim ke:', email);
            showStatus(
                `✅ Email reset password telah dikirim ke <strong>${email}</strong>. ` +
                'Silakan cek kotak masuk Anda (termasuk folder spam).',
                'success'
            );
            
            // Reset form & redirect setelah 4 detik
            form.reset();
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 4000);

        } catch (error) {
            console.error('❌ Gagal kirim reset email:', error);
            
            let errorMessage = 'Gagal mengirim email reset. ';
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage += 'Email tidak terdaftar. Silakan daftar terlebih dahulu.';
                    break;
                case 'auth/invalid-email':
                    errorMessage += 'Format email tidak valid.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage += 'Terlalu banyak permintaan. Coba lagi nanti.';
                    break;
                default:
                    errorMessage += error.message;
            }
            showStatus('❌ ' + errorMessage, 'error');
        }

        // Enable button & hide loader
        resetBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    });

    emailInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            form.dispatchEvent(new Event('submit'));
        }
    });
}

console.log('Lupa Password (real) ready.');
