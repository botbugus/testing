// === KONFIGURASI SUPABASE ===
const SUPABASE_URL = "https://bszlxczgnutryoasbhrs.supabase.co";
const SUPABASE_KUNCI = "sb_publishable_v5HNDQeM95t9MPN_9erx4w_D18rbrfc";
// =============================

const { createClient } = supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_KUNCI);

const formLogin = document.getElementById("formLogin");
const pesanEl = document.getElementById("pesan");
const linkDaftar = document.getElementById("linkDaftar");

formLogin.addEventListener("submit", async (e) => {
  e.preventDefault();
  pesanEl.textContent = "";

  const email = document.getElementById("email").value.trim();
  const sandi = document.getElementById("sandi").value;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: sandi
    });

    if (error) throw error;

    pesanEl.style.color = "#16a34a";
    pesanEl.textContent = "✅ Berhasil masuk! Mengalihkan...";
    
    setTimeout(() => {
      window.location.href = "/beranda.html";
    }, 1200);

  } catch (err) {
    pesanEl.style.color = "#dc2626";
    pesanEl.textContent = "❌ " + err.message;
  }
});

linkDaftar.addEventListener("click", (e) => {
  e.preventDefault();
  alert("Silakan buat akun dulu di menu Autentikasi → Pengguna di dashboard Supabase.");
});
