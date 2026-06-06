// NAVIGASI SUB-TAB BLUEPRINT
function switchBlueprintSubTab(subTabName) {
    document.getElementById('blue-bucket').classList.add('hidden');
    document.getElementById('blue-generator').classList.add('hidden');
    document.getElementById('blue-calendar').classList.add('hidden');
    document.getElementById('blue-capsule').classList.add('hidden');

    const buttons = [
        document.getElementById('sub-blue-bucket'),
        document.getElementById('sub-blue-generator'),
        document.getElementById('sub-blue-calendar'),
        document.getElementById('sub-blue-capsule')
    ];
    buttons.forEach(btn => {
        btn.classList.remove('border-rose-500', 'text-rose-600');
        btn.classList.add('text-slate-500', 'border-transparent');
    });

    document.getElementById(`blue-${subTabName}`).classList.remove('hidden');
    document.getElementById(`sub-blue-${subTabName}`).classList.add('border-rose-500', 'text-rose-600');
    document.getElementById(`sub-blue-${subTabName}`).classList.remove('text-slate-500');

    if (subTabName === 'bucket') {
        renderBucketList();
    } else if (subTabName === 'calendar') {
        renderCalendar();
    } else if (subTabName === 'capsule') {
        renderCapsules();
    }
}

// BUCKET LIST IMPIAN BERSAMA
function renderBucketList() {
    const container = document.getElementById('bucket-list-container');
    container.innerHTML = '';

    let completedCount = 0;
    appState.bucketList.forEach(item => {
        if (item.completed) completedCount++;

        const card = document.createElement('div');
        card.className = `flex items-center justify-between p-4 bg-white border border-rose-50 rounded-2xl shadow-sm ${item.completed ? 'opacity-70 line-through' : ''}`;
        card.innerHTML = `
            <div class="flex items-center gap-3">
                <input type="checkbox" ${item.completed ? 'checked' : ''} onclick="toggleBucket(${item.id})" class="w-4.5 h-4.5 text-rose-500 border-slate-300 rounded focus:ring-rose-400">
                <div>
                    <span class="text-[10px] text-slate-400 font-semibold tracking-wide uppercase">${item.category}</span>
                    <h4 class="font-bold text-slate-800 text-sm">${item.title}</h4>
                </div>
            </div>
            <button onclick="deleteBucket(${item.id})" class="text-slate-300 hover:text-red-500"><i data-lucide="trash" class="w-4 h-4"></i></button>
        `;
        container.appendChild(card);
    });

    const percent = appState.bucketList.length > 0 ? Math.round((completedCount / appState.bucketList.length) * 100) : 0;
    document.getElementById('bucket-progress-bar').style.width = `${percent}%`;
    document.getElementById('bucket-progress-text').innerText = `Progress: ${percent}%`;
    lucide.createIcons();
}

function toggleBucket(id) {
    const item = appState.bucketList.find(b => b.id === id);
    if (item) {
        item.completed = !item.completed;
        saveToLocalStorage();
        renderBucketList();
    }
}

function openBucketModal() { document.getElementById('bucket-modal').classList.remove('hidden'); }
function closeBucketModal() { document.getElementById('bucket-modal').classList.add('hidden'); }

function saveBucketItem() {
    const title = document.getElementById('bucket-title-input').value.trim();
    const category = document.getElementById('bucket-category-input').value;
    if (title) {
        appState.bucketList.push({ id: Date.now(), title, category, completed: false });
        saveToLocalStorage();
        renderBucketList();
        closeBucketModal();
        document.getElementById('bucket-title-input').value = '';
    }
}

function deleteBucket(id) {
    appState.bucketList = appState.bucketList.filter(b => b.id !== id);
    saveToLocalStorage();
    renderBucketList();
}

// DATE NIGHT GENERATOR ACAK
const dateNightIdeas = [
    { title: 'Nonton Film Horor & Masak Ramyeon', emoji: '🍿', desc: 'Matikan lampu utama, nyalakan lilin, tonton bersama.' },
    { title: 'Melukis Bersama dengan Kanvas Mini', emoji: '🎨', desc: 'Lukis wajah pasangan masing-masing tanpa mengintip.' },
    { title: 'Keliling Museum Virtual Bersama', emoji: '🏛️', desc: 'Kunjungi galeri museum terbaik dunia bersama.' },
    { title: 'Masak Resep Baru dari Tiktok', emoji: '🍳', desc: 'Uji kemampuan memasak kalian saat sedang video call.' }
];

function generateDateNight() {
    const idx = Math.floor(Math.random() * dateNightIdeas.length);
    const idea = dateNightIdeas[idx];
    
    document.getElementById('generated-date-box').classList.remove('hidden');
    document.getElementById('generated-date-emoji').innerText = idea.emoji;
    document.getElementById('generated-date-title').innerText = idea.title;
    document.getElementById('generated-date-desc').innerText = idea.desc;
    showToast('Ide Kencan Baru! ✨', idea.title, 'sparkles');
}

// KALENDER KEGIATAN BERSAMA
function renderCalendar() {
    const grid = document.getElementById('calendar-days-grid');
    grid.innerHTML = '';
    
    for (let i = 1; i <= 30; i++) {
        const dayEl = document.createElement('div');
        const hasEvent = appState.calendarEvents.some(e => new Date(e.date).getDate() === i);
        dayEl.className = `p-2 rounded-xl text-xs font-semibold flex items-center justify-center relative transition-all ${hasEvent ? 'bg-rose-500 text-white shadow-sm cursor-pointer' : 'bg-white hover:bg-rose-50 text-slate-700'}`;
        dayEl.innerHTML = `${i}${hasEvent ? '<span class="absolute bottom-1 w-1 h-1 bg-white rounded-full"></span>' : ''}`;
        
        if (hasEvent) {
            const event = appState.calendarEvents.find(e => new Date(e.date).getDate() === i);
            dayEl.onclick = () => showToast('Jadwal Kegiatan 📅', `${event.title}: ${event.desc}`, 'calendar');
        }
        grid.appendChild(dayEl);
    }

    const list = document.getElementById('calendar-events-list');
    list.innerHTML = '';
    appState.calendarEvents.forEach(item => {
        const card = document.createElement('div');
        card.className = 'p-3 bg-rose-50 border border-rose-100/50 rounded-xl flex justify-between items-start';
        card.innerHTML = `
            <div>
                <h4 class="font-bold text-xs text-rose-900">${item.title}</h4>
                <p class="text-[10px] text-slate-500 mt-0.5">${formatDate(item.date)}</p>
                <p class="text-[10px] text-slate-600 mt-1">${item.desc}</p>
            </div>
            <button onclick="deleteCalendarItem(${item.id})" class="text-slate-400 hover:text-red-500"><i data-lucide="trash" class="w-3.5 h-3.5"></i></button>
        `;
        list.appendChild(card);
    });
    lucide.createIcons();
}

function openCalendarModal() { document.getElementById('calendar-modal').classList.remove('hidden'); }
function closeCalendarModal() { document.getElementById('calendar-modal').classList.add('hidden'); }

function saveCalendarItem() {
    const title = document.getElementById('cal-title-input').value.trim();
    const date = document.getElementById('cal-date-input').value;
    const desc = document.getElementById('cal-desc-input').value.trim();

    if (title && date) {
        appState.calendarEvents.push({ id: Date.now(), title, date, desc });
        saveToLocalStorage();
        renderCalendar();
        closeCalendarModal();
        document.getElementById('cal-title-input').value = '';
        document.getElementById('cal-date-input').value = '';
        document.getElementById('cal-desc-input').value = '';
    }
}

function deleteCalendarItem(id) {
    appState.calendarEvents = appState.calendarEvents.filter(e => e.id !== id);
    saveToLocalStorage();
    renderCalendar();
}

// KAPSUL WAKTU SURAT CINTA
function renderCapsules() {
    const container = document.getElementById('time-capsule-container');
    container.innerHTML = '';

    appState.capsuleLetters.forEach(item => {
        const now = new Date();
        const unlockDate = new Date(item.unlockDate);
        const isLocked = now < unlockDate;

        const card = document.createElement('div');
        card.className = `p-5 rounded-3xl border shadow-sm flex flex-col justify-between h-56 transition-all ${isLocked ? 'bg-slate-50/50 border-slate-200' : 'bg-gradient-to-br from-rose-50 to-pink-50 border-rose-100'}`;
        card.innerHTML = `
            <div>
                <div class="flex justify-between items-center mb-3">
                    <span class="text-xs font-semibold text-rose-600">Kepada: ${item.target}</span>
                    <span class="text-[10px] text-slate-400">Buka: ${formatDate(item.unlockDate)}</span>
                </div>
                ${isLocked ? `
                    <div class="text-center py-6">
                        <i data-lucide="lock" class="w-8 h-8 mx-auto text-slate-400 mb-2"></i>
                        <h4 class="font-bold text-slate-700 text-xs">Mati Terkunci dalam Kapsul Waktu</h4>
                    </div>
                ` : `<p class="text-xs text-slate-700 font-serif italic line-clamp-4">"${item.content}"</p>`}
            </div>
            <div class="flex justify-between items-center pt-4 border-t border-slate-100">
                ${isLocked ? `
                    <button class="px-3 py-1.5 bg-slate-200 text-slate-500 rounded-lg text-[10px] font-semibold cursor-not-allowed" disabled>Masih Terkunci 🔒</button>
                ` : `
                    <button onclick="readCapsuleLetter('${item.content}')" class="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[10px] font-semibold transition-all">Baca Surat Terbuka ✉️</button>
                `}
                <button onclick="deleteCapsule(${item.id})" class="text-slate-300 hover:text-red-500"><i data-lucide="trash" class="w-4 h-4"></i></button>
            </div>
        `;
        container.appendChild(card);
    });
    lucide.createIcons();
}

function openCapsuleModal() { document.getElementById('capsule-modal').classList.remove('hidden'); }
function closeCapsuleModal() { document.getElementById('capsule-modal').classList.add('hidden'); }

function saveCapsuleItem() {
    const target = document.getElementById('capsule-target-input').value.trim() || 'Sayangku';
    const unlockDate = document.getElementById('capsule-unlock-input').value;
    const content = document.getElementById('capsule-content-input').value.trim();

    if (unlockDate && content) {
        appState.capsuleLetters.push({ id: Date.now(), target, unlockDate, content });
        saveToLocalStorage();
        renderCapsules();
        closeCapsuleModal();
        document.getElementById('capsule-target-input').value = '';
        document.getElementById('capsule-unlock-input').value = '';
        document.getElementById('capsule-content-input').value = '';
    }
}

function readCapsuleLetter(content) {
    document.getElementById('capsule-modal-content-text').innerText = content;
    document.getElementById('capsule-view-modal').classList.remove('hidden');
}

function closeCapsuleModalReader() {
    document.getElementById('capsule-view-modal').classList.add('hidden');
}

function deleteCapsule(id) {
    appState.capsuleLetters = appState.capsuleLetters.filter(c => c.id !== id);
    saveToLocalStorage();
    renderCapsules();
}
