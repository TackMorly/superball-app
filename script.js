// エントリーのローカルストレージ管理
function getEntries() {
    return JSON.parse(localStorage.getItem('entries') || '[]');
}
function saveEntries(entries) {
    localStorage.setItem('entries', JSON.stringify(entries));
}

function renderEntries() {
    const list = document.getElementById('entryList');
    list.innerHTML = '';
    const entries = getEntries();
    entries.forEach((entry, idx) => {
        const li = document.createElement('li');
        li.className = 'entry-item';
        li.innerHTML = `
            <span>${entry.name}：${entry.count}個</span>
            <span class="entry-actions">
                <button class="edit" data-idx="${idx}">編集</button>
                <button class="delete" data-idx="${idx}">削除</button>
            </span>
        `;
        list.appendChild(li);
    });
}

document.getElementById('entryForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const count = parseInt(document.getElementById('count').value, 10);
    if (!name || isNaN(count)) return;
    const entries = getEntries();
    entries.push({ name, count });
    saveEntries(entries);
    renderEntries();
    this.reset();
});

document.getElementById('entryList').addEventListener('click', function(e) {
    if (e.target.classList.contains('delete')) {
        const idx = e.target.getAttribute('data-idx');
        const entries = getEntries();
        entries.splice(idx, 1);
        saveEntries(entries);
        renderEntries();
    } else if (e.target.classList.contains('edit')) {
        const idx = e.target.getAttribute('data-idx');
        const entries = getEntries();
        const entry = entries[idx];
        const newName = prompt('名前を編集', entry.name);
        if (newName === null) return;
        const newCount = prompt('すくった数を編集', entry.count);
        if (newCount === null || isNaN(parseInt(newCount, 10))) return;
        entries[idx] = { name: newName.trim(), count: parseInt(newCount, 10) };
        saveEntries(entries);
        renderEntries();
    }
});

document.addEventListener('DOMContentLoaded', renderEntries);
