// 1. HUBUNGKAN KE DATABASE CLOUD FIREBASE ANDA
// Tempelkan URL Database Realtime Anda di bawah ini
const firebaseConfig = {
    databaseURL: "https://couple-s-digital-sanctuary-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
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
        { id: 1, title: 'Pertama Kali Bertemu', date: '2025-09-25', desc: 'Pertemuan tak disengaja.', color: 'rose' },
        { id: 2, title: 'Pertama...', date: '2025-09-30', desc: '....', color: 'pink' },
        { id: 3, title: 'Kita Resmi Jadian! ❤️', date: '2023-10-12', desc: 'Di diatas padang rumput pada sore hari.', color: 'emerald' }
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
    // Menyimpan data langsung ke Firebase agar seketika terkirim ke browser pasangan
    database.ref('lovebook_shared_state').set(appState)
    .then(() => {
        console.log("Data berhasil disinkronkan ke Cloud secara Real-Time!");
    })
    .catch((error) => {
        console.error("Gagal melakukan sinkronisasi: ", error);
    });
}

// 4. MENDENGARKAN PERUBAHAN SECARA REAL-TIME (PENTING!)
// Fungsi ini akan mendeteksi setiap kali pasangan Anda mengetik surat, mengubah mood, atau mengunggah foto
database.ref('lovebook_shared_state').on('value', (snapshot) => {
    const cloudData = snapshot.val();
    if (cloudData) {
        //
        appState.settings = {
            ...appState.settings,
            ...(cloudData.settings || {})
        };

        // Pengaman array [] agar browser tidak crash
        appState.timeline = cloudData.timeline || {};
        appState.scrapbook = cloudData.scrapbook || {};
        appState.voiceNotes = cloudData.voiceNotes || {};
        appState.bucketList = cloudData.bucketList || {};
        appState.capsuleLetters = cloudData.capsuleLetters || {};
        appState.calendarEvents = cloudData.calendarEvents || {};
        appState.microMessages = cloudData.microMessages || {};

        appState.unlocked = cloudData.unlocked !== undefined ? cloudData.unlocked : false;

        // Render ulang seluruh halaman jika user sudah berhasil melewati gerbang kunci (unlocked)
        const isUnlocked = localStorage.getItem('lovebook_unlocked') === 'true';
        if (isUnlocked && typeof initMainDashboard === 'function') {
            try {
                initMainDashboard();
            } catch (error) {
                console.error("Error initializing main dashboard: ", error);
            }
        }
    } else {
        // Jika database Cloud masih baru/kosong, unggah data default untuk pertama kali
        saveToLocalStorage();
    }
});
