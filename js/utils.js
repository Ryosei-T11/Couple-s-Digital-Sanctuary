// SISTEM NOTIFIKASI TOAST KUSTOM
function showToast(title, desc, iconName = 'bell') {
    const toast = document.getElementById('toast-notif');
    const toastTitle = document.getElementById('toast-title');
    const toastDesc = document.getElementById('toast-desc');
    const iconContainer = document.getElementById('toast-icon-container');

    toastTitle.innerText = title;
    toastDesc.innerText = desc;
    iconContainer.innerHTML = `<i data-lucide="${iconName}" class="w-5 h-5"></i>`;
    lucide.createIcons();

    toast.classList.remove('translate-y-[-100px]', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-[-100px]', 'opacity-0');
    }, 4000);
}

// FORMAT FORMAT TANGGAL LOKAL (BAHASA INDONESIA)
function formatDate(dateStr) {
    const d = new Date(dateStr);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return d.toLocaleDateString('id-ID', options);
}
