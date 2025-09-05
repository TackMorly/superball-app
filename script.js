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
    // 名前ごとに最高記録のみ抽出
    const bestEntries = {};
    entries.forEach((entry) => {
        if (!bestEntries[entry.name] || bestEntries[entry.name].count < entry.count) {
            bestEntries[entry.name] = entry;
        }
    });
    const uniqueEntries = Object.values(bestEntries);
    uniqueEntries.forEach((entry, idx) => {
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
    let entries = getEntries();
    // 既存の同名エントリーの最高記録を更新
    const existingIdx = entries.findIndex(entry => entry.name === name);
    if (existingIdx !== -1) {
        if (entries[existingIdx].count < count) {
            entries[existingIdx].count = count;
        }
    } else {
        entries.push({ name, count });
    }
    saveEntries(entries);
    renderEntries();
    this.reset();
});

document.getElementById('entryList').addEventListener('click', function(e) {
    // 表示は最高記録のみなので、編集・削除もそれに合わせる
    const list = document.getElementById('entryList');
    const entries = getEntries();
    // 名前ごとに最高記録のみ抽出
    const bestEntries = {};
    entries.forEach((entry) => {
        if (!bestEntries[entry.name] || bestEntries[entry.name].count < entry.count) {
            bestEntries[entry.name] = entry;
        }
    });
    const uniqueEntries = Object.values(bestEntries);
    if (e.target.classList.contains('delete')) {
        const idx = e.target.getAttribute('data-idx');
        const target = uniqueEntries[idx];
        // 同名の全エントリーを削除
        const newEntries = entries.filter(entry => entry.name !== target.name);
        saveEntries(newEntries);
        renderEntries();
    } else if (e.target.classList.contains('edit')) {
        const idx = e.target.getAttribute('data-idx');
        const target = uniqueEntries[idx];
        const newName = prompt('名前を編集', target.name);
        if (newName === null) return;
        const newCount = prompt('すくった数を編集', target.count);
        if (newCount === null || isNaN(parseInt(newCount, 10))) return;
        // 同名の全エントリーを削除し、新しいエントリーを追加
        const newEntries = entries.filter(entry => entry.name !== target.name);
        newEntries.push({ name: newName.trim(), count: parseInt(newCount, 10) });
        saveEntries(newEntries);
        renderEntries();
    }
});

document.addEventListener('DOMContentLoaded', renderEntries);
