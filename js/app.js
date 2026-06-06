// PEMUTAR AUDIO LATAR
const bgAudio = document.getElementById('bg-audio');
let isMusicPlaying = false;

// SIKLUS HIDUP PADA SAAT WEBSITE SELESAI DIMUAT
window.onload = function() {
    // Memuat state tersimpan dari LocalStorage jika ada
    const savedState = localStorage.getItem('digital_lovebook_state');
    if (savedState) {
        appState = JSON.parse(savedState);
    } else {
        // Melakukan deteksi otomatis zona waktu browser lokal pengakses
        try {
            const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (localTz) {
                appState.settings.myTimezone = localTz;
            }
        } catch (e) {
            console.log("Deteksi otomatis zona waktu gagal, menggunakan default.");
        }
        saveToLocalStorage();
    }

    // Pasang pertanyaan login & petunjuk jawaban bawaan
    document.getElementById('lock-screen-question').innerText = `"${appState.settings.secretQuestion}"`;
    document.getElementById('hint-answer-placeholder').innerText = appState.settings.secretAnswer;

    // Periksa status gerbang masuk (Lock)
    const isUnlocked = localStorage.getItem('lovebook_unlocked');
    if (isUnlocked === 'true') {
        appState.unlocked = true;
        document.getElementById('lock-screen').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        initMainDashboard(); 
    }

    // Inisialisasi awal Ikon Lucide
    lucide.createIcons();

    // Memasang pewaktu jam LDR dan countdown jadian (diperbarui tiap detik)
    setInterval(updateClocks, 1000);
    setInterval(updateLoveTimers, 1000);

    // Mengubah kecerahan gradasi background otomatis berdasarkan jam aktif
    updateDynamicBackgroundMood();

    // Mengisi kolom-kolom input formulir pada tab Pengaturan (Settings)
    fillSettingsFields();

    // Menampilkan pesan petunjuk rahasia gerbang masuk setelah 3 detik
    setTimeout(() => {
        document.getElementById('login-hint-text').classList.remove('hidden');
    }, 3000);
};

// PENGISIAN FORM PENGATURAN
function fillSettingsFields() {
    document.getElementById('set-my-name').value = appState.settings.myName;
    document.getElementById('set-my-city').value = appState.settings.myCity;
    document.getElementById('set-my-timezone').value = appState.settings.myTimezone;
    document.getElementById('set-partner-name').value = appState.settings.partnerName;
    document.getElementById('set-partner-city').value = appState.settings.partnerCity;
    document.getElementById('set-partner-timezone').value = appState.settings.partnerTimezone;
    document.getElementById('set-anniversary-date').value = appState.settings.anniversaryDate;
    document.getElementById('set-secret-question').value = appState.settings.secretQuestion;
    document.getElementById('set-secret-answer').value = appState.settings.secretAnswer;
}

// MENYIMPAN INTEGRASI SETTINGS
function saveAllSettings() {
    appState.settings.myName = document.getElementById('set-my-name').value.trim() || 'Pembuat';
    appState.settings.myCity = document.getElementById('set-my-city').value.trim() || 'Jakarta';
    appState.settings.myTimezone = document.getElementById('set-my-timezone').value;
    appState.settings.partnerName = document.getElementById('set-partner-name').value.trim() || 'Pasangan';
    appState.settings.partnerCity = document.getElementById('set-partner-city').value.trim() || 'Tokyo';
    appState.settings.partnerTimezone = document.getElementById('set-partner-timezone').value;
    appState.settings.anniversaryDate = document.getElementById('set-anniversary-date').value;
    appState.settings.secretQuestion = document.getElementById('set-secret-question').value.trim() || 'Di mana lokasi kencan pertama kita?';
    appState.settings.secretAnswer = document.getElementById('set-secret-answer').value.trim().toLowerCase() || 'taman';

    saveToLocalStorage();

    // Perbarui Tampilan Pertanyaan Keamanan di halaman depan
    document.getElementById('lock-screen-question').innerText = `"${appState.settings.secretQuestion}"`;
    document.getElementById('hint-answer-placeholder').innerText = appState.settings.secretAnswer;

    initMainDashboard();
    showToast('Pengaturan Disimpan!', 'Detail profil, tanggal anniversary, & profil zona waktu telah diperbarui.', 'check-circle');
    switchTab('dashboard');
}

// 1. DIGITAL KEY LOCK SCREEN CHECK
function checkDigitalKey() {
    const answer = document.getElementById('security-answer').value.trim().toLowerCase();
    const realAnswer = appState.settings.secretAnswer.toLowerCase();

    if (answer === realAnswer) {
        appState.unlocked = true;
        localStorage.setItem('lovebook_unlocked', 'true');

        const lockScreen = document.getElementById('lock-screen');
        lockScreen.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            lockScreen.classList.add('hidden');
            document.getElementById('main-app').classList.remove('hidden');
            initMainDashboard();
            showToast('Akses Diberikan!', 'Selamat datang di brankas digital rahasia kita.', 'heart');
        }, 500);
    } else {
        showToast('Jawaban Salah 😢', 'Silakan coba lagi atau hubungi kekasihmu!', 'shield-alert');
    }
}

// MENJALANKAN INISIALISASI UTAMA UNTUK SEMUA MODUL FITUR
function initMainDashboard() {
    updateLoveTimers();
    renderTimeline();
    renderScrapbook();
    renderVoiceNotes();
    renderBucketList();
    renderCalendar();
    renderCapsules();
    initScratchCards();
    spawnLoveLetters();

    // Dinamisasikan semua penamaan teks label widget LDR di halaman depan berdasarkan Settings
    document.getElementById('welcome-title').innerText = `Selamat Datang di Dunia Kita, ${appState.settings.myName}!`;
    document.getElementById('widget-my-title').innerText = `${appState.settings.myName} (${appState.settings.myCity})`;
    document.getElementById('widget-partner-title').innerText = `${appState.settings.partnerName} (${appState.settings.partnerCity})`;

    document.getElementById('mood-my-label').innerText = `Mood ${appState.settings.myName} Hari Ini:`;
    document.getElementById('mood-partner-label').innerText = `Mood ${appState.settings.partnerName}:`;
    document.getElementById('ldr-my-city').innerText = `${appState.settings.myName} (${appState.settings.myCity})`;
    document.getElementById('ldr-partner-city').innerText = `${appState.settings.partnerName} (${appState.settings.partnerCity})`;
    document.getElementById('missyou-box-title').innerText = `Kirim Rindu untuk ${appState.settings.partnerName}`;
}

// SISTEM PERPINDAHAN NAVIGASI TAB (ROUTER TAB)
function switchTab(tabName) {
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.add('hidden'));

    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        btn.classList.remove('bg-rose-50', 'text-rose-600');
        btn.classList.add('text-slate-600', 'hover:bg-rose-50', 'hover:text-rose-600');
    });

    document.getElementById(`tab-${tabName}`).classList.remove('hidden');
    document.getElementById(`nav-${tabName}`).classList.add('bg-rose-50', 'text-rose-600');
    document.getElementById(`nav-${tabName}`).classList.remove('text-slate-600');

    if (tabName === 'playroom') {
        setTimeout(initScratchCards, 100);
    } else if (tabName === 'settings') {
        fillSettingsFields();
    }
}

// MUSIC CONTROLS
function toggleMusic() {
    const btn = document.getElementById('music-btn');
    const icon = document.getElementById('music-icon');

    if (!isMusicPlaying) {
        bgAudio.play().then(() => {
            isMusicPlaying = true;
            btn.classList.add('bg-emerald-500');
            btn.classList.remove('bg-rose-500');
            icon.setAttribute('data-lucide', 'pause');
            showToast('Lagu Kita Dimulai 🎶', 'Menikmati instrumen musik romantis.', 'music');
        }).catch(err => {
            showToast('Gagal memutar audio', 'Berikan izin pemutaran audio di setelan browser.', 'alert-triangle');
        });
    } else {
        bgAudio.pause();
        isMusicPlaying = false;
        btn.classList.remove('bg-emerald-500');
        btn.classList.add('bg-rose-500');
        icon.setAttribute('data-lucide', 'play');
    }
    lucide.createIcons();
}

// WATCH PARTY ROOM MOVIE SINKRONISASI
function startWatchParty() {
    const urlInput = document.getElementById('watch-party-url').value.trim();
    if (urlInput) {
        let videoId = '';
        if (urlInput.includes('v=')) {
            videoId = urlInput.split('v=')[1].split('&')[0];
        } else if (urlInput.includes('youtu.be/')) {
            videoId = urlInput.split('youtu.be/')[1].split('?')[0];
        }

        if (videoId) {
            const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            document.getElementById('watch-party-iframe').src = embedUrl;
            document.getElementById('watch-party-iframe').classList.remove('hidden');
            document.getElementById('watch-party-fallback-player').classList.add('hidden');
        } else {
            window.open(urlInput, '_blank');
        }
        document.getElementById('movie-room-frame').classList.remove('hidden');
        showToast('Watch Party Dimulai! 🎬', 'Ruang nonton bersama virtual siap digunakan.', 'tv');
    }
}

function joinWatchParty() {
    showToast('Bergabung Sesi 🍿', 'Berhasil bergabung ke sesi nonton pasanganmu.', 'user-check');
    document.getElementById('movie-room-frame').classList.remove('hidden');
}

function closeWatchParty() {
    document.getElementById('movie-room-frame').classList.add('hidden');
    document.getElementById('watch-party-iframe').src = '';
    document.getElementById('watch-party-iframe').classList.add('hidden');
    document.getElementById('watch-party-fallback-player').classList.remove('hidden');
}
