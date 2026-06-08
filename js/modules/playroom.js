// NAVIGASI SUB-TAB PLAYROOM
function switchPlayroomSubTab(subTabName) {
    document.getElementById('play-coupons').classList.add('hidden');
    document.getElementById('play-missyou').classList.add('hidden');
    document.getElementById('play-stickynotes').classList.add('hidden');
    document.getElementById('play-minigames').classList.add('hidden');

    const buttons = [
        document.getElementById('sub-play-coupons'),
        document.getElementById('sub-play-missyou'),
        document.getElementById('sub-play-stickynotes'),
        document.getElementById('sub-play-minigames')
    ];
    buttons.forEach(btn => {
        if (btn) {
            btn.classList.remove('border-rose-500', 'text-rose-600');
            btn.classList.add('text-slate-500', 'border-transparent');
        }
    });

    const activeTab = document.getElementById(`play-${subTabName}`);
    const activeBtn = document.getElementById(`sub-play-${subTabName}`);
    if (activeTab) activeTab.classList.remove('hidden');
    if (activeBtn) {
        activeBtn.classList.add('border-rose-500', 'text-rose-600');
        activeBtn.classList.remove('text-slate-500');
    }

    if (subTabName === 'stickynotes') {
        renderStickyNotes();
    } else if (subTabName === 'coupons') {
        setTimeout(initScratchCards, 100);
    } else if (subTabName === 'minigames') {
        initRealtimeTtt();
    }
}

// ==========================================================
// 1. GAME TIC-TAC-TOE REAL-TIME (MULTIPLAYER VIA FIREBASE)
// ==========================================================
function initRealtimeTtt() {
    // Pastikan state ttt di Firebase sudah terinisialisasi dengan aman
    if (!appState.playroom) appState.playroom = {};
    if (!appState.playroom.ttt) {
        appState.playroom.ttt = {
            board: ['', '', '', '', '', '', '', '', ''],
            turn: '🐱',
            active: true,
            status: 'Giliran Kucing (🐱)'
        };
    }
    renderTttBoard();
}

function renderTttBoard() {
    if (!appState.playroom || !appState.playroom.ttt) return;
    const ttt = appState.playroom.ttt;

    // Gambar ulang simbol di setiap grid tombol
    for (let i = 0; i < 9; i++) {
        const btn = document.getElementById(`ttt-${i}`);
        if (btn) {
            btn.innerText = ttt.board[i];
            // Beri warna khusus berdasarkan simbol
            if (ttt.board[i] === '🐱') {
                btn.className = "bg-rose-100 text-2xl font-bold text-rose-600 rounded-xl flex items-center justify-center border border-rose-200 transition-all";
            } else if (ttt.board[i] === '🐶') {
                btn.className = "bg-sky-100 text-2xl font-bold text-sky-600 rounded-xl flex items-center justify-center border border-sky-200 transition-all";
            } else {
                btn.className = "bg-rose-50/50 hover:bg-rose-100/50 rounded-xl text-2xl font-bold text-slate-800 flex items-center justify-center transition-all border border-rose-100/30";
            }
        }
    }

    // Perbarui status permainan di UI
    const statusEl = document.getElementById('ttt-status');
    if (statusEl) statusEl.innerText = ttt.status;
}

function makeTttMove(index) {
    if (!appState.playroom || !appState.playroom.ttt) return;
    const ttt = appState.playroom.ttt;

    if (ttt.board[index] !== '' || !ttt.active) return;

    // DETEKSI PERAN: Menentukan apakah Giliran Anda (🐱) atau Pasangan Anda (🐶)
    // Creator (Hīro) = 🐱, Partner (Pasangan) = 🐶
    const localName = appState.settings.myName || 'Pembuat';
    const isCreator = (localStorage.getItem('lovebook_unlocked') === 'true'); // Dalam sesi login perangkat ini

    if (ttt.turn === '🐱' && !isCreator) {
        showToast('Bukan Giliranmu! 🐱', 'Tunggu giliran kekasihmu melangkah.', 'clock');
        return;
    }
    if (ttt.turn === '🐶' && isCreator) {
        showToast('Bukan Giliranmu! 🐶', 'Tunggu giliran kekasihmu melangkah.', 'clock');
        return;
    }

    // Lakukan langkah
    ttt.board[index] = ttt.turn;

    // Periksa Kemenangan
    if (checkTttWin(ttt.board, ttt.turn)) {
        ttt.status = `Selamat! ${ttt.turn} Memenangkan Pertandingan Cinta! ❤️🏆`;
        ttt.active = false;
        showToast('Kemenangan Cinta!', `Pemain ${ttt.turn} memenangkan pertandingan!`, 'trophy');
    } else if (!ttt.board.includes('')) {
        ttt.status = 'Pertandingan Seri! Kalian Sama-Sama Hebat! 🥰';
        ttt.active = false;
    } else {
        // Ganti giliran
        ttt.turn = ttt.turn === '🐱' ? '🐶' : '🐱';
        ttt.status = `Giliran: ${ttt.turn} (${ttt.turn === '🐱' ? appState.settings.myName : appState.settings.partnerName})`;
    }

    saveToLocalStorage(); // Kirim langkah ke Firebase agar HP pasangan langsung terupdate!
    renderTttBoard();
}

function checkTttWin(board, player) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Baris
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Kolom
        [0, 4, 8], [2, 4, 6]             // Diagonal
    ];
    return winPatterns.some(pattern => pattern.every(idx => board[idx] === player));
}

function resetTtt() {
    if (!appState.playroom) appState.playroom = {};
    appState.playroom.ttt = {
        board: ['', '', '', '', '', '', '', '', ''],
        turn: '🐱',
        active: true,
        status: `Giliran: 🐱 (${appState.settings.myName})`
    };
    saveToLocalStorage();
    renderTttBoard();
    showToast('Game Diulang 🔄', 'Papan Tic-Tac-Toe telah dibersihkan berdua.', 'rotate-ccw');
}


// ==========================================================
// 2. VIRTUAL HUG SIMULATOR (DENGAN FEEDBACK REAL-TIME & GETAR)
// ==========================================================
let localHolding = false;

function initHugSimulator() {
    const hugBtn = document.getElementById('virtual-hug-btn');
    if (!hugBtn) return;

    // Event PC (Mouse)
    hugBtn.addEventListener('mousedown', startHoldingHug);
    hugBtn.addEventListener('mouseup', stopHoldingHug);
    hugBtn.addEventListener('mouseleave', stopHoldingHug);

    // Event HP (Sentuh Layar)
    hugBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startHoldingHug();
    });
    hugBtn.addEventListener('touchend', stopHoldingHug);
}

function startHoldingHug() {
    if (localHolding) return;
    localHolding = true;

    if (!appState.playroom) appState.playroom = {};
    if (!appState.playroom.hug) appState.playroom.hug = { creator: false, partner: false };

    // Tentukan peran holding berdasarkan perangkat login
    const isCreator = (localStorage.getItem('lovebook_unlocked') === 'true');
    if (isCreator) {
        appState.playroom.hug.creator = true;
    } else {
        appState.playroom.hug.partner = true;
    }

    saveToLocalStorage();
    checkHugMatch();
}

function stopHoldingHug() {
    if (!localHolding) return;
    localHolding = false;

    if (appState.playroom && appState.playroom.hug) {
        const isCreator = (localStorage.getItem('lovebook_unlocked') === 'true');
        if (isCreator) {
            appState.playroom.hug.creator = false;
        } else {
            appState.playroom.hug.partner = false;
        }
        saveToLocalStorage();
    }
    removeHugOverlay();
}

// Memeriksa apakah Anda berdua sedang menekan tombol pelukan secara bersamaan
function checkHugMatch() {
    if (!appState.playroom || !appState.playroom.hug) return;
    const hug = appState.playroom.hug;

    if (hug.creator && hug.partner) {
        // TRIGGER PELUKAN CO-OP BERHASIL!
        triggerFullVirtualHug();
    }
}

function triggerFullVirtualHug() {
    // 1. Getarkan perangkat jika dimainkan di HP (Haptic feedback)
    if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
    }

    // 2. Munculkan overlay animasi pelukan indah di seluruh layar
    let overlay = document.getElementById('hug-full-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'hug-full-overlay';
        overlay.className = 'fixed inset-0 bg-rose-500/90 z-50 flex flex-col items-center justify-center text-white transition-all duration-500 animate-fade-in backdrop-blur-sm';
        overlay.innerHTML = `
            <div class="text-center space-y-6">
                <i data-lucide="heart" class="w-32 h-32 fill-white text-white animate-ping mx-auto"></i>
                <h2 class="text-3xl font-serif font-bold">Pelukan Terkirim! ❤️🤗</h2>
                <p class="text-sm text-rose-100 max-w-xs leading-relaxed">Kamu dan kekasihmu sedang berpelukan erat menatap layar secara bersamaan saat ini.</p>
            </div>
        `;
        document.body.appendChild(overlay);
        lucide.createIcons();
    }
}

function removeHugOverlay() {
    const overlay = document.getElementById('hug-full-overlay');
    if (overlay) {
        overlay.classList.add('opacity-0');
        setTimeout(() => overlay.remove(), 500);
    }
}


// ==========================================================
// 3. DIGITAL SCRATCH CARDS (KUPON CINTA)
// ==========================================================
function initScratchCards() {
    for (let i = 1; i <= 3; i++) {
        const canvas = document.getElementById(`scratch-canvas-${i}`);
        if (!canvas) continue;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#475569';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Gosok di Sini dengan Cinta 💖', canvas.width / 2, canvas.height / 2);

        let isDrawing = false;

        function scratch(e) {
            if (!isDrawing) return;
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX || e.touches[0].clientX) - rect.left;
            const y = (e.clientY || e.touches[0].clientY) - rect.top;

            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(x, y, 16, 0, Math.PI * 2);
            ctx.fill();
        }

        canvas.addEventListener('mousedown', () => isDrawing = true);
        canvas.addEventListener('mousemove', scratch);
        canvas.addEventListener('mouseup', () => isDrawing = false);

        canvas.addEventListener('touchstart', (e) => {
            isDrawing = true;
            scratch(e);
        });
        canvas.addEventListener('touchmove', scratch);
        canvas.addEventListener('touchend', () => isDrawing = false);
    }
}

function claimCoupon(title, id) {
    showToast('Kupon Diklaim! 🎫', `Notifikasi kupon "${title}" berhasil dikirim ke pasanganmu!`, 'heart-handshake');
    document.getElementById(`claim-btn-${id}`).classList.add('bg-slate-300', 'cursor-not-allowed');
    document.getElementById(`claim-btn-${id}`).innerText = 'Sudah Diklaim';
    document.getElementById(`claim-btn-${id}`).disabled = true;
}


// ==========================================================
// 4. STICKY NOTES BOARD & MOOD SINKRONISASI
// ==========================================================
function sendMissYouSignal() {
    const msg = document.getElementById('miss-you-success-msg');
    if (msg) msg.innerText = `Sinyal "Aku Kangen Kamu" Berhasil Dikirimkan ke ${appState.settings.partnerName}! 🥰`;
    showToast('Rindu Terkirim! ❤️', `Gelombang kangen instan telah mengetuk hati ${appState.settings.partnerName}.`, 'send');
    
    spawnLoveLetters();

    setTimeout(() => {
        if (msg) msg.innerText = '';
    }, 5000);
}

function setMyMood(emoji, title) {
    document.getElementById('my-mood-emoji').innerText = emoji;
    document.getElementById('my-mood-title').innerText = title;
    document.getElementById('my-mood-note').innerText = 'Baru diperbarui saja olehmu!';
    showToast('Mood Diperbarui!', `Hari ini emosimu terdeteksi sebagai: ${title}`, 'smile');
}

// Catatan Tempel Sinkron
function renderStickyNotes() {
    const board = document.getElementById('sticky-board');
    if (!board) return;
    board.innerHTML = '';

    const microData = Array.isArray(appState.microMessages) ? appState.microMessages : [];

    if (microData.length === 0) {
        board.innerHTML = `<div class="col-span-full text-center py-6 text-slate-400 text-xs">Papan masih kosong. Klik "+ Catatan Baru" untuk menempel pesan.</div>`;
        return;
    }

    microData.forEach((noteText, idx) => {
        const colors = ['bg-yellow-100', 'bg-rose-100', 'bg-sky-100', 'bg-emerald-100'];
        const cardColor = colors[idx % colors.length];

        const item = document.createElement('div');
        item.className = `${cardColor} p-4 rounded-2xl shadow-sm relative flex flex-col justify-between h-40 transform rotate-1 hover:scale-105 transition-all`;
        item.innerHTML = `
            <p class="text-xs text-slate-700 font-medium leading-relaxed">"${noteText}"</p>
            <div class="flex justify-end items-center mt-4">
                <button onclick="deleteStickyNote(${idx})" class="text-slate-400 hover:text-red-500 transition-colors"><i data-lucide="trash" class="w-3.5 h-3.5"></i></button>
            </div>
        `;
        board.appendChild(item);
    });
    lucide.createIcons();
}

function addNewStickyNote() {
    const text = prompt('Tulis pesan singkat untuk ditempel di papan:');
    if (text) {
        if (!Array.isArray(appState.microMessages)) appState.microMessages = [];
        appState.microMessages.push(text);
        saveToLocalStorage();
        renderStickyNotes();
        showToast('Catatan Ditempel!', 'Pesan kecilmu siap dilihat pasangan saat login.', 'pin');
    }
}

function deleteStickyNote(index) {
    if (!Array.isArray(appState.microMessages)) return;
    appState.microMessages.splice(index, 1);
    saveToLocalStorage();
    renderStickyNotes();
    showToast('Catatan Dicabut', 'Sticky note berhasil dihapus.', 'trash');
}
