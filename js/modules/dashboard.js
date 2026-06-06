// JAM DINDING LDR GANDA
function updateClocks() {
    const now = new Date();
    
    // Jam pengakses lokal
    try {
        const optionsLocal = { timeZone: appState.settings.myTimezone, hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };
        const localTimeString = now.toLocaleTimeString('id-ID', optionsLocal);
        document.getElementById('local-time').innerText = localTimeString;
        document.getElementById('ldr-time-local').innerText = localTimeString;
    } catch (e) {
        document.getElementById('local-time').innerText = now.toLocaleTimeString('id-ID');
    }

    // Jam pasangan
    try {
        const optionsRemote = { timeZone: appState.settings.partnerTimezone, hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };
        const remoteTimeString = now.toLocaleTimeString('id-ID', optionsRemote);
        document.getElementById('remote-time').innerText = remoteTimeString;
        document.getElementById('ldr-time-remote').innerText = remoteTimeString;
    } catch (e) {
        document.getElementById('remote-time').innerText = now.toLocaleTimeString('id-ID');
    }
}

// GRADASI LATAR BELAKANG DINAMIS BERDASARKAN JAM AKTIF
function updateDynamicBackgroundMood() {
    const hour = new Date().getHours();
    const body = document.body;
    if (hour >= 5 && hour < 11) {
        body.style.background = 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%)';
    } else if (hour >= 11 && hour < 16) {
        body.style.background = 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)';
    } else if (hour >= 16 && hour < 19) {
        body.style.background = 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 50%, #ffedd5 100%)';
    } else {
        body.style.background = 'linear-gradient(135deg, #ffe4e6 0%, #fecdd3 50%, #fda4af 100%)';
    }
}

// PENGHITUNG WAKTU JADIAN & COUNTDOWN ANNIVERSARY
function updateLoveTimers() {
    const now = new Date();
    const annivDate = new Date(appState.settings.anniversaryDate + 'T00:00:00');

    // Tentukan tahun anniversary berikutnya
    let currentYear = now.getFullYear();
    let nextAnnivDate = new Date(appState.settings.anniversaryDate);
    nextAnnivDate.setFullYear(currentYear);
    if (nextAnnivDate < now) {
        nextAnnivDate.setFullYear(currentYear + 1);
    }

    // Hitung maju sejak jadian (Countup)
    const countupDiff = now - annivDate;
    if (countupDiff > 0) {
        const upDays = Math.floor(countupDiff / (1000 * 60 * 60 * 24));
        const upHours = Math.floor((countupDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const upMinutes = Math.floor((countupDiff % (1000 * 60 * 60)) / (1000 * 60));
        const upSeconds = Math.floor((countupDiff % (1000 * 60)) / 1000);

        document.getElementById('countup-days').innerText = upDays;
        document.getElementById('countup-hours').innerText = upHours;
        document.getElementById('countup-minutes').innerText = upMinutes;
        document.getElementById('countup-seconds').innerText = upSeconds;
    }

    document.getElementById('anniversary-date-display').innerText = annivDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

    // Perayaan keberapa
    const yearsAnniv = nextAnnivDate.getFullYear() - annivDate.getFullYear();
    document.getElementById('next-anniv-title').innerText = `Anniversary Ke-${yearsAnniv} Kita 🎉`;

    // Hitung mundur (Countdown)
    const countdownDiff = nextAnnivDate - now;
    if (countdownDiff > 0) {
        const downDays = Math.floor(countdownDiff / (1000 * 60 * 60 * 24));
        const downHours = Math.floor((countdownDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const downMinutes = Math.floor((countdownDiff % (1000 * 60 * 60)) / (1000 * 60));
        const downSeconds = Math.floor((countdownDiff % (1000 * 60)) / 1000);

        document.getElementById('countdown-days').innerText = downDays;
        document.getElementById('countdown-hours').innerText = downHours;
        document.getElementById('countdown-minutes').innerText = downMinutes;
        document.getElementById('countdown-seconds').innerText = downSeconds;
    }
}

// SPESIAL MOOD CHECKIN
function setMyMood(emoji, title) {
    document.getElementById('my-mood-emoji').innerText = emoji;
    document.getElementById('my-mood-title').innerText = title;
    document.getElementById('my-mood-note').innerText = 'Baru diperbarui saja olehmu!';
    showToast('Mood Diperbarui!', `Hari ini emosimu terdeteksi sebagai: ${title}`, 'smile');
}

// SURAT CINTA MELAYANG (FLOATING LETTER)
function spawnLoveLetters() {
    const container = document.getElementById('floating-container');
    container.innerHTML = ''; 

    for (let i = 0; i < 15; i++) {
        const element = document.createElement('div');
        element.className = 'floating-heart cursor-pointer pointer-events-auto bg-white/90 border border-rose-100 p-2.5 rounded-2xl shadow-md text-rose-500 flex items-center justify-center';
        element.style.left = `${Math.random() * 90}%`;
        element.style.animationDelay = `${Math.random() * 8}s`;
        element.style.animationDuration = `${10 + Math.random() * 10}s`;
        element.innerHTML = `<i data-lucide="mail" class="w-5 h-5 fill-rose-100"></i>`;
        
        element.onclick = () => {
            const idx = Math.floor(Math.random() * appState.microMessages.length);
            const message = appState.microMessages[idx];
            showToast('Surat Cinta Melayang 💌', `"${message}"`, 'heart');
            element.innerHTML = `<i data-lucide="sparkles" class="w-5 h-5 text-amber-500"></i>`;
            lucide.createIcons();
            setTimeout(() => element.remove(), 1000);
        };
        container.appendChild(element);
    }
    lucide.createIcons();
}

function addNewMicroMessage() {
    document.getElementById('micro-msg-modal').classList.remove('hidden');
}

function closeMicroMessageModal() {
    document.getElementById('micro-msg-modal').classList.add('hidden');
}

function saveMicroMessage() {
    const input = document.getElementById('micro-msg-input');
    const val = input.value.trim();
    if (val) {
        appState.microMessages.push(val);
        saveToLocalStorage();
        input.value = '';
        closeMicroMessageModal();
        showToast('Sukses!', 'Catatan manismu berhasil disebar ke langit cinta.', 'check-circle');
        spawnLoveLetters();
    }
}
