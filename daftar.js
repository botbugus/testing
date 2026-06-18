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
        msg.textContent = '⚠️ Gagal terhubung ke Firebase.';
    }
}

// ============================================================
//  FORM REGISTRASI HANDLER (dengan Firebase Auth)
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
async function saveRegistrationToFirestore(nama, email, timestamp, uid) {
    if (!firebaseInitialized || !db) {
        console.warn('Firebase tidak aktif, data tidak tersimpan.');
        return false;
    }
    try {
        await db.collection('users').add({
            nama: nama,
            email: email,
            timestamp: timestamp,
            uid: uid || 'unknown',
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

// Submit handler dengan Firebase Auth
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

        try {
            // 🔐 REGISTRASI DENGAN FIREBASE AUTH
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Update profil dengan nama
            await user.updateProfile({
                displayName: nama
            });

            console.log('✅ Registrasi sukses:', user.email, 'UID:', user.uid);

            // Simpan data registrasi ke Firestore
            const now = new Date().toISOString();
            await saveRegistrationToFirestore(nama, email, now, user.uid);

            showStatus(`✅ Registrasi berhasil! Selamat datang, ${nama}`, 'success');
            console.log('Registrasi sukses:', email, 'waktu:', now);

            // Reset form
            form.reset();

            // Redirect ke login setelah 2 detik
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);

        } catch (error) {
            console.error('❌ Registrasi gagal:', error);

            let errorMessage = 'Registrasi gagal. ';
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage += 'Email sudah terdaftar. Silakan login.';
                    break;
                case 'auth/invalid-email':
                    errorMessage += 'Format email tidak valid.';
                    break;
                case 'auth/weak-password':
                    errorMessage += 'Password terlalu lemah. Gunakan minimal 6 karakter.';
                    break;
                default:
                    errorMessage += error.message;
            }
            showStatus('❌ ' + errorMessage, 'error');
        }

        daftarBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    });

    confirmPassInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            form.dispatchEvent(new Event('submit'));
        }
    });
}

console.log('UIX Register with Firebase Auth ready.');
