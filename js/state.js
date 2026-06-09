// 1. HUBUNGKAN KE DATABASE CLOUD FIREBASE ANDA
// Tempelkan URL Database Realtime Anda di bawah ini
const firebaseConfig = {
    databaseURL: "https://couple-s-digital-sanctuary-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// Inisialisasi Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// Database lokal awal website cinta
let appState = {
    unlocked: false,
    settings: {
        myName: 'Pembuat',
        myCity: 'Jakarta',
        myTimezone: 'Asia/Jakarta',
        partnerName: 'Pasangan',
        partnerCity: 'Tokyo',
        partnerTimezone: 'Asia/Tokyo',
        anniversaryDate: '2025-10-25',
        secretQuestion: 'Di mana lokasi kencan pertama kita?',
        secretAnswer: 'taman'
    },
    myMoodEmoji: '🥰',
    myMoodTitle: 'Sangat Bahagia',
    myMoodNote: 'Bahagia banget hari ini karena mikirin kamu terus!',
    partnerMoodEmoji: '😴',
    partnerMoodTitle: 'Sedikit Lelah',
    partnerMoodNote: 'Baru selesai kelas/kerja padat, butuh pelukan jauh.',
    timeline: [
        { id: 1, title: 'Pertama Kali Bertemu', date: '2023-05-15', desc: 'Pertemuan tak disengaja di perpustakaan kampus. Kamu tersenyum, dan duniaku langsung berubah.', color: 'rose' },
        { id: 2, title: 'Kencan Pertama', date: '2023-06-10', desc: 'Nonton bioskop, makan es krim, dan kita sama-sama malu-malu untuk memegang tangan masing-masing.', color: 'pink' },
        { id: 3, title: 'Kita Resmi Jadian! ❤️', date: '2023-10-12', desc: 'Di bawah jembatan kota malam hari, kamu akhirnya menerima cintaku. Momen terindah sepanjang hidupku!', color: 'emerald' }
    ],
    scrapbook: [
        { id: 1, img: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600', caption: 'Kencan pertama di pinggir danau kota kita yang super romantis.', location: 'Jakarta, Indonesia' },
        { id: 2, img: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=600', caption: 'Tertawa lepas saat kamu mencoreti hidungku dengan krim kue.', location: 'Bandung, Indonesia' }
    ],
    voiceNotes: [],
    bucketList: [
        { id: 1, title: 'Liburan bersama ke Bali', category: 'Destinasi', completed: true },
        { id: 2, title: 'Menyaksikan konser band favorit berdua', category: 'Aktivitas', completed: false },
        { id: 3, title: 'Memasak makan malam romantis lengkap 3 kursus', category: 'Makanan', completed: false },
        { id: 4, title: 'Belajar bahasa Jepang bareng sebelum ke Tokyo', category: 'Pencapaian', completed: false }
    ],
    capsuleLetters: [
        { id: 1, target: 'Sayangku', unlockDate: '2027-01-01', content: 'Hei Sayang! Jika kamu membaca ini, itu tandanya kita sudah melewati bertahun-tahun penuh rintangan bersama. Terima kasih karena selalu berada di sisiku. Aku mencintaimu, dulu, sekarang, dan selamanya.', unlocked: false }
    ],
    calendarEvents: [
        { id: 1, title: 'Kencan Virtual Weekend', date: '2026-06-15', desc: 'Pukul 20.00 WIB, nonton bareng & makan pizza' },
        { id: 2, title: 'Anniversary Hubungan Kita', date: '2026-10-25', desc: 'Siapkan kejutan manis!' }
    ],
    microMessages: [
        'Aku sangat bersyukur memilikimu di hidupku.',
        'Jangan lupa makan ya sayang, aku tidak mau kamu jatuh sakit!',
        'Suara tawamu adalah lagu favoritku di dunia.',
        'Pelukan jauh untuk pacarku yang hebat!',
        'Aku mencintaimu lebih dari kemarin, tapi tak sebanyak besok.'
    ],
    watchParty: {
        active: false,
        url: '',
        currentTime: 0,
        isPlaying: false,
        lastUpdated: 0
    }
};

// Deteksi otomatis zona waktu awal agar tidak kosong
try {
    const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (localTz) {
        appState.settings.myTimezone = localTz;
    }
} catch (e) {
    console.log("Deteksi otomatis zona waktu gagal, menggunakan default.");
}

// Fungsi pembantu untuk mendeteksi apakah data konfigurasi masih bersifat bawaan/default
function isDefaultSettings(settings) {
    if (!settings) return true;
    return settings.myName === 'Pembuat' && 
           settings.partnerName === 'Pasangan' && 
           settings.myCity === 'Jakarta' && 
           settings.partnerCity === 'Tokyo';
}

// 3. FUNGSI UNTUK MENYIMPAN DATA SECARA SINKRON KE CLOUD
function saveToLocalStorage() {
    database.ref('lovebook_shared_state').set(appState)
    .then(() => {
        console.log("Data berhasil disinkronkan ke Cloud secara Real-Time!");
    })
    .catch((error) => {
        console.error("Gagal melakukan sinkronisasi ke Firebase: ", error);
    });
}

// 4. MENDENGARKAN PERUBAHAN CLOUD DENGAN SMART CONFLICT RESOLUTION & AUTO-LOGOUT
database.ref('lovebook_shared_state').on('value', (snapshot) => {
    try {
        let cloudData = snapshot.val();
        
        // Ambil cadangan dari localStorage jika ada di browser ini
        const localBackupStr = localStorage.getItem('digital_lovebook_state');
        let localBackup = null;
        if (localBackupStr) {
            try {
                localBackup = JSON.parse(localBackupStr);
            } catch (e) {
                console.error("Gagal membaca backup lokal:", e);
            }
        }

        if (cloudData) {
            // JALUR PENYELAMATAN DATA (AUTO-RESTORE):
            // Jika data di cloud terdeteksi kembali ke bawaan (default), tetapi browser lokal ini masih
            // memiliki data kustom asli milik Anda, pulihkan data kustom tersebut kembali ke Firebase secara otomatis!
            if (localBackup && localBackup.settings && !isDefaultSettings(localBackup.settings)) {
                if (isDefaultSettings(cloudData.settings)) {
                    console.warn("⚠️ Konflik Terdeteksi: Cloud kembali default, tetapi browser lokal memiliki data kustom.");
                    console.log("🔄 Memulihkan data kustom Anda dari browser ini kembali ke Firebase...");
                    appState = localBackup;
                    saveToLocalStorage(); // Unggah ulang data Anda untuk menyelamatkan database!
                    return;
                }
            }

            // ==========================================
            // LOGIKA UTAMA AUTO-LOGOUT SECARA REAL-TIME
            // ==========================================
            const localSessionUnlocked = localStorage.getItem('lovebook_unlocked') === 'true';
            const localLastAnswer = localStorage.getItem('last_active_answer');
            const cloudAnswer = cloudData.settings.secretAnswer ? cloudData.settings.secretAnswer.toLowerCase() : '';

            // Jika browser sedang dalam kondisi login, namun kunci di cloud ternyata berbeda dengan kunci lokal perangkat
            if (localSessionUnlocked && localLastAnswer && localLastAnswer !== cloudAnswer) {
                console.warn("🔒 Kunci keamanan telah diubah dari perangkat lain! Mengeluarkan paksa perangkat...");
                
                // Reset status login lokal di browser ini
                localStorage.setItem('lovebook_unlocked', 'false');
                localStorage.removeItem('last_active_answer');
                
                // Segera muat ulang halaman untuk menampilkan kunci pengaman baru secara paksa
                location.reload();
                return;
            }

            // NORMALISASI AMAN: Menjamin setiap properti wajib ada (mencegah crash)
            cloudData.settings = cloudData.settings || appState.settings;
            cloudData.timeline = Array.isArray(cloudData.timeline) ? cloudData.timeline : [];
            cloudData.scrapbook = Array.isArray(cloudData.scrapbook) ? cloudData.scrapbook : [];
            cloudData.voiceNotes = Array.isArray(cloudData.voiceNotes) ? cloudData.voiceNotes : [];
            cloudData.bucketList = Array.isArray(cloudData.bucketList) ? cloudData.bucketList : [];
            cloudData.capsuleLetters = Array.isArray(cloudData.capsuleLetters) ? cloudData.capsuleLetters : [];
            cloudData.calendarEvents = Array.isArray(cloudData.calendarEvents) ? cloudData.calendarEvents : [];
            cloudData.microMessages = Array.isArray(cloudData.microMessages) ? cloudData.microMessages : [];
            cloudData.watchParty = cloudData.watchParty || {url: '', status: 'idle' };

             // Mengisi nilai mood default jika belum ada di cloud
            cloudData.myMoodEmoji = cloudData.myMoodEmoji || appState.myMoodEmoji;
            cloudData.myMoodTitle = cloudData.myMoodTitle || appState.myMoodTitle;
            cloudData.myMoodNote = cloudData.myMoodNote || appState.myMoodNote;
            cloudData.partnerMoodEmoji = cloudData.partnerMoodEmoji || appState.partnerMoodEmoji;
            cloudData.partnerMoodTitle = cloudData.partnerMoodTitle || appState.partnerMoodTitle;
            cloudData.partnerMoodNote = cloudData.partnerMoodNote || appState.partnerMoodNote;
            
            appState = cloudData;
            
            // Perbarui UI Lock Screen jika elemennya sudah dimuat di DOM
            const lockQ = document.getElementById('lock-screen-question');
            const lockHint = document.getElementById('hint-answer-placeholder');
            if (lockQ) lockQ.innerText = `"${appState.settings.secretQuestion}"`;
            if (lockHint) lockHint.innerText = appState.settings.secretAnswer;

            if (typeof injectIdentitySelector === 'function') {
                injectIdentitySelector();
            }

            // Simpan cadangan aman ke penyimpanan lokal browser saat ini
            localStorage.setItem('digital_lovebook_state', JSON.stringify(appState));
            
            // Render ulang dashboard setelah data terisi aman
            // (Mengecek status login langsung dari localStorage tanpa deklarasi ulang variabel "isUnlocked")
            if (localStorage.getItem('lovebook_unlocked') === 'true' && typeof initMainDashboard === 'function') {
                initMainDashboard();
            }
        } else {
            // JIKA DATABASE CLOUD BENAR-BENAR KOSONG:
            if (localBackup) {
                console.log("Database cloud kosong. Mengimpor data cadangan dari browser ini...");
                appState = localBackup;
                saveToLocalStorage();
            } else {
                console.log("Database cloud kosong & tidak ada backup lokal. Menggunakan state default awal.");
            }
        }
    } catch (error) {
        console.error("Error saat memproses data Firebase:", error);
    }
}, (error) => {
    console.error("Firebase read failed: ", error);
});
