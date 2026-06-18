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
    document.getElementById('statusMsg').textContent = '⚠️ Gagal terhubung ke Firebase.';
}

// ============================================================
//  DASHBOARD LOGIC
// ============================================================
let allData = [];
let currentFilter = 'all';

// Ambil parameter dari URL (email user yang login)
function getEmailFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('email') || 'admin@email.com';
}

const currentEmail = getEmailFromURL();

// Tampilkan email di header
document.getElementById('userEmail').textContent = currentEmail;

// Logout
document.getElementById('logoutBtn').addEventListener('click', function() {
    if (confirm('Yakin ingin keluar?')) {
        window.location.href = 'index.html';
    }
});

// Refresh
document.getElementById('refreshBtn').addEventListener('click', function() {
    loadData();
});

// Filter
document.getElementById('filterSelect').addEventListener('change', function(e) {
    currentFilter = e.target.value;
    renderTable();
});

// Load data dari Firestore
async function loadData() {
    if (!firebaseInitialized || !db) {
        showStatus('Firebase tidak terhubung.', 'error');
        return;
    }

    showStatus('Loading data...', 'info');

    try {
        // Ambil data dari collection logins
        const loginSnapshot = await db.collection('logins')
            .orderBy('timestamp', 'desc')
            .get();

        const loginData = [];
        loginSnapshot.forEach(doc => {
            loginData.push({
                id: doc.id,
                ...doc.data(),
                type: 'login'
            });
        });

        // Ambil data dari collection users (registrasi)
        const userSnapshot = await db.collection('users')
            .orderBy('timestamp', 'desc')
            .get();

        const userData = [];
        userSnapshot.forEach(doc => {
            userData.push({
                id: doc.id,
                ...doc.data(),
                type: 'register'
            });
        });

        // Gabungkan dan urutkan berdasarkan timestamp
        allData = [...loginData, ...userData].sort((a, b) => {
            return new Date(b.timestamp) - new Date(a.timestamp);
        });

        updateStats();
        renderTable();
        showStatus(`✅ ${allData.length} data ditemukan.`, 'success');

    } catch (err) {
        console.error('Gagal load data:', err);
        showStatus('❌ Gagal memuat data.', 'error');
    }
}

// Update statistik
function updateStats() {
    const total = allData.length;
    const loginCount = allData.filter(d => d.type === 'login').length;
    const registerCount = allData.filter(d => d.type === 'register').length;

    document.getElementById('totalCount').textContent = total;
    document.getElementById('loginCount').textContent = loginCount;
    document.getElementById('registerCount').textContent = registerCount;
}

// Render tabel
function renderTable() {
    const tbody = document.getElementById('tableBody');
    let filteredData = allData;

    if (currentFilter === 'login') {
        filteredData = allData.filter(d => d.type === 'login');
    } else if (currentFilter === 'register') {
        filteredData = allData.filter(d => d.type === 'register');
    }

    if (filteredData.length === 0) {
        tbody.innerHTML = `
            <tr class="empty-row">
                <td colspan="4">Belum ada data.</td>
            </tr>
        `;
        return;
    }

    let html = '';
    filteredData.forEach(item => {
        const typeLabel = item.type === 'login' ? '🔐 Login' : '📝 Daftar';
        const email = item.email || '-';
        const nama = item.nama || '-';
        const time = item.timestamp ? new Date(item.timestamp).toLocaleString('id-ID') : '-';
        const source = item.source || 'web';

        html += `
            <tr>
                <td>${typeLabel}</td>
                <td>${email}</td>
                <td>${nama}</td>
                <td>${time}</td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

function showStatus(msg, type = 'info') {
    const statusEl = document.getElementById('statusMsg');
    statusEl.textContent = msg;
    statusEl.className = 'status-msg show ' + type;
    if (type === 'info') {
        statusEl.style.display = 'block';
        setTimeout(() => {
            statusEl.style.display = 'none';
        }, 3000);
    }
}

// ============================================================
//  CEK KONEKSI & LOAD DATA
// ============================================================
if (firebaseInitialized && db) {
    db.collection('logins').limit(1).get()
        .then(() => {
            console.log('✅ Firestore read test OK');
            loadData();
        })
        .catch(err => {
            console.warn('⚠️ Firestore read test gagal:', err);
            loadData(); // tetap coba load
        });
} else {
    document.getElementById('statusMsg').textContent = '⚠️ Firebase tidak terhubung.';
}

console.log('Dashboard ready.');
