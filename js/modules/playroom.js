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
        btn.classList.remove('border-rose-500', 'text-rose-600');
        btn.classList.add('text-slate-500', 'border-transparent');
    });

    document.getElementById(`play-${subTabName}`).classList.remove('hidden');
    document.getElementById(`sub-play-${subTabName}`).classList.add('border-rose-500', 'text-rose-600');
    document.getElementById(`sub-play-${subTabName}`).classList.remove('text-slate-500');

    if (subTabName === 'stickynotes') {
        renderStickyNotes();
    } else if (subTabName === 'coupons') {
        setTimeout(initScratchCards, 100);
    } else if (subTabName === 'minigames') {
        initTriviaGame();
    }
}

// KUPON GOSOK DENGAN CANVAS
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
        canvas.addEventListener('touchstart', (e) => { isDrawing = true; scratch(e); });
        canvas.addEventListener('touchmove', scratch);
        canvas.addEventListener('touchend', () => isDrawing = false);
    }
}

function claimCoupon(title, id) {
    showToast('Kupon Diklaim! 🎫', `Notifikasi kupon "${title}" berhasil dikirim ke pasanganmu!`, 'heart-handshake');
    const btn = document.getElementById(`claim-btn-${id}`);
    btn.classList.add('bg-slate-300', 'cursor-not-allowed');
    btn.innerText = 'Sudah Diklaim';
    btn.disabled = true;
}

// KIRIM SINYAL RINDU INSTAN
function sendMissYouSignal() {
    const msg = document.getElementById('miss-you-success-msg');
    msg.innerText = `Sinyal "Aku Kangen Kamu" Berhasil Dikirimkan ke ${appState.settings.partnerName}! 🥰`;
    showToast('Rindu Terkirim! ❤️', `Gelombang kangen instan telah mengetuk hati pasanganmu.`, 'send');
    spawnLoveLetters();
    setTimeout(() => { msg.innerText = ''; }, 5000);
}

// CATATAN TEMPEL (STICKY NOTES)
let stickyNotes = [
    { id: 1, text: 'Jangan lupa minum air putih hari ini, ganteng!', color: 'bg-yellow-100', date: '06/06/2026' },
    { id: 2, text: 'Nanti malam VC jam 8 ya sayang!', color: 'bg-rose-100', date: '06/06/2026' }
];

function renderStickyNotes() {
    const board = document.getElementById('sticky-board');
    board.innerHTML = '';
    stickyNotes.forEach(note => {
        const item = document.createElement('div');
        item.className = `${note.color} p-4 rounded-2xl shadow-sm relative flex flex-col justify-between h-40 transform rotate-1 hover:scale-105 transition-all`;
        item.innerHTML = `
            <p class="text-xs text-slate-700 font-medium leading-relaxed">"${note.text}"</p>
            <div class="flex justify-between items-center text-[9px] text-slate-400 mt-4">
                <span>${note.date}</span>
                <button onclick="deleteStickyNote(${note.id})" class="hover:text-red-500"><i data-lucide="trash" class="w-3.5 h-3.5"></i></button>
            </div>
        `;
        board.appendChild(item);
    });
    lucide.createIcons();
}

function addNewStickyNote() {
    const text = prompt('Tulis pesan singkat untuk ditempel di papan:');
    if (text) {
        const colors = ['bg-yellow-100', 'bg-rose-100', 'bg-sky-100', 'bg-emerald-100'];
        stickyNotes.push({
            id: Date.now(),
            text,
            color: colors[Math.floor(Math.random() * colors.length)],
            date: new Date().toLocaleDateString('id-ID')
        });
        renderStickyNotes();
        showToast('Catatan Ditempel!', 'Pesan kecilmu siap dilihat pasangan saat login.', 'pin');
    }
}

function deleteStickyNote(id) {
    stickyNotes = stickyNotes.filter(n => n.id !== id);
    renderStickyNotes();
}

// GAME TRIVIA PASANGAN
const triviaQuestions = [
    { q: 'Siapa nama panggilan kesayangan pacarmu saat kecil?', opts: ['Adek Imut', 'Ompong', 'Si Unyil'], ans: 'Ompong' },
    { q: 'Ke mana destinasi impian nomor satu yang ingin kalian kunjungi?', opts: ['Tokyo, Jepang', 'Paris, Prancis', 'Seoul, Korea'], ans: 'Tokyo, Jepang' },
    { q: 'Makanan apa yang paling tidak disukai pasanganmu?', opts: ['Seledri', 'Durian', 'Ceker Ayam'], ans: 'Seledri' }
];
let currentTriviaIndex = 0;
let triviaScore = 0;

function initTriviaGame() {
    currentTriviaIndex = 0;
    triviaScore = 0;
    document.getElementById('trivia-q-num').classList.remove('hidden');
    document.getElementById('trivia-q-text').classList.remove('hidden');
    document.getElementById('trivia-options').classList.remove('hidden');
    document.getElementById('trivia-score-box').classList.add('hidden');
    showTriviaQuestion();
}

function showTriviaQuestion() {
    const currentQ = triviaQuestions[currentTriviaIndex];
    document.getElementById('trivia-q-num').innerText = `Pertanyaan ${currentTriviaIndex + 1} dari ${triviaQuestions.length}`;
    document.getElementById('trivia-q-text').innerText = currentQ.q;
    
    const optsContainer = document.getElementById('trivia-options');
    optsContainer.innerHTML = '';
    currentQ.opts.forEach(opt => {
        optsContainer.innerHTML += `
            <button onclick="answerTrivia('${opt}')" class="px-4 py-3 bg-white border border-slate-100 hover:border-rose-200 hover:bg-rose-50/50 rounded-xl text-left text-xs font-medium transition-all w-full">${opt}</button>
        `;
    });
}

function answerTrivia(selectedOpt) {
    const currentQ = triviaQuestions[currentTriviaIndex];
    if (selectedOpt === currentQ.ans) {
        triviaScore++;
        showToast('Jawaban Benar! 🎉', 'Kamu sangat mengenal pacarmu!', 'check-circle');
    } else {
        showToast('Jawaban Salah 😢', `Jawaban benar: ${currentQ.ans}`, 'alert-circle');
    }

    currentTriviaIndex++;
    if (currentTriviaIndex < triviaQuestions.length) {
        showTriviaQuestion();
    } else {
        document.getElementById('trivia-q-num').classList.add('hidden');
        document.getElementById('trivia-q-text').classList.add('hidden');
        document.getElementById('trivia-options').classList.add('hidden');
        
        const scoreBox = document.getElementById('trivia-score-box');
        scoreBox.classList.remove('hidden');
        document.getElementById('trivia-score').innerText = triviaScore;
    }
}

// GAME TIC-TAC-TOE CINTA
let tttBoard = ['', '', '', '', '', '', '', '', ''];
let tttPlayer = '🐱';
let tttActive = true;

function makeTttMove(index) {
    if (tttBoard[index] !== '' || !tttActive) return;
    
    tttBoard[index] = tttPlayer;
    document.getElementById(`ttt-${index}`).innerText = tttPlayer;

    if (checkTttWin()) {
        document.getElementById('ttt-status').innerText = `Selamat! ${tttPlayer} Memenangkan Pertandingan Cinta! ❤️🏆`;
        tttActive = false;
        showToast('Kemenangan Cinta!', `Pemain ${tttPlayer} memenangkan game!`, 'trophy');
        return;
    }

    if (!tttBoard.includes('')) {
        document.getElementById('ttt-status').innerText = 'Pertandingan Seri!';
        tttActive = false;
        return;
    }

    tttPlayer = tttPlayer === '🐱' ? '🐶' : '🐱';
    document.getElementById('ttt-status').innerText = `Giliran: ${tttPlayer}`;
}

function checkTttWin() {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    return winPatterns.some(pattern => pattern.every(index => tttBoard[index] === tttPlayer));
}

function resetTtt() {
    tttBoard = ['', '', '', '', '', '', '', '', ''];
    tttPlayer = '🐱';
    tttActive = true;
    document.getElementById('ttt-status').innerText = 'Giliran Kucing (🐱)';
    for (let i = 0; i < 9; i++) {
        document.getElementById(`ttt-${i}`).innerText = '';
    }
}
