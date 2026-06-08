// PEMUTAR AUDIO LATAR
const bgAudio = document.getElementById('bg-audio');
let isMusicPlaying = false;

// SIKLUS HIDUP PADA SAAT WEBSITE SELESAI DIMUAT
window.onload = function() {
    // Pasang pertanyaan login & petunjuk jawaban bawaan sementara dari state awal
    const lockQ = document.getElementById('lock-screen-question');
    const lockHint = document.getElementById('hint-answer-placeholder');
    if (lockQ) lockQ.innerText = `"${appState.settings.secretQuestion}"`;
    if (lockHint) lockHint.innerText = appState.settings.secretAnswer;
    
    // Periksa status gerbang masuk (Lock) dengan memvalidasi kecocokan kunci sesi
    const isUnlocked = localStorage.getItem('lovebook_unlocked');
    const savedUnlockKey = localStorage.getItem('lovebook_unlocked_key');
    const currentAnswer = appState.settings.secretAnswer ? appState.settings.secretAnswer.toLowerCase() : '';
    
    if (isUnlocked === 'true' && savedUnlockKey === currentAnswer) {
        appState.unlocked = true;
        const lockScreen = document.getElementById('lock-screen');
        const mainApp = document.getElementById('main-app');
        if (lockScreen) lockScreen.classList.add('hidden');
        if (mainApp) mainApp.classList.remove('hidden');
    } else {
        // Force lock jika kunci yang disimpan di browser tidak cocok dengan kunci rahasia aktif
        localStorage.setItem('lovebook_unlocked', 'false');
        localStorage.removeItem('lovebook_unlocked_key');
        appState.unlocked = false;
    }

    // Inisialisasi awal Ikon Lucide
    lucide.createIcons();

    // Memasang pewaktu jam LDR dan countdown jadian (diperbarui tiap detik)
    setInterval(updateClocks, 1000);
    setInterval(updateLoveTimers, 1000);

    // Mengubah kecerahan gradasi background otomatis berdasarkan jam aktif
    updateDynamicBackgroundMood();

    // Menampilkan pesan petunjuk rahasia gerbang masuk setelah 3 detik
    setTimeout(() => {
        const hintText = document.getElementById('login-hint-text');
        if (hintText) hintText.classList.remove('hidden');
    }, 3000);
};

// PENGISIAN FORM PENGATURAN
function fillSettingsFields() {
    const setMyName = document.getElementById('set-my-name');
    const setMyCity = document.getElementById('set-my-city');
    const setMyTz = document.getElementById('set-my-timezone');
    const setPartName = document.getElementById('set-partner-name');
    const setPartCity = document.getElementById('set-partner-city');
    const setPartTz = document.getElementById('set-partner-timezone');
    const setAnniv = document.getElementById('set-anniversary-date');
    const setSecQ = document.getElementById('set-secret-question');
    const setSecA = document.getElementById('set-secret-answer');

    if (setMyName) setMyName.value = appState.settings.myName;
    if (setMyCity) setMyCity.value = appState.settings.myCity;
    if (setMyTz) setMyTz.value = appState.settings.myTimezone;
    if (setPartName) setPartName.value = appState.settings.partnerName;
    if (setPartCity) setPartCity.value = appState.settings.partnerCity;
    if (setPartTz) setPartTz.value = appState.settings.partnerTimezone;
    if (setAnniv) setAnniv.value = appState.settings.anniversaryDate;
    if (setSecQ) setSecQ.value = appState.settings.secretQuestion;
    if (setSecA) setSecA.value = appState.settings.secretAnswer;
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
    
    // Perbarui jawaban keamanan (jadikan huruf kecil semua)
    const newAnswer = document.getElementById('set-secret-answer').value.trim().toLowerCase() || 'taman';
    appState.settings.secretAnswer = newAnswer;

    // Daftarkan kunci sesi baru ini pada perangkat pemilik saat ini agar tidak terlogout otomatis
    localStorage.setItem('lovebook_unlocked_key', newAnswer);

    saveToLocalStorage();
    
    // Perbarui Tampilan Pertanyaan Keamanan di halaman depan
    const lockQ = document.getElementById('lock-screen-question');
    const lockHint = document.getElementById('hint-answer-placeholder');
    if (lockQ) lockQ.innerText = `"${appState.settings.secretQuestion}"`;
    if (lockHint) lockHint.innerText = appState.settings.secretAnswer;
    
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
        localStorage.setItem('lovebook_unlocked_key', realAnswer); // Simpan kunci jawaban saat ini untuk pelacakan masa depan
        
        const lockScreen = document.getElementById('lock-screen');
        if (lockScreen) {
            lockScreen.classList.add('opacity-0', 'scale-95');
            setTimeout(() => {
                lockScreen.classList.add('hidden');
                const mainApp = document.getElementById('main-app');
                if (mainApp) mainApp.classList.remove('hidden');
                initMainDashboard();
                showToast('Akses Diberikan!', 'Selamat datang di brankas digital rahasia kita.', 'heart');
            }, 500);
        }
    } else {
        showToast('Jawaban Salah 😢', 'Silakan coba lagi atau hubungi kekasihmu!', 'shield-alert');
    }
}

// MENJALANKAN INISIALISASI UTAMA UNTUK SEMUA MODUL FITUR
function initMainDashboard() {
    if (typeof updateLoveTimers === 'function') updateLoveTimers();
    if (typeof renderTimeline === 'function') renderTimeline();
    if (typeof renderScrapbook === 'function') renderScrapbook();
    if (typeof renderVoiceNotes === 'function') renderVoiceNotes();
    if (typeof renderBucketList === 'function') renderBucketList();
    if (typeof renderCalendar === 'function') renderCalendar();
    if (typeof renderCapsules === 'function') renderCapsules();
    if (typeof initScratchCards === 'function') initScratchCards();
    if (typeof spawnLoveLetters === 'function') spawnLoveLetters();

    // Dinamisasikan semua penamaan teks label widget LDR di halaman depan berdasarkan Settings
    const welcomeTitle = document.getElementById('welcome-title');
    const widgetMyTitle = document.getElementById('widget-my-title');
    const widgetPartnerTitle = document.getElementById('widget-partner-title');
    const moodMyLabel = document.getElementById('mood-my-label');
    const moodPartnerLabel = document.getElementById('mood-partner-label');
    const ldrMyCity = document.getElementById('ldr-my-city');
    const ldrPartnerCity = document.getElementById('ldr-partner-city');
    const missyouBoxTitle = document.getElementById('missyou-box-title');

    if (welcomeTitle) welcomeTitle.innerText = `Selamat Datang di Dunia Kita, ${appState.settings.myName}!`;
    if (widgetMyTitle) widgetMyTitle.innerText = `${appState.settings.myName} (${appState.settings.myCity})`;
    if (widgetPartnerTitle) widgetPartnerTitle.innerText = `${appState.settings.partnerName} (${appState.settings.partnerCity})`;
    
    if (moodMyLabel) moodMyLabel.innerText = `Mood ${appState.settings.myName} Hari Ini:`;
    if (moodPartnerLabel) moodPartnerLabel.innerText = `Mood ${appState.settings.partnerName}:`;
    if (ldrMyCity) ldrMyCity.innerText = `${appState.settings.myName} (${appState.settings.myCity})`;
    if (ldrPartnerCity) ldrPartnerCity.innerText = `${appState.settings.partnerName} (${appState.settings.partnerCity})`;
    if (missyouBoxTitle) missyouBoxTitle.innerText = `Kirim Rindu untuk ${appState.settings.partnerName}`;
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

    const activeTab = document.getElementById(`tab-${tabName}`);
    const activeNav = document.getElementById(`nav-${tabName}`);
    if (activeTab) activeTab.classList.remove('hidden');
    if (activeNav) {
        activeNav.classList.add('bg-rose-50', 'text-rose-600');
        activeNav.classList.remove('text-slate-600');
    }

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
