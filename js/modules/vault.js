// NAVIGASI SUB-TAB VAULT
function switchVaultSubTab(subTabName) {
    document.getElementById('vault-timeline').classList.add('hidden');
    document.getElementById('vault-scrapbook').classList.add('hidden');
    document.getElementById('vault-voicenotes').classList.add('hidden');

    const buttons = [
        document.getElementById('sub-vault-timeline'),
        document.getElementById('sub-vault-scrapbook'),
        document.getElementById('sub-vault-voicenotes')
    ];
    buttons.forEach(btn => {
        if (btn) {
            btn.classList.remove('border-rose-500', 'text-rose-600');
            btn.classList.add('text-slate-500', 'border-transparent');
        }
    });

    const activeTab = document.getElementById(`vault-${subTabName}`);
    const activeBtn = document.getElementById(`sub-vault-${subTabName}`);
    if (activeTab) activeTab.classList.remove('hidden');
    if (activeBtn) {
        activeBtn.classList.add('border-rose-500', 'text-rose-600');
        activeBtn.classList.remove('text-slate-500');
    }

    if (subTabName === 'scrapbook') {
        renderScrapbook();
    } else if (subTabName === 'voicenotes') {
        renderVoiceNotes();
    }
}

// LOGIKA INTERACTIVE TIMELINE AMAN
function renderTimeline() {
    const container = document.getElementById('timeline-container');
    if (!container) return;
    container.innerHTML = '';

    // Pastikan timeline berupa array sebelum disort
    const timelineData = Array.isArray(appState.timeline) ? appState.timeline : [];

    timelineData.sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(item => {
        const block = document.createElement('div');
        block.className = 'relative pl-8 md:pl-12 group';
        block.innerHTML = `
            <div class="absolute -left-3.5 top-1.5 w-7 h-7 bg-white border-4 border-rose-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <div class="w-1.5 h-1.5 bg-rose-500 rounded-full"></div>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start">
                    <div>
                        <span class="text-xs text-rose-500 font-semibold">${formatDate(item.date)}</span>
                        <h4 class="font-serif font-bold text-slate-800 text-base mt-1">${item.title}</h4>
                    </div>
                    <button onclick="deleteTimeline(${item.id})" class="text-slate-300 hover:text-red-500 transition-colors">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
                <p class="text-xs text-slate-600 mt-2 leading-relaxed">${item.desc}</p>
            </div>
        `;
        container.appendChild(block);
    });
    lucide.createIcons();
}

function openTimelineModal() { document.getElementById('timeline-modal').classList.remove('hidden'); }
function closeTimelineModal() { document.getElementById('timeline-modal').classList.add('hidden'); }

function saveTimelineItem() {
    const title = document.getElementById('timeline-title-input').value.trim();
    const date = document.getElementById('timeline-date-input').value;
    const desc = document.getElementById('timeline-desc-input').value.trim();

    if (title && date && desc) {
        if (!Array.isArray(appState.timeline)) appState.timeline = [];
        appState.timeline.push({ id: Date.now(), title, date, desc, color: 'rose' });
        saveToLocalStorage();
        renderTimeline();
        closeTimelineModal();
        showToast('Momen Disimpan!', 'Garis waktu sejarah cinta kita bertambah.', 'check');
        document.getElementById('timeline-title-input').value = '';
        document.getElementById('timeline-date-input').value = '';
        document.getElementById('timeline-desc-input').value = '';
    }
}

function deleteTimeline(id) {
    if (!Array.isArray(appState.timeline)) return;
    appState.timeline = appState.timeline.filter(item => item.id !== id);
    saveToLocalStorage();
    renderTimeline();
}

// LOGIKA PHOTO SCRAPBOOK AMAN
function renderScrapbook() {
    const container = document.getElementById('scrapbook-container');
    if (!container) return;
    container.innerHTML = '';

    const scrapbookData = Array.isArray(appState.scrapbook) ? appState.scrapbook : [];

    scrapbookData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'bg-white p-4 border border-rose-50 rounded-lg shadow-md transform hover:rotate-1 hover:scale-102 transition-all cursor-zoom-in';
        card.innerHTML = `
            <div class="aspect-square bg-slate-100 rounded-md overflow-hidden relative mb-4">
                <img src="${item.img}" alt="Kenangan" class="w-full h-full object-cover">
            </div>
            <div class="space-y-1">
                <p class="font-serif text-slate-700 font-semibold text-sm italic">"${item.caption}"</p>
                <div class="flex justify-between items-center text-[10px] text-slate-400">
                    <span class="flex items-center gap-1"><i data-lucide="map-pin" class="w-3 h-3"></i> ${item.location}</span>
                    <button onclick="deleteScrapbook(${item.id})" class="hover:text-red-500"><i data-lucide="trash" class="w-3.5 h-3.5"></i></button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
    lucide.createIcons();
}

function openScrapbookModal() { document.getElementById('scrapbook-modal').classList.remove('hidden'); }
function closeScrapbookModal() { document.getElementById('scrapbook-modal').classList.add('hidden'); }

function saveScrapbookItem() {
    const img = document.getElementById('scrapbook-img-input').value.trim() || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7';
    const caption = document.getElementById('scrapbook-caption-input').value.trim();
    const location = document.getElementById('scrapbook-loc-input').value.trim() || 'Indonesia';

    if (caption) {
        if (!Array.isArray(appState.scrapbook)) appState.scrapbook = [];
        appState.scrapbook.push({ id: Date.now(), img, caption, location });
        saveToLocalStorage();
        renderScrapbook();
        closeScrapbookModal();
        showToast('Foto Polaroid Ditambahkan!', 'Koleksi album kenangan kita semakin indah.', 'image');
        document.getElementById('scrapbook-img-input').value = '';
        document.getElementById('scrapbook-caption-input').value = '';
        document.getElementById('scrapbook-loc-input').value = '';
    }
}

function deleteScrapbook(id) {
    if (!Array.isArray(appState.scrapbook)) return;
    appState.scrapbook = appState.scrapbook.filter(item => item.id !== id);
    saveToLocalStorage();
    renderScrapbook();
}

// PEREKAM SUARA ASLI AMAN
let mediaRecorder;
let audioChunks = [];
let recordedBlobUrl = null;

async function startRecording() {
    audioChunks = [];
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = e => { audioChunks.push(e.data); };
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
            const reader = new FileReader();
            reader.onloadend = () => {
                recordedBlobUrl = reader.result;
                document.getElementById('recorded-audio').src = recordedBlobUrl;
                document.getElementById('audio-playback-container').classList.remove('hidden');
            };
            reader.readAsDataURL(audioBlob);
        };

        mediaRecorder.start();
        document.getElementById('recording-status').classList.remove('hidden');
        document.getElementById('record-start-btn').classList.add('hidden');
        document.getElementById('record-stop-btn').classList.remove('hidden');
    } catch (err) {
        showToast('Akses Mik Ditolak', 'Website memerlukan izin mikrofon untuk merekam pesan suara.', 'alert-triangle');
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        document.getElementById('recording-status').classList.add('hidden');
        document.getElementById('record-start-btn').classList.remove('hidden');
        document.getElementById('record-stop-btn').classList.add('hidden');
    }
}

function saveVoiceNote() {
    const titleInput = document.getElementById('voice-note-title');
    const title = titleInput.value.trim() || 'Pesan Suara Tanpa Judul';

    if (recordedBlobUrl) {
        if (!Array.isArray(appState.voiceNotes)) appState.voiceNotes = [];
        appState.voiceNotes.push({ id: Date.now(), title, audioData: recordedBlobUrl, date: new Date().toLocaleDateString('id-ID') });
        saveToLocalStorage();
        renderVoiceNotes();
        titleInput.value = '';
        document.getElementById('audio-playback-container').classList.add('hidden');
        showToast('Pesan Suara Disimpan 📻', 'Siap didengarkan oleh kekasihmu kapan saja.', 'mic');
    }
}

// RENDER VOICE NOTES AMAN (MEMUTUS ERROR FOR-EACH)
function renderVoiceNotes() {
    const list = document.getElementById('voice-notes-list');
    if (!list) return;
    list.innerHTML = '';

    const voiceNotesData = Array.isArray(appState.voiceNotes) ? appState.voiceNotes : [];

    if (voiceNotesData.length === 0) {
        list.innerHTML = `<div class="col-span-full text-center py-6 text-slate-400 text-xs">Belum ada rekaman suara.</div>`;
        return;
    }

    voiceNotesData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'bg-white border border-rose-50 p-4 rounded-2xl shadow-sm space-y-2';
        card.innerHTML = `
            <div class="flex justify-between items-center">
                <div>
                    <h4 class="font-bold text-sm text-slate-800">${item.title}</h4>
                    <span class="text-[10px] text-slate-400">Direkam pada: ${item.date}</span>
                </div>
                <button onclick="deleteVoiceNote(${item.id})" class="text-slate-300 hover:text-red-500"><i data-lucide="trash" class="w-4 h-4"></i></button>
            </div>
            <audio src="${item.audioData}" controls class="w-full h-8"></audio>
        `;
        list.appendChild(card);
    });
    lucide.createIcons();
}

function deleteVoiceNote(id) {
    if (!Array.isArray(appState.voiceNotes)) return;
    appState.voiceNotes = appState.voiceNotes.filter(item => item.id !== id);
    saveToLocalStorage();
    renderVoiceNotes();
}
