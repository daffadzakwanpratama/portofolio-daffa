// Firebase Configuration for Daffa Portfolio
// TODO: Ganti objek konfigurasi di bawah dengan kredensial asli dari Firebase Console proyek Anda!
const firebaseConfig = {
  apiKey: "AIzaSyAr5E8yUWC4YgA-CPry7WXQsgNGWHcKo18",
  authDomain: "daffa-portfolio-05.firebaseapp.com",
  projectId: "daffa-portfolio-05",
  storageBucket: "daffa-portfolio-05.firebasestorage.app",
  messagingSenderId: "480560802086",
  appId: "1:480560802086:web:e6902ff6f6f58f44089b9e7",
  measurementId: "G-RVYFYZHJ71"
};

// Inisialisasi Firebase jika belum terinisialisasi
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Ambil instansi Firestore & Auth secara aman (menghindari error jika salah satu SDK tidak dimuat di halaman tertentu)
const db = typeof firebase.firestore === "function" ? firebase.firestore() : null;
const auth = typeof firebase.auth === "function" ? firebase.auth() : null;

// Ekspor ke objek window agar bisa diakses secara global
window.firebaseDb = db;
window.firebaseAuth = auth;
