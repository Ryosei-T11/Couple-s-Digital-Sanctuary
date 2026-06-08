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
    ]
};

// 3. FUNGSI UNTUK MENYIMPAN DATA SECARA SINKRON KE CLOUD
function saveToLocalStorage() {
    database.ref('lovebook_shared_state').set(appState)
    .then(() => {
        console.log("Data berhasil disinkronkan ke Cloud secara Real-Time!");
    })
    .catch((error) => {
        console.error("Gagal melakukan sinkronisasi: ", error);
    });
}

// 4. MENDENGARKAN PERUBAHAN CLOUD DENGAN SMART MIGRATION
database.ref('lovebook_shared_state').on('value', (snapshot) => {
    try {
        let cloudData = snapshot.val();
        if (cloudData) {
            // NORMALISASI AMAN: Menjamin setiap array wajib ada (tidak boleh undefined)
            cloudData.settings = cloudData.settings || appState.settings;
            cloudData.timeline = Array.isArray(cloudData.timeline) ? cloudData.timeline : [];
            cloudData.scrapbook = Array.isArray(cloudData.scrapbook) ? cloudData.scrapbook : [];
            cloudData.voiceNotes = Array.isArray(cloudData.voiceNotes) ? cloudData.voiceNotes : [];
            cloudData.bucketList = Array.isArray(cloudData.bucketList) ? cloudData.bucketList : [];
            cloudData.capsuleLetters = Array.isArray(cloudData.capsuleLetters) ? cloudData.capsuleLetters : [];
            cloudData.calendarEvents = Array.isArray(cloudData.calendarEvents) ? cloudData.calendarEvents : [];
            cloudData.microMessages = Array.isArray(cloudData.microMessages) ? cloudData.microMessages : [];
            
            appState = cloudData;
            
            // Backup cadangan ke localStorage lokal sebagai antisipasi jika offline
            localStorage.setItem('digital_lovebook_state', JSON.stringify(appState));
            
            // Render ulang dashboard setelah data terisi aman
            const isUnlocked = localStorage.getItem('lovebook_unlocked') === 'true';
            if (isUnlocked && typeof initMainDashboard === 'function') {
                initMainDashboard();
            }
        } else {
            // PROSES MIGRASI PINTAR:
            // Jika database cloud kosong, cek dulu apakah laptop/HP Anda punya data lama di localStorage
            const localBackup = localStorage.getItem('digital_lovebook_state');
            if (localBackup) {
                console.log("Menemukan data lama di browser ini! Mengimpor & mengunggah ke Firebase...");
                try {
                    const parsedBackup = JSON.parse(localBackup);
                    // Validasi agar data yang diimpor memiliki format yang benar
                    if (parsedBackup && typeof parsedBackup === 'object') {
                        appState = parsedBackup;
                        saveToLocalStorage(); // Kirim data lama Anda ke Firebase Cloud!
                        return;
                    }
                } catch (e) {
                    console.error("Gagal membaca backup data lokal:", e);
                }
            }
            
            // Jika di browser lokal juga benar-benar kosong, baru kirim data default bawaan
            saveToLocalStorage();
        }
    } catch (error) {
        console.error("Error saat memproses data Firebase:", error);
    }
}, (error) => {
    console.error("Firebase read failed: ", error);
});
