// PEMUTAR AUDIO LATAR
const bgAudio = document.getElementById('bg-audio');
let isMusicPlaying = false;

// SIKLUS HIDUP PADA SAAT WEBSITE SELESAI DIMUAT
window.onload = function() {
    // Memuat state tersimpan dari LocalStorage jika ada sebagai langkah awal
    const savedState = localStorage.getItem('digital_lovebook_state');
    if (savedState) {
        try {
            appState = JSON.parse(savedState);
        } catch (e) {
            console.error("Gagal parse savedState saat onload:", e);
        }
    }

    // Pasang pertanyaan login & petunjuk jawaban bawaan
    if (appState && appState.settings) {
        const lockQ = document.getElementById('lock-screen-question');
        const lockHint = document.getElementById('hint-answer-placeholder');
        if (lockQ) lockQ.innerText = `"${appState.settings.secretQuestion}"`;
        if (lockHint) lockHint.innerText = appState.settings.secretAnswer;
    }
    
    // Periksa status gerbang masuk (Lock)
    const isUnlocked = localStorage.getItem('lovebook_unlocked');
    if (isUnlocked === 'true') {
        if (appState) appState.unlocked = true;
        const lockScreen = document.getElementById('lock-screen');
        const mainApp = document.getElementById('main-app');
        if (lockScreen) lockScreen.classList.add('hidden');
        if (mainApp) mainApp.classList.remove('hidden');
        
        // Jalankan dashboard jika datanya sudah siap
        if (typeof initMainDashboard === 'function') {
            initMainDashboard(); 
        }
    }

    // Inisialisasi awal Ikon Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Memasang pewaktu jam LDR dan countdown jadian (diperbarui tiap detik)
    setInterval(updateClocks, 1000);
    setInterval(updateLoveTimers, 1000);

    // Mengubah kecerahan gradasi background otomatis berdasarkan jam aktif
    updateDynamicBackgroundMood();

    // Mengisi kolom-kolom input formulir pada tab Pengaturan (Settings)
    fillSettingsFields();

    // Menampilkan pesan petunjuk rahasia gerbang masuk setelah 3 detik
    setTimeout(() => {
        const hintText = document.getElementById('login-hint-text');
        if (hintText) hintText.classList.remove('hidden');
    }, 3000);
};

// PENGISIAN FORM PENGATURAN
function fillSettingsFields() {
    const fields = {
        'set-my-name': appState.settings.myName,
        'set-my-city': appState.settings.myCity,
        'set-my-timezone': appState.settings.myTimezone,
        'set-partner-name': appState.settings.partnerName,
        'set-partner-city': appState.settings.partnerCity,
        'set-partner-timezone': appState.settings.partnerTimezone,
        'set-anniversary-date': appState.settings.anniversaryDate,
        'set-secret-question': appState.settings.secretQuestion,
        'set-secret-answer': appState.settings.secretAnswer
    };

    for (const [id, value] of Object.entries(fields)) {
        const element = document.getElementById(id);
        if (element) element.value = value || '';
    }
}

// MENYIMPAN INTEGRASI SETTINGS SECARA REAL-TIME
function saveAllSettings() {
    appState.settings.myName = document.getElementById('set-my-name').value.trim() || 'Pembuat';
    appState.settings.myCity = document.getElementById('set-my-city').value.trim() || 'Jakarta';
    appState.settings.myTimezone = document.getElementById('set-my-timezone').value;
    appState.settings.partnerName = document.getElementById('set-partner-name').value.trim() || 'Pasangan';
    appState.settings.partnerCity = document.getElementById('set-partner-city').value.trim() || 'Tokyo';
    appState.settings.partnerTimezone = document.getElementById('set-partner-timezone').value;
    appState.settings.anniversaryDate = document.getElementById('set-anniversary-date').value;
    appState.settings.secretQuestion = document.getElementById('set-secret-question').value.trim() || 'Di mana lokasi kencan pertama kita?';
    
    const newAnswer = document.getElementById('set-secret-answer').value.trim().toLowerCase() || 'taman';
    appState.settings.secretAnswer = newAnswer;

    // PENTING: Karena browser ini yang melakukan perubahan kata sandi,
    // simpan sandi baru ke localStorage browser ini agar tidak ikut ter-logout otomatis!
    localStorage.setItem('last_active_answer', newAnswer);

    saveToLocalStorage();
    
    // Perbarui Tampilan Pertanyaan Keamanan di halaman depan
    const lockQ = document.getElementById('lock-screen-question');
    const lockHint = document.getElementById('hint-answer-placeholder');
    if (lockQ) lockQ.innerText = `"${appState.settings.secretQuestion}"`;
    if (lockHint) lockHint.innerText = appState.settings.secretAnswer;
    
    if (typeof initMainDashboard === 'function') {
        initMainDashboard();
    }
    
    showToast('Pengaturan Disimpan!', 'Detail profil, tanggal anniversary, & profil zona waktu telah diperbarui.', 'check-circle');
    switchTab('dashboard');
}

// DIGITAL KEY LOCK SCREEN CHECK
function checkDigitalKey() {
    const answerInput = document.getElementById('security-answer');
    if (!answerInput) return;
    
    const answer = answerInput.value.trim().toLowerCase();
    const realAnswer = appState.settings.secretAnswer.toLowerCase();
    
    if (answer === realAnswer) {
        appState.unlocked = true;
        localStorage.setItem('lovebook_unlocked', 'true');
        
        // PENTING: Simpan kunci jawaban aktif ke dalam browser ini saat berhasil masuk!
        localStorage.setItem('last_active_answer', realAnswer);
        
        const lockScreen = document.getElementById('lock-screen');
        if (lockScreen) {
            lockScreen.classList.add('opacity-0', 'scale-95');
            setTimeout(() => {
                lockScreen.classList.add('hidden');
                const mainApp = document.getElementById('main-app');
                if (mainApp) mainApp.classList.remove('hidden');
                if (typeof initMainDashboard === 'function') {
                    initMainDashboard();
                }
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
    const myWidgetTitle = document.getElementById('widget-my-title');
    const partnerWidgetTitle = document.getElementById('widget-partner-title');
    const moodMyLabel = document.getElementById('mood-my-label');
    const moodPartnerLabel = document.getElementById('mood-partner-label');
    const ldrMyCity = document.getElementById('ldr-my-city');
    const ldrPartnerCity = document.getElementById('ldr-partner-city');
    const missyouTitle = document.getElementById('missyou-box-title');

    if (welcomeTitle) welcomeTitle.innerText = `Selamat Datang di Dunia Kita, ${appState.settings.myName}!`;
    if (myWidgetTitle) myWidgetTitle.innerText = `${appState.settings.myName} (${appState.settings.myCity})`;
    if (partnerWidgetTitle) partnerWidgetTitle.innerText = `${appState.settings.partnerName} (${appState.settings.partnerCity})`;
    if (moodMyLabel) moodMyLabel.innerText = `Mood ${appState.settings.myName} Hari Ini:`;
    if (moodPartnerLabel) moodPartnerLabel.innerText = `Mood ${appState.settings.partnerName}:`;
    if (ldrMyCity) ldrMyCity.innerText = `${appState.settings.myName} (${appState.settings.myCity})`;
    if (ldrPartnerCity) ldrPartnerCity.innerText = `${appState.settings.partnerName} (${appState.settings.partnerCity})`;
    if (missyouTitle) missyouTitle.innerText = `Kirim Rindu untuk ${appState.settings.partnerName}`;
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
    const activeBtn = document.getElementById(`nav-${tabName}`);
    if (activeTab) activeTab.classList.remove('hidden');
    if (activeBtn) {
        activeBtn.classList.add('bg-rose-50', 'text-rose-600');
        activeBtn.classList.remove('text-slate-600');
    }

    if (tabName === 'playroom') {
        setTimeout(() => {
            if (typeof initScratchCards === 'function') initScratchCards();
        }, 100);
    } else if (tabName === 'settings') {
        fillSettingsFields();
    }
}

// MUSIC CONTROLS
function toggleMusic() {
    const btn = document.getElementById('music-btn');
    const icon = document.getElementById('music-icon');
    if (!btn || !icon) return;

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
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// WATCH PARTY ROOM MOVIE SINKRONISASI
function startWatchParty() {
    const urlInput = document.getElementById('watch-party-url');
    if (!urlInput) return;
    const url = urlInput.value.trim();
    if (url) {
        let videoId = '';
        if (url.includes('v=')) {
            videoId = url.split('v=')[1].split('&')[0];
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        }

        if (videoId) {
            const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            const iframe = document.getElementById('watch-party-iframe');
            const fallback = document.getElementById('watch-party-fallback-player');
            if (iframe) {
                iframe.src = embedUrl;
                iframe.classList.remove('hidden');
            }
            if (fallback) fallback.classList.add('hidden');
        } else {
            window.open(url, '_blank');
        }
        const frame = document.getElementById('movie-room-frame');
        if (frame) frame.classList.remove('hidden');
        showToast('Watch Party Dimulai! 🎬', 'Ruang nonton bersama virtual siap digunakan.', 'tv');
    }
}

function joinWatchParty() {
    showToast('Bergabung Sesi 🍿', 'Berhasil bergabung ke sesi nonton pasanganmu.', 'user-check');
    const frame = document.getElementById('movie-room-frame');
    if (frame) frame.classList.remove('hidden');
}

function closeWatchParty() {
    const frame = document.getElementById('movie-room-frame');
    const iframe = document.getElementById('watch-party-iframe');
    const fallback = document.getElementById('watch-party-fallback-player');
    
    if (frame) frame.classList.add('hidden');
    if (iframe) {
        iframe.src = '';
        iframe.classList.add('hidden');
    }
    if (fallback) fallback.classList.remove('hidden');
}
